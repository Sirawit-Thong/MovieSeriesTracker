import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie Series Tracker",
  description: "Track your favorite movies and TV series",
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
