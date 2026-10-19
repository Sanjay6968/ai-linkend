import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "ContentMint | AI-Powered LinkedIn Content Creation",
  description: "Turn a rough topic into a ready-to-publish LinkedIn post in under two seconds. Five style archetypes. Direct publishing via LinkedIn OAuth.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "ContentMint — AI LinkedIn Content Engine",
    description: "Turn a rough idea into a published LinkedIn post. ContentMint AI · LinkedIn OAuth · Smart Scheduling.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ContentMint" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentMint — AI LinkedIn Content Engine",
    description: "Turn a rough idea into a published LinkedIn post.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
