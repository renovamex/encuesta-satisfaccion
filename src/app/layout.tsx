import type { Metadata, Viewport } from "next";
import { Mulish, Montserrat } from "next/font/google";
import "./globals.css";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Renova | Encuesta de satisfacción",
  description: "Cuéntanos cómo fue tu experiencia con Renova México.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${mulish.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">{children}</body>
    </html>
  );
}
