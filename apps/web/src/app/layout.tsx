import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retire Strong",
  description: "AI-powered wellness platform for adults 50+",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

