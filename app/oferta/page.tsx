import { prisma } from "@/lib/db";

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

export default async function OfertaPage() {
  const cottages = await prisma.cottage.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      <header className="text-center space-y-2 py-4">
        <h1 className="text-3xl font-semibold text-stone-800">Bryziówka</h1>
        <p className="text-stone-500">Domki całoroczne w Miłkowie · u podnóża Śnieżki</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cottages.map((c) => {
          const amenities = parseList(c.amenities);
          const photos = parseList(c.photos);
          return (
            <section
              key={c.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col"
            >
              {photos.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[0]} alt={c.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-stone-100 flex items-center justify-center text-stone-400 text-sm">
                  (zdjęcia do dodania)
                </div>
              )}

              <div className="p-5 space-y-3 flex-1 flex flex-col">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-xl font-medium text-stone-800">{c.name}</h2>
                  <span className="text-emerald-700 font-semibold whitespace-nowrap">
                    {c.pricePerNight ? `${c.pricePerNight} zł / doba` : "cena na zapytanie"}
                  </span>
                </div>

                {c.description && <p className="text-sm text-stone-600">{c.description}</p>}

                <ul className="text-sm text-stone-600 grid grid-cols-2 gap-x-4 gap-y-1">
                  <li>👥 do {c.capacity} osób</li>
                  {c.bedrooms != null && <li>🛏️ {c.bedrooms} sypialnie</li>}
                  {c.areaM2 != null && <li>📐 {c.areaM2} m²</li>}
                  {c.petsAllowed && <li>🐾 zwierzęta mile widziane</li>}
                </ul>
                {c.beds && <p className="text-sm text-stone-500">Spanie: {c.beds}</p>}

                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {amenities.map((a) => (
                      <span
                        key={a}
                        className="text-xs bg-stone-100 text-stone-600 rounded-full px-2.5 py-1"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {c.address && (
                  <p className="text-sm text-stone-400 mt-auto pt-2">📍 {c.address}</p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-center text-xs text-stone-400">
        Dane podstawowe ze źródeł publicznych. Ceny, zdjęcia i pełny opis — w przygotowaniu.
      </p>
    </div>
  );
}
