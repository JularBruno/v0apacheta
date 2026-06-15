"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import SpinningLogo from "@/components/home/spinning-logo"

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	return (
		<header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					<div className="flex items-center space-x-3">
						<SpinningLogo size="sm" />
						<span className="text-xl font-bold text-foreground">Apacheta</span>
					</div>

					<nav className="hidden md:flex items-center space-x-8">
						<a href="#about" className="text-muted-foreground hover:text-primary-600 transition-colors text-sm">
							Quiénes Somos
						</a>
						<a href="#faq" className="text-muted-foreground hover:text-primary-600 transition-colors text-sm">
							FAQ
						</a>
						<Link href="/login" className="text-muted-foreground hover:text-primary-600 transition-colors text-sm">
							Log In
						</Link>
						<Link
							href="/onboarding"
							className="bg-primary text-coffee-bean-800 font-semibold px-5 py-2 rounded-lg hover:bg-primary-500 transition-colors text-sm"
						>
							Comienza tu Camino
						</Link>
					</nav>

					<button className="md:hidden text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
						{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
					</button>
				</div>

				{isMenuOpen && (
					<div className="md:hidden py-4 border-t border-border">
						<div className="flex flex-col space-y-4">
							<a href="#about" className="text-muted-foreground hover:text-primary-600 transition-colors">Quiénes Somos</a>
							<a href="#faq" className="text-muted-foreground hover:text-primary-600 transition-colors">FAQ</a>
							<Link href="/login" className="text-muted-foreground hover:text-primary-600 transition-colors">Log In</Link>
							<Link href="/onboarding" className="bg-primary text-coffee-bean-800 font-semibold px-6 py-2 rounded-lg text-center hover:bg-primary-500 transition-colors">
								Comienza tu Camino
							</Link>
						</div>
					</div>
				)}
			</div>
		</header>
	)
}
