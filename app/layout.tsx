import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Energy Management Calendar",
  description: "Track and manage your daily energy levels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
