# Harmonogram dyżurów (plugin FlotoMax) — przekazanie projektu

Plik dla drugiej osoby i jej Claude Code. Wklej to na start rozmowy:
„Przeczytaj harmonogram-plugin/PRZEKAZANIE.md i pracuj według niego.”

## Co to jest
Program kadrowy do planowania dyżurów kierowców na 1–2 tygodnie do przodu, z liczeniem godzin dla kadrowej.
Jest pluginem FlotoMax. FlotoMax dobiera kierowców do tras na podstawie tego grafiku
(trasy, obszary i kilometry to zadanie FlotoMax, nie tego programu).

Działa jako **Claude Artifact z bazą (capability `db`)**, jeden plik `harmonogram-app.html`, czysty JavaScript, bez frameworków.
- Aktualny adres: https://claude.ai/artifact/MEtsioA6AVgn9HZJUZCxYu (właściciel: maciejos306)
- Ta kopia w repo jest stanem na dzień przekazania. Żywa wersja może być nowsza.

## Jak współpracować (ważne)
Baza jest przypisana do konkretnego artefaktu. Są dwa sposoby:

1. **Wspólna żywa wersja (zalecane).** Właściciel udostępnia artefakt drugiej osobie z prawem **edycji**
   (przycisk „Udział” na stronie programu). Wtedy druga osoba w Claude Code:
   - czyta stronę: Artifact `action: "read"` z tym adresem,
   - zmienia kod i publikuje z `url` tego artefaktu (bez `url` powstałby osobny artefakt z pustą bazą),
   - dane widzą obie strony, bo baza jest wspólna.
   Kolizja wersji: jeśli publikacja jest odrzucona, przeczytać żywą wersję, scalić zmiany i opublikować ponownie. Nie używać `force`.
2. **Własna kopia do prób.** Opublikować `harmonogram-app.html` jako nowy artefakt. Ma pustą bazę,
   więc nie psuje danych produkcyjnych. Dane można wgrać przez „Eksport/Import JSON” w programie.
   Gotowe zmiany trafiają potem do wspólnej wersji przez właściciela lub przez punkt 1.

Zanim cokolwiek się opublikuje: uruchomić testy (niżej). Po zmianie zawsze publikować ten sam plik z `url`.

## Dane w bazie (kolekcje/dokumenty)
| Dokument | Zawartość |
|---|---|
| `app/employees` | `{items:[{id,name,active,hasC?,color?}]}` (8 kierowców, id e1–e8; brak kat. C tylko u Tomasza Bubona) |
| `app/shifts` | typy zmian/tras: `id,name,people,weight (dniówki),part (full/am/pm),rest (dni odpoczynku, ręcznie),start,startDow,hours,reqC` |
| `app/absences` | `{items:[{empId,date,reason}]}` reason: `odpoczynek`,`urlop`,`l4`,`wniosek` (oczekujący, żółty) |
| `app/plan` | Założenia: które trasy jadą w które dni tygodnia (`days[0..6]`, 0 = niedziela) |
| `app/labels` | edytowalne napisy interfejsu |
| `app/hr` | ręczne pola Kadr: stan dni wolnych, stan nadgodzin |
| `schedules/<id>` | tydzień: `{id,name,start,end,cells:[{date,shiftId,slot,empId,locked?,part?}],est?}` |

Ważne pułapki:
- Dane ze snapshotu bazy są zamrożone. Przed zmianą robić `structuredClone`, inaczej zapis cicho nie działa.
- Publikować zawsze z `url`.
- `cell.part` (`am`/`pm`) to nadpisanie połowy dnia, gdy kierowca ma dwie trasy w jednym dniu.
- `s.est[data]` to ręcznie ustawiona szacowana liczba tras w dniu (domyślnie z Założeń).

## Reguły biznesowe (ustalone z właścicielem, nie zmieniać bez pytania)
- Wagi w dniówkach: Trasa 1–7 = 1, Zwroty = 1, Dyżur (dawniej Nagel) = 0,5, Trasa 8–11 = 2,5, Trasa 12 = 2.
- Odpoczynek po dalekiej trasie wynika z wagi, ale jest **edytowalny per trasa** (obecnie 8–11 → 1 dzień, 12 → 0).
- Ciągłość trasy: kierowca trzyma tę samą trasę z dnia na dzień. Dalekie trasy przydzielane najpierw, najlepiej komuś wolnemu wczoraj.
- Dzień dzielimy na rano i po południu. W niedzielę bez podziału. Dwie trasy jednego kierowcy w jednym dniu = jedna rano, druga po południu.
- Dyżur (po południu) to praca po godzinach: nie koliduje z trasą na cały dzień, nie liczy się jako dzień pracy,
  blokują go tylko odpoczynek i nieobecność oraz (przy losowaniu) daleka trasa tego dnia.
- Poprzedni tydzień jest brany pod uwagę (odpoczynek się przenosi, np. niedziela Trasa 10/11 → brak dyżuru w poniedziałek).
- Co najmniej 2 dni wolne w tygodniu pon–ndz (maks. 5 dni pracy).
- Ręczna zmiana blokuje komórkę (ciemna ramka). Automatyczna naprawa kolizji rusza dopiero od tego dnia i nie tyka zablokowanych.
- Kat. C: Trasa 10 wymaga kat. C.
- Wniosek urlopowy jest żółty i nie blokuje, dopóki spedytor go nie zatwierdzi (wtedy staje się urlopem).
- Limit urlopów w dniu: wolne miejsca = aktywni kierowcy − szacowana liczba tras − nieobecni. Zgłoszenie urlopu (wniosek), które przekroczyłoby limit w którymkolwiek dniu zakresu, jest **odrzucane** (UI i `requestLeave`, które zwraca `{ok:false,blocked}`). L4, odpoczynek i urlop wpisany bezpośrednio przez kadry nie są blokowane.
- Inicjały kierowców z wnioskiem (żółte) i zatwierdzonym urlopem (niebieskie) widać w nagłówku każdego dnia u wszystkich użytkowników.
- Rachunek dniówek (jak system płatniczy): trasa daje „monety” równe wadze (dyżur 0,5; T1–7 i Zwroty 1; T8–11 2,5; T12 2). Norma to 5 dniówek na tydzień Pon–Ndz, pomniejszona o dni L4. Dzień wolny przydzielony przez system i urlop bez wyjazdu kosztują 1 dniówkę z salda, dalekie trasy i dodatkowe dni je podnoszą. Saldo = ręczny bilans otwarcia (`app/hr`, pole `overtime`, teraz w dniówkach) + suma tygodni od `app/hr._since`. Liczą się tylko tygodnie w pełni objęte harmonogramami. 1 dniówka = 8,5 h tylko do przeliczeń na godziny. Kadry pokazują też dni wolne przydzielone (zatwierdzone urlopy) i zgłoszone (wnioski).
- Sprawiedliwe losowanie: kierowcy z wyższym saldem dostają więcej dni wolnych (przesunięcie licznika o saldo w dniówkach, ograniczone do ±3). Gdy brakuje ludzi, komórka może dostać dodatkowy dzień pracy (`cell.extra`, maks. 6 dni w tygodniu, odpoczynek po dalekich trasach zawsze zachowany), wlicza się do salda jak każda dniówka.
- Kadry: godziny podstawowe do 8 h/dzień, nadgodziny, dyżur, urlop, L4, wnioski + ręczne pola, eksport CSV.
- Statystyczne starty: Trasy 1–7 i Zwroty 01:30 (sobota 02:30) 8 h; T8 22:00/20 h; T9, T10 21:00/20 h; T11 19:00/20 h; T12 13:00/16 h; Dyżur 14:30/5 h.

## Struktura kodu (harmonogram-app.html)
Pojedynczy plik. Kluczowe funkcje: `generate(start,end,excludeId)` (losowanie), `repair(sched,fromDate,extraLocked)` (naprawa kolizji),
`assignShift` (ręczna edycja, blokowanie, dzielenie dnia), `undoLast` (Cofnij, Ctrl+Z, 40 kroków), `availability(date)` (Dyspozycja dnia),
`hrReport(month)` (Kadry), `renderPlan`/`renderTimeline` (widok kafelków i godzin), `estOf/estTag` (szacowana liczba tras),
drag & drop na zdarzeniach pointer.
API dla FlotoMax: `window.HarmonogramPlugin` (getData, setData, availability, hrReport, requestLeave, freeDrivers, generate, repair)
oraz komunikaty `postMessage` o tych samych nazwach.

## Testy (Playwright)
W `testy/`: `shot.js` buduje `local.html` z atrapą bazy i robi zrzuty ekranu, `e2e.js` to ok. 27 kroków, `split.js` sprawdza dzielenie dnia i cofanie.
```
cd harmonogram-plugin/testy
npm i playwright           # przeglądarka Chromium musi być dostępna
node shot.js && node e2e.js && node split.js
```
W `shot.js` i `e2e.js` jest ścieżka do przeglądarki (`executablePath`). Popraw ją na swoją.
Błąd „ERR_CERT_AUTHORITY_INVALID” w konsoli pochodzi ze środowiska i można go pominąć.
Po każdej zmianie `harmonogram-app.html` uruchom `node shot.js`, żeby przebudować `local.html`.

## Otwarte tematy
- Przekazywanie szacowanej liczby tras z FlotoMax na bieżąco (na razie ręcznie lub z Założeń).
- Zapisanie edytowanych napisów na stałe w kodzie (na życzenie właściciela).
- Potwierdzenie z kadrową przeliczania godzin i zasady przerwy kierowcy.
- Opcjonalnie: dyżur na dzień z daleką trasą przy ręcznej edycji jest dziś dozwolony bez ostrzeżenia.
- Wersja serwerowa (Flask + SQLite) jest osobno w folderze `harmonogram/`. To starsza droga, nie łączy się z artefaktem.
