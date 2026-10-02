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
