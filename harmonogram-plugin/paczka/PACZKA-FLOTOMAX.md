# Paczka do przeniesienia Harmonogramu jako karta „Kadry → Harmonogram” w FlotoMax

Stan: 07.10.2026, Harmonogram v91. Bez haseł, PIN-ów, tokenów i adresów łącznika.

Zawartość paczki (folder `harmonogram-plugin/paczka/`):
- `PACZKA-FLOTOMAX.md` — ten dokument (punkty 1–8),
- `eksport-2026-10-07.json` — pełny stan bazy (punkt 4),
- `zrzuty/*.png` — zrzuty każdego ekranu (punkt 1).
Uzupełnienia: `../SPECYFIKACJA-PRZENIESIENIE-DO-FLOTOMAX.md` (reguły w jednym miejscu), `../POSTEPY.md` (historia 91 wersji), `../DLA-FLOTOMAX.md` (błędy FlotoMax), `../testy/` (29 testów), kod `../harmonogram-app.html`.

---

## 1. FUNKCJE I EKRANY (każdy = kafelek w FlotoMax)

Układ ogólny: pasek zakładek u góry; pod nim pasek FlotoMax (stan łącznika, „Pobierz z FlotoMax”, „Wyślij grafik do FlotoMax”, lista „Nowe / Do sprawdzenia”) — po przeniesieniu znika. Tryb jasny/ciemny, telefon (tabele przewijane). ~80 podpowiedzi po najechaniu (0,6 s). Ekran logowania: kafelki osób w grupach, PIN 4 cyfry.

### 1.1 Plan tygodnia (`zrzuty/plan.png`, `plan-godziny.png`, `plan-okno-komorki.png`)
Główny ekran. Grafik ciągły od 28.09 do `dziś + 20 dni`.
- Nagłówek: „Grafik ułożony do DD.MM (zawsze 20 dni do przodu). Zamrożone do DD.MM — zmiany tylko ręczne.”; przyciski „◀ Pokaż 2 tygodnie wcześniej”, „Dziś”, „Cofnij (N)” (40 kroków, Ctrl+Z), „Losuj ponownie” (od końca zamrożenia).
- „Sprawdź kolizje od [data] · Sprawdź i napraw” + checkbox „po ręcznej zmianie sprawdzaj kolizje i podmieniaj resztę”.
- Nagłówek każdego dnia: nazwa dnia, data, etykieta **DZIŚ**, „≈ N tras · przydz. M” (N = zapotrzebowanie z Założeń lub ręczne, M = obsadzone), „wolnych miejsc na urlop: K” (czerwone, gdy 0), inicjały nieobecnych (niebieskie = urlop, żółte = wniosek), „zakończone x/y” po dniu, święto.
- **Widok Kafelki**: wiersz = kierowca (kolorowy pasek, nazwisko, „saldo ±N dn.”), kolumna = dzień podzielony na RANO / PO POŁ. (niedziela: CAŁY DZIEŃ). Kafelek trasy w kolorze etykiety z podpisem „1 dn.” / „2,5 dn.”; „✓ Trasa 3 — zakończona 03:08–08:54 · 1 dn.” (fakt z FlotoMax, biały kontur); „☾ odpoczynek” (beż), „☾ odpoczynek z pop. tygodnia”; „URLOP” / „L4” (niebieskie/czerwone kreski); „wniosek urlop.” (żółty); „— wolne —”. Ciemna ramka = zablokowane ręcznie. Czerwone „⚠ Urlop – trasa nadal przydzielona”, gdy naprawa była niemożliwa. Przyklejony u góry **pasek kafelków**: URLOP, L4, wszystkie trasy — przeciągasz na kierowcę i dzień. Kafelek między komórkami też się przeciąga (przeniesienie).
  Kroki: (a) dodać trasę: przeciągnij kafelek na komórkę albo dotknij komórki → okno wyboru → trasa; (b) zdjąć: dotknij → „— wolne cały dzień —”; (c) urlop/L4: przeciągnij URLOP/L4 albo w oknie komórki; program zdejmuje trasy, szuka zastępstwa, pokazuje „X: Urlop 09.10. Zwolnione trasy przydzielono ponownie.” i ostrzeżenia; (d) zdjąć nieobecność: w oknie komórki „✓ Urlop — dotknij, żeby zdjąć”; (e) odblokować dzień: „🔓 Odblokuj ten dzień”; (f) trasa spoza Założeń → pytanie „przestawić resztę grafiku tego kierowcy? Tak / Nie”.
- **Okno komórki** (`plan-okno-komorki.png`): tytuł „Kierowca · DD.MM”; sekcja „Dyżur tego dnia” (zlecenia np. „Nagel + Perfekt”, stan: zaplanowany/anulowany/zrealizowany, odjazd z bazy, powrót, albo czas h, „Zapisz dyżur”, werdykt 0,5/1 dniówki); sekcja „Realizacja trasy” (zakończona ✓, odjazd/powrót); kafelki tras z Założeń na ten dzień (zaznaczone ✓ obecne), „— wolne cały dzień —”, Urlop, L4, „Poza założeniami na ten dzień: …”.
- **Widok Godziny (oś 24 h)** (`plan-godziny.png`): dzień = oś 0–24 h; pasek od wyjazdu do powrotu z etykietą, „✓” i godzinami gdy fakt; końcówka dalekiej trasy z poprzedniego dnia („→ Trasa 11 do 17:34”); pas 9 h odpoczynku przed daleką; „Σ x h” dnia (czas tras minus 9 h odpoczynku dobowego kat. C na długiej trasie) i „Σ tydz.”; przeciąganie paska w poziomie = zmiana godziny wyjazdu (zapamiętana jako ręczna), ciągnięcie krawędzi = zmiana długości; pula kafelków z boku. Upuszczenie dalekiej trasy wieczorem = wyjazd dzień przed dniem rozwózki.
- **Wydruk**: wybór tygodnia, „🖨 Drukuj tydzień (A4)” (`wydruk-a4.png`: A4 poziomo, 1 strona, wiersz na kierowcę, kolumna na dzień, duża etykieta + „wyjazd HH:MM” / „wyjazd Wt 22:00” dla dnia wcześniej, „Dyżur od 14:30”, URLOP/L4, „odpoczynek po Trasa 8”, „— wolne —”, legenda tras z godziną i czasem), „⬇ Zapisz plik” (samodzielny HTML). Ten sam HTML idzie jako okno tygodnia do FlotoMax.
- Pod planem: „Brak obsady (N): DD.MM Trasa X” (tylko dziś i przyszłość), legenda.

### 1.2 Harmonogramy (`lista.png`)
Lista grafików (dziś jeden: „Grafik ciągły”), zmiana nazwy, usunięcie, „Eksport JSON” / „Import JSON” całej bazy, losowanie nowego okresu (start, koniec).

### 1.3 Pracownicy (`ludzie.png`)
Lista: nazwisko, aktywny, kat. C, kolor, data zatrudnienia (tydzień nauki), id FlotoMax; dodawanie, dezaktywacja. **Historia kierowcy**: wybór osoby i zakresu dat → dzień po dniu trasa, godziny (fakt / plan), dniówki.

### 1.4 Typy zmian (`trasy.png`)
Karta każdej etykiety: nazwa, kolor, część dnia (cały dzień / po południu), osób dziennie, waga w dniówkach, dni odpoczynku po trasie (auto/ręcznie), „wyjazd: auto / dzień wcześniej / tego dnia”, start, start sob., czas h, „wymaga kat. C”, zielona etykieta **„FlotoMax: dzień wcześniej 20:45 · 18,25 h (śr. z 3)”** = czego program się nauczył. Dodawanie nowego typu.

### 1.5 Założenia (`zalozenia.png`)
Siatka dni tygodnia × etykiety: „✓ jeździ” / „—”. Z tego liczy się „≈ N tras” i losowanie.

### 1.6 Dyspozycja dnia (`dysp.png`)
Wybór dnia → każdy kierowca ze stanem: wolny / zajęty (trasa) / odpoczynek (po czym, do kiedy) / nieobecny; „jutro wieczorem: Trasa 9 od 21:00” dla dalekich. Do podpowiedzi dla spedycji przy nagłych zleceniach.

### 1.7 Kadry (`kadry.png`)
Miesiąc → tabela: dni pracy, dniówki, norma, saldo miesiąca, dyżur h, urlop, L4, wnioski, ręczne „stan dni wolnych” i „stan dniówek”. „Kopiuj CSV (Excel)”. **Rachunek dniówek i dni wolnych** od wybranej daty: saldo dniówek, dodatkowe dni pracy, dni wolne przydzielone, dni wolne zgłoszone. Nieobecności: dodawanie zakresu (od–do, powód: urlop/L4/odpoczynek/wniosek) i usuwanie (✕) — usunięcie wpisu z FlotoMax dopisuje go do pominiętych.

### 1.8 Bilans (`bilans.png`)
Tygodnie: pojemność (aktywni × (norma 5 + dopuszczalne nadgodziny) − urlopy − L4 − wnioski) vs zapotrzebowanie (suma dniówek tras z grafiku/Założeń), werdykt „wystarczy / brakuje X dniówek”, prognoza; druga karta ze średnimi z faktycznych tygodni (godziny planowane vs wykonane, wiarygodność danych). Pola: norma, dopuszczalne nadgodziny (per kierowca per tydzień), próg ostrzeżenia. **Kalendarz pracy**: polskie święta liczone automatycznie (stałe + Wielkanoc algorytmem Meeusa, Poniedziałek Wielkanocny, Zielone Świątki, Boże Ciało), firmowe dni wolne z opcją „trasy nie jadą”; rok do przodu.

### 1.9 Rejestr (`rejestr.png`)
Tygodnie od poniedziałku: per kierowca dniówki (monety) i roboczogodziny (fakt → nauka → Założenia), suma, premia/nadgodziny (ręcznie), „od kiedy liczyć”.

### 1.10 Kalendarz (`kalendarz.png`)
Kartka miesiąca: nieobecności (urlop, L4, wniosek, odpoczynek) i święta, „Dziś”, ◀ ▶.

### 1.11 Konta (`konta.png`, tylko Administrator)
Lista kont: nazwa, grupa, uprawnienie płacowe, „resetuj PIN” (tymczasowy, wymusza zmianę), usuń; dodawanie.

### 1.12 Płace 🔒 (`place.png`, Administrator + uprawnienie płacowe)
Pierwsze wejście: ustawienie hasła płacowego (≥ 8 znaków). Potem: odblokowanie hasłem, miesiąc, tabela: kierowca, stawka (kwota + jednostka: za dniówkę / za godzinę / miesięcznie), dniówki, propozycja (stawka × dniówki), **wypłata brutto** (ręcznie), uwagi; „Zapisz szkic”, „Zatwierdź” (kto, kiedy), „Zablokuj”. Bez hasła w pamięci nic z tego nie jest czytelne.

### 1.13 Asystent AI (Administrator, przycisk „🤖 Asystent”)
Panel po prawej; polecenia po polsku („podlicz dniówki Knury za wrzesień”, „oznacz Czogałę jako L4 od 1.02 do 5.02”, „daj Farasiowi Trasę 3 w piątek”); narzędzia: nieobecności, dyżur, trasa, zlecenie, zakończenie trasy, dzień wolny, raporty.

### Kolory etykiet tras
Kolor = `LABEL_COLORS[indeks typu zmiany]` (chyba że typ ma własny `color`; dziś żaden nie ma). Kolejność typów i kolory:
| Etykieta | Kolor | Etykieta | Kolor |
|---|---|---|---|
| Trasa 1 | `#6FD46A` zielony | Trasa 9 | `#FF9A3D` pomarańczowy |
| Trasa 2 | `#5C9DF2` niebieski | Trasa 10 | `#F06BAA` różowy |
| Trasa 3 | `#FFB347` morelowy | Trasa 11 | `#D98E5F` brąz |
| Trasa 4 | `#3ED1C4` turkus | Trasa 12 | `#4FC3F7` błękit |
| Trasa 5 | `#B58BF5` fiolet | Dyżur | `#B5C95A` oliwka |
| Trasa 6 | `#F5D43C` żółty | Zwroty | `#A3E635` limonka |
| Trasa 7 | `#9AA8BA` szary | Trasa niezapowiedziana | `#8C83F2` lawenda |
| Trasa 8 | `#FF7A6B` koral | Trasa 13 | `#F59AD9` róż jasny |
Napis na kafelku ciemny (`#111`). URLOP: niebieskie ukośne pasy `#2f7fd0/#2569b0`, biały napis; L4: czerwonawe pasy; odpoczynek: beż z ciemnożółtym napisem; wniosek: żółty; kierowca ma własny kolor paska (`EMP_COLORS`: `#0ea5e9 #f59e0b #10b981 #ef4444 #8b5cf6 #ec4899 #14b8a6 #f97316 #6366f1 #84cc16 #a16207 #0891b2` wg kolejności).

## 2. ROLE I UPRAWNIENIA

| Konto | Grupa | Widzi | Może zmieniać |
|---|---|---|---|
| Administrator | admin | wszystko (12 zakładek + Asystent AI + Konta + Płace) | wszystko; konta, PIN-y, hasło płacowe |
| Mariola Basiaga, Iza Błaszczok | spedycja | Plan tygodnia, Dyspozycja dnia, Kalendarz | grafik (kafelki, oś, okno komórki, urlop/L4, naprawa, losowanie, wysyłka do FlotoMax, wydruk) |
| Jolanta | kadry + uprawnienie płacowe | Plan (podgląd), Kadry, Rejestr, Pracownicy, **Płace** | nieobecności zakresowe i pola ręczne w Kadrach, Rejestr, płace (stawki, wypłata brutto, zatwierdzanie) |
| Wioletta | kadry | Plan (podgląd), Kadry, Rejestr, Pracownicy | jak Jolanta bez Płac |

**Grupa „Kadry”** = dział kadr: rozlicza dniówki, godziny, urlopy i L4, prowadzi rejestr i pola ręczne (stan dni wolnych, stan dniówek, premie), nie układa grafiku (Plan tylko do podglądu, bez przeciągania). Płace widzi wyłącznie osoba z osobnym uprawnieniem płacowym (dziś Jolanta) i Administrator — **wymóg właściciela: wypłata brutto i stawki nigdy nie są widoczne dla nikogo innego**. Konta nie są kierowcami. PIN: SHA-256 z solą, 4 cyfry, reset daje PIN tymczasowy z wymuszoną zmianą. Prawo zapisu w bazie sprawdzane z góry; brak → czerwony pasek „NIE ZAPISANO…”.

## 3. MODEL DANYCH

Dziś: baza dokumentowa artefaktu claude.ai (kolekcje `app`, `schedules`, `triplog`), JSON, zapis całych dokumentów, odczyt na żywo (`onSnapshot`). Klucz kierowcy do FlotoMax: `employees[].flotoId` = `driverId` FlotoMax.

| Encja (dokument) | Pola | Ograniczenia / relacje |
|---|---|---|
| **Pracownik** `app/employees.items[]` | `id` string (`e1`…, losowe), `name`, `active` bool, `catC` bool (domyślnie true), `flotoId` int, `startDate` YYYY-MM-DD?, `color`?, `virtual`? | `flotoId` unikalny; `virtual`/„Wirtualny kierowca” nigdy nie dostaje tras |
| **Typ zmiany / etykieta** `app/shifts.items[]` | `id`, `name` (≤40), `part` `full`/`pm`, `people` int ≥1, `weight` 0.5–2.5 (dniówki), `rest` int? (dni odpoczynku), `start` h dziesiętne (np. 21), `startDow{6:h}`?, `hours` h, `startPrev` bool?, `reqC` bool?, `color`?, `fromFloto`? | daleka = `weight ≥ 2 && part ≠ pm`; `rest` domyślnie `floor(weight−0.5)`; `id` `nagel` = Dyżur, `zwroty` = Zwroty |
| **Założenia** `app/plan.days{0..6:[shiftId]}` | 0 = niedziela | etykieta w dniu tygodnia = jedno miejsce × `people` |
| **Nieobecność** `app/absences.items[]` | `empId`, `date`, `reason` ∈ {urlop, l4, odpoczynek, wniosek}, `src` `floto`?, `flotoAbs` id?, `flotoSent` bool?, `note` ≤300? | 1 rekord/dzień/osoba; urlop/l4/odpoczynek blokują trasy, wniosek nie; zakres ≤ 120 dni; wniosek odrzucany, gdy brak miejsc |
| **Grafik** `schedules/rolling` | `id`, `start`, `end`, `rolling` true, `est{date:int}` (ręczne zapotrzebowanie), `cells[]` | jeden ciągły; `end = dziś+20` utrzymywany automatycznie |
| **Komórka** `cells[]` | `date`, `shiftId`, `slot` int, `empId`|null, `locked`?, `part` am/pm?, `extra`? (6. dzień), `training`?, `startH` h?, `durH` h?, `prevDep` bool?, `manualT`?, `flotoPlan` id?, `flotoRoute` id?, `tripAt` [ISO dep, ISO ret]?, `out`/`back` HH:MM?, `closed`?, `duty` done/cancelled?, `dutyH` h?, `orders[]`?, `restH` h?, `katCNote`?, `flotoSwap` id? | klucz `(date, shiftId, slot)`; `empId` → pracownik; `shiftId` → typ; `slot` 0..people−1 (więcej = `extra`) |
| **Dziennik wyjazdu** `triplog/<routeId>` | `routeId`, `date`, `label`, `kind` dostawa/zwroty, `driverId`, `driver`, `empId`, `plate`, `stops`, `plannedDeparture`, `plannedReturn`, `departed`, `returned`, `hours`, `restHours`, `weekday` | źródło nauki czasów; 1 rekord na trasę FlotoMax |
| **Kadry/ustawienia** `app/hr.items` | `_bilans{norm, ot, low}`, `_reg{prem}`, `_since`, `_cal{custom[], …}` (firmowe dni wolne), `_absIgnore[]`, pola ręczne per kierowca/miesiąc (`<empId>|<YYYY-MM>|dniWolne/dniowki`) | |
| **Konto** `app/users.items[]` | `id`, `name`, `group` admin/spedycja/kadry, `pay` bool?, `salt`, `hash`, `mustChange`? | bez haseł w eksporcie |
| **Płace** `app/payroll` | `salt`, `iv`, `data` (szyfrogram AES-GCM JSON: `{rates{empId:{rate,unit}}, months{YYYY-MM:{rows{empId:{brutto,note}}, status, by, at}}}`), `by`, `at` | klucz PBKDF2 (250 000 iteracji) z hasła; nie w eksporcie |
| **Napisy** `app/labels.items{key:html}` | edytowalne teksty interfejsu | |

Pochodne (nie przechowywane): saldo dni (rachunek monet), odpoczynek automatyczny po dalekiej trasie, wolne miejsca na urlop, „≈ tras”, godziny nauczone, święta ustawowe.

## 4. EKSPORT DANYCH

`paczka/eksport-2026-10-07.json` (wszystkie kolekcje, stan z 07.10 rano):
- `drivers[]` — 11 kierowców z `driverId` (= id FlotoMax), `harmonogramId`, `name`, `active`, `catC`, `virtual`, `startDate`; w tym `Wirtualny kierowca` (119, `virtual: true`, nieaktywny w Harmonogramie).
- `staff[]` — 5 kont użytkowników programu, **nie kierowcy**: Administrator (admin), Mariola Basiaga i Iza Błaszczok (spedycja), Jolanta (kadry, uprawnienie płacowe), Wioletta (kadry). Bez PIN-ów.
- `shifts[]` (16), `plan`, `absences[]` (55 dni, każdy z `driverId`), `schedule` (grafik 28.09–27.10, 181 komórek, każda z `driverId` i `driverName`, `est`), `hr`, `labels`, `triplog[]` (50 wyjazdów).
- Pominięte celowo: `app/users` hasła/sole, `app/payroll` (szyfrogram; odszyfrowuje Administrator w zakładce Płace i eksportuje osobno).

## 5. REGUŁY I ALGORYTMY

**Stałe:** `HORIZON=20` dni; zamrożenie do niedzieli następnego tygodnia; `MAX_WORK_DAYS=5` (≥ 2 dni wolne pon–ndz); `REST_BEFORE_FAR=9` h; `FAR_W=2` (daleka od wagi 2), `FAR_GAP=6` dni, `FAR_WIN=42` dni; `DUTY_LIMIT_H=5`; `TRIP_REST_H=9`, `TRIP_REST_MIN=12`; `DAY_H=8.5`; `TRAINEE_DAYS=28`; nauka: `LEARN_N=3`, `LEARN_DAYS=120`.

**Generowanie grafiku** (`generate`): dzień po dniu od końca zamrożenia do `dziś+20`. Dla dnia: lista miejsc z Założeń (× `people`), posortowana: dalekie najpierw, potem waga, potem id. Stan początkowy z 14 dni wstecz (`seedState`): odpoczynki trwające, wczorajsze trasy, dni pracy w tygodniu. Kandydat musi: być aktywny i nie wirtualny; nie mieć nieobecności ani odpoczynku; mieć kat. C gdy `reqC`; nie kolidować rano/po południu (dwie pełne trasy w dniu zabronione; dyżur łączy się z trasą dzienną, ale nie z daleką); spełniać 9 h przed daleką (`clashNext`: koniec wczorajszej trasy + 9 h ≤ wyjazd dalekiej, z uwzględnieniem wyjazdu dzień wcześniej); mieć < 5 dni pracy w tygodniu (dyżur nie liczy się jako dzień); nie być w `ban`. Wybór `pick`: najmniejszy licznik dniówek w okresie, licznik startuje z przesunięciem = saldo kierowcy ograniczone do ±3 (kto ma nadwyżkę monet, dostaje więcej wolnego); remis → preferuj ciągłość (ta sama etykieta co wczoraj), potem rotacja dalekich (pomijany, kto miał daleką w ostatnich 6 dniach, dopóki są inni; w oknie 42 dni wyrównanie liczby dalekich), potem losowo. Gdy nikt nie spełnia reguł: dla tras pełnych dopuszczalny 6. dzień (`extra`), a dalej miejsce zostaje puste. Po przydziale: odpoczynek `rest` dni, licznik dniówek, dzień pracy.

**Naprawa** (`repair(from)`): komórki zamrożone, zablokowane, zakończone, z FlotoMax są stałe i tylko zasilają stan; każdą inną sprawdza tymi samymi regułami; nieważną podmienia kandydatem jak w `pick`; w zamrożonym tygodniu tylko puste miejsca i zastępstwa: nikt nie dostaje drugiej zmiany tego dnia, pierwszeństwo ma kierowca z najmniejszą liczbą dni pracy w tym tygodniu. Puste miejsce spoza Założeń (bez zlecenia) pomija.

**Nieobecność** (`repairForAbsences`, `absHeal`): zdjąć trasy nieobecnego/nieaktywnego od dziś, naprawa od pierwszego takiego dnia, zapis, komunikat. Uruchamiane po każdej zmianie nieobecności z dowolnego źródła.

**Saldo dni (rachunek monet, Kadry):** saldo = bilans otwarcia (ręczny „stan dniówek”) + Σ tygodni od daty „rachunek liczony od”: (zarobione dniówki − norma 5). Zarobione: każda trasa daje wagę; dyżur tylko zrealizowany (0,5; > 5 h → 1). Dzień wolny przydzielony przez program i urlop kosztują 1 (norma pomniejszona o dni L4). Norma miesiąca w tabeli = 5 × liczba pełnych tygodni (20), dla zatrudnionych w trakcie miesiąca proporcjonalnie (15). Przeliczenie dniówek na godziny: 0,5 → 5 h, 1 → 8,5 h, 1,5 → 13,5 h, 2 → 18 h, 2,5 → 22,5 h.

**„Wolnych miejsc na urlop: K”** = aktywni kierowcy − zapotrzebowanie dnia (≈ N tras) − nieobecni (urlop/L4/odpoczynek z listy). K < 1 → czerwone; wniosek przekraczający K w którymkolwiek dniu zakresu jest odrzucany; urlop/L4 nie jest blokowany, tylko ostrzeżenie.

**„≈ N tras · przydz. M”**: N = `est[date]` (ręcznie) albo liczba tras `full` z Założeń na ten dzień tygodnia (0 w święto „trasy nie jadą”); M = komórki `full` z kierowcą tego dnia.

**„Odpoczynek po Trasa N”**: dzień D jest odpoczynkiem kierowcy po trasie z dnia T, gdy `T < D ≤ T + rest(trasa)` i kierowca nie ma w D własnej trasy. Pokazywany na kafelkach, wydruku i wysyłany do FlotoMax jako etykieta „Odpoczynek po Trasa N”. Odpoczynek z poprzedniego tygodnia przenosi się.

**Kat. C — 9 h odpoczynku dobowego ≠ czas pracy**: dla kierowcy z kat. C na trasie z `reqC`, która trwa ≥ 12 h, od czasu trasy odejmuje się 9 h (`TRIP_REST_H`), a gdy FlotoMax podał `restHours`, to tyle (nie więcej niż czas trasy). Dotyczy „Σ x h”, Rejestru, Kadr, Bilansu. Trasa 10 wymaga kat. C; Bubon, Dziadura, Faraś nie mają kat. C.

**Wyjazd dzień wcześniej (trasy nocne)**: dzień na grafiku = dzień rozwózki. Trasa wyjeżdża dzień wcześniej, gdy: (1) ręcznie `startPrev=true`, albo (2) nauka: średni wyjazd przypada przed północą dnia rozwózki, albo (3) plan FlotoMax (`prevDep`), albo (4) domyślnie start ≥ 18:00 i waga ≥ 2,5. Na osi godzin pasek w dniu poprzednim, końcówka w dniu rozwózki. 9 h przed daleką liczone do faktycznego wyjazdu.

**Reguła niedzieli**: bez podziału rano/po południu (jedna etykieta na kierowcę); Założenia niedzieli: T11, T9, T12 (dalekie, wyjeżdżają w niedzielę w ciągu dnia wg nauki: T12 ~12:30, T11 ~19:20); odpoczynek po niedzielnej dalekiej przenosi się na poniedziałek; w poniedziałek tylko dyżur. Sobota: trasy poranne + Zwroty po południu u każdego z poranną trasą.

**departAt i hours (wysyłka)**: `departAt = (prev ? date−1 : date) + " " + HH:MM`, gdzie HH:MM = godzina wyjazdu wg pierwszeństwa fakt > ręczna > nauka > plan > ustawienie; `hours` = suma czasów wszystkich tras kierowcy w dniu (wg tego samego pierwszeństwa); `plannedStart` = HH:MM; `label` = etykiety w kolejności wyjazdu łączone „ + ”.

**Nauka czasów**: p. 4 specyfikacji (pierwszy przejazd = średnia, potem średnia z 3 ostatnich; osobno dzień tygodnia; pora ±3 h; wzorzec dalekich tras dnia tygodnia; okno 120 dni; bez dyżuru; przejazd bez etykiety → po kierowcy i dniu).

**Święta**: polskie ustawowe liczone na rok (1.01, 6.01, Wielkanoc i Poniedziałek Wielkanocny — Meeus, 1.05, 3.05, Zielone Świątki, Boże Ciało, 15.08, 1.11, 11.11, 25–26.12); firmowe dni wolne ręcznie z flagą „trasy nie jadą” (zapotrzebowanie 0); dni wolne nie obniżają normy (L4 tak).

**Ostrzeżenia i walidacje**: nieobecność w przeszłości („tylko od dziś w przód”); zakres nieobecności > 120 dni; wniosek ponad limit miejsc — odrzucony; urlop/L4 → „⚠ Uwaga: w dniach … zabraknie kierowców (potrzeba X, aktywnych Y, nieobecnych Z)” i „⚠ N tras tego dnia nie ma kierowcy”; trasa spoza Założeń → pytanie o przestawienie reszty; „Brak obsady (N)”; „⚠ Urlop – trasa nadal przydzielona”; nieudany zapis → „NIE ZAPISANO”; kolizje 9 h w „Sprawdź i napraw”; hasło płacowe < 8 znaków; PIN ≠ 4 cyfry.

**Zamiany tras (FlotoMax)**: przyjęta zamiana na jeden dzień między A i B: liczy się ostatni stan każdego kierowcy w tym dniu (`dayAfter`, np. „Dyżur od 14:30”, „wolne”, „Trasa 1 + Dyżur”); zdejmowane są tylko etykiety z zamiany, których po niej nie ma, drugi kierowca wchodzi w zwolnione miejsce; wpisy zablokowane; oczekujące pomijane. Po przeniesieniu: zamiana zmienia komórki wprost.

**Wnioski urlopowe**: `wniosek` nie blokuje; widoczny żółto na kafelku, w nagłówku dnia (żółte inicjały), w Kadrach; zatwierdzenie = zmiana na `urlop` (→ zdjęcie tras); odrzucenie = usunięcie. Dziś FlotoMax zatwierdzonych wniosków kierowców nie przekazuje (błąd p. 7).

## 6. INTEGRACJA Z FLOTOMAX (dziś)

Kiedy: przy starcie strony (po 2,8 s), co godzinę (`rollingTick`), po kliknięciu „Pobierz z FlotoMax”, po dołożeniu dni horyzontu; wysyłka: przycisk „Wyślij grafik do FlotoMax” i **automatycznie 20 s po każdej ręcznej zmianie grafiku**.

| Krok | Narzędzie | Kierunek | Źródło prawdy |
|---|---|---|---|
| kierowcy | `list_drivers` | FlotoMax → H | FlotoMax (nowi dopisywani, `flotoId`) |
| zlecenia planu (dziś … +42 dni) | `list_assignments` | FlotoMax → H | FlotoMax dla przydziału kierowcy (komórka `flotoPlan`, zablokowana); godziny planu niżej niż nauka |
| przyjęte zamiany | `list_swaps` | FlotoMax → H | FlotoMax |
| wyjazdy (−14 dni … jutro) | `list_trips` | FlotoMax → H | FlotoMax (fakt: `flotoRoute`, `tripAt`, zamknięcie) + dziennik `triplog` |
| nieobecności (−31 … +366 dni) | `list_absences` | FlotoMax → H | FlotoMax dla `src: floto` (usunięte we FlotoMax znikają; pominięte wg `_absIgnore`) |
| nieobecności z Harmonogramu | `report_absence` | H → FlotoMax | Harmonogram (potem oznaczone `flotoSent`) |
| dostępność na 21 dni + wolne miejsca na urlop | `set_availability` | H → FlotoMax | Harmonogram |
| grafik tygodni (bieżący → koniec) | `set_schedule` (`label`, `plannedStart`, `departAt`, `hours`, `replaceFrom/To`) | H → FlotoMax | **Harmonogram** (dla grafiku) |
| okno tygodnia 1:1 | `publish_week_view` (HTML) | H → FlotoMax | Harmonogram |

Po przeniesieniu: wszystko to jest odczytem/zapisem w jednej bazie; znikają `flotoId`, `flotoPlan`, `flotoRoute`, `flotoSent`, `_absIgnore`, komunikaty „Nowe/Do sprawdzenia”.

## 7. ZNANE BŁĘDY I NIEDOKOŃCZONE

Po stronie FlotoMax (szczegóły `../DLA-FLOTOMAX.md`): (1) `plannedDepartureAt` dalekich tras bywa błędne; (2) brak odwołania nieobecności; (3) zatwierdzony wniosek kierowcy nie trafia do listy nieobecności (Faraś, Dziadura od 20.10); (4) wyjazdy bez etykiety trasy (27.09) — „Trasa 9” nigdy się nie nauczyła; (5) zamiany nadpisywały grafik po `set_schedule` — naprawione 06.10; (6) `departAt`/`hours` w `set_schedule` — nie wiadomo, czy FlotoMax je przyjmuje (schemat ich nie wymienia).

Po stronie Harmonogramu: (a) dyżur na dzień z daleką trasą przy ręcznej edycji jest dozwolony bez ostrzeżenia; (b) przerwa 45 min kierowcy (`katCNote`) nie jest liczona; (c) nowe etykiety „od 12.10” zapowiedziane przez właściciela, nieopisane; (d) wiele klientów naraz: ostatni zapis wygrywa (bez scalania); (e) edytowalne napisy nie są wpisane na stałe w kod; (f) wersja serwerowa Flask+SQLite w `harmonogram/` jest stara i nieużywana.

## 8. KOD ŹRÓDŁOWY

- Żywy program: artefakt claude.ai `https://claude.ai/artifact/MEtsioA6AVgn9HZJUZCxYu` (właściciel: maciejos306; baza danych tego artefaktu = produkcja).
- Repozytorium `maciejos306/losowanie`, gałąź `claude/program-harmonogram-aabbmy`, folder `harmonogram-plugin/`: `harmonogram-app.html` (cały program, jeden plik, JavaScript bez frameworków, ~300 kB), `testy/` (Playwright), `POSTEPY.md`, `DLA-FLOTOMAX.md`, `SPECYFIKACJA-PRZENIESIENIE-DO-FLOTOMAX.md`, `INSTRUKCJA-DLA-SESJI-FLOTOMAX.md`, `paczka/` (ten dokument, eksport, zrzuty), `dane/` (stare importy).
- Kluczowe funkcje w kodzie: `generate`, `repair`, `pick`, `seedState`, `clashNext`, `assignShift`, `undoLast`, `repairForAbsences`, `absHeal`, `ensureHorizon`, `rollingTick`, `learnReadings`, `learned`, `cellBounds`, `cellPrev`, `applyFlotoTrips`, `applyFlotoAssignments`, `applyFlotoAbsences`, `applyFlotoSwaps`, `flotoWeekEntries`, `flotoSendSchedule`, `printWeekHtml`, `renderPlan0`, `renderTimeline`, `hrReport`, `renderBilans`, `renderRegister`, `renderKonta`, `payEnc`/`payDec`, `slotsOn`, `checkLeave`, `estOf`, `plHolidays`.
