import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Clone Traveler',
  description: 'Send your AI clone on adventures around the world',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
