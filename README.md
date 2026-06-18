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

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Prisma 6 · PostgreSQL.

## Uruchomienie lokalne

Wymaga bazy PostgreSQL (np. darmowa „dev branch" w Neon albo lokalny Docker:
`docker run -e POSTGRES_PASSWORD=haslo -p 5432:5432 postgres`).

```bash
npm install
cp .env.example .env       # uzupełnij DATABASE_URL/DIRECT_URL, hasło, sekret i token
npx prisma migrate deploy  # utwórz tabele z migracji
npm run db:seed            # dodaj domki Bryziówka 1 i 2
npm run dev                # http://localhost:3000
```

## Konfiguracja (`.env`)

| Zmienna          | Opis                                                         |
| ---------------- | ----------------------------------------------------------- |
| `DATABASE_URL`   | Postgres — połączenie pooled (runtime)                      |
| `DIRECT_URL`     | Postgres — połączenie bezpośrednie (migracje)               |
| `OWNER_PASSWORD` | Hasło właściciela do panelu (jawne lub hash bcrypt `$2...`) |
| `SESSION_SECRET` | Długi losowy sekret do podpisywania sesji                   |
| `CLEANING_TOKEN` | Token w linku grafiku: `/sprzatanie/<TOKEN>`                |
| `APP_URL`        | Publiczny adres aplikacji (do linków iCal i grafiku)       |

## Deploy na Vercel + Neon

1. **Baza:** załóż projekt na [neon.tech](https://neon.tech), skopiuj dwa
   connection stringi: *pooled* → `DATABASE_URL`, *direct* → `DIRECT_URL`.
2. **Vercel:** zaimportuj repozytorium na [vercel.com](https://vercel.com)
   (framework wykryje się jako Next.js).
3. **Zmienne środowiskowe** w ustawieniach projektu Vercel: `DATABASE_URL`,
   `DIRECT_URL`, `OWNER_PASSWORD`, `SESSION_SECRET`, `CLEANING_TOKEN`,
   `APP_URL` (np. `https://twoja-domena.vercel.app`).
4. **Deploy.** `vercel.json` uruchamia automatycznie:
   `prisma generate → prisma migrate deploy → seed → next build`
   (seed jest idempotentny i **nie nadpisuje** edytowanej oferty).

## Adresy

- `/login` — logowanie właściciela
- `/panel` — panel rezerwacji (wymaga logowania)
- `/sprzatanie/<CLEANING_TOKEN>` — grafik dla pani sprzątającej
- `/api/ical/<slug>` — feed iCal domku do importu w Booking.com
