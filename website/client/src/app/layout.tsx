import type { Metadata } from 'next'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import Navbar from '@/components/Navbar'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'MagNet-IQ',
  description: 'ML-based Permanent Magnet Material Intelligence System',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-[#0a0e1a] text-[#e2e8f0]">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
