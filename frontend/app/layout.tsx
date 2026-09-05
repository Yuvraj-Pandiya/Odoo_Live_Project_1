import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DealFlow360 — Intelligent Sales Operations Platform',
  description: 'Enterprise-grade B2B sales platform: quotation-to-cash lifecycle management with AI-driven deal health, multi-tier governance, and real-time fulfillment intelligence.',
  keywords: ['sales operations', 'CPQ', 'deal desk', 'B2B platform', 'quotation management'],
  openGraph: {
    title: 'DealFlow360',
    description: 'Intelligent Sales Operations Platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
        {/* Mainframe landing page fonts */}
        <link rel="stylesheet" href="https://db.onlinewebfonts.com/c/5ac3fe7c6abd2f62067f266d89671492?family=HelveticaNowDisplay-Medium" />
        <link rel="stylesheet" href="https://db.onlinewebfonts.com/c/1aa3377e489837a26d019bba501e779d?family=HelveticaNowDisplayW01-Rg" />
      </head>
      <body className="bg-[var(--color-background)] text-[var(--color-on-surface)] min-h-screen font-[var(--font-family-base)]">
        {children}
      </body>
    </html>
  );
}
