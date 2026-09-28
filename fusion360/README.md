# Skrypty Fusion 360

## KrzyzWklesly

Wycina prosty, minimalistyczny wklęsły krzyż (w stylu urny Beo) na wybranej
płaskiej ścianie modelu. Domyślnie krzyż łaciński 40 x 26 mm, belki 4 mm,
wcięcie 1,5 mm.

Jak użyć w otwartym projekcie (np. „camen urna 1"):

1. Skopiuj folder `fusion360/KrzyzWklesly` na swój komputer.
2. W Fusion 360: Utilities -> Add-Ins -> Scripts and Add-Ins (Shift+S).
3. Zakładka Scripts -> zielony „+" -> wskaż folder `KrzyzWklesly`.
4. Zaznacz `KrzyzWklesly` -> Run.
5. Kliknij ścianę urny, na której ma być krzyż. Krzyż zostanie wyśrodkowany.

Wymiary zmieniasz w sekcji PARAMETRY na górze pliku `KrzyzWklesly.py`
(np. `ROWNORAMIENNY = True` da krzyż 40 x 40 mm). Operacja jest zwykłym
wyciągnięciem typu Cut, więc widać ją w osi czasu i można ją cofnąć lub edytować.
