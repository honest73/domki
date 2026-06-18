// Pomocnicze funkcje dat — pracujemy na „dniach" (bez stref czasowych w UI).

export function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function plDate(d: Date): string {
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function plWeekday(d: Date): string {
  return d.toLocaleDateString("pl-PL", { weekday: "long" });
}

/** Liczba nocy między zameldowaniem a wymeldowaniem. */
export function nights(checkIn: Date, checkOut: Date): number {
  return Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
}

/** Parsuje "YYYY-MM-DD" do daty w UTC (stabilnie, bez przesunięć stref). */
export function parseYmd(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`);
}

export function todayUtc(): Date {
  return parseYmd(new Date().toISOString().slice(0, 10));
}

/** Czy dwa zakresy [aIn,aOut) i [bIn,bOut) nachodzą na siebie (kolizja terminów). */
export function overlaps(aIn: Date, aOut: Date, bIn: Date, bOut: Date): boolean {
  return aIn < bOut && bIn < aOut;
}
