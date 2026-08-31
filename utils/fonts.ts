import { Fraunces, Inter } from "next/font/google";

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
