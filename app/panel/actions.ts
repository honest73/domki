"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { destroySession } from "@/lib/auth";
import { fetchBookingEvents } from "@/lib/ical";
import { parseYmd, overlaps } from "@/lib/dates";

export async function addReservation(_prev: string | undefined, formData: FormData) {
  const cottageId = String(formData.get("cottageId") ?? "");
  const guestName = String(formData.get("guestName") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const guests = Number(formData.get("guests") ?? 2) || 2;
  const checkInStr = String(formData.get("checkIn") ?? "");
  const checkOutStr = String(formData.get("checkOut") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!cottageId || !checkInStr || !checkOutStr) return "Uzupełnij domek i daty pobytu.";

  const checkIn = parseYmd(checkInStr);
  const checkOut = parseYmd(checkOutStr);
  if (!(checkOut > checkIn)) return "Data wymeldowania musi być po zameldowaniu.";

  // Kolizja z istniejącymi (aktywnymi) rezerwacjami tego domku
  const existing = await prisma.reservation.findMany({
    where: { cottageId, status: "confirmed" },
    select: { checkIn: true, checkOut: true },
  });
  if (existing.some((r) => overlaps(checkIn, checkOut, r.checkIn, r.checkOut))) {
    return "Termin koliduje z inną rezerwacją tego domku.";
  }

  await prisma.reservation.create({
    data: { cottageId, guestName, phone, guests, checkIn, checkOut, notes, source: "direct" },
  });
  revalidatePath("/panel");
  return undefined;
}

export async function cancelReservation(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.reservation.update({ where: { id }, data: { status: "cancelled" } });
    revalidatePath("/panel");
  }
}

export async function deleteReservation(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.reservation.delete({ where: { id } });
    revalidatePath("/panel");
  }
}

export async function saveBookingUrl(formData: FormData) {
  const cottageId = String(formData.get("cottageId") ?? "");
  const url = String(formData.get("bookingIcalUrl") ?? "").trim() || null;
  if (cottageId) {
    await prisma.cottage.update({ where: { id: cottageId }, data: { bookingIcalUrl: url } });
    revalidatePath("/panel");
  }
}

/** Zaciąga zajętość z kalendarzy Booking.com wszystkich domków, które mają ustawiony link. */
export async function syncBooking() {
  const cottages = await prisma.cottage.findMany({ where: { bookingIcalUrl: { not: null } } });
  for (const c of cottages) {
    let events;
    try {
      events = await fetchBookingEvents(c.bookingIcalUrl!);
    } catch {
      continue; // pomijamy domek, którego kalendarza nie udało się pobrać
    }
    const seen = new Set<string>();
    for (const ev of events) {
      seen.add(ev.uid);
      await prisma.reservation.upsert({
        where: { cottageId_source_externalId: { cottageId: c.id, source: "booking", externalId: ev.uid } },
        update: { checkIn: ev.checkIn, checkOut: ev.checkOut, guestName: ev.summary, status: "confirmed" },
        create: {
          cottageId: c.id,
          source: "booking",
          externalId: ev.uid,
          guestName: ev.summary,
          checkIn: ev.checkIn,
          checkOut: ev.checkOut,
        },
      });
    }
    // Usuń zaimportowane rezerwacje, których już nie ma w kalendarzu Booking (anulowane)
    const stale = await prisma.reservation.findMany({
      where: { cottageId: c.id, source: "booking" },
      select: { id: true, externalId: true },
    });
    const toDelete = stale.filter((r) => r.externalId && !seen.has(r.externalId)).map((r) => r.id);
    if (toDelete.length) await prisma.reservation.deleteMany({ where: { id: { in: toDelete } } });
  }
  revalidatePath("/panel");
}

export async function markCleaned(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const token = String(formData.get("token") ?? "");
  if (id) {
    await prisma.reservation.update({ where: { id }, data: { cleanedAt: new Date() } });
    revalidatePath(`/sprzatanie/${token}`);
    revalidatePath("/panel");
  }
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
