import ical from "node-ical";
import { ymd } from "./dates";

type Resv = {
  id: string;
  guestName: string | null;
  checkIn: Date;
  checkOut: Date;
  source: string;
};

function icalDate(d: Date): string {
  // Format daty całodniowej: YYYYMMDD
  return ymd(d).replace(/-/g, "");
}

function escapeText(s: string): string {
  return s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

/** Buduje treść pliku .ics z rezerwacji domku — do importu w Booking.com. */
export function buildIcalFeed(cottageName: string, reservations: Resv[]): string {
  const now =
    new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bryziowka//Panel rezerwacji//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(cottageName)}`,
  ];
  for (const r of reservations) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${r.id}@bryziowka`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${icalDate(r.checkIn)}`,
      `DTEND;VALUE=DATE:${icalDate(r.checkOut)}`,
      `SUMMARY:${escapeText(r.guestName ? `Rezerwacja: ${r.guestName}` : "Zajęte")}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  // iCal wymaga CRLF
  return lines.join("\r\n") + "\r\n";
}

export type ImportedEvent = {
  uid: string;
  checkIn: Date;
  checkOut: Date;
  summary: string;
};

/** Pobiera i parsuje iCal z Booking.com, zwracając zdarzenia zajętości. */
export async function fetchBookingEvents(url: string): Promise<ImportedEvent[]> {
  const data = await ical.async.fromURL(url);
  const out: ImportedEvent[] = [];
  for (const key of Object.keys(data)) {
    const ev = data[key];
    if (!ev || ev.type !== "VEVENT" || !ev.start || !ev.end) continue;
    out.push({
      uid: String(ev.uid ?? key),
      checkIn: new Date(ev.start),
      checkOut: new Date(ev.end),
      summary: String(ev.summary ?? "Booking.com"),
    });
  }
  return out;
}
