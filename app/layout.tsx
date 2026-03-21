import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Australian NBA Players",
  description: "Current season stats for Australian players in the NBA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
