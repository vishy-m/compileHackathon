import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grid Arbitrage Simulator",
  description: "Realtime arbitrage and grid prediction demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
