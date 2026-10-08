# Kalkulator kosztów produkcji – wyroby garmażeryjne

Aplikacja w jednym pliku HTML (`kalkulator-kosztow.html`), działa offline w przeglądarce,
bez instalacji. Dane zapisują się automatycznie w przeglądarce; kopię robisz przez eksport JSON.

## Ułatwienia dostępu
- przyciski **A / A+ / A++** – trzy wielkości czcionki,
- **Wysoki kontrast** – czarne tło, biały i żółty tekst, wyraźne obramowania,
- duże pola i przyciski, wyraźne podświetlenie aktywnego elementu, obsługa klawiaturą.

## Moduły
1. **Maszyny i ludzie** – lista maszyn (moc w kW, koszt eksploatacji zł/h); program liczy koszt prądu
   i pełny koszt godziny maszyny. Domyślna stawka pracownika.
2. **Spiżarnia** – składniki i dostawy z faktur (ilość, kwota). Program liczy średnią ważoną cenę
   (lub cenę z ostatniej faktury), stan magazynu i ostrzega o niskim stanie.
3. **Produkty i przepisy** – karta produktu na partię bazową (np. 100 kg): składniki ze spiżarni,
   etapy pracy (liczba osób × godziny), maszyny (godziny pracy), inne koszty.
4. **Kuchnia** – wybierasz produkt i ilość (np. pierogi 300 kg). Program przelicza proporcje
   składników, roboczogodziny, zużycie prądu, eksploatację maszyn, koszty ogólne, koszt za kg,
   cenę netto/brutto i sprawdza, czy składniki są w spiżarni. „Zapisz produkcję” zdejmuje
   składniki ze stanu i dodaje wpis do historii.
5. **Ustawienia** – cena prądu, koszty ogólne, marża, VAT, eksport/import, przykładowe dane.
