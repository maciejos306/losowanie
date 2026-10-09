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
  // { nazwa, mocKw, eksploatacjaZlH }
  maszyny: [
    // PRZYKŁAD – do zastąpienia danymi z zakładu:
    { nazwa: 'Kocioł warzelny 150 l', mocKw: 9, eksploatacjaZlH: 3 },
    { nazwa: 'Mikser spiralny 60 l', mocKw: 3, eksploatacjaZlH: 2 },
    { nazwa: 'Pierogarka automatyczna', mocKw: 1.5, eksploatacjaZlH: 4 },
    { nazwa: 'Obieraczka do ziemniaków', mocKw: 0.75, eksploatacjaZlH: 1 },
    { nazwa: 'Chłodnia / schładzarka', mocKw: 2.2, eksploatacjaZlH: 1.5 },
  ],

  // ---------- SPIŻARNIA (składniki + dostawy z faktur) ----------
  // { nazwa, jedn, minStan, dostawy: [ { data, ilosc, kwota, faktura } ] }
  skladniki: [
    { nazwa: 'Mąka pszenna typ 500', jedn: 'kg', minStan: 100, dostawy: [ { data: '2026-10-01', ilosc: 500, kwota: 1500, faktura: 'FV 240/10' } ] },
    { nazwa: 'Ziemniaki', jedn: 'kg', minStan: 50, dostawy: [ { data: '2026-10-01', ilosc: 400, kwota: 720, faktura: 'FV 12/10' } ] },
    { nazwa: 'Twaróg półtłusty', jedn: 'kg', minStan: 20, dostawy: [ { data: '2026-10-02', ilosc: 80, kwota: 1360, faktura: 'FV 88/10' } ] },
    { nazwa: 'Cebula', jedn: 'kg', minStan: 10, dostawy: [ { data: '2026-10-01', ilosc: 60, kwota: 150, faktura: 'FV 12/10' } ] },
    { nazwa: 'Jaja', jedn: 'szt.', minStan: 60, dostawy: [ { data: '2026-10-02', ilosc: 360, kwota: 252, faktura: 'FV 89/10' } ] },
    { nazwa: 'Olej rzepakowy', jedn: 'l', minStan: 5, dostawy: [ { data: '2026-09-28', ilosc: 30, kwota: 240, faktura: 'FV 101/09' } ] },
    { nazwa: 'Sól', jedn: 'kg', minStan: 5, dostawy: [ { data: '2026-09-01', ilosc: 25, kwota: 40, faktura: 'FV 3/09' } ] },
  ],

  // ---------- PRODUKTY (karta + receptura na partię) ----------
  // { nazwa, jedn, partia, opis,
  //   skladniki: [ { nazwa, ilosc } ],
  //   ludzie:    [ { etap, osob, godzin, stawka? } ],
  //   maszyny:   [ { nazwa, godzin } ],
  //   inne:      [ { opis, kwota } ] }
  produkty: [
    { nazwa: 'Pierogi ruskie', jedn: 'kg', partia: 100, opis: 'Ciasto: mąka, woda, jaja, olej, sól. Farsz: ziemniaki, twaróg, cebula.',
      skladniki: [ { nazwa: 'Mąka pszenna typ 500', ilosc: 40 }, { nazwa: 'Ziemniaki', ilosc: 45 }, { nazwa: 'Twaróg półtłusty', ilosc: 18 }, { nazwa: 'Cebula', ilosc: 6 }, { nazwa: 'Jaja', ilosc: 30 }, { nazwa: 'Olej rzepakowy', ilosc: 2 }, { nazwa: 'Sól', ilosc: 0.8 } ],
      ludzie: [ { etap: 'Przygotowanie farszu', osob: 2, godzin: 2 }, { etap: 'Ciasto i formowanie', osob: 3, godzin: 3 }, { etap: 'Gotowanie, chłodzenie, pakowanie', osob: 2, godzin: 1.5 } ],
      maszyny: [ { nazwa: 'Obieraczka do ziemniaków', godzin: 0.5 }, { nazwa: 'Kocioł warzelny 150 l', godzin: 2.5 }, { nazwa: 'Mikser spiralny 60 l', godzin: 1 }, { nazwa: 'Pierogarka automatyczna', godzin: 3 }, { nazwa: 'Chłodnia / schładzarka', godzin: 2 } ],
      inne: [ { opis: 'Opakowania (tacki, folia, etykiety)', kwota: 60 }, { opis: 'Gaz / woda', kwota: 25 } ] },
  ],
};
