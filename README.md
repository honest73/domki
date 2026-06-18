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

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Prisma 6 · SQLite.
Zmiana bazy na Postgres = podmiana `provider` w `prisma/schema.prisma`
i `DATABASE_URL`.

## Uruchomienie lokalne

```bash
npm install
cp .env.example .env      # uzupełnij hasło, sekret i token
npm run db:push           # utwórz bazę z schematu
npm run db:seed           # dodaj domki Bryziówka 1 i 2
npm run dev               # http://localhost:3000
```

## Konfiguracja (`.env`)

| Zmienna          | Opis                                                          |
| ---------------- | ------------------------------------------------------------ |
| `DATABASE_URL`   | Połączenie z bazą (domyślnie SQLite `file:./dev.db`)         |
| `OWNER_PASSWORD` | Hasło właściciela do panelu (jawne lub hash bcrypt `$2...`)  |
| `SESSION_SECRET` | Długi losowy sekret do podpisywania sesji                    |
| `CLEANING_TOKEN` | Token w linku grafiku: `/sprzatanie/<TOKEN>`                 |
| `APP_URL`        | Publiczny adres aplikacji (do linków iCal i grafiku)        |

## Adresy

- `/login` — logowanie właściciela
- `/panel` — panel rezerwacji (wymaga logowania)
- `/sprzatanie/<CLEANING_TOKEN>` — grafik dla pani sprzątającej
- `/api/ical/<slug>` — feed iCal domku do importu w Booking.com
