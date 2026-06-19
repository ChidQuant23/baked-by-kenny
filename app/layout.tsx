import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baked by Kenny — Custom Cakes",
  description: "Handmade custom cakes, made to order. See prices and send your enquiry.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
