import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CWC AI Workforce — Founder Command Center",
  description: "Code Wear Connect (CWC): SCAN • SHARE • WEAR. Autonomous AI Workforce Orchestration & Governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#08090c] text-neutral-100 antialiased selection:bg-[#ff4655] selection:text-white">
        {children}
      </body>
    </html>
  );
}
