# Harmonogram dyżurów: zapis postępów

Stan na koniec sesji 29.09.2026. Żywa wersja: https://claude.ai/artifact/MEtsioA6AVgn9HZJUZCxYu (wersja 39, capabilities `db` i `sample`).
Plik `harmonogram-app.html` w tym folderze jest tą samą wersją. Instrukcja pracy dla drugiej osoby: `PRZEKAZANIE.md`.

## Co działa
- Plan tygodnia w widoku kafelków i godzin (oś 24 h), rano i po południu, niedziela bez podziału, wyraźne granice dni.
- Losowanie z ciągłością tras, odpoczynkiem po dalekich trasach, normą 5 dni pracy, kat. C i poprzednim tygodniem.
- Ręczne zmiany: przeciąganie, blokowanie komórek, naprawa kolizji od wybranego dnia, dzielenie dnia na dwie trasy, Cofnij (Ctrl+Z).
- Nieobecności (odpoczynek, urlop, L4, wniosek) z zakresami dat. Wniosek ponad limit wolnych miejsc w dniu jest odrzucany. Inicjały i wolne miejsca widać w nagłówku dnia.
- Szacowana liczba tras pod dniem (z Założeń, edytowalna).
- Rachunek w dniówkach: norma 5 na tydzień, dzień wolny lub urlop kosztuje 1 dniówkę, dalekie trasy i dodatkowe dni je podnoszą, dyżur liczy się tylko zrealizowany (0,5, a wyjazd ponad 5 h to 1). Losowanie wyrównuje salda.
- Kadry: raport miesięczny, rachunek dniówek, saldo, CSV, stawka kierowcy (tylko do wpisania).
- Karta Bilans: pojemność (kierowcy × 5,5 dniówki) kontra zapotrzebowanie, statusy i zalecenie zatrudnienia.
- Asystent AI (okno po prawej): pytania i polecenia, zmiany za zatwierdzeniem, Cofnij.
- API dla FlotoMax: `window.HarmonogramPlugin` (getData, setData, availability, hrReport, requestLeave, freeDrivers, generate, repair, reportDuty, bilans) oraz postMessage.

## Poprawki z ostatniej symulacji
- Trasa w drugiej połowie dnia była traktowana jak dyżur i nie kolidowała z trasą na cały dzień.
- Ponowne losowanie gubiło podział dnia i status dyżuru w zablokowanych komórkach.
- Cofnięcie mogło przywrócić plan z kierowcą na dniu urlopu lub L4. Teraz program naprawia takie kolizje, gdy nieobecności zmieniły się po zrobieniu kopii.
- Czyszczenie dnia kierowcy mogło oddać mu tę samą trasę.

## Testy (`testy/`)
`e2e.js` (27 kroków), `edge.js`, `feat.js`, `ledger.js`, `duty.js`, `bilans.js`, `split.js`, `big2.js` (40 tygodni), `settle.js` i `settle_many.js` (rozliczenia dzienne, tygodniowe, miesięczne liczone niezależnie), `fuzz.js` (losowe operacje, niezmienniki planu), `aitest.js` z atrapą `fake.js` (obsługa okna asystenta i narzędzi).
Uruchamianie: `node shot.js`, potem wybrany test. Dla `aitest.js` i `fuzz.js` trzeba zbudować `local_ai.html` z atrapą modelu (patrz nagłówek `fake.js`).

## Otwarte tematy
- Asystent nie był sprawdzony z prawdziwym modelem, tylko z atrapą. Pierwsze użycie wymaga zgody w przeglądarce.
- Saldo dniówek nie zmniejsza się przy odbiorze dni wolnych. Można dodać rodzaj nieobecności „odbiór”.
- Stawka kierowcy jest tylko zapisywana, jeszcze nie liczy wynagrodzenia.
- Nowe pola kierowcy (prawo jazdy, badania, kod 95, karta kierowcy) i alerty ważności: czekają na dane z FlotoMax.
- Asystent w FlotoMax obok zestawienia tras: do zrobienia w makiecie FlotoMax.
- Licznik lub limit poleceń asystenta na osobę (na życzenie).
- Potwierdzić z kadrową przeliczenia godzin i zasadę przerwy kierowcy.
- Zmiana nazwy „Dyżur”, bo w przepisach o czasie pracy kierowców ma inne znaczenie.
