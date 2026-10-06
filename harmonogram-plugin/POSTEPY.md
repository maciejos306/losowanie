# Harmonogram dyżurów: zapis postępów i start na innym urządzeniu

Stan na 30.09.2026. Żywa wersja: https://claude.ai/artifact/MEtsioA6AVgn9HZJUZCxYu (wersja 45, capabilities `db` i `sample`, artefakt prywatny, właściciel maciejos306).
Ten folder zawiera tę samą wersję w pliku `harmonogram-app.html`, testy w `testy/` i dane w `dane/`. Szczegóły reguł i struktury: `PRZEKAZANIE.md`.

## Jak zacząć na innym urządzeniu
1. Sklonuj repozytorium `maciejos306/losowanie` i przełącz się na gałąź `claude/program-harmonogram-aabbmy`.
2. Uruchom Claude Code w tym repozytorium i wklej: „Przeczytaj harmonogram-plugin/POSTEPY.md i PRZEKAZANIE.md i kontynuuj pracę”.
3. Żeby zmieniać żywy program, publikuj plik `harmonogram-plugin/harmonogram-app.html` zawsze z adresem artefaktu (`url`) i z `capabilities: {db:{}, sample:{}}`. Bez adresu powstaje osobny artefakt z pustą bazą. Do zmian w żywej bazie potrzebny jest dostęp z prawem edycji do artefaktu.
4. Testy: w `harmonogram-plugin/testy` zainstaluj Playwright (`npm i playwright`), popraw ścieżkę przeglądarki (`executablePath`) i uruchom `node shot.js`, a potem wybrany test. Testy z asystentem używają `local_ai.html` z atrapą modelu (`fake.js`), którą skleja się z `local.html`.
5. Dane w żywej bazie nie są w repozytorium poza kopią tygodnia 28.09–04.10 (`dane/`). Eksport całości: w programie Kadry lub „Eksport danych (JSON)”.

## Co działa
Plan tygodnia (kafelki i oś godzin), losowanie z regułami, ręczne zmiany z blokowaniem, Cofnij, nieobecności i wnioski z limitem wolnych miejsc, inicjały urlopów w nagłówkach dni, szacowana liczba tras, rachunek w dniówkach z normą 5 na tydzień, dyżur liczony po realizacji (0,5 lub 1 dniówka po 5 h), zlecenia dodatkowe i wyjazdy, dalekie trasy wyjeżdżające dzień wcześniej, oznaczanie zakończonych tras i dni, Kadry, stawka kierowcy, karta Bilans (tydzień, miesiąc, rok), kalendarz świąt i dni wolnych (polskie święta automatycznie), karta Rejestr (dniówki i roboczogodziny, porównanie systemów rozliczania), asystent AI z narzędziami i zatwierdzaniem zmian, API dla FlotoMax (`window.HarmonogramPlugin` i postMessage).

## Ostatnie poprawki (z niezależnego przeglądu)
Własny dzień wolny na święcie nie znosi obniżki normy, dwa wpisy na tej samej dacie łączą się, okresy bez dni pracujących nie proponują absurdalnych zatrudnień, dni „trasy nie jadą” nie liczą niezakończonych tras i nie dostają tras z losowania, norma z ustawień skaluje miesiąc i rok, nieobecny cały okres kierowca nie zostawia „fantomowej” pojemności, ustawienia Bilansu mają zakresy, zniekształcone dane kalendarza nie psują programu, L4 w niedzielę będącą świętem nadal zmniejsza normę.

## Otwarte tematy
- Przegląd zgłosił jeszcze, bez poprawek: Kadry liczą urlop w dniu będącym świętem jako dzień urlopu; norma miesięczna w Kadrach (tygodnie wg czwartku) różni się od kalendarzowej w Bilansie; kilka komunikatów wciąż mówi „5 dniówek na tydzień” mimo zmiany normy w ustawieniach. Nie przeglądano jeszcze osobno okna kalendarza (UI) ani narzędzi asystenta pod kątem ostatniej wersji.
- Asystent nie był sprawdzony z prawdziwym modelem, tylko z atrapą. Pierwsze użycie wymaga zgody w przeglądarce.
- Dane z aplikacji kierowców i FlotoMax nie wpływają na program, dopóki FlotoMax nie wywoła `completeRoute`, `reportTrip` i `assignOrder`.
- W święta trasy domyślnie jadą wg Założeń. Decyzja biznesowa do potwierdzenia.
- Saldo dniówek nie zmniejsza się przy odbiorze dni wolnych; stawka kierowcy liczy się tylko w karcie Rejestr; nowe dane kierowcy (prawo jazdy, badania, kod 95) czekają na dane z FlotoMax.
- Niedziela 04.10 w planie z PDF ma trzy razy Trasa 11 i dwa dyżury 30.09 (Twardzik niezrealizowany i Roman „Nagel + Perfekt”); do potwierdzenia.
- Nazwa „Dyżur” ma w przepisach o czasie pracy kierowców inne znaczenie.


## v46
- Okno kalendarza (Bilans): formularz/fokus/przewinięcie przetrwają przebudowę, data zatwierdzana po opuszczeniu pola (rok 2000–2100), Enter dodaje, pierwszy klik Usuń działa po edycji.
- Asystent `ustaw_dzien_wolny`: czytelne błędy przy usuwaniu nieistniejącego dnia / święta ustawowego, cofnięcie dotyka tylko danego dnia.
- API (workingDays/bilansRange/yearStats/calendar): walidacja zakresu dat.
- Test: testy/cal3.js (16/16). Pełna regresja zielona.
- Nadal otwarte: Kadry – urlop w święto liczony jako dzień urlopu; norma miesięczna Kadr (tygodnie) vs kalendarzowa w Bilansie; stare teksty „5 dniówek”.

## v47
- Pracownicy: dodawanie kierowcy z wyborem kat. C / kat. B, Enter dodaje, odrzucanie duplikatów. Test: testy/emp.js.
- Dopisany kierowca Tomasz Dziadura (kat. B, id e9) w bazie na żywo.
- Integracja z FlotoMax: artefakt nie ma dostępu do sieci; planowana droga przez serwer MCP FlotoMax (łącznik claude.ai + capability mcp).

## v48
- Naprawa: ręcznie wstawiona (zablokowana) trasa w dniu odpoczynku po wcześniejszej dalekiej trasie (np. T8 → T11 dzień później). Naprawa kolizji (repair) nie przydziela trasy, po której odpoczynek wypada na zablokowany przydział tej osoby; przy ręcznym wstawieniu sprawdzanie zaczyna się kilka dni wcześniej (maks. liczba dni odpoczynku). Test: testy/rest8.js.

## v49 — połączenie z FlotoMax
- Łącznik MCP „FlotoMax” (claude.ai → Ustawienia → Łączniki), capability `mcp` z narzędziami list_drivers, list_trips.
- Pasek „FlotoMax” pod zakładkami: pobranie po otwarciu strony, co 10 min i przyciskiem. Szczegóły: co wpisano i co do sprawdzenia.
- Kierowcy: łączenie po `flotoId` (lub nazwisku), nowi aktywni dopisywani (kat. C wg FlotoMax).
- Wyjazdy: dzień = dzień dostawy, out/back w czasie polskim, `tripAt` (pełne daty, dokładne godziny także > doby), trasa zamknięta, Nagel/dyżur = zrealizowany z dutyH. Wyjazd < 15 min pomijany, nieznany typ trasy (np. „Trasa niezapowiedziana”) zgłaszany. Faktyczny kierowca zastępuje zaplanowanego.
- Wpisano do bazy wyjazdy 29.09–02.10 (20) i kierowcę Dariusz Faraś.
- Test: testy/floto.js (dane: testy/floto_data.json).

## v50–v51 (02.10)
- Oś godzin: kafelek łapie się i upuszcza jak w typowym programie do grafików (wiersz = kierowca, kolumna = dzień, miejsce = godzina wyjazdu, co 15 min); prawa krawędź zmienia długość; „Pula etykiet” nad osią; Cofnij działa. Zakończonym trasom zmienia się tylko godziny.
- FlotoMax: plan zleceń (list_assignments) z blokadą i zwrotami, nieobecności w obie strony, dostępność i wolne miejsca na urlop (set_availability), kierowca wirtualny, nowe typy zmian z nieznanych etykiet.
- Zmiany automatyczne tylko w przyszłości (repair zamraża dni przed dziś i trasy zakończone).
- 9 h odpoczynku kat. C na długiej trasie poza czasem pracy (restHours z FlotoMax ma pierwszeństwo).
- Testy: testy/floto2.js, tl.js, rest9.js; reg.js zaktualizowany. Uzgodnienia: DLA-FLOTOMAX.md.

## v52–v53 (02.10)
- Rotacja dalekich tras (waga ≥ 2, T8–T12): pierwszeństwo ma kierowca z najmniejszą liczbą dalekich tras w oknie ±42 dni, potem ten, kto najdłużej nie jechał; po dalekiej trasie 6 dni przerwy, jeśli jest ktoś inny. Zablokowane i zakończone dalekie trasy liczą się z góry.
- Twarda reguła: dalekiej trasy wyjeżdżającej wieczorem nie dostaje kierowca, którego trasa z tego dnia jeszcze trwa (np. T12 w niedzielę 13:00–05:00 i T9 w poniedziałek z wyjazdem w niedzielę 21:00).
- Oś godzin: kafelki dalekich tras mają kursor przeciągania, działa też kafelek z sąsiedniego grafiku, automatyczne przewijanie przy krawędzi, komunikaty przy nieudanym upuszczeniu.
- W bazie przeliczono dalekie trasy w grafiku 05.10–01.11 (od dziś, bez zablokowanych).
- Test: testy/far.js.

## v54
- Przycisk „⇪ Wyślij grafik do FlotoMax” (set_schedule): tygodnie od bieżącego, replaceFrom/To = pon–ndz, jeden wpis na kierowcę i dzień (zmiany łączone „ + ”), plannedStart = start pierwszej zmiany (dalekie: godzina wyjazdu dzień wcześniej), dni bez przydziału „wolne”, nieobecności jako Urlop/L4/Odpoczynek; bez kierowców wirtualnych. Test: testy/send.js.
- Plan z arkusza (07.09) wpisany na tydzień 05.10–11.10.

## v55
- Grafik wysyłany do FlotoMax bez godzin (tylko etykiety).

## v56
- Nowa szata wg projektu planera (https://claude.ai/artifact/RVYkkMqBy6e591oLbX4aiu): IBM Plex Sans/Mono, tło #F3F4F1, ciemne menu z bursztynowym aktywnym, niebieski przycisk główny, zakładki jako segmenty, białe karty; kafelki w kolorach kategorii (dzienne zielone, dalekie pomarańczowe, dyżur szary, zwroty oliwkowe, z FlotoMax fioletowe) z ciemnym tekstem; jasny i ciemny motyw.

## v57
- Zakładka Kalendarz: kartka miesiąca (pon–ndz), święta ustawowe i dni wolne firmy, urlopy/L4/wnioski/odpoczynek pracowników, dziś zaznaczone, nawigacja miesiącami. Test: testy/kal.js.
- Plan: ciągły grafik (jedna oś czasu, 20 dni do przodu automatycznie) — do zrobienia.

## v58
- Każda etykieta ma własny kolor (LABEL_COLORS, jasne odcienie, ciemny napis; nadpisywalny polem shift.color).
- DO ZROBIENIA: od 12.10 nowe etykiety (do opisania przez właściciela). Trasa 5 znika, numeracja i zasady przesuwają się o -1 od 5: nowa 5 = dawna 6, 6 = dawna 7, 7 = dawna 8 itd.

## v59 — grafik ciągły (02.10)
- Jeden dokument `schedules/rolling` (rolling:true) zamiast tygodni; stare dokumenty scalane automatycznie (migrateRolling).
- Program sam dobudowuje grafik do dziś + 20 dni (ensureHorizon, co godzinę i przy otwarciu). Bieżący i przyszły tydzień zamrożone (freezeTo = niedziela przyszłego tygodnia): obsadzone zostają, puste można uzupełnić, zmiany ręczne dozwolone.
- Widok: od dziś − 7 dni do końca, przycisk „Pokaż 2 tygodnie wcześniej”, „Dziś”; po otwarciu dzisiejszy dzień na 1/3 szerokości.
- Losuj ponownie (grafik ciągły): tylko dni po zamrożeniu, zablokowane/FlotoMax zostają.
- Trasa spoza planu dnia dodana ręcznie: pytanie, czy przestawić resztę grafiku kierowcy.
- Nowi kierowcy (Pracownicy → Początek pracy): 28 dni bez dalekich tras, pierwszeństwo dla tras, których nie znają. „Tydzień nauki”: 2 dni z opiekunem, dyżur, potem różne trasy z różnymi kierowcami (training:true, druga osoba na trasie).
- Sprawiedliwe 2 wolne z rzędu: planOffPairs (weekendy rotują) + fixOffPairs (bez gwarancji przy małej liczbie kierowców).
- Przed daleką trasą min. 9 h wypoczynku od końca poprzedniej (REST_BEFORE_FAR).
- Dziennik wyjazdów `triplog/<routeId>`: plan (planned*) i rzeczywistość (departed/returned, hours, restHours) do przewidywania.
- Żywsze kolory etykiet, wiersze kierowców z poświatą ich koloru.
- DO ZROBIENIA: nowe etykiety od 12.10 (Trasa 5 znika, numeracja −1 od 5) — czekam na listę od właściciela.

## v60
- Oś godzin: na kafelkach tras z odpoczynkiem kat. C pasek „☾ 9 h odpoczynku” (położenie orientacyjne: przed ostatnimi 2 h powrotu).
- Czas zaplanowanej trasy = mediana faktycznych przejazdów tej trasy w ten sam dzień tygodnia (ostatnie 120 dni, min. 2), inaczej z Typów zmian.

## v61
- Oś godzin: godziny trasy pogrubione na początku drugiej linii kafelka; kolumna „Σ godzin”: bieżący tydzień (godziny pracy, liczba kafelków, nadwyżka ponad 40 h) i suma widocznych dni.

## v62
- Pauza 9 h na kafelku: pełna wysokość, ukośne pasy, środek pauzy ≈ 5/12 długości trasy (między 1/3 a 1/2).

## v63
- Odpoczynek 9 h w trasie tylko na trasach wymagających kat. C (Typy zmian → wymaga kat. C; obecnie T10). Przejazdy z FlotoMax: restHours z FlotoMax.

## v64
- Trasy jednorazowe (fromFloto/oneOff, np. „Trasa niezapowiedziana”) nigdy nie są losowane, nawet gdy zaznaczone w Założeniach. Usunięto ją z Założeń (poniedziałek) i wylosowane powtórki 12.10 i 19.10.

## v65
- Oś godzin: Pula etykiet w kolumnie po lewej (sticky), kompaktowe wiersze (38 px) — wszyscy kierowcy na ekranie; suma tygodnia w jednej linii (szczegóły w podpowiedzi).
- Plan FlotoMax: wyjazd dzień wcześniej per trasa (c.prevDep) gdy plannedDeparture wypada dzień przed datą dostawy; zmiana etykiety trasy we FlotoMax usuwa stare miejsce (bez „duchów”).
- Naniesiono plan 03–05.10 z FlotoMax (nowe etykiety: Trasa 13 w niedzielę).

## v66
- Sobota i niedziela wyraźniej: tło kolumn #E7E9F2 (ciemny: #232A33), nagłówek z niebieską kreską u góry.

## v67
- Godziny z planu FlotoMax co do minuty (bez zaokrąglania do 15 min); podziałka osi co 3 h; na części kafelka przed wyjazdem najpierw „wyj. HH:MM”.

## v68
- cellPrev: c.prevDep (true/false) z planu FlotoMax ma pierwszeństwo przed typem trasy — wyjazd tego samego dnia jest możliwy dla T8–T12.
- 04.10: T11 Wranik nd 13:30→pn 15:15 i T12 Piórkowski nd 15:40→pn 09:44 poprawione ręcznie i zablokowane (manualT), bo API FlotoMax podaje sobotę.

## v69 — zastępstwa za nieobecność w zamrożonym tygodniu
- Zastępca nie dostaje drugiej zmiany tego samego dnia (np. trasa 01:30 + dyżur 14:30).
- Spośród możliwych zastępców wybierany jest ten, kto ma w tym tygodniu najmniej dni pracy.
- Sprawdzone symulacją urlopu (Knura 06–08.10, tylko lokalnie): Trasa 7 → Schmidt / Misiewicz / Czogała zamiast Misiewicza 2×.

## v70 — wyraźniejszy urlop
- Urlop w tabeli i na osi godzin: ciemnoniebieskie pasy, biały napis WIELKIMI LITERAMI, obramowanie i cień.

## v71 — suma dnia
- Na osi godzin w każdym dniu kierowcy (w prawym dolnym rogu, na szarym pasie nocy) etykieta „Σ x h” = łączny czas pracy wszystkich zadań tego dnia (np. trasa rano + Zwroty/dyżur), bez 9 h odpoczynku w trasie kat. C.

## v72 — opis nadgodzin w Bilansie
- „Dopuszczalne nadgodziny” opisane: dniówki na kierowcę na tydzień, tylko do Bilansu.

## v73 — dymki z opisem
- Po najechaniu myszą (ok. 0,6 s) pojawia się okienko z opisem: nagłówki tabel, pola ustawień, liczniki KPI oraz wszystkie elementy, które miały podpowiedź (kafelki, sumy, wolne miejsca).
- Słownik ok. 80 opisów pojęć (Bilans, Kadry, Rejestr, Kalendarz, Typy zmian).

## v74 — Bilans z danych rzeczywistych
- Druga karta Bilansu: średnia z tygodni grafiku (obsadzone trasy, rzeczywiste urlopy/L4), godziny planowane i wykonane (FlotoMax), wiarygodność danych wg liczby tygodni historii.

## v75 — konta i logowanie
- Ekran Logowanie: kafelki osób w grupach (Spedycja, Kadry, Administrator), PIN 4 cyfry (hash SHA-256 z solą w app/users), wymuszona zmiana PIN-u tymczasowego, „← Nie ja, zmień konto”, Wyloguj.
- Spedycja: Plan tygodnia, Dyspozycja dnia, Kalendarz; edycja planu; w puli etykiet kafelki Urlop i L4 (= nieobecność z naprawą kolizji).
- Kadry: Kadry, Rejestr, Pracownicy (zmiana nazwiska ✎, kat., aktywny), Historia kierowcy (dzień po dniu, wyjazd/powrót z FlotoMax lub plan, dniówki, filtr dat); plan tylko do podglądu.
- Administrator: wszystko + zakładka Konta (dodaj, usuń, zmień grupę, resetuj PIN). Asystent AI tylko dla Administratora.
- Ograniczenie: logowanie działa w przeglądarce — porządkuje menu, nie jest twardym zabezpieczeniem danych.

## v76 — dane płacowe tylko dla Jolanty i Administratora
- Nowa zakładka „Płace 🔒”: stawki i wypłata brutto na miesiąc, propozycja (stawka × dniówki), Zapisz szkic / Zatwierdź listę (kto i kiedy), ponowne otwarcie tylko przez Administratora.
- Dane zaszyfrowane w app/payroll (AES-GCM, klucz z hasła płacowego, PBKDF2 250 tys.). Hasło ustawia Administrator; bez niego kwot nie odczyta nikt, także ktoś czytający bazę.
- Uprawnienie „płace” nadawane w Kontach (Jolanta: tak). Stawki usunięte z kartoteki kierowców i z eksportu; pola stawek i kwoty ukryte dla pozostałych.

## v77 — poprawka logowania
- Konta, płace i migracja stawek czytane przez onSnapshot (baza strony nie ma .get()) — wcześniej strona nie widziała kont i działała bez logowania.

## Stan na 03.10.2026 — symulacja i zapis
- Pełny zestaw testów (24 pliki, ~370 sprawdzeń): wszystkie OK. Poprawiony test `edge.js` (pomija zakładki ukryte dla danego konta).
- Symulacja na danych z bazy (tylko odczyt, bez zapisów do FlotoMax): grafik do 23.10, zamrożone dni bez zmian, brak tras u nieobecnych, brak pustych tras, brak przydziałów dla kierowcy wirtualnego, brak naruszeń 9 h odpoczynku. Sobota 03.10: trasa rano + Zwroty u 5 kierowców — zgodnie z założeniem (łączny czas pokazuje „Σ” na osi godzin).
- Otwarte: `publish_week_view` (czeka na narzędzie w łączniku FlotoMax i opis parametrów), poprawka `plannedDepartureAt` po stronie FlotoMax (DLA-FLOTOMAX.md p. 5–6), nowe etykiety od 12.10, hasło płacowe do ustawienia przez Administratora.

## v78 — nauka czasów tras z FlotoMax
- Program uczy się z faktycznych przejazdów (komórki z FlotoMax + dziennik `triplog`), ile trwa każda trasa i o której wyjeżdża. Zasada: pierwszy przejazd jest średnią, potem średnia z 3 ostatnich. Liczy osobno dla dnia tygodnia, gdy trasa ma w nim własne przejazdy; inaczej ze wszystkich dni.
- Godzina wyjazdu: średnia tylko z przejazdów o podobnej porze co ostatni (±3 h), żeby trasa jeżdżąca raz w południe, raz wieczorem nie dostała średniej „pośrodku”. Z tego wynika też, czy wyjazd jest dzień wcześniej.
- Pierwszeństwo: faktyczny wyjazd/powrót > ręczna poprawka na osi > nauka > plan FlotoMax (`plannedDepartureAt` bywa błędne) > ustawienie w Typach zmian.
- Nauka działa na osi godzin, w „Σ” dnia, w kontroli 9 h odpoczynku przed daleką trasą, w końcówkach z poprzedniego tygodnia, w Dyspozycji dnia i przy upuszczaniu kafelków. Dyżur (Nagel) się nie uczy.
- Typy zmian pokazują zieloną etykietę „FlotoMax: … (śr. z N)” z tym, czego program się nauczył.
- Dziennik `triplog` wczytuje się od razu po starcie, nie dopiero przy pobraniu z FlotoMax.
- Testy: nowy `testy/learn.js` (16 sprawdzeń); `floto2.js` ma przypiętą datę 02.10 (dane testowe są z tygodnia 28.09) i nowe oczekiwanie dla Trasy 10 (nauka przed planem). Cały zestaw: 23 pliki, 345 OK.
- Symulacja na danych z bazy: zamrożone dni bez zmian; nauczone godziny np. Zwroty sb 12:00 · 4 h (statycznie 01:30 · 8 h), Trasa 8 śr. wyjazd wt. 20:45 · 18,25 h. Z nauki wynika jedna kolizja 9 h odpoczynku: Wranik 21→22.10 Trasa 3 → Trasa 11 — do „Sprawdź i napraw”.

## v79 — Urlop i L4 w widoku kafelków
- Pasek kafelków (Plan tygodnia → Kafelki) ma na początku Urlop i L4 do przeciągnięcia na kierowcę i dzień; do tej pory były tylko na osi godzin. Spedycja ma więc nieobecności bez zakładki Kadry.
- Okno wyboru komórki (dotknięcie) ma Urlop i L4, a gdy nieobecność już jest — kafelek „✓ Urlop/L4, dotknij, żeby zdjąć”.
- Ostrzeżenie przy wpisywaniu nieobecności (także w Kadrach): gdy tego dnia zabraknie kierowców do obsady tras lub nie ma już wolnych miejsc na urlop, komunikat „⚠ Uwaga: …”; dodatkowo „⚠ N tras tego dnia nie ma kierowcy”, jeśli naprawa nie znalazła zastępstwa. Nie blokuje wpisu — L4 to fakt. Blokada zostaje tylko dla wniosków urlopowych.
- Test `testy/abs2.js` (7 sprawdzeń). Cały zestaw: 24 pliki, 352 OK.

## v80 — dzisiejszy dzień w planie
- Nagłówek bieżącego dnia ma etykietę „DZIŚ” i podkreślenie w kolorze akcentu, a jego kolumna w widoku kafelków boczne obramowanie. Na osi godzin oznaczony jest nagłówek.

## v81 — zamiany z FlotoMax, nieobecności z każdej strony, widoczne błędy zapisu
- **Zamiany z FlotoMax** (`list_swaps`): przyjęte zamiany na jeden dzień między kierowcami są wczytywane przy każdym pobraniu. Liczy się ostatni stan każdego kierowcy danego dnia (`dayAfter`), więc zamiany tam i z powrotem nie są odtwarzane po kolei. Najpierw zdejmuje etykietę z zamiany, potem wpisuje drugiego kierowcę w zwolnione miejsce; wpisy są zablokowane. Oczekujące (pending) pomijane. Komunikat „Zamiana z FlotoMax: 08.10 Andrzej Czogała: Dyżur od 14:30”. Deklaracja łącznika rozszerzona o `list_swaps` (8 narzędzi).
- **Nieobecność z każdej strony zdejmuje trasy**: formularz w Kadrach nie uruchamiał naprawy grafiku (urlop wpisany, trasy zostawały) — naprawione. Do tego samonaprawa (`absHeal`): gdy nieobecność przyjdzie z FlotoMax, z innej przeglądarki albo z pominiętej ścieżki, a nieobecny kierowca nadal ma trasy od dziś, program sam je zdejmuje, szuka zastępstwa i zapisuje.
- **Widoczny błąd zapisu**: każdy nieudany zapis do bazy pokazuje czerwony pasek „NIE ZAPISANO …”; brak prawa zapisu (konto z samym podglądem) tłumaczy, że właściciel musi udostępnić stronę z prawem edycji. Nieudany zapis nieobecności cofa ją w pamięci, żeby nagłówki nie pokazywały urlopu, którego nie ma w bazie. Prawo zapisu sprawdzane z góry (`user.can("data.write")`).
- **Kolizja na kafelku**: nieobecny kierowca z nadal przydzieloną trasą ma na kafelku czerwone „⚠ Urlop – trasa nadal przydzielona” (np. w trybie podglądu).
- Testy: `testy/abs3.js` (8), `testy/floto3.js` (8). Cały zestaw: 26 plików, 368 OK. Symulacja na danych z bazy: bez błędów, zamrożone dni bez zmian.
- Zgłoszenie użytkownika (06.10): urlop Dziadury 07–11.10 nie trafił do bazy (w bazie nie ma żadnej ręcznie wpisanej nieobecności, tylko 45 dni z FlotoMax) — najpewniej odmowa zapisu, wcześniej niewidoczna. Po odświeżeniu trzeba wpisać ponownie.

## v82 — wydruk tygodnia na A4, nieobecność z FlotoMax usuwalna
- **Wydruk tygodnia**: w Planie tygodnia wybór tygodnia + „🖨 Drukuj tydzień (A4)” + „⬇ Zapisz plik”. Jedna kartka A4 poziomo: wiersz na kierowcę (kolorowy pasek, nazwisko), kolumna na dzień (Pon–Ndz z datą, weekend szary), w komórce duża kolorowa etykieta trasy i pod nią „wyjazd HH:MM” (dla dalekich: „wyjazd Wt 22:00” = dzień wcześniej), dyżur „od 14:30”, URLOP/L4 w kreski, odpoczynek po dalekiej trasie, „— wolne —”. Legenda tras z godziną i czasem z nauki. Wysokość wierszy dopasowuje się do liczby kierowców. „Zapisz plik” daje samodzielny HTML (`grafik-RRRR-MM-DD.html`) przez możliwość `downloads`; bez niej otwiera nową kartę, a w ostateczności podpowiada „Zapisz jako PDF” z okna drukowania. Test `testy/print.js` sprawdza m.in., że PDF ma 1 stronę.
- **Nieobecność z FlotoMax usunięta w Harmonogramie nie wraca**: usunięcie (Kadry ✕ albo okno komórki) dopisuje id wpisu FlotoMax do listy pominiętych (`app/hr._absIgnore`); przy pobraniu program go nie wczytuje. Komunikat przypomina, że we FlotoMax trzeba usunąć osobno (brak narzędzia odwołania — DLA-FLOTOMAX p. 7).
- Baza: urlop Dziadury 07–11.10 (wpis FlotoMax id 11, wysłany z Harmonogramu) zdjęty i dodany do pominiętych; Trasa 1 na 07–10.10 przywrócona Dziadurze.
- Testy: 27 plików, 376 OK.

## v83 — pasek kafelków przyklejony
- Pasek kafelków (Urlop, L4, trasy) w widoku Kafelki jest przyklejony u góry ekranu przy przewijaniu, więc kafelek da się upuścić na kierowcę z dołu listy. Test `testy/sticky.js`.

## v84 — wnioski z FlotoMax
- `list_absences`: wpisy ze statusem `pending/oczekuje/wniosek` (albo pole `requests`) wchodzą jako „wniosek urlopowy” (nie blokują tras), gdy FlotoMax zacznie je zwracać. Zatwierdzone wnioski kierowców FlotoMax nadal nie przekazuje — DLA-FLOTOMAX p. 8.

## v85
- „Brak obsady” pod planem liczy tylko dziś i przyszłość (stare braki z minionych dni nie straszą).

## v86
- Naprawa kolizji nie obsadza pustych miejsc spoza Założeń na dany dzień (bez planu FlotoMax) — takiej trasy tego dnia nie ma; „Brak obsady” też ich nie liczy. Przykład 06.10: pusta Trasa 6 w piątek 09.10 dostała kierowcę, choć piątek w Założeniach nie ma Trasy 6.
