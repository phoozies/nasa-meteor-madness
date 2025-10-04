import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Navigation from "@/components/layout/Navigation";
import { theme } from '@/lib/theme';
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
