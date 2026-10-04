import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Search } from 'lucide-react';
import { ThemeProvider } from "@/components/ThemeProvider";
import CommandPalette from "@/components/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "eduStack - Enterprise Student Analytics",
  description: "Empowering Education with Data Clarity.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-sand-100 dark:bg-storm-950 text-sand-950 dark:text-storm-50 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          
          <main className="min-h-screen w-full">
            {children}
          </main>
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
