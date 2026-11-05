import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: {
    default: "PrimeSA_Salon | Hair Salon in Pinetown, Durban",
    template: "%s | PrimeSA_Salon",
  },
  description:
    "Visit PrimeSA_Salon in Pinetown, Durban for professional men's haircuts, women's hairstyles, wig installation, and hair treatments.",
  metadataBase: getSiteUrl(),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "PrimeSA_Salon | Hair Salon in Pinetown, Durban",
    description:
      "Professional haircuts, hairstyles, wig installation, and hair treatments at PrimeSA_Salon in Pinetown, Durban.",
    type: "website",
    siteName: "PrimeSA_Salon",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary",
    title: "PrimeSA_Salon | Hair Salon in Pinetown, Durban",
    description:
      "Professional haircuts, hairstyles, and personalised hair care in Pinetown, Durban.",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="page-shell">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
