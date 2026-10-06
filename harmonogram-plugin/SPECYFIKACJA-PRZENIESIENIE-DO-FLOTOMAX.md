# Harmonogram dyżurów — pełna specyfikacja do przeniesienia do FlotoMax

Stan na 06.10.2026, wersja 90. Dokument opisuje **wszystko, co program robi i jak liczy**, żeby FlotoMax mógł to wbudować u siebie i skończyć z dwustronną synchronizacją. Kod źródłowy (jeden plik, czysty JavaScript, ~300 kB): `harmonogram-app.html`. Historia zmian: `POSTEPY.md`. Lista błędów FlotoMax wykrytych po drodze: `DLA-FLOTOMAX.md`. Testy (Playwright, 28 plików, ~390 sprawdzeń): `testy/`.

Zasada przeniesienia: **FlotoMax staje się jedynym systemem**. Wszystko, co dziś idzie łącznikiem (kierowcy, trasy, wyjazdy, nieobecności, zamiany, wysyłka grafiku), staje się zwykłym odczytem z własnej bazy FlotoMax. Reguły, algorytm i ekrany z tego dokumentu przenosi się 1:1.

---

## 1. Po co jest program

Układa grafik kierowców na 20 dni do przodu, sam go poprawia po nieobecnościach i zamianach, liczy dniówki i godziny dla kadr, pozwala spedycji zmieniać ręcznie, drukuje tydzień na A4 i trzyma dane płacowe zaszyfrowane. Trasy, obszary i kilometry to zadanie FlotoMax; Harmonogram tylko przydziela ludzi do etykiet tras.

## 2. Pojęcia i dane

### 2.1 Pracownik (`app/employees.items[]`)
`id` (np. `e9`), `name`, `active`, `catC` (kategoria C; `false` = brak), `flotoId` (id kierowcy we FlotoMax; po przeniesieniu zbędne), `startDate` (dzień zatrudnienia; nowy kierowca przez 28 dni ma „tydzień nauki”), `color`, `virtual` (kierowca wirtualny/symulacyjny — nigdy nie dostaje tras).

### 2.2 Typ zmiany = etykieta trasy (`app/shifts.items[]`)
| Pole | Znaczenie |
|---|---|
| `id`, `name` | np. `t8`, „Trasa 8”; `nagel` = „Dyżur”; `zwroty` = „Zwroty” |
| `part` | `full` (cały dzień) / `pm` (po południu — dyżur) |
| `people` | ile osób dziennie (zwykle 1) |
| `weight` | **dniówki**: Trasy 1–7 i Zwroty = 1, Dyżur = 0,5, Trasy 8–11 = 2,5, Trasa 12 = 2, Trasa 13 = 1, Trasa niezapowiedziana = 0,5 |
| `rest` | dni odpoczynku po trasie (ręcznie); domyślnie `floor(weight − 0,5)` → T8–11: 1 dzień (ustawione ręcznie), T12: 0 |
| `start`, `startDow[6]`, `hours` | statyczny start i czas (zapas, gdy nie ma nauki): T1–7, Zwroty 01:30 / 8 h; T8 22:00 / 20 h; T9, T10 21:00 / 20 h; T11 19:00 / 20 h; T12 13:00 / 16 h; Dyżur 14:30 / 5 h |
| `startPrev` | wymuszenie „wyjazd dzień wcześniej” (auto: start ≥ 18:00 i waga ≥ 2,5) |
| `reqC` | wymaga kat. C (Trasa 10) |
| `fromFloto` | typ utworzony automatycznie z nieznanej etykiety FlotoMax |

Daleka trasa = `weight ≥ 2` i nie `pm` (T8–T12).

### 2.3 Założenia (`app/plan.days[0..6]`, 0 = niedziela)
Które etykiety jadą w który dzień tygodnia. Stan obecny: nd: T11, T9, T12 · pn: Dyżur · wt: T1, T2, T3, T6, T4, T7, Dyżur · śr: T1, T2, T3, T6, T8, T10, T9, Dyżur · cz: T1, T2, T3, T6, T11, Dyżur · pt: T1, T2, T3, T4, T7, Dyżur · sb: T1, T2, T3, T6, T7. Zapotrzebowanie dnia (`est`) = liczba tras `full` z Założeń; można nadpisać ręcznie per dzień (`schedule.est[data]`), a święto z „trasy nie jadą” daje 0.

### 2.4 Nieobecności (`app/absences.items[]`)
`{empId, date, reason, src?, flotoAbs?, flotoSent?, note?}`; `reason`: `urlop`, `l4`, `odpoczynek` (blokują trasy), `wniosek` (żółty, nie blokuje, czeka na zatwierdzenie). Jeden rekord na dzień. `app/hr._absIgnore[]` = id wpisów FlotoMax usuniętych w Harmonogramie, których nie wczytuje się ponownie (po przeniesieniu zbędne).

### 2.5 Grafik ciągły (`schedules/rolling`)
`{id:"rolling", start, end, cells:[], est:{}}`; **komórka** = jedno miejsce trasy w dniu:
`{date, shiftId, slot, empId|null, locked?, part?("am"/"pm"), extra?, startH?, durH?, prevDep?, manualT?, flotoPlan?, flotoRoute?, tripAt?[dep,ret], out?, back?, closed?, duty?("done"/"cancelled"), dutyH?, orders?[], restH?, katCNote?, flotoSwap?, training?}`.
- `locked` — ręcznie ustawione / z planu FlotoMax / z zamiany; losowanie i naprawa tego nie ruszają.
- `startH`, `durH`, `prevDep` — godziny z planu FlotoMax (`plannedDepartureAt`); `manualT` — poprawione ręcznie na osi (najwyższy priorytet po fakcie).
- `tripAt`, `out`, `back`, `closed` — fakt z FlotoMax (wyjazd i powrót); `flotoRoute` — id trasy FlotoMax; `flotoPlan` — id zlecenia z planu.
- `duty`, `dutyH`, `orders` — dyżur: zrealizowany/anulowany, czas, zlecenia (np. „Nagel + Perfekt”).

### 2.6 Pozostałe dokumenty
`app/users` (konta i PIN-y), `app/payroll` (płace, zaszyfrowane), `app/hr` (pola kadr, kalendarz świąt, nadgodziny, pominięte nieobecności), `app/labels` (edytowalne napisy), `triplog/<routeId>` (dziennik każdego wyjazdu z FlotoMax: plan i fakt — do nauki czasów).

## 3. Reguły biznesowe (ustalone z właścicielem)

1. **Horyzont i zamrożenie.** Grafik zawsze ułożony na `dziś + 20 dni`. Bieżący i następny tydzień (do niedzieli następnego tygodnia) są **zamrożone**: zmienia je tylko człowiek; program uzupełnia w nich wyłącznie puste miejsca i zastępstwa za nieobecnych. Dni minione nigdy nie są zmieniane.
2. **Dniówki** jak w 2.2. Norma 5 dniówek na tydzień pon–ndz, pomniejszona o dni L4. Rachunek „monet”: każda trasa daje wagę, dzień wolny kosztuje 1; saldo kierowcy (±) steruje sprawiedliwością losowania (przesunięcie licznika o saldo, ograniczone do ±3: kto ma nadwyżkę, dostaje więcej wolnego).
3. **Co najmniej 2 dni wolne** w tygodniu pon–ndz (maks. 5 dni pracy; przy braku ludzi komórka może dostać `extra` = szósty dzień, widoczny i liczony).
4. **Dzień dzieli się na rano / po południu**, w niedzielę nie. Dwie etykiety u jednego kierowcy w dniu = jedna rano, druga po południu. **Dyżur** (po południu) jest pracą po godzinach: nie koliduje z trasą dzienną, nie liczy się jako dzień pracy, blokują go tylko nieobecność, odpoczynek i daleka trasa tego dnia. Zwroty w sobotę łączą się z trasą poranną.
5. **Odpoczynek po dalekiej trasie**: `rest` dni po dniu trasy (T8–T11: 1 dzień). Przenosi się z poprzedniego tygodnia (niedzielna T11 → poniedziałek odpoczynek).
6. **9 h odpoczynku przed daleką trasą** (`REST_BEFORE_FAR = 9`): koniec poprzedniej trasy + 9 h ≤ wyjazd dalekiej trasy (liczone z nauczonych godzin, z uwzględnieniem wyjazdu dzień wcześniej).
7. **Wyjazd dzień wcześniej**: dzień na grafiku = dzień rozwózki; daleka trasa startująca wieczorem wyjeżdża poprzedniego dnia. Na osi godzin widać końcówkę w dniu rozwózki, a pasek wyjazdu w dniu poprzednim. Czy trasa wyjeżdża dzień wcześniej, wynika z nauki (p. 5), z planu FlotoMax (`prevDep`) albo z `startPrev`.
8. **Sprawiedliwa rotacja dalekich tras** (`farLog`): kierowca, który miał daleką trasę w ostatnich `FAR_GAP = 6` dniach, jest pomijany, dopóki są inni; w oknie `FAR_WIN = 42` dni liczba dalekich tras ma się wyrównywać. Dalekie trasy przydzielane są najpierw, najlepiej komuś wolnemu dzień wcześniej.
9. **Ciągłość trasy**: kierowca trzyma tę samą etykietę z dnia na dzień, jeśli to nie łamie innych reguł.
10. **Kat. C**: trasa z `reqC` tylko dla kierowcy z kat. C. Dla kat. C na trasie z `reqC` dłuższej niż 12 h odejmuje się 9 h odpoczynku dobowego (`TRIP_REST_H`) albo `restHours` z FlotoMax.
11. **Zastępstwo za nieobecnego** (tylko w komórkach nieobecnego, reszta grafiku nietknięta): z wolnych tego dnia bierze tego, kto ma w tym tygodniu najmniej dni pracy; nikt nie dostaje drugiej pełnej trasy w dniu; zachowane 2 dni wolne, odpoczynki, kat. C, 9 h. Gdy nikogo nie ma, miejsce zostaje **puste i widoczne** („Brak obsady”) — program nie łamie reguł.
12. **Nieobecność z każdej strony zdejmuje trasy**: kafelek, okno komórki, Kadry, FlotoMax, inna przeglądarka. Samonaprawa (`absHeal`): gdy nieobecny ma trasy od dziś, program je zdejmuje, szuka zastępstwa, zapisuje i pokazuje komunikat. Wpis nieobecności nie jest blokowany (L4 to fakt), ale ostrzega: „zabraknie kierowców do obsady tras (potrzeba X, aktywnych Y, nieobecnych Z)” i „N tras tego dnia nie ma kierowcy”.
13. **Wniosek urlopowy** nie blokuje; limit miejsc na urlop w dniu = aktywni − zapotrzebowanie − nieobecni; wniosek przekraczający limit w którymkolwiek dniu jest odrzucany z komunikatem. Zatwierdzenie (spedytor) zamienia wniosek w urlop → p. 12.
14. **Ręczna zmiana blokuje komórkę**; naprawa kolizji rusza od tego dnia i podmienia tylko kolidujące przydziały; „Odblokuj dzień” w oknie komórki. Trasa spoza Założeń dodana ręcznie pyta: „przestawić resztę grafiku tego kierowcy?”.
15. **Puste miejsce spoza Założeń** na dany dzień (bez zlecenia FlotoMax) nie jest obsadzane ani liczone jako brak.
16. **Dyżur liczy się tylko zrealizowany**: 0,5 dniówki, a gdy odjazd–powrót trwał > 5 h (`DUTY_LIMIT_H`), 1 dniówka. Zaplanowany, niewykorzystany lub anulowany = 0.
17. **Tydzień nauki nowego kierowcy** (28 dni od `startDate`): 2 dni jako druga osoba z opiekunem, 1 dzień dyżur, pozostałe dni różne trasy z różnymi kierowcami (jak najwięcej kontaktów); komórki `training`.
18. **Godziny do Kadr**: rzeczywiste (`out`/`back`, `dutyH`), a gdy ich nie ma — z nauki, potem z Założeń. Doba pracy 8,5 h bazowo (`DAY_H`), nadgodziny ponad 8 h/dzień; „dopuszczalne nadgodziny” to limit per kierowca per tydzień (domyślnie 0,5 dniówki).

## 4. Nauka czasów tras z faktycznych przejazdów (v78–v90)

Źródło: każdy zakończony wyjazd (wyjazd z bazy, powrót do bazy) z etykietą. Dla każdej etykiety:
- **pierwszy przejazd = średnia; potem średnia z 3 ostatnich** (czas trwania);
- liczone **osobno dla dnia tygodnia**, gdy trasa ma w nim własne przejazdy; inaczej ze wszystkich dni;
- **godzina wyjazdu**: średnia tylko z przejazdów o podobnej porze co ostatni (±3 h), żeby trasa jeżdżąca raz w południe, raz wieczorem nie dostała godziny „pośrodku”; z tego wynika też „wyjazd dzień wcześniej” (średnia < 0 względem północy dnia rozwózki);
- trasa daleka **bez własnych przejazdów** bierze wzorzec innych dalekich tras z tego dnia tygodnia (np. niedzielne wyjeżdżają w niedzielę w ciągu dnia), a bez wzorca — ustawienie statyczne;
- okno 120 dni; dyżur się nie uczy (czas zależy od zleceń); przejazd < 15 min to błędne kliknięcie; przejazd bez etykiety przypisuje się po kierowcy i dniu z grafiku, gdy ma tego dnia jedną trasę.

**Pierwszeństwo godzin na osi i w regułach:** fakt (wyjazd/powrót) > ręczna poprawka na osi > nauka > plan FlotoMax (`plannedDepartureAt` bywa błędne) > ustawienie w Typach zmian. Nauka działa na osi godzin, w „Σ” dnia (suma czasu minus 9 h dla kat. C na długiej trasie), w kontroli 9 h, w końcówkach z poprzedniego tygodnia, w Dyspozycji dnia, przy upuszczaniu kafelków i w wysyłce `plannedStart`. Typy zmian pokazują zieloną etykietę „FlotoMax: … (śr. z N)”.

Wniosek dla FlotoMax: **każdy wyjazd musi mieć etykietę trasy** (dalekie trasy z 27.09 miały `label = null`, dlatego „Trasa 9” nigdy się nie nauczyła).

## 5. Algorytm (do przeniesienia 1:1)

1. **`generate(start,end)`** — losowanie całego okresu dzień po dniu: dla każdego dnia bierze etykiety z Założeń (+ `est`), najpierw dalekie, potem resztę; kandydaci = aktywni, bez nieobecności, bez odpoczynku, z kat. C gdy trzeba, bez kolizji rano/po południu, bez naruszenia 9 h i 2 dni wolnych; wybór `pick()` = najmniejszy licznik dniówek (z przesunięciem o saldo), preferencja ciągłości trasy i rotacji dalekich; zamrożone dni pozostają. Stan początkowy `seedState()` bierze 14 dni historii (odpoczynki, wczorajsze trasy, dni pracy w tygodniu).
2. **`repair(sched, fromDate, locked, ban)`** — naprawa od daty: komórki zamrożone, zablokowane, zakończone i z FlotoMax są stałe; dla pozostałych sprawdza ważność przydziału (nieobecność, odpoczynek, kat. C, 9 h, kolizje, 2 dni wolne) i podmienia tylko kolidujące; w zamrożonym tygodniu uzupełnia tylko puste (zastępstwo p. 3.11).
3. **`repairForAbsences()`** — zdejmuje trasy nieobecnych/nieaktywnych od dziś i wywołuje `repair`.
4. **`assignShift(emp, date, shift, opts)`** — ręczne przydzielenie: dzielenie dnia rano/po południu, przenoszenie kafelków (z blokadą), toggle, auto-naprawa od tego dnia (checkbox), 40 kroków cofania (Ctrl+Z).
5. **`ensureHorizon()` / `rollingTick()`** — co godzinę i przy starcie: dokłada dni do `dziś+20`, migruje stare tygodnie do grafiku ciągłego, pobiera FlotoMax.
6. **`applyFlotoSwaps()`** — przyjęte zamiany na jeden dzień: liczy się ostatni stan każdego kierowcy w dniu (`dayAfter`), zdejmuje etykiety z zamiany, wpisuje drugiego w zwolnione miejsce, blokuje. Po przeniesieniu: zamiana w FlotoMax zmienia komórki bezpośrednio.
7. **`learned(sh, date)`** — p. 4.

## 6. Konta, role i bezpieczeństwo

- Logowanie PIN-em (4 cyfry; SHA-256 z solą), ekran z kafelkami osób w grupach; po wylogowaniu klucz płac znika z pamięci.
- Grupy: **Spedycja** (Plan tygodnia, Dyspozycja dnia, Kalendarz; edycja), **Kadry** (Plan, Kadry, Rejestr, Ludzie; podgląd), **Administrator** (wszystko, Konta: dodawanie, usuwanie, reset PIN, grupa; AI-asystent).
- Konta obecne: Administrator (PIN 3011), Mariola Basiaga, Iza Błaszczok (Spedycja), Jolanta, Wioletta (Kadry) — PIN 2222.
- **Płace** (zakładka 🔒): tylko Administrator i osoba z uprawnieniem `pay` (Jolanta). Hasło płacowe ≥ 8 znaków; dane szyfrowane AES-GCM, klucz PBKDF2 (250 000 iteracji), w bazie wyłącznie szyfrogram; stawki nigdy nie trafiają do eksportu pracowników. Tabela miesięczna: kierowca, stawka (kwota + jednostka), dniówki, propozycja, **wypłata brutto**, uwagi; status szkic/zatwierdzony, kto i kiedy zatwierdził. **Wymóg właściciela: wypłata brutto widoczna wyłącznie dla Jolanty i Administratora.**
- Prawo zapisu sprawdzane z góry; każdy nieudany zapis pokazuje czerwony pasek „NIE ZAPISANO …”.

## 7. Ekrany

1. **Plan tygodnia** — grafik ciągły; „Pokaż 2 tygodnie wcześniej”, „Dziś”; nagłówek dnia: „≈ N tras · przydz. M”, wolne miejsca na urlop, inicjały nieobecnych (niebieskie urlop, żółte wniosek), „zakończone x/y”, etykieta **DZIŚ**; „Sprawdź kolizje od [data] / Sprawdź i napraw”; checkbox auto-naprawy; „Losuj ponownie”; „Cofnij”.
   - **Widok Kafelki**: wiersz na kierowcę (kolor, saldo), kolumna na dzień (rano/po południu, niedziela cały dzień); kafelki tras z dniówkami, ✓ zakończone z godzinami, odpoczynek, URLOP/L4 w kreski, „— wolne —”; przyklejony pasek kafelków do przeciągania (Urlop, L4, wszystkie trasy); dotknięcie komórki = okno wyboru (trasy, Urlop/L4, zdjęcie nieobecności, odblokowanie, realizacja trasy, dyżur: zlecenia, odjazd/powrót, zrealizowany/anulowany). Kolizja „⚠ Urlop – trasa nadal przydzielona”, gdy naprawa niemożliwa.
   - **Widok Godziny (oś 24 h)**: paski od wyjazdu do powrotu, końcówki z poprzedniego dnia, pas 9 h odpoczynku przed daleką, „Σ x h” dnia i „Σ tydz.”, przeciąganie w czasie (zmiana godziny) i zmiana długości, pula kafelków z boku.
   - **Wydruk**: wybór tygodnia, „Drukuj tydzień (A4)” (poziomo, 1 strona: wiersz na kierowcę, kolumna na dzień, duża etykieta + „wyjazd HH:MM”, legenda), „Zapisz plik” (samodzielny HTML).
   - Pasek FlotoMax: stan, „Pobierz z FlotoMax”, „Wyślij grafik do FlotoMax”, lista „Nowe / Do sprawdzenia”.
2. **Harmonogramy** — lista grafików (dziś jeden ciągły), eksport/import JSON.
3. **Pracownicy** — lista, aktywność, kat. C, kolor, data zatrudnienia; historia kierowcy dzień po dniu (trasa, godziny z FlotoMax/planu, dniówki, filtr dat).
4. **Typy zmian** — pola z 2.2 + etykieta nauki + „wyjazd: auto/dzień wcześniej/tego dnia”.
5. **Założenia** — siatka dni tygodnia × etykiety („✓ jeździ”).
6. **Dyspozycja dnia** — kto wolny/zajęty/odpoczywa/nieobecny danego dnia, co ma jutro wieczorem (dalekie), do podpowiedzi dla spedycji.
7. **Kadry** — miesięczny raport: godziny podstawowe, nadgodziny, dyżury, urlop, L4, wnioski, pola ręczne, nieobecności zakresowe (dodawanie/usuwanie), eksport CSV.
8. **Bilans** — pojemność tygodnia vs zapotrzebowanie, prognoza, druga karta ze średnimi z faktycznych tygodni; kalendarz świąt (polskie święta liczone automatycznie + firmowe dni wolne, „trasy nie jadą”).
9. **Rejestr** — tygodniowo per kierowca: dniówki i roboczogodziny (fakt → nauka → Założenia), premie/nadgodziny.
10. **Kalendarz** — kartka miesiąca z nieobecnościami i świętami.
11. **Konta** (admin), **Płace 🔒** (admin + `pay`).
12. **Asystent AI** (admin): polecenia po polsku („podlicz dniówki Knury”, „oznacz Czogałę jako L4 1–5.02”) z narzędziami: nieobecności, dyżur, trasa, zlecenie, zakończenie, dzień wolny.
13. Podpowiedzi (tooltipy ~80 pól, 0,6 s), edytowalne napisy, tryb jasny/ciemny, telefon (tabele przewijane).

## 8. Integracja z FlotoMax dziś (co po przeniesieniu staje się wewnętrzne)

| Dziś (łącznik MCP) | Po przeniesieniu |
|---|---|
| `list_drivers` → pracownicy (id = `flotoId`) | tabela kierowców |
| `list_assignments` → zlecenia planu (`flotoPlan`, `plannedDepartureAt` → `startH/durH/prevDep`, kierowca wirtualny = do obsady) | plan tras |
| `list_trips` → fakty (`flotoRoute`, `tripAt`, `out/back`, `closed`, `restHours`, `katCNote`), dziennik `triplog`, nauka | wyjazdy |
| `list_absences` → urlop/L4/wolne (`src:"floto"`); `report_absence` ← nieobecności wpisane w Harmonogramie; `_absIgnore` | jedna tabela nieobecności; **zatwierdzony wniosek kierowcy musi być nieobecnością** (DLA-FLOTOMAX p. 8); potrzebne odwołanie nieobecności (p. 7) |
| `list_swaps` → przyjęte zamiany (ostatni stan dnia) | zamiana zmienia komórki wprost |
| `set_availability` ← dostępność i wolne miejsca na urlop na 21 dni | liczone w locie |
| `set_schedule` ← wpisy per kierowca/dzień: `label` („Trasa 1 + Dyżur”, „Urlop”, „Odpoczynek po Trasa 9”, „wolne”), `plannedStart` | grafik jest w FlotoMax |

Komunikaty synchronizacji („Nowe: …”, „Do sprawdzenia: …”) i blokady `locked` dla danych FlotoMax przestają być potrzebne.

## 9. Testy do przeniesienia (co sprawdzają)

`e2e` (27: losowanie, reguły, cofanie), `edge` (17: zablokowane, zakładki ról), `feat`, `ledger`/`settle`/`settle_many` (rachunek dniówek liczony niezależnie), `duty` (dyżur 5 h), `bilans`, `trip` (godziny z FlotoMax), `prev` (poprzedni tydzień, odpoczynki), `cal/cal2/cal3` (święta, kalendarz), `reg` (rejestr), `emp` (nowy kierowca, tydzień nauki), `rest8/rest9` (9 h), `far` (rotacja dalekich), `floto2/floto3` (pełna synchronizacja, zamiany), `tl` (oś godzin), `send` (wysyłka), `kal`, `roll` (grafik ciągły, zamrożenie), `konta` (PIN, role), `place` (szyfrowanie płac), `learn` (16: nauka czasów), `abs2/abs3` (nieobecności z każdej strony, samonaprawa, odmowa zapisu), `print` (A4 na 1 stronie), `sticky`, `single`.

## 10. Otwarte sprawy po stronie FlotoMax (szczegóły w `DLA-FLOTOMAX.md`)
1. `plannedDepartureAt` dalekich tras bywa błędne (np. Trasa 8 w czwartek o 07:00 zamiast wtorek ~19:00) — Harmonogram obchodzi to nauką.
2. Brak odwołania nieobecności (`cancel_absence`).
3. Zatwierdzony wniosek kierowcy nie trafia do `list_absences` (Faraś, Dziadura od 20.10).
4. Wyjazdy bez etykiety trasy.
5. Zamiany nadpisywały grafik po `set_schedule` — naprawione 06.10.
6. Okno 1:1 (`publish_week_view`) — narzędzie pojawiło się, nieużyte; po przeniesieniu zbędne.

## 11. Dane produkcyjne do migracji
Baza artefaktu `MEtsioA6AVgn9HZJUZCxYu`: `app/employees` (11 osób, w tym wirtualny), `app/shifts` (16 typów), `app/plan`, `app/absences` (~50 dni), `app/users` (5 kont), `app/hr`, `app/payroll` (szyfrogram — do odszyfrowania potrzebne hasło płacowe Administratora), `schedules/rolling` (28.09–26.10, ~170 komórek), `triplog` (35 wyjazdów). Eksport: przycisk „Eksport JSON” w Harmonogramach albo odczyt bazy artefaktu.
