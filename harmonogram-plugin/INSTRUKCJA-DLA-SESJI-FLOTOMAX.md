# Instrukcja dla sesji FlotoMax: zbuduj Harmonogram dyżurów wewnątrz FlotoMax

Wklej ten plik (albo poniższy tekst) na start rozmowy z Claude w sesji FlotoMax. Repozytorium: `maciejos306/losowanie`, gałąź `claude/program-harmonogram-aabbmy`, folder `harmonogram-plugin/`.

---

**Zadanie.** Wbuduj w FlotoMax moduł „Harmonogram dyżurów” o dokładnie takim działaniu, jakie ma istniejący program w `harmonogram-plugin/harmonogram-app.html` (jeden plik JavaScript, ~300 kB, działający dziś jako osobna strona z łącznikiem do FlotoMax). Po wbudowaniu łącznik znika: kierowcy, trasy, wyjazdy, nieobecności, zamiany i grafik są w jednej bazie FlotoMax, a wszystkie funkcje poniżej działają na niej bezpośrednio.

**Kolejność czytania.**
1. `harmonogram-plugin/SPECYFIKACJA-PRZENIESIENIE-DO-FLOTOMAX.md` — pełna specyfikacja: dane, 18 reguł biznesowych, nauka czasów tras, algorytm, konta i płace, 13 ekranów, tabela integracji, testy, otwarte sprawy, dane do migracji. **To jest źródło prawdy.**
2. `harmonogram-plugin/harmonogram-app.html` — kod: funkcje `generate`, `repair`, `pick`, `seedState`, `assignShift`, `repairForAbsences`, `absHeal`, `learnReadings`/`learned`, `applyFlotoSwaps`, `flotoWeekEntries`, `printWeekHtml`, `renderPlan0`/`renderTimeline`, `renderHR`/`hrReport`, `renderBilans`, `renderRegister`, `renderKonta`, `renderPlace`, `payEnc`/`payDec`. Algorytm przenieś 1:1 (możesz przepisać na język backendu FlotoMax, ale z tymi samymi regułami i stałymi: `HORIZON=20`, `MAX_WORK_DAYS=5`, `REST_BEFORE_FAR=9`, `FAR_W=2`, `FAR_GAP=6`, `FAR_WIN=42`, `DUTY_LIMIT_H=5`, `TRIP_REST_H=9`, `TRIP_REST_MIN=12`, `DAY_H=8.5`, `TRAINEE_DAYS=28`, zamrożenie do niedzieli następnego tygodnia).
3. `harmonogram-plugin/POSTEPY.md` — historia 91 wersji z uzasadnieniem każdej reguły.
4. `harmonogram-plugin/DLA-FLOTOMAX.md` — błędy FlotoMax wykryte przy integracji (p. 1–9); po wbudowaniu większość znika, ale p. 3 (zatwierdzony wniosek kierowcy = nieobecność) i p. 4 (każdy wyjazd ma etykietę trasy) muszą działać wewnątrz FlotoMax.
5. `harmonogram-plugin/testy/` — 29 testów Playwright (~400 sprawdzeń); przenieś je jako testy modułu, bo opisują zachowanie, które użytkownik już zaakceptował.

**Wymagania twarde (nie zmieniać bez pytania właściciela).**
- Reguły 3.1–3.18 ze specyfikacji, w tym: grafik na 20 dni, zamrożony bieżący i następny tydzień; dniówki (T1–7, Zwroty = 1; Dyżur = 0,5; T8–11 = 2,5; T12 = 2); co najmniej 2 dni wolne pon–ndz; odpoczynek po dalekiej trasie; 9 h przed daleką; wyjazd dzień wcześniej; sprawiedliwa rotacja dalekich; ciągłość trasy; kat. C; zastępstwo tylko w komórkach nieobecnego, najmniej obciążonym; nieobecność z każdej strony zdejmuje trasy; puste miejsce zostaje widoczne, program nie łamie reguł.
- Nauka czasów: pierwszy przejazd = średnia, potem średnia z 3 ostatnich, osobno na dzień tygodnia, pora wyjazdu ±3 h, wzorzec dalekich tras dnia tygodnia; pierwszeństwo: fakt > ręczna poprawka > nauka > plan > ustawienie.
- Role: Spedycja (plan, dyspozycja, kalendarz; edycja), Kadry (plan, kadry, rejestr, ludzie; podgląd), Administrator (wszystko). PIN 4 cyfry.
- **Płace: wypłata brutto i stawki widoczne wyłącznie dla Administratora i osoby z uprawnieniem płacowym (Jolanta); dane szyfrowane hasłem (AES-GCM, PBKDF2), w bazie tylko szyfrogram.** To wymóg właściciela.
- Ekrany: Plan tygodnia (Kafelki i Godziny 24 h, przyklejony pasek kafelków Urlop/L4/trasy, okno komórki, „Sprawdź i napraw”, Cofnij, DZIŚ), wydruk tygodnia A4 poziomo na 1 stronie + zapis pliku, Harmonogramy, Pracownicy (+ historia kierowcy), Typy zmian (+ nauka), Założenia, Dyspozycja dnia, Kadry, Bilans (+ kalendarz świąt), Rejestr, Kalendarz, Konta, Płace, asystent AI dla administratora. Widok kierowcy „Mój grafik” ma pokazywać to samo, co wydruk tygodnia (etykieta, godzina wyjazdu, dzień wcześniej, odpoczynek, urlop).

**Migracja danych** z bazy artefaktu `https://claude.ai/artifact/MEtsioA6AVgn9HZJUZCxYu` (właściciel maciejos306): pracownicy (11), typy zmian (16), Założenia, nieobecności, konta (5), grafik ciągły 28.09–26.10, dziennik wyjazdów (35). Eksport: przycisk „Eksport JSON” w zakładce Harmonogramy albo odczyt bazy przez Claude. Płace: odszyfrowuje Administrator w Harmonogramie przed migracją.

**Odbiór.** Moduł jest gotowy, gdy: (1) losowanie na 20 dni z zamrożeniem przechodzi testy `e2e`, `roll`, `rest9`, `far`, `prev`; (2) urlop/L4 wpisany gdziekolwiek zdejmuje trasy i daje zastępstwo (`abs2`, `abs3`); (3) nauka czasów (`learn`); (4) zamiany kierowców zmieniają komórki wprost; (5) wydruk A4 na 1 stronie (`print`); (6) płace zaszyfrowane i niewidoczne poza uprawnionymi (`place`, `konta`); (7) rozliczenia dniówek i godzin zgodne z `settle`, `ledger`, `duty`, `reg`, `bilans`.
