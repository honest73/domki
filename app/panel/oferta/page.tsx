import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CottageEditForm, { type CottageData } from "./CottageEditForm";

export const dynamic = "force-dynamic";

function parseList(json: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export default async function PanelOfertaPage() {
  if (!(await isLoggedIn())) redirect("/login");

  const cottages = await prisma.cottage.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Edycja oferty</h1>
          <p className="text-sm text-stone-500">Cena, opis, udogodnienia i zdjęcia domków</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/oferta" className="text-emerald-700 hover:underline">
            Podgląd oferty ↗
          </Link>
          <Link href="/panel" className="text-stone-500 hover:text-stone-800">
            ← Panel
          </Link>
        </div>
      </header>

      {cottages.map((c) => {
        const data: CottageData = {
          id: c.id,
          name: c.name,
          description: c.description,
          pricePerNight: c.pricePerNight,
          capacity: c.capacity,
          areaM2: c.areaM2,
          bedrooms: c.bedrooms,
          beds: c.beds,
          address: c.address,
          petsAllowed: c.petsAllowed,
          amenities: parseList(c.amenities),
          photos: parseList(c.photos),
        };
        return <CottageEditForm key={c.id} cottage={data} />;
      })}
    </div>
  );
}
