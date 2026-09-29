# FlotoMAX – lista zadań z sesji 28/29.09.2026

Zadania zebrane z rozmowy (zgłoszenia kierowców z nocy 28/29.09 i uwagi administratora).
Status: NIEWYKONANE w tej sesji – brak dostępu do kodu programu z chmury (kod jest na komputerze lokalnym).

## A. Przywrócenie stanu (najpilniejsze)
1. Przywrócić z kopii zapasowej stan programu z godz. 22:30: dane, nazwy tras, wygląd aplikacji.
2. Przywrócić trasę Krapkowice, jej stan i potwierdzenie wydawki.
3. Kierowcy mają móc ruszyć na wcześniej zaplanowaną trasę potwierdzoną przez wydawkę.
4. Panel administratora: podział tras ma być PRZED wygenerowaniem tras na zwroty (nie odwrotnie).

## B. Duży projekt: konto „Symulator”
- Każdy klient (np. Maxpol) dostaje drugie konto „Maxpol Symulator”.
- Konto symulatora jest w pełni odseparowane od danych prawdziwych.
- W koncie symulatora przycisk „Wczytaj” pobiera ostatni zapis z konta prawdziwego.
- Cel: testowanie i szkolenie w każdej grupie pracowników bez ryzyka dla danych produkcyjnych.
- Pytania do wyjaśnienia z użytkownikiem: czy symulator ma osobne loginy kierowców; czy zapis w symulatorze ma być
  kiedykolwiek przenoszony z powrotem do konta prawdziwego (założenie: NIE); czy „Wczytaj” ma nadpisywać całość.

## C. Panel administratora
5. Przy przycisku „Generuj automatycznie” ikona „Wróć” – przywrócenie stanu sprzed ostatniej zmiany (undo).

## D. Zgłoszenia kierowców (każde = osobna poprawka)
6. Jeżeli wydawka nadpisała informację spedytora, kierowca widzi TYLKO najnowszą informację.
   Spedytor tylko planuje, wydawka potwierdza prawdziwy stan.
7. Korekta danego kontrahenta przez kierowcę możliwa przez 5 min po zakończeniu rozładunku punktu (bufor na pomyłkę).
8. Anulowanie punktu przez kierowcę: wybór powodu – „nie mam tego punktu w samochodzie” / „zamknięte” / „inny”.
   U kierowcy punkt oznaczony jako zrealizowany, u spedytora na trasie widoczny problem.
9. Szacowany czas przyjazdu do następnego punktu liczyć od momentu zakończenia rozładunku poprzedniego
   (przykład: rozładunek zakończony 00:39, o 00:50 program pokazywał przyjazd do Łazisk za 5 min – nierealne).
10. Zabezpieczenie przed przypadkowym rozpoczęciem trasy (Andrzej Czogała omyłkowo uruchomił trasę planowaną
    na niedzielę 23:45). Propozycja: potwierdzenie startu + blokada startu wcześniej niż X godzin przed planem.
11. Trasy „Zwroty” mają zaczynać się od NAJDALSZEGO punktu.
12. Trasa „Zwroty”: kierowca nie startuje z bazy – zamiast „Odjazd od bazy” przycisk „Rozpoczęcie trasy zwroty”.
    GPS nie blokuje startu takiej trasy. Czas przyjazdu na punkty liczony z aktualnej pozycji kierowcy.
13. (Po wykonaniu powyższych) Funkcja dla kierowcy „Dołożenie” opakowań od kontrahenta w trakcie całej trasy;
    edycja możliwa tylko 5 min od zakończenia załadunku. (Treść urwana w zapisie rozmowy – doprecyzować.)
