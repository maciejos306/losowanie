# Uzgodnienia Harmonogram ↔ FlotoMax

Harmonogram (artefakt claude.ai) łączy się z FlotoMax przez łącznik MCP „FlotoMax”.
Używa narzędzi: list_drivers, list_assignments, list_trips, list_absences, report_absence, set_availability.

## Co Harmonogram robi z danymi
- Kierowcy: łączenie po `id` FlotoMax. Nazwy zawierające „wirtualn” lub „symulac” to miejsca na trasę bez kierowcy; nie są losowane.
- Plan (`list_assignments`, status inny niż done): przydział zablokowany w grafiku. `kind:"zwroty"` = typ zmiany „Zwroty” (dzień dzielony: trasa rano, zwroty po południu).
  Godzina startu i czas z `plannedDepartureAt`/`plannedReturnAt`. Nieznana etykieta (np. „Trasa niezapowiedziana”) = nowy typ zmiany (1 dniówka, poza Założeniami).
  Zlecenie u kierowcy wirtualnego: Harmonogram dobiera prawdziwego kierowcę.
- Wyjazdy (`list_trips`): dzień dostawy, godziny w czasie polskim, trasa zakończona. Wyjazd < 15 min jest pomijany jako błędne kliknięcie.
- `restHours` przy wyjeździe: faktyczny odpoczynek w trasie, odejmowany od czasu pracy. Bez danych (plan): 9 h dla kat. C na trasie ≥ 2 dniówki trwającej ≥ 12 h.
- Nieobecności: urlop→urlop, l4→L4, wolne→odpoczynek. Wpisy z Harmonogramu są wysyłane przez `report_absence`.
- `set_availability` na 21 dni: kto dostępny i notatka „Wolnych miejsc na urlop: N (potrzeba kierowców: X)”.
- Zmiany grafiku dotyczą tylko przyszłości; dni minione i trasy zakończone nie są ruszane.

## Prośby do FlotoMax
1. Blokować wniosek urlopowy kierowcy, gdy na dany dzień „Wolnych miejsc na urlop” = 0 (z `set_availability`).
2. Okna dostaw zależne od dnia tygodnia, np. w niedzielę PIB Gołymin ok. 20:00, King Warszawa ok. 22:00.
   Planowana godzina wyjazdu (`plannedDepartureAt`) powinna to uwzględniać; Harmonogram pokaże ją na osi.
3. Odpoczynek 9 h kat. C na długiej trasie nie jest czasem pracy: dalej podawać `restHours` przy każdym wyjeździe.
4. Wyjazd Romana Wranika (Nagel 30.09, 2 min) do poprawienia.
5. `list_assignments`: dla Tras 11 i 12 z 04.10 `plannedDepartureAt` jest dzień za wcześnie (sobota 03.10 13:30 / 15:40), a karta trasy pokazuje niedzielę 04.10 13:30 / 15:40 (Trasa 13 jest poprawna). Popraw wyliczanie planowanego wyjazdu przy cofaniu o odpoczynek kat. C / godzinę otwarcia odbiorcy. Harmonogram przyjmuje teraz wyjazd tego samego dnia także dla tras zwykle wyjeżdżających dzień wcześniej (c.prevDep = true/false wg planu).

6. **Widok osi czasu (rozwiązanie z Harmonogramu, 04.10).** Na osi FlotoMax Trasa 11 Wranika zaczyna się w sobotę 03.10 13:30, a Schmidt ma w niedzielę „Trasa 11 · wyj. ~06:00 · 20 h”. Tak naprawiliśmy to w Harmonogramie:
   1. **Dzień wyjazdu bierz z rzeczywistej daty i godziny, nie z reguły.** Nie zakładaj, że trasa 8+ zawsze wyjeżdża dzień wcześniej. Kafelek rysuj od `plannedDepartureAt` (data + godzina). Jeśli ta data jest taka sama jak dzień rozwózki, wyjazd jest tego samego dnia. U nas jest to pole `prevDep: true/false` wyliczone z daty, a stała reguła służy tylko jako ostatnia deska ratunku.
   2. **Popraw samo `plannedDepartureAt`.** Dla T11 i T12 z 04.10 musi być niedziela 04.10 13:30 i 15:40, tak jak na karcie trasy. Błąd powstaje przy cofaniu startu o 9 h odpoczynku kat. C albo o godzinę otwarcia odbiorcy. Cofnięcie ma zmieniać godzinę, a dzień tylko wtedy, gdy wynik naprawdę wypada przed północą.
   3. **Szacunek („~06:00”) tylko gdy brak planu.** Gdy trasa ma zaplanowaną godzinę, pokaż ją z dokładnością do minuty. Szacunek z historii (mediana z tego dnia tygodnia) pokazuj dopiero, gdy planu brak. Sprawdź też etykietę: Schmidt 04.10 ma Trasę 13 (wyj. 14:35, powrót pon. 02:34), nie Trasę 11.
   4. **Trasa przez północ:** jeden kafelek od wyjazdu do powrotu, a w następnym dniu kontynuacja „→ Trasa 11 do 15:15”. Tak już macie.
   5. **Odpoczynek 9 h w trasie** licz tylko dla tras kat. C (obecnie T10). Pokazuj go jako pasek w kafelku i odejmuj od czasu pracy.
   6. **Ręczna poprawka w planie ma wygrywać z wyliczeniem.** U nas jest to `manualT` + `locked`. Bez tego każda synchronizacja przywraca błędny dzień.
