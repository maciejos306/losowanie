// ============================================================
//  DANE ZAKŁADU – dział garmażeryjny
//  Ten plik jest "bazą danych startową" aplikacji.
//  Uzupełniany stopniowo na podstawie danych z zakładu.
//  Wczytanie: Ustawienia -> "Wczytaj dane zakładu"
//  (przy pierwszym uruchomieniu wczytuje się automatycznie).
//
//  Jednostki: moc w kW, eksploatacja w zł za godzinę pracy maszyny,
//  ilości składników w jednostce składnika (kg / l / szt.),
//  kwoty z faktur netto w zł, receptury na PARTIĘ bazową.
// ============================================================
window.DANE_ZAKLADU = {

  ustawienia: {
    labourRate: 35,   // domyślna stawka pracownika zł/h (z narzutami) – DO POTWIERDZENIA
    hoursFte: 168,    // godzin w miesiącu na pełny etat
    energy: 1.2,      // cena prądu zł/kWh
    overhead: 10,     // koszty ogólne zakładu % kosztu bezpośredniego
    margin: 20,       // domyślna marża %
    vat: 5,           // VAT % (wyroby garmażeryjne – zwykle 5%)
    priceMode: 'avg'  // 'avg' = średnia z faktur, 'last' = ostatnia faktura
  },

  // ---------- PRACOWNICY DZIAŁU ----------
  // { osoba, etat (1 = pełny, 0.75 = 3/4), stawka? zł/h (puste = domyślna) }
  pracownicy: [
    { osoba: 'Pracownica 1', etat: 1 },
    { osoba: 'Pracownica 2', etat: 1 },
    { osoba: 'Pracownica 3', etat: 0.75 },
  ],

  // ---------- MASZYNY DZIAŁU ----------
  // { nazwa, mocKw, eksploatacjaZlH }   (moc i eksploatacja ORIENTACYJNE – do potwierdzenia)
  maszyny: [
    { nazwa: 'Kocioł warzelny 150 l', mocKw: 9, eksploatacjaZlH: 3 },
    { nazwa: 'Mikser spiralny do ciasta 60 l', mocKw: 3, eksploatacjaZlH: 2 },
    { nazwa: 'Pierogarka automatyczna', mocKw: 1.5, eksploatacjaZlH: 4 },
    { nazwa: 'Obieraczka do ziemniaków', mocKw: 0.75, eksploatacjaZlH: 1 },
    { nazwa: 'Wilk do mięsa', mocKw: 1.5, eksploatacjaZlH: 1.5 },
    { nazwa: 'Patelnia elektryczna (naleśniki)', mocKw: 3.5, eksploatacjaZlH: 1 },
    { nazwa: 'Smażalnik / frytkownica', mocKw: 6, eksploatacjaZlH: 2 },
    { nazwa: 'Chłodnia / schładzarka', mocKw: 2.2, eksploatacjaZlH: 1.5 },
  ],

  // ---------- SPIŻARNIA (składniki + dostawy z faktur) ----------
  // { nazwa, jedn, minStan, dostawy: [ { data, ilosc, kwota, faktura } ] }
  // Dostawy opisane "ORIENTACYJNA" to założone ceny rynkowe – do zastąpienia fakturami.
  skladniki: [
    { nazwa: 'Mąka pszenna typ 500', jedn: 'kg', minStan: 100, dostawy: [ { data: '2026-10-01', ilosc: 500, kwota: 1500, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Mąka ziemniaczana', jedn: 'kg', minStan: 20, dostawy: [ { data: '2026-10-01', ilosc: 100, kwota: 500, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Ziemniaki', jedn: 'kg', minStan: 50, dostawy: [ { data: '2026-10-01', ilosc: 400, kwota: 720, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Twaróg półtłusty', jedn: 'kg', minStan: 20, dostawy: [ { data: '2026-10-02', ilosc: 100, kwota: 1700, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Cebula', jedn: 'kg', minStan: 10, dostawy: [ { data: '2026-10-01', ilosc: 60, kwota: 150, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Jaja', jedn: 'szt.', minStan: 60, dostawy: [ { data: '2026-10-02', ilosc: 720, kwota: 504, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Olej rzepakowy', jedn: 'l', minStan: 5, dostawy: [ { data: '2026-09-28', ilosc: 60, kwota: 480, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Mleko 2%', jedn: 'l', minStan: 10, dostawy: [ { data: '2026-10-02', ilosc: 100, kwota: 350, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Cukier', jedn: 'kg', minStan: 5, dostawy: [ { data: '2026-09-01', ilosc: 50, kwota: 200, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Sól', jedn: 'kg', minStan: 5, dostawy: [ { data: '2026-09-01', ilosc: 25, kwota: 40, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Pieprz mielony', jedn: 'kg', minStan: 0.5, dostawy: [ { data: '2026-09-01', ilosc: 2, kwota: 120, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Bułka tarta', jedn: 'kg', minStan: 5, dostawy: [ { data: '2026-10-01', ilosc: 50, kwota: 300, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Kapusta kiszona', jedn: 'kg', minStan: 20, dostawy: [ { data: '2026-10-03', ilosc: 200, kwota: 900, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Grzyby suszone', jedn: 'kg', minStan: 0.5, dostawy: [ { data: '2026-10-03', ilosc: 5, kwota: 900, faktura: 'CENA ORIENTACYJNA' } ] },
    { nazwa: 'Łopatka wieprzowa b/k', jedn: 'kg', minStan: 20, dostawy: [ { data: '2026-10-03', ilosc: 100, kwota: 1600, faktura: 'CENA ORIENTACYJNA (z własnego zakładu)' } ] },
  ],

  // ---------- PRODUKTY (karta + receptura na partię) ----------
  // { nazwa, jedn, partia, opis,
  //   skladniki: [ { nazwa, ilosc } ],
  //   ludzie:    [ { etap, osob, godzin, stawka? } ],
  //   maszyny:   [ { nazwa, godzin } ],
  //   inne:      [ { opis, kwota } ] }
  // Receptury ORIENTACYJNE na 100 kg gotowego wyrobu – do potwierdzenia w zakładzie.
  produkty: [
    { nazwa: 'Pierogi ruskie', jedn: 'kg', partia: 100, opis: 'RECEPTURA ORIENTACYJNA. Ciasto: mąka, woda, jaja, olej, sól. Farsz: ziemniaki, twaróg, cebula smażona.',
      skladniki: [ { nazwa: 'Mąka pszenna typ 500', ilosc: 40 }, { nazwa: 'Jaja', ilosc: 30 }, { nazwa: 'Olej rzepakowy', ilosc: 2 }, { nazwa: 'Sól', ilosc: 0.8 }, { nazwa: 'Ziemniaki', ilosc: 45 }, { nazwa: 'Twaróg półtłusty', ilosc: 18 }, { nazwa: 'Cebula', ilosc: 6 }, { nazwa: 'Pieprz mielony', ilosc: 0.1 } ],
      ludzie: [ { etap: 'Przygotowanie farszu', osob: 2, godzin: 2 }, { etap: 'Ciasto i formowanie', osob: 3, godzin: 3 }, { etap: 'Gotowanie, chłodzenie, pakowanie', osob: 2, godzin: 1.5 } ],
      maszyny: [ { nazwa: 'Obieraczka do ziemniaków', godzin: 0.5 }, { nazwa: 'Kocioł warzelny 150 l', godzin: 2.5 }, { nazwa: 'Mikser spiralny do ciasta 60 l', godzin: 1 }, { nazwa: 'Pierogarka automatyczna', godzin: 3 }, { nazwa: 'Chłodnia / schładzarka', godzin: 2 } ],
      inne: [ { opis: 'Opakowania (tacki, folia, etykiety)', kwota: 60 }, { opis: 'Gaz / woda', kwota: 25 } ] },

    { nazwa: 'Pierogi z kapustą i grzybami', jedn: 'kg', partia: 100, opis: 'RECEPTURA ORIENTACYJNA. Ciasto jak w ruskich. Farsz: kapusta kiszona duszona, grzyby suszone, cebula.',
      skladniki: [ { nazwa: 'Mąka pszenna typ 500', ilosc: 40 }, { nazwa: 'Jaja', ilosc: 30 }, { nazwa: 'Olej rzepakowy', ilosc: 3 }, { nazwa: 'Sól', ilosc: 0.6 }, { nazwa: 'Kapusta kiszona', ilosc: 55 }, { nazwa: 'Grzyby suszone', ilosc: 1.5 }, { nazwa: 'Cebula', ilosc: 8 }, { nazwa: 'Pieprz mielony', ilosc: 0.15 } ],
      ludzie: [ { etap: 'Przygotowanie farszu (duszenie kapusty, grzyby)', osob: 2, godzin: 2.5 }, { etap: 'Ciasto i formowanie', osob: 3, godzin: 3 }, { etap: 'Gotowanie, chłodzenie, pakowanie', osob: 2, godzin: 1.5 } ],
      maszyny: [ { nazwa: 'Kocioł warzelny 150 l', godzin: 3.5 }, { nazwa: 'Mikser spiralny do ciasta 60 l', godzin: 1 }, { nazwa: 'Pierogarka automatyczna', godzin: 3 }, { nazwa: 'Chłodnia / schładzarka', godzin: 2 } ],
      inne: [ { opis: 'Opakowania (tacki, folia, etykiety)', kwota: 60 }, { opis: 'Gaz / woda', kwota: 25 } ] },

    { nazwa: 'Pierogi na słodko (z serem)', jedn: 'kg', partia: 100, opis: 'RECEPTURA ORIENTACYJNA. Ciasto jak w ruskich. Farsz: twaróg, cukier, żółtka.',
      skladniki: [ { nazwa: 'Mąka pszenna typ 500', ilosc: 40 }, { nazwa: 'Jaja', ilosc: 50 }, { nazwa: 'Olej rzepakowy', ilosc: 2 }, { nazwa: 'Sól', ilosc: 0.3 }, { nazwa: 'Twaróg półtłusty', ilosc: 48 }, { nazwa: 'Cukier', ilosc: 7 } ],
      ludzie: [ { etap: 'Przygotowanie farszu', osob: 1, godzin: 1.5 }, { etap: 'Ciasto i formowanie', osob: 3, godzin: 3 }, { etap: 'Gotowanie, chłodzenie, pakowanie', osob: 2, godzin: 1.5 } ],
      maszyny: [ { nazwa: 'Kocioł warzelny 150 l', godzin: 2 }, { nazwa: 'Mikser spiralny do ciasta 60 l', godzin: 1.5 }, { nazwa: 'Pierogarka automatyczna', godzin: 3 }, { nazwa: 'Chłodnia / schładzarka', godzin: 2 } ],
      inne: [ { opis: 'Opakowania (tacki, folia, etykiety)', kwota: 60 }, { opis: 'Gaz / woda', kwota: 20 } ] },

    { nazwa: 'Krokiety z kapustą i grzybami', jedn: 'kg', partia: 100, opis: 'RECEPTURA ORIENTACYJNA. Naleśniki: mąka, mleko, jaja, olej. Farsz: kapusta kiszona, grzyby, cebula. Panierka: jaja, bułka tarta; podsmażane.',
      skladniki: [ { nazwa: 'Mąka pszenna typ 500', ilosc: 25 }, { nazwa: 'Mleko 2%', ilosc: 30 }, { nazwa: 'Jaja', ilosc: 100 }, { nazwa: 'Olej rzepakowy', ilosc: 7 }, { nazwa: 'Sól', ilosc: 0.5 }, { nazwa: 'Kapusta kiszona', ilosc: 42 }, { nazwa: 'Grzyby suszone', ilosc: 1.5 }, { nazwa: 'Cebula', ilosc: 6 }, { nazwa: 'Pieprz mielony', ilosc: 0.1 }, { nazwa: 'Bułka tarta', ilosc: 8 } ],
      ludzie: [ { etap: 'Farsz (duszenie kapusty, grzyby)', osob: 1, godzin: 2.5 }, { etap: 'Smażenie naleśników', osob: 2, godzin: 3 }, { etap: 'Zwijanie i panierowanie', osob: 3, godzin: 2.5 }, { etap: 'Podsmażanie, chłodzenie, pakowanie', osob: 2, godzin: 1.5 } ],
      maszyny: [ { nazwa: 'Kocioł warzelny 150 l', godzin: 2 }, { nazwa: 'Mikser spiralny do ciasta 60 l', godzin: 0.5 }, { nazwa: 'Patelnia elektryczna (naleśniki)', godzin: 3 }, { nazwa: 'Smażalnik / frytkownica', godzin: 1.5 }, { nazwa: 'Chłodnia / schładzarka', godzin: 2 } ],
      inne: [ { opis: 'Opakowania (tacki, folia, etykiety)', kwota: 70 }, { opis: 'Gaz / woda', kwota: 20 } ] },

    { nazwa: 'Krokiety z mięsem', jedn: 'kg', partia: 100, opis: 'RECEPTURA ORIENTACYJNA. Naleśniki jak wyżej. Farsz: łopatka gotowana, mielona z cebulą. Panierka: jaja, bułka tarta; podsmażane.',
      skladniki: [ { nazwa: 'Mąka pszenna typ 500', ilosc: 25 }, { nazwa: 'Mleko 2%', ilosc: 30 }, { nazwa: 'Jaja', ilosc: 100 }, { nazwa: 'Olej rzepakowy', ilosc: 7 }, { nazwa: 'Sól', ilosc: 0.6 }, { nazwa: 'Łopatka wieprzowa b/k', ilosc: 48 }, { nazwa: 'Cebula', ilosc: 6 }, { nazwa: 'Pieprz mielony', ilosc: 0.15 }, { nazwa: 'Bułka tarta', ilosc: 8 } ],
      ludzie: [ { etap: 'Gotowanie i mielenie mięsa, farsz', osob: 1, godzin: 2.5 }, { etap: 'Smażenie naleśników', osob: 2, godzin: 3 }, { etap: 'Zwijanie i panierowanie', osob: 3, godzin: 2.5 }, { etap: 'Podsmażanie, chłodzenie, pakowanie', osob: 2, godzin: 1.5 } ],
      maszyny: [ { nazwa: 'Kocioł warzelny 150 l', godzin: 2.5 }, { nazwa: 'Wilk do mięsa', godzin: 0.5 }, { nazwa: 'Mikser spiralny do ciasta 60 l', godzin: 0.5 }, { nazwa: 'Patelnia elektryczna (naleśniki)', godzin: 3 }, { nazwa: 'Smażalnik / frytkownica', godzin: 1.5 }, { nazwa: 'Chłodnia / schładzarka', godzin: 2 } ],
      inne: [ { opis: 'Opakowania (tacki, folia, etykiety)', kwota: 70 }, { opis: 'Gaz / woda', kwota: 20 } ] },

    { nazwa: 'Kluski śląskie', jedn: 'kg', partia: 100, opis: 'RECEPTURA ORIENTACYJNA. Ziemniaki gotowane, przeciśnięte, mąka ziemniaczana (1/4 objętości), jaja, sól. Formowane ręcznie, gotowane.',
      skladniki: [ { nazwa: 'Ziemniaki', ilosc: 95 }, { nazwa: 'Mąka ziemniaczana', ilosc: 22 }, { nazwa: 'Jaja', ilosc: 12 }, { nazwa: 'Sól', ilosc: 0.8 } ],
      ludzie: [ { etap: 'Obieranie i gotowanie ziemniaków', osob: 1, godzin: 1.5 }, { etap: 'Ciasto i formowanie klusek', osob: 3, godzin: 3 }, { etap: 'Gotowanie, chłodzenie, pakowanie', osob: 2, godzin: 1.5 } ],
      maszyny: [ { nazwa: 'Obieraczka do ziemniaków', godzin: 0.7 }, { nazwa: 'Kocioł warzelny 150 l', godzin: 3 }, { nazwa: 'Mikser spiralny do ciasta 60 l', godzin: 0.5 }, { nazwa: 'Chłodnia / schładzarka', godzin: 2 } ],
      inne: [ { opis: 'Opakowania (tacki, folia, etykiety)', kwota: 55 }, { opis: 'Gaz / woda', kwota: 20 } ] },
  ],
};
