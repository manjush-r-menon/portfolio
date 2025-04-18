import type { Metadata } from "next";
import { babas } from "@/utils/fonts";
import { Layout } from "@/components/layout/layout";
import { Providers } from "./providers";

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
    <html
      lang="en"
      className={`h-full antialiased ${babas.variable}`}
      suppressHydrationWarning
    >
      <body className="flex h-full bg-zinc-50 dark:bg-black">
        <Providers>
          <div className="flex w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  );
}
