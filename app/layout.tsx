import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bryziówka — Panel rezerwacji",
  description: "Panel rezerwacji domków Bryziówka 1 i 2 w Miłkowie",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        {children}
      </body>
    </html>
  );
}
