import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tender Management Dashboard",
  description: "Dasbor pemantauan hasil ekstraksi dokumen tender dan log audit kepatuhan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-neutral-50 text-neutral-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
