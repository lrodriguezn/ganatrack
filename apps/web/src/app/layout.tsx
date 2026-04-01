import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { AppProviders } from "@/shared/providers/app-providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GanaTrack",
  description: "Sistema de gestión ganadera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
