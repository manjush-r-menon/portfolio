import { Fraunces, Inter, Bebas_Neue } from "next/font/google";

export const fraunces = Fraunces({
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "800", "900"],
  subsets: ["latin"],
});

// Scoped to ErrorCube (see components/error-cube/error-cube.tsx) rather
// than applied on <html> in app/layout.tsx like the two above — it's only
// ever rendered on /error and /not-found, so its .variable class is applied
// there instead, keeping the font out of every other route's bundle.
export const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});
