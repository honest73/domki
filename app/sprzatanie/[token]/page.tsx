import { notFound } from "next/navigation";
import { checkCleaningToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { plDate, plWeekday, todayUtc, ymd } from "@/lib/dates";
import { markCleaned } from "../../panel/actions";

export const dynamic = "force-dynamic";

export default async function CleaningPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!checkCleaningToken(token)) notFound();

  const today = todayUtc();

  // Sprzątanie odbywa się w dniu wymeldowania — bierzemy wymeldowania od dziś.
  const checkouts = await prisma.reservation.findMany({
    where: { status: "confirmed", checkOut: { gte: today } },
    orderBy: { checkOut: "asc" },
    include: { cottage: true },
  });

  // Zameldowania (do wykrycia „tego samego dnia" = trzeba posprzątać do przyjazdu).
  const arrivals = await prisma.reservation.findMany({
    where: { status: "confirmed", checkIn: { gte: today } },
    select: { cottageId: true, checkIn: true },
  });
  const arrivalKeys = new Set(arrivals.map((a) => `${a.cottageId}|${ymd(a.checkIn)}`));

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-stone-800">Grafik sprzątania</h1>
        <p className="text-sm text-stone-500">Bryziówka 1 i 2 · Miłków</p>
      </header>

      {checkouts.length === 0 && (
        <p className="text-sm text-stone-500">Brak zaplanowanych sprzątań.</p>
      )}

      <ul className="space-y-2">
        {checkouts.map((r) => {
          const sameDay = arrivalKeys.has(`${r.cottageId}|${ymd(r.checkOut)}`);
          const done = !!r.cleanedAt;
          return (
            <li
              key={r.id}
              className={`rounded-xl border p-4 flex items-center justify-between gap-3 ${
                done ? "bg-stone-100 border-stone-200" : "bg-white border-stone-200"
              }`}
            >
              <div>
                <div className="font-medium text-stone-800">
                  {r.cottage.name}
                  {done && <span className="ml-2 text-emerald-600 text-sm">✓ posprzątane</span>}
                </div>
                <div className="text-sm text-stone-600 mt-1">
                  Sprzątanie: <span className="font-medium">{plDate(r.checkOut)}</span>{" "}
                  <span className="text-stone-400">({plWeekday(r.checkOut)})</span>
                </div>
                {sameDay && (
                  <div className="text-sm text-amber-700 mt-0.5 font-medium">
                    ⚠ Tego samego dnia przyjazd gości — posprzątać do 14:00
                  </div>
                )}
              </div>
              {!done && (
                <form action={markCleaned}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="token" value={token} />
                  <button className="rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm font-medium hover:bg-emerald-700">
                    Oznacz jako posprzątane
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
