import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { plDate, nights, todayUtc } from "@/lib/dates";
import {
  cancelReservation,
  deleteReservation,
  saveBookingUrl,
  syncBooking,
  logout,
} from "./actions";
import ReservationForm from "./ReservationForm";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  if (!(await isLoggedIn())) redirect("/login");

  const appUrl = process.env.APP_URL ?? "";
  const cleaningToken = process.env.CLEANING_TOKEN ?? "";

  const cottages = await prisma.cottage.findMany({ orderBy: { name: "asc" } });
  const today = todayUtc();

  // Nadchodzące i trwające rezerwacje (wymeldowanie dziś lub później)
  const reservations = await prisma.reservation.findMany({
    where: { status: "confirmed", checkOut: { gte: today } },
    orderBy: { checkIn: "asc" },
    include: { cottage: true },
  });

  const cleaningLink = appUrl && cleaningToken ? `${appUrl}/sprzatanie/${cleaningToken}` : null;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Bryziówka — rezerwacje</h1>
          <p className="text-sm text-stone-500">Miłków · Bryziówka 1 i 2</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/panel/oferta"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium hover:bg-stone-100"
          >
            Edytuj ofertę
          </Link>
          <form action={syncBooking}>
            <button className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium hover:bg-stone-100">
              ↻ Synchronizuj Booking
            </button>
          </form>
          <form action={logout}>
            <button className="rounded-lg px-3 py-2 text-sm text-stone-500 hover:text-stone-800">
              Wyloguj
            </button>
          </form>
        </div>
      </header>

      {cleaningLink && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
          <span className="font-medium">Link dla pani sprzątającej:</span>{" "}
          <a href={cleaningLink} className="underline break-all">{cleaningLink}</a>
        </div>
      )}

      <ReservationForm cottages={cottages.map((c) => ({ id: c.id, name: c.name }))} />

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-stone-800">Nadchodzące pobyty</h2>
        {reservations.length === 0 && (
          <p className="text-sm text-stone-500">Brak nadchodzących rezerwacji.</p>
        )}
        <ul className="space-y-2">
          {reservations.map((r) => (
            <li
              key={r.id}
              className="bg-white rounded-xl border border-stone-200 p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-800">{r.cottage.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      r.source === "booking"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {r.source === "booking" ? "Booking.com" : "własna"}
                  </span>
                </div>
                <div className="text-sm text-stone-600 mt-1">
                  {plDate(r.checkIn)} → {plDate(r.checkOut)} · {nights(r.checkIn, r.checkOut)} nocy
                  {r.guestName ? ` · ${r.guestName}` : ""}
                  {r.phone ? ` · tel. ${r.phone}` : ""}
                </div>
                {r.notes && <div className="text-sm text-stone-400 mt-0.5">{r.notes}</div>}
              </div>
              <div className="flex items-center gap-2">
                <form action={cancelReservation}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="text-sm text-amber-700 hover:underline">Anuluj</button>
                </form>
                <form action={deleteReservation}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="text-sm text-red-600 hover:underline">Usuń</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-stone-800">Połączenie z Booking.com</h2>
        <p className="text-sm text-stone-500">
          Wklej link „Eksportuj kalendarz" (iCal) z panelu Booking.com dla każdego domku — będziemy
          zaciągać zajętość. W drugą stronę: poniższy link „Eksport iCal" wklej w Booking jako import,
          aby Twoje własne rezerwacje blokowały terminy.
        </p>
        <div className="space-y-3">
          {cottages.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
              <div className="font-medium text-stone-800">{c.name}</div>
              <form action={saveBookingUrl} className="flex flex-wrap gap-2 items-end">
                <input type="hidden" name="cottageId" value={c.id} />
                <label className="flex-1 min-w-[240px] text-sm text-stone-600 flex flex-col gap-1">
                  Link iCal z Booking.com (import)
                  <input
                    name="bookingIcalUrl"
                    defaultValue={c.bookingIcalUrl ?? ""}
                    placeholder="https://ical.booking.com/v1/export?..."
                    className="rounded-lg border border-stone-300 px-3 py-2"
                  />
                </label>
                <button className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium hover:bg-stone-100">
                  Zapisz
                </button>
              </form>
              {appUrl && (
                <div className="text-sm text-stone-500">
                  Eksport iCal (wklej w Booking):{" "}
                  <a href={`${appUrl}/api/ical/${c.slug}`} className="underline break-all">
                    {appUrl}/api/ical/{c.slug}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
