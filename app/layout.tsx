import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CloneWander - Send AI Clones on Adventures',
  description: 'Create AI clones, send them to destinations worldwide, and get personalized travel recommendations based on your preferences and budget.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
