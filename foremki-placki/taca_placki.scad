// Taca-foremka do placków ziemniaczanych (druk 3D)
// Proces: dozowanie masy -> mroźnia -> wybijanie na taśmę -> smażalnik taśmowy
// Wszystkie wymiary w mm. Zmień parametry i wyeksportuj STL (F6, potem F7).

/* [Gniazda] */
rows   = 3;     // liczba rzędów
cols   = 3;     // liczba kolumn
D      = 75;    // średnica placka na górze gniazda
h      = 12;    // grubość placka (głębokość gniazda)
draft  = 7;     // pochylenie ścianek [stopnie], ułatwia wybicie
fillet = 2;     // promień zaokrąglenia dna gniazda

/* [Taca] */
gap    = 6;     // odstęp między gniazdami
margin = 6;     // margines od krawędzi tacy
wall   = 1.6;   // grubość dna i ścianek gniazda (4 obrysy z dyszy 0,4)
top    = 2.5;   // grubość górnej płyty
skirt  = 2;     // grubość obrzeża
corner = 6;     // promień narożników tacy

$fn = 96;

R  = D / 2;
r  = R - h * tan(draft);                 // promień dna gniazda
W  = cols * D + (cols - 1) * gap + 2 * margin;
L  = rows * D + (rows - 1) * gap + 2 * margin;
H  = h + wall;
ro = r + wall;                           // promień zewnętrzny dna
Ro = ro + (H - top) * tan(draft);        // promień zewnętrzny pod płytą

echo(str("Taca: ", W, " x ", L, " x ", H, " mm, gniazd: ", rows * cols));

function cx(i) = -W / 2 + margin + R + i * (D + gap);
function cy(j) = -L / 2 + margin + R + j * (D + gap);

// Krzywa Béziera 2. stopnia jako lista punktów (zaokrąglenie dna)
function bez(p0, p1, p2, n = 10) =
    [for (k = [0:n]) let(t = k / n) (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2];

module rrect(w, l, rad, hh) {
    linear_extrude(hh) offset(r = rad) square([w - 2 * rad, l - 2 * rad], center = true);
}

// Wnętrze gniazda (bryła odejmowana)
module cavity_inner() {
    rotate_extrude()
        polygon(concat(
            [[0, -h]],
            bez([r - fillet, -h], [r, -h], [r + fillet * sin(draft), -h + fillet * cos(draft)]),
            [[R, 0], [R, 1], [0, 1]]
        ));
}

// Zewnętrzna skorupa gniazda
module cavity_outer() {
    rotate_extrude()
        polygon(concat(
            [[0, -H]],
            bez([ro - fillet, -H], [ro, -H], [ro + fillet * sin(draft), -H + fillet * cos(draft)]),
            [[Ro, -top], [Ro, 0], [0, 0]]
        ));
}

module tray() {
    difference() {
        union() {
            translate([0, 0, -top]) rrect(W, L, corner, top);
            translate([0, 0, -H]) difference() {
                rrect(W, L, corner, H - top + 0.01);
                translate([0, 0, -1]) rrect(W - 2 * skirt, L - 2 * skirt, corner - skirt, H + 2);
            }
            for (i = [0:cols - 1], j = [0:rows - 1])
                translate([cx(i), cy(j), 0]) cavity_outer();
        }
        for (i = [0:cols - 1], j = [0:rows - 1])
            translate([cx(i), cy(j), 0]) cavity_inner();
    }
}

// Drukować dnem gniazd do stołu: obracamy tak, by spód tacy leżał na z = 0
translate([0, 0, H]) tray();
