# Program do powielania 3MF

Program dla drukarek Bambu Lab: bierze pocięty plik `.gcode.3mf` i skleja go N razy w jeden plik,
tak żeby drukarka po każdym wydruku schłodziła stół, zepchnęła obiekt, podgrzała się,
skalibrowała stół i zaczęła drukować ten sam obiekt od nowa.

## Co tu wrzucić

1. Przykładowy pocięty plik z Bambu Studio (`.gcode.3mf`, „Export plate sliced file”).
2. G-code z dopisaną sekwencją chłodzenia i spychania (cały plik albo sam fragment końcowy).
3. Program/kod napisany wcześniej w Gemini.
4. Notatki: model drukarki, czy ostatnia kopia też ma być zepchnięta, inne wymagania.
