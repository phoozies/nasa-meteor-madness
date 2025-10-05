import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { CssBaseline } from '@mui/material';
import Navigation from "@/components/layout/Navigation";
import { ThemeModeProvider } from '@/contexts/ThemeContext';
import { AppThemeProvider } from '@/components/providers/AppThemeProvider';
import "./globals.css";
import "../styles/visualizations.css";

// NASA recommended fonts - Source Sans Pro for UI text
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-source-sans',
  weight: ['300', '400', '600', '700'],
});

export const metadata: Metadata = {
  title: "Meteor Madness - NASA Space Apps Challenge 2025",
  description: "Interactive asteroid impact simulation and visualization tool for planetary defense education and risk assessment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sourceSans.className}>
        <ThemeModeProvider>
          <AppThemeProvider>
            <CssBaseline />
            <Navigation />
            {children}
          </AppThemeProvider>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
