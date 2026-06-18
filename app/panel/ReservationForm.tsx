"use client";

import { useActionState, useRef, useEffect } from "react";
import { addReservation } from "./actions";

type CottageOpt = { id: string; name: string };

export default function ReservationForm({ cottages }: { cottages: CottageOpt[] }) {
  const [error, formAction, pending] = useActionState(addReservation, undefined);
  const ref = useRef<HTMLFormElement>(null);

  // Po udanym zapisie (brak błędu i nie w trakcie) czyścimy formularz
  useEffect(() => {
    if (!pending && error === undefined) ref.current?.reset();
  }, [pending, error]);

  return (
    <form
      ref={ref}
      action={formAction}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white rounded-xl border border-stone-200 p-4"
    >
      <h3 className="sm:col-span-2 font-medium text-stone-800">Nowa rezerwacja</h3>

      <label className="text-sm text-stone-600 flex flex-col gap-1">
        Domek
        <select name="cottageId" required className="rounded-lg border border-stone-300 px-3 py-2">
          {cottages.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="text-sm text-stone-600 flex flex-col gap-1">
        Gość (imię i nazwisko)
        <input name="guestName" className="rounded-lg border border-stone-300 px-3 py-2" />
      </label>

      <label className="text-sm text-stone-600 flex flex-col gap-1">
        Zameldowanie
        <input name="checkIn" type="date" required className="rounded-lg border border-stone-300 px-3 py-2" />
      </label>

      <label className="text-sm text-stone-600 flex flex-col gap-1">
        Wymeldowanie
        <input name="checkOut" type="date" required className="rounded-lg border border-stone-300 px-3 py-2" />
      </label>

      <label className="text-sm text-stone-600 flex flex-col gap-1">
        Telefon
        <input name="phone" className="rounded-lg border border-stone-300 px-3 py-2" />
      </label>

      <label className="text-sm text-stone-600 flex flex-col gap-1">
        Liczba osób
        <input name="guests" type="number" min={1} max={12} defaultValue={2} className="rounded-lg border border-stone-300 px-3 py-2" />
      </label>

      <label className="text-sm text-stone-600 flex flex-col gap-1 sm:col-span-2">
        Notatki
        <input name="notes" className="rounded-lg border border-stone-300 px-3 py-2" />
      </label>

      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Zapisywanie…" : "Dodaj rezerwację"}
        </button>
      </div>
    </form>
  );
}
