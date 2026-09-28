"""Render czarno-bialych podgladow krzyza (PNG) oraz DXF.

Uzycie:
  python3 render_krzyz.py podglad   -> PNG wariantow + arkusz zbiorczy
  python3 render_krzyz.py dxf A     -> DXF wybranego wariantu
Wymiary w milimetrach. Obraz: czysta czern na bieli (tryb 1-bit).
"""
import sys
import os
from PIL import Image, ImageDraw, ImageFont

# Warianty: (nazwa, wysokosc, szerokosc, grubosc belki, przesuniecie poziomej belki)
WARIANTY = {
    'A': dict(opis='krzyz lacinski, belka 4 mm', h=40.0, w=26.0, t=4.0, dy=8.0),
    'B': dict(opis='krzyz lacinski, belka 3 mm (delikatny)', h=40.0, w=26.0, t=3.0, dy=8.0),
    'C': dict(opis='krzyz lacinski, belka 5 mm (mocniejszy)', h=40.0, w=24.0, t=5.0, dy=8.0),
    'D': dict(opis='krzyz rownoramienny 40 x 40, belka 4 mm', h=40.0, w=40.0, t=4.0, dy=0.0),
}


def punkty_krzyza(h, w, t, dy):
    hh, hw, ht = h / 2.0, w / 2.0, t / 2.0
    return [
        (-ht, -hh), (ht, -hh),
        (ht, dy - ht), (hw, dy - ht),
        (hw, dy + ht), (ht, dy + ht),
        (ht, hh), (-ht, hh),
        (-ht, dy + ht), (-hw, dy + ht),
        (-hw, dy - ht), (-ht, dy - ht),
    ]


def font(size):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
              '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def rysuj_krzyz(draw, pts_mm, cx, cy, ppm, fill=0):
    # os Y obrazu w dol, wiec odwracamy y
    poly = [(cx + x * ppm, cy - y * ppm) for x, y in pts_mm]
    draw.polygon(poly, fill=fill)


def podglad_wariantu(key, ppm=20, margines_mm=8):
    v = WARIANTY[key]
    pts = punkty_krzyza(v['h'], v['w'], v['t'], v['dy'])
    W = int((v['w'] + 2 * margines_mm) * ppm)
    H = int((v['h'] + 2 * margines_mm) * ppm)
    img = Image.new('1', (W, H), 1)
    d = ImageDraw.Draw(img)
    rysuj_krzyz(d, pts, W / 2.0, H / 2.0, ppm)
    return img


def linia_wymiarowa(d, x1, y1, x2, y2, tekst, f, pion=False, strzalka=6):
    d.line([(x1, y1), (x2, y2)], fill=0, width=2)
    # kreski ograniczajace
    if pion:
        for y in (y1, y2):
            d.line([(x1 - strzalka, y), (x1 + strzalka, y)], fill=0, width=2)
        tw = d.textlength(tekst, font=f)
        d.text((x1 + 10, (y1 + y2) / 2 - f.size / 2), tekst, fill=0, font=f)
    else:
        for x in (x1, x2):
            d.line([(x, y1 - strzalka), (x, y1 + strzalka)], fill=0, width=2)
        tw = d.textlength(tekst, font=f)
        d.text(((x1 + x2) / 2 - tw / 2, y1 + 8), tekst, fill=0, font=f)


def arkusz(ppm=12):
    """Arkusz zbiorczy: 4 warianty obok siebie + rysunek wymiarowy wariantu A."""
    f_tyt = font(34)
    f = font(26)
    f_small = font(22)
    cell_w = int(70 * ppm)
    cell_h = int(80 * ppm)
    top = 90
    W = cell_w * 4
    H = top + cell_h + 40 + int(72 * ppm)
    img = Image.new('1', (W, H), 1)
    d = ImageDraw.Draw(img)
    d.text((30, 20), 'Krzyz wklesly na urne - warianty (skala: wysokosc 40 mm)', fill=0, font=f_tyt)

    for i, key in enumerate(WARIANTY):
        v = WARIANTY[key]
        pts = punkty_krzyza(v['h'], v['w'], v['t'], v['dy'])
        cx = i * cell_w + cell_w / 2.0
        cy = top + cell_h / 2.0 - 10
        rysuj_krzyz(d, pts, cx, cy, ppm)
        label = 'Wariant %s' % key
        tw = d.textlength(label, font=f)
        d.text((cx - tw / 2, top + 4), label, fill=0, font=f)
        opis = '%s' % v['opis']
        tw = d.textlength(opis, font=f_small)
        d.text((cx - tw / 2, top + cell_h - 62), opis, fill=0, font=f_small)
        wym = '%g x %g mm' % (v['h'], v['w'])
        tw = d.textlength(wym, font=f_small)
        d.text((cx - tw / 2, top + cell_h - 34), wym, fill=0, font=f_small)
        if i:
            d.line([(i * cell_w, top), (i * cell_w, top + cell_h)], fill=0, width=1)

    # rysunek wymiarowy wariantu A
    y0 = top + cell_h + 40
    d.line([(0, y0 - 20), (W, y0 - 20)], fill=0, width=2)
    d.text((30, y0), 'Rysunek wymiarowy - wariant A (glebokosc wciecia 1,5 mm)', fill=0, font=f)
    v = WARIANTY['A']
    pts = punkty_krzyza(v['h'], v['w'], v['t'], v['dy'])
    P = 14  # px/mm na rysunku wymiarowym
    cx = 60 + (v['w'] / 2 + 8) * P
    cy = y0 + 100 + (v['h'] / 2 + 3) * P
    rysuj_krzyz(d, pts, cx, cy, P)
    hh, hw, ht, dy = v['h'] / 2, v['w'] / 2, v['t'] / 2, v['dy']
    # wysokosc calkowita (po prawej)
    x = cx + (hw + 6) * P
    linia_wymiarowa(d, x, cy - hh * P, x, cy + hh * P, '40', f, pion=True)
    # szerokosc calkowita (na dole)
    y = cy + (hh + 5) * P
    linia_wymiarowa(d, cx - hw * P, y, cx + hw * P, y, '26', f)
    # grubosc belki (na gorze)
    y = cy - (hh + 5) * P
    linia_wymiarowa(d, cx - ht * P, y, cx + ht * P, y, '4', f)
    # polozenie poziomej belki: od gory krzyza do gornej krawedzi belki
    x = cx - (hw + 6) * P
    linia_wymiarowa(d, x, cy - hh * P, x, cy - (dy + ht) * P, '10', f, pion=True)
    # opis parametrow obok
    tx = cx + (hw + 16) * P
    opis = [
        'Wysokosc calkowita: 40 mm',
        'Szerokosc calkowita: 26 mm',
        'Grubosc belek: 4 mm',
        'Gorna krawedz poziomej belki: 10 mm od gory',
        'Glebokosc wciecia w urnie: 1,5 mm',
        '',
        'Wszystkie warianty maja 40 mm wysokosci.',
        'Po akceptacji: DXF wybranego wariantu',
        '(obrys zamkniety, jednostki mm).',
    ]
    for j, line in enumerate(opis):
        d.text((tx, y0 + 110 + j * 34), line, fill=0, font=f)
    return img


def zapisz_dxf(key, sciezka):
    import ezdxf
    v = WARIANTY[key]
    pts = punkty_krzyza(v['h'], v['w'], v['t'], v['dy'])
    doc = ezdxf.new('R2010')
    doc.units = ezdxf.units.MM
    doc.header['$INSUNITS'] = 4  # milimetry
    msp = doc.modelspace()
    doc.layers.add('KRZYZ')
    msp.add_lwpolyline(pts, close=True, dxfattribs={'layer': 'KRZYZ'})
    doc.saveas(sciezka)
    return pts


if __name__ == '__main__':
    tryb = sys.argv[1] if len(sys.argv) > 1 else 'podglad'
    out = os.path.dirname(os.path.abspath(__file__))
    if tryb == 'podglad':
        for key in WARIANTY:
            podglad_wariantu(key).save(os.path.join(out, 'krzyz_wariant_%s.png' % key))
        arkusz().save(os.path.join(out, 'krzyz_warianty_arkusz.png'))
        print('zapisano PNG do', out)
    elif tryb == 'dxf':
        key = sys.argv[2].upper()
        p = os.path.join(out, 'krzyz_wariant_%s.dxf' % key)
        zapisz_dxf(key, p)
        print('zapisano', p)
