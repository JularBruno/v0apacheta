"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link" // Import Link

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <div className="text-white font-bold text-lg">A</div>
            </div>
            <span className="text-xl font-bold text-gray-900">Apacheta</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-gray-700 hover:text-green-600 transition-colors">
              Quiénes Somos
            </a>
            <a href="#faq" className="text-gray-700 hover:text-green-600 transition-colors">
              FAQ
            </a>
            <Link href="/login" className="text-gray-700 hover:text-green-600 transition-colors">
              Log In
            </Link>
            {/* Updated to Link to onboarding */}
            <Link
              href="/onboarding"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Comienza tu Camino
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a href="#about" className="text-gray-700 hover:text-green-600 transition-colors">
                Quiénes Somos
              </a>
              <a href="#faq" className="text-gray-700 hover:text-green-600 transition-colors">
                FAQ
              </a>
              <Link href="/login" className="text-gray-700 hover:text-green-600 transition-colors w-full text-center">
                Log In
              </Link>
              {/* Updated to Link to onboarding */}
              <Link
                href="/onboarding"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors w-full text-center"
              >
                Comienza tu Camino
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
