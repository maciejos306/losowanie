# Skrypt Fusion 360: prosty, minimalistyczny krzyz wklesly (wciety w powierzchnie).
#
# Uruchomienie w Fusion 360:
#   1. Otworz projekt (np. "camen urna 1").
#   2. Narzedzia (Utilities) -> Add-Ins -> Scripts and Add-Ins (Shift+S).
#   3. Zakladka "Scripts" -> zielony "+" -> wskaz folder "KrzyzWklesly".
#   4. Zaznacz "KrzyzWklesly" -> Run.
#   5. Kliknij plaska sciane urny, na ktorej ma byc krzyz.
#
# Krzyz jest centrowany na srodku wybranej sciany i wycinany w glab bryly.
# Wszystkie wymiary ponizej sa w milimetrach.

import adsk.core
import adsk.fusion
import traceback

# ---------------- PARAMETRY (mm) ----------------
WYSOKOSC = 40.0        # calkowita wysokosc krzyza (pionowa belka)
SZEROKOSC = 26.0       # calkowita szerokosc krzyza (pozioma belka)
GRUBOSC_BELKI = 4.0    # grubosc obu belek
GLEBOKOSC = 1.5        # glebokosc wciecia w bryle
# Polozenie poziomej belki: 0.0 = srodek pionowej belki (krzyz rownoramienny),
# wartosc dodatnia przesuwa belke do gory (krzyz lacinski, jak na urnie Beo).
PRZESUNIECIE_BELKI = 8.0
# Rownoramienny krzyz 40 x 40 mm? Ustaw True (wtedy SZEROKOSC = WYSOKOSC,
# PRZESUNIECIE_BELKI = 0).
ROWNORAMIENNY = False
# ------------------------------------------------

MM = 0.1  # Fusion API liczy wewnetrznie w centymetrach


def punkty_krzyza(h, w, t, dy):
    """Zwraca 12 wierzcholkow obrysu krzyza (w mm) wzgledem srodka (0,0)."""
    hh = h / 2.0
    hw = w / 2.0
    ht = t / 2.0
    return [
        (-ht, -hh), (ht, -hh),           # dol pionowej belki
        (ht, dy - ht), (hw, dy - ht),    # prawa dolna krawedz poziomej belki
        (hw, dy + ht), (ht, dy + ht),    # prawa gorna krawedz
        (ht, hh), (-ht, hh),             # gora pionowej belki
        (-ht, dy + ht), (-hw, dy + ht),  # lewa gorna krawedz
        (-hw, dy - ht), (-ht, dy - ht),  # lewa dolna krawedz
    ]


def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui = app.userInterface
        design = adsk.fusion.Design.cast(app.activeProduct)
        if not design:
            ui.messageBox('Otworz projekt typu Design (np. "camen urna 1") i uruchom skrypt ponownie.')
            return

        h = WYSOKOSC
        w = WYSOKOSC if ROWNORAMIENNY else SZEROKOSC
        dy = 0.0 if ROWNORAMIENNY else PRZESUNIECIE_BELKI
        t = GRUBOSC_BELKI

        if abs(dy) + t / 2.0 >= h / 2.0:
            ui.messageBox('PRZESUNIECIE_BELKI jest za duze - pozioma belka wychodzi poza pionowa.')
            return

        sel = ui.selectEntity('Kliknij plaska sciane, na ktorej ma byc wklesly krzyz', 'PlanarFaces')
        if not sel:
            return
        face = adsk.fusion.BRepFace.cast(sel.entity)
        comp = face.body.parentComponent

        # Szkic na wybranej scianie, krzyz wysrodkowany na jej srodku.
        sketch = comp.sketches.add(face)
        sketch.name = 'Krzyz wklesly'
        center = sketch.modelToSketchSpace(face.centroid)

        pts = punkty_krzyza(h, w, t, dy)
        lines = sketch.sketchCurves.sketchLines
        n = len(pts)
        for i in range(n):
            x1, y1 = pts[i]
            x2, y2 = pts[(i + 1) % n]
            p1 = adsk.core.Point3D.create(center.x + x1 * MM, center.y + y1 * MM, 0)
            p2 = adsk.core.Point3D.create(center.x + x2 * MM, center.y + y2 * MM, 0)
            lines.addByTwoPoints(p1, p2)

        # Najmniejszy profil zamkniety = obrys krzyza (sciana moze dac tez wiekszy profil).
        prof = None
        best = None
        for i in range(sketch.profiles.count):
            p = sketch.profiles.item(i)
            a = p.areaProperties().area
            if best is None or a < best:
                best = a
                prof = p
        if prof is None:
            ui.messageBox('Nie udalo sie utworzyc profilu krzyza.')
            return

        extrudes = comp.features.extrudeFeatures
        depth = GLEBOKOSC * MM
        feature = None
        for sign in (-1.0, 1.0):  # najpierw w glab bryly, w razie czego odwrotnie
            try:
                inp = extrudes.createInput(prof, adsk.fusion.FeatureOperations.CutFeatureOperation)
                inp.setDistanceExtent(False, adsk.core.ValueInput.createByReal(sign * depth))
                inp.participantBodies = [face.body]
                feature = extrudes.add(inp)
                if feature and feature.bodies.count > 0:
                    break
                if feature:
                    feature.deleteMe()
                    feature = None
            except Exception:
                feature = None
        if feature is None:
            ui.messageBox('Wyciecie sie nie powiodlo. Sprawdz, czy sciana jest plaska i czy krzyz miesci sie na scianie.')
            return

        feature.name = 'Krzyz wklesly'
        ui.messageBox('Gotowe: wklesly krzyz {:g} x {:g} mm, glebokosc {:g} mm.'.format(h, w, GLEBOKOSC))

    except Exception:
        if ui:
            ui.messageBox('Blad skryptu:\n{}'.format(traceback.format_exc()))
