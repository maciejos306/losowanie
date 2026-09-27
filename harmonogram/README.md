# Harmonogram dyżurów

Aplikacja webowa do losowego, sprawiedliwego przydzielania pracowników do zmian/dyżurów,
z trwałą bazą danych (SQLite).

## Funkcje

- Zarządzanie pracownikami (dodawanie, aktywacja/dezaktywacja, usuwanie)
- Oznaczanie dni niedostępności dla każdego pracownika
- Definiowanie typów zmian (np. Ranna, Popołudniowa, Nocna) wraz z liczbą osób potrzebnych na zmianę
- Losowanie harmonogramu dla wybranego zakresu dat:
  - każda osoba pracuje co najwyżej raz dziennie,
  - dni niedostępności są respektowane,
  - obciążenie jest równoważone (osoby z najmniejszą liczbą dotychczasowych zmian są losowane w pierwszej kolejności)
- Ręczna zmiana przydziału w dowolnej komórce harmonogramu
- Ponowne losowanie całego harmonogramu jednym kliknięciem
- Historia harmonogramów zapisana w bazie danych

## Uruchomienie lokalne

```bash
cd harmonogram
pip install -r requirements.txt
python3 app.py
```

Aplikacja wystartuje pod adresem `http://localhost:5000`. Baza danych `harmonogram.db`
zostanie utworzona automatycznie przy pierwszym uruchomieniu.

## Struktura

- `app.py` — backend Flask, model danych (SQLite) i logika losowania
- `templates/` — widoki HTML (Jinja2)
- `static/style.css` — stylistyka spójna z resztą projektu
- `harmonogram.db` — plik bazy danych (tworzony automatycznie, nie jest w repozytorium)

## Wdrożenie

To jest aplikacja z backendem (Flask + SQLite), więc **nie może działać na GitHub Pages**
(hosting tylko dla stron statycznych). Do uruchomienia produkcyjnego potrzebny jest serwer
z Pythonem, np. Render, Railway, Fly.io, PythonAnywhere lub własny VPS — wystarczy
`pip install -r requirements.txt` i uruchomienie przez WSGI (np. `gunicorn app:app`).
