'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Predict', path: '/predict' },
    { name: 'Recommend', path: '/recommend' },
    { name: 'Explore', path: '/explore' },
    { name: 'About', path: '/about' },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-magnet-border/40 bg-magnet-bg/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 font-mono text-xl font-bold tracking-tight text-white">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-magnet-blue"
              >
                <path d="M4 15V9a8 8 0 0 1 16 0v6" />
                <path d="M6 15v-6a6 6 0 0 1 12 0v6" />
                <line x1="4" y1="15" x2="6" y2="15" />
                <line x1="18" y1="15" x2="20" y2="15" />
              </svg>
              <span className="gradient-text">MagNet-IQ</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative py-1 text-sm font-medium transition-colors hover:text-magnet-blue ${
                    isActive(link.path) ? 'text-magnet-blue' : 'text-magnet-text/70'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-magnet-blue animate-pulse-field" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-magnet-text/70 hover:bg-magnet-surface hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-magnet-border/40 bg-magnet-bg/95 backdrop-blur-lg md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-magnet-surface/80 text-magnet-blue border-l-2 border-magnet-blue'
                    : 'text-magnet-text/70 hover:bg-magnet-surface hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
