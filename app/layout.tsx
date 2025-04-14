import type { Metadata } from "next";
import "./globals.css";
import { babas } from "@/utils/fonts";

export const metadata: Metadata = {
  title: "Manjush | Portfolio",
  description: "Frontend Developer Portfolio of Manjush",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${babas.variable} antialiased`}>{children}</body>
    </html>
  );
}
