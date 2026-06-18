import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Dane zweryfikowane z publicznych źródeł (Booking/portale noclegowe).
// UWAGA: ceny, zdjęcia i własny opis marketingowy pochodzą z FB i muszą zostać
// uzupełnione przez właściciela — pola pozostają puste, dopóki ich nie poda.
const amenities = JSON.stringify([
  "W pełni wyposażona kuchnia",
  "TV z dostępem do Netflix i YouTube",
  "Bezpłatne WiFi",
  "Prywatny parking",
  "Taras",
  "Ogrodzony, niezależny teren dla każdego domku",
  "Miejsce na grill i ognisko",
]);

const baseDetails = {
  capacity: 6,
  areaM2: 60,
  bedrooms: 2,
  beds: "1 łóżko podwójne, 2 pojedyncze + sofa",
  amenities,
  petsAllowed: true,
  pricePerNight: null, // do uzupełnienia z FB
  address: "ul. Sudecka 93, 58-535 Miłków",
  description:
    "Komfortowy domek w Miłkowie u podnóża Śnieżki (Karkonosze). Dwie sypialnie, " +
    "salon z aneksem kuchennym i łazienka, do 6 osób. Ogrodzony, niezależny teren " +
    "z miejscem na grill i ognisko. Idealny na całoroczny wypoczynek w górach.",
  photos: JSON.stringify([]), // brak — zdjęcia tylko z FB
};

const cottages = [
  { name: "Bryziówka 1", slug: "bryziowka-1", ...baseDetails },
  { name: "Bryziówka 2", slug: "bryziowka-2", ...baseDetails },
];

for (const c of cottages) {
  const { slug, ...rest } = c;
  await prisma.cottage.upsert({
    where: { slug },
    update: rest,
    create: { slug, ...rest },
  });
  console.log(`✓ ${c.name}`);
}

await prisma.$disconnect();
