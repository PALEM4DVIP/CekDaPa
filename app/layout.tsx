import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Rankline — Bulk PageRank Checker",
  description:
    "Cek Open PageRank hingga 100 domain sekaligus. Export ke CSV/Excel, statistik instan, dan tampilan modern.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          // Runs before paint to avoid a light/dark flash.
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('rankline-theme');
                var theme = stored ? stored : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body antialiased bg-canvas-light dark:bg-canvas-dark transition-colors duration-300`}>
        {children}
      </body>
    </html>
  );
}
