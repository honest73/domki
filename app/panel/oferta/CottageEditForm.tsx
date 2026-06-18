"use client";

import { useActionState } from "react";
import { updateCottageDetails } from "../actions";

export type CottageData = {
  id: string;
  name: string;
  description: string | null;
  pricePerNight: number | null;
  capacity: number;
  areaM2: number | null;
  bedrooms: number | null;
  beds: string | null;
  address: string | null;
  petsAllowed: boolean;
  amenities: string[];
  photos: string[];
};

const input = "rounded-lg border border-stone-300 px-3 py-2 w-full";
const label = "text-sm text-stone-600 flex flex-col gap-1";

export default function CottageEditForm({ cottage }: { cottage: CottageData }) {
  const [status, action, pending] = useActionState(updateCottageDetails, undefined);

  return (
    <form action={action} className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
      <input type="hidden" name="id" value={cottage.id} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={label}>
          Nazwa
          <input name="name" defaultValue={cottage.name} className={input} />
        </label>
        <label className={label}>
          Cena za dobę (zł) — puste = „na zapytanie"
          <input name="pricePerNight" type="number" min={0} defaultValue={cottage.pricePerNight ?? ""} className={input} />
        </label>
      </div>

      <label className={label}>
        Opis
        <textarea name="description" rows={3} defaultValue={cottage.description ?? ""} className={input} />
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <label className={label}>
          Max osób
          <input name="capacity" type="number" min={1} defaultValue={cottage.capacity} className={input} />
        </label>
        <label className={label}>
          Sypialnie
          <input name="bedrooms" type="number" min={0} defaultValue={cottage.bedrooms ?? ""} className={input} />
        </label>
        <label className={label}>
          Metraż (m²)
          <input name="areaM2" type="number" min={0} defaultValue={cottage.areaM2 ?? ""} className={input} />
        </label>
        <label className="text-sm text-stone-600 flex items-center gap-2 pt-6">
          <input name="petsAllowed" type="checkbox" defaultChecked={cottage.petsAllowed} className="size-4" />
          Zwierzęta
        </label>
      </div>

      <label className={label}>
        Spanie (układ łóżek)
        <input name="beds" defaultValue={cottage.beds ?? ""} className={input} />
      </label>

      <label className={label}>
        Adres
        <input name="address" defaultValue={cottage.address ?? ""} className={input} />
      </label>

      <label className={label}>
        Udogodnienia (jedno w linii)
        <textarea name="amenities" rows={4} defaultValue={cottage.amenities.join("\n")} className={input} />
      </label>

      <label className={label}>
        Zdjęcia — linki URL (jeden w linii)
        <textarea
          name="photos"
          rows={3}
          placeholder="https://…/zdjecie1.jpg"
          defaultValue={cottage.photos.join("\n")}
          className={input}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Zapisywanie…" : "Zapisz ofertę"}
        </button>
        {status && <span className="text-sm text-emerald-700">{status}</span>}
      </div>
    </form>
  );
}
