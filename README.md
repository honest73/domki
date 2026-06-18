# Bryziówka — panel rezerwacji

Panel rezerwacji domków **Bryziówka 1 i 2** w Miłkowie, z dwukierunkową
synchronizacją kalendarza z **Booking.com** (iCal) oraz osobnym **grafikiem
sprzątania** dla pani sprzątającej.

## Funkcje

- **Panel właściciela** (logowanie hasłem) — dodawanie/anulowanie/usuwanie
  rezerwacji, lista nadchodzących pobytów, wykrywanie kolizji terminów.
- **Synchronizacja z Booking.com przez iCal**:
  - *import* — wklejasz link „Eksportuj kalendarz" z Booking dla każdego domku,
    panel zaciąga zajętość (przycisk „Synchronizuj Booking");
  - *eksport* — panel udostępnia własny feed iCal
    (`/api/ical/bryziowka-1`, `/api/ical/bryziowka-2`), który wklejasz w Booking
    jako import, żeby Twoje własne rezerwacje blokowały terminy.
- **Grafik sprzątania** — osobny link z tokenem (bez logowania), pokazuje dni
  wymeldowań, oznacza „sprzątanie tego samego dnia co przyjazd" i pozwala
  odhaczyć posprzątane domki.

> **Uwaga o Booking.com:** pełne API Connectivity wymaga partnerstwa i
> certyfikacji — dla 2 domków stosujemy standardową synchronizację iCal, która
> działa od ręki, bez partnerstwa.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Prisma 6 · SQLite
(baza to plik na serwerze — bez zewnętrznej bazy danych).

## Uruchomienie lokalne

```bash
npm install
cp .env.example .env   # uzupełnij hasło, sekret i token
npm run db:setup       # utwórz bazę SQLite + dodaj domki Bryziówka 1 i 2
npm run dev            # http://localhost:3000
```

## Konfiguracja (`.env`)

| Zmienna          | Opis                                                         |
| ---------------- | ----------------------------------------------------------- |
| `DATABASE_URL`   | Ścieżka pliku SQLite, np. `file:./prod.db` (w katalogu `prisma/`) |
| `OWNER_PASSWORD` | Hasło właściciela do panelu (jawne lub hash bcrypt `$2...`) |
| `SESSION_SECRET` | Długi losowy sekret do podpisywania sesji                   |
| `CLEANING_TOKEN` | Token w linku grafiku: `/sprzatanie/<TOKEN>`                |
| `APP_URL`        | Publiczny adres aplikacji (do linków iCal i grafiku)       |

## Deploy na seohost.pl (DirectAdmin, Node.js)

Aplikacja startuje plikiem `server.js` i trzyma dane w pliku SQLite —
nie potrzebuje zewnętrznej bazy.

1. **Wgraj pliki** projektu do katalogu poza `public_html`
   (np. `~/aplikacje/bryziowka`) — przez Git, FTP albo Menedżer plików.
2. **Terminal SSH** (DirectAdmin → Terminal) w katalogu aplikacji:
   ```bash
   npm install
   cp .env.example .env   # i ustaw hasło, SESSION_SECRET, CLEANING_TOKEN, APP_URL
   npm run db:setup       # tworzy bazę SQLite i dodaje oba domki
   npm run build
   ```
3. **DirectAdmin → Setup Node.js App** (kreator aplikacji Node.js):
   - *Application Root:* katalog aplikacji (np. `aplikacje/bryziowka`)
   - *Application startup file:* `server.js`
   - *Node version:* 20 lub nowsza
   - *Environment:* `production`
   - zapisz i **Start/Restart**. Panel sam utworzy `.htaccess` z proxy.
4. Aplikacja działa pod **adresem technicznym** przypisanym do tej aplikacji
   (domena nie jest wymagana). Ten adres wpisz też jako `APP_URL` w `.env`
   i zrestartuj aplikację.

> Po zmianach w kodzie: `git pull && npm install && npm run build`, a potem
> **Restart** aplikacji w panelu. Plik bazy (`prisma/prod.db`) zostaje nietknięty.

## Adresy

- `/login` — logowanie właściciela
- `/panel` — panel rezerwacji (wymaga logowania)
- `/sprzatanie/<CLEANING_TOKEN>` — grafik dla pani sprzątającej
- `/api/ical/<slug>` — feed iCal domku do importu w Booking.com
