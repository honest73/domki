import { prisma } from "@/lib/db";
import { buildIcalFeed } from "@/lib/ical";
import { todayUtc } from "@/lib/dates";

export const dynamic = "force-dynamic";

// Publiczny feed iCal zajętości domku — Booking.com importuje go, by blokować terminy.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cottage = await prisma.cottage.findUnique({ where: { slug } });
  if (!cottage) return new Response("Nie znaleziono domku", { status: 404 });

  const reservations = await prisma.reservation.findMany({
    where: { cottageId: cottage.id, status: "confirmed", checkOut: { gte: todayUtc() } },
    orderBy: { checkIn: "asc" },
  });

  const body = buildIcalFeed(cottage.name, reservations);
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
