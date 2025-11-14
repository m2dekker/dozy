import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloneWander - Send AI Clones on Adventures",
  description: "Send AI travel clones to explore destinations and get personalized recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
