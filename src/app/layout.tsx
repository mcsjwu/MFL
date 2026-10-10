import type { Metadata, Viewport } from "next";
import { Figtree, Nunito } from "next/font/google";
import "./globals.css";

// Display face (titles, numerals) and text face. Apple devices use SF via the
// font stacks in tokens.css; these load everywhere else.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MFL",
  description: "Scores, lineups and standings for your MyFantasyLeague league",
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#060a12" },
    { media: "(prefers-color-scheme: light)", color: "#eef2f8" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  );
}
