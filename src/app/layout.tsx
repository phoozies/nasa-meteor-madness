import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Navigation from "@/components/layout/Navigation";
import { theme } from '@/lib/theme';
import "./globals.css";
import "../styles/visualizations.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
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
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
