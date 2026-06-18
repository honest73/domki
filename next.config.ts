import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-ical i Prisma to ciężkie pakiety serwerowe — nie bundlujemy ich.
  serverExternalPackages: ["node-ical", "@prisma/client", "prisma"],
};

export default nextConfig;
