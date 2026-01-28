import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { SiteSettingsProvider } from "@/components/site-settings-provider";
import { Toaster } from "sonner";


const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "uContents - Social Media Management Platform",
    template: "%s | uContents",
  },
  description: "Manage your social media content, automate posting, and generate AI-powered content with uContents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <AuthProvider>
              <SiteSettingsProvider />
              {children}
              <Toaster position="bottom-right" richColors closeButton />
            </AuthProvider>
          </ThemeProvider>
        
      </body>
    </html>
  );
}
