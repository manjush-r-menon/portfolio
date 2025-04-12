import type { Metadata } from "next";
import "./globals.css";
import { geistMono, geistSans, jetbrainsMono } from "@/utils/fonts";

export const metadata: Metadata = {
  title: "Manjush | Portfolio",
  description: "Frontend Developer Portfolio of Manjush",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
