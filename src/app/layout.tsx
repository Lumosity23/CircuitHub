import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CircuitHub - BOM Manager pour projets électroniques",
  description: "Gestionnaire de Bill of Materials (BOM) pour projets électroniques avec versionning, import CSV, et gestion de composants.",
  keywords: ["BOM", "électronique", "composants", "PCB", "Arduino", "gestion de projet", "versionning"],
  authors: [{ name: "CircuitHub Team" }],
  openGraph: {
    title: "CircuitHub - BOM Manager",
    description: "Gestionnaire de BOM pour projets électroniques",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CircuitHub - BOM Manager",
    description: "Gestionnaire de BOM pour projets électroniques",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <AuthProvider>
          <TRPCProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
