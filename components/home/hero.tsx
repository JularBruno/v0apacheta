"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import SpinningLogo from "@/components/home/spinning-logo"

export default function Hero() {
	return (
		<section id="hero" className="bg-white py-24 lg:py-36">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

				<div className="flex justify-center mb-10">
					<SpinningLogo size="lg" />
				</div>

				<h1 className="text-5xl md:text-7xl text-muted-500 lg:text-8xl font-bold text-foreground mb-4 leading-tight">
					Las apachetas
					<span className="block text-primary mt-2">guiarán tu camino...</span>
				</h1>

				<p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
					Sigue el camino para salir de deudas, ahorrar más y construir patrimonio.
					{/* Educación financiera diseñada para Argentina. */}
				</p>

				<Link
					href="/onboarding"
					className="inline-flex items-center gap-2 bg-primary text-coffee-bean-800 font-bold px-8 py-4 rounded-xl text-lg hover:bg-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl"
				>
					Comienza tu Camino
					<ArrowRight className="w-5 h-5" />
				</Link>

				<div className="flex flex-wrap justify-center gap-3 mt-14">
					{[
						{ label: "🇦🇷 Para Argentina", color: "bg-burnt-peach-50 text-burnt-peach-700" },
						// { label: "📊 Presupuesto", color: "bg-berry-crush-50 text-berry-crush-700" },
						// { label: "💰 Ahorro", color: "bg-primary/10 text-primary-600" },
						// { label: "📈 Inversión", color: "bg-ash-grey-100 text-ash-grey-700" },
					].map((tag) => (
						<span key={tag.label} className={`${tag.color} px-4 py-1.5 rounded-full text-sm font-medium`}>
							{tag.label}
						</span>
					))}
				</div>
			</div>
		</section>
	)
}
