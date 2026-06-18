import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cottages = [
  { name: "Bryziówka 1", slug: "bryziowka-1", capacity: 6 },
  { name: "Bryziówka 2", slug: "bryziowka-2", capacity: 6 },
];

for (const c of cottages) {
  await prisma.cottage.upsert({
    where: { slug: c.slug },
    update: { name: c.name, capacity: c.capacity },
    create: c,
  });
  console.log(`✓ ${c.name}`);
}

await prisma.$disconnect();
