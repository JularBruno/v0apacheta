"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
	{
		question: "¿Qué es Apacheta y cómo puede ayudarme?",
		answer: "Apacheta es una plataforma de educación financiera diseñada específicamente para Argentina. Te ayudamos a gestionar tus ingresos, gastos y carteras de ahorro e inversión de manera intuitiva, con un enfoque práctico adaptado a nuestra realidad económica.",
	},
	{
		question: "¿Puedo usar Apacheta si vivo fuera de Argentina?",
		answer: "Aunque Apacheta está optimizado para la realidad financiera argentina, muchos de nuestros conceptos y herramientas son aplicables en otros países.",
	},
	{
		question: "¿Es gratuito usar Apacheta?",
		answer: "Sí.",
	},
	{
		question: "¿Necesito conocimientos previos de finanzas?",
		answer: "¡Para nada! Apacheta está diseñado especialmente para personas sin conocimientos financieros previos. Comenzamos desde lo básico y te acompañamos paso a paso en tu aprendizaje.",
	},
]

export default function FAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(null)

	return (
		<section id="faq" className="py-20 bg-burnt-peach-50">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

				<div className="text-center mb-14">
					<p className="text-xs font-bold tracking-widest text-burnt-peach-500 uppercase mb-3">FAQ</p>
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Preguntas Frecuentes</h2>
					<p className="text-lg text-muted-foreground">Resolvemos tus dudas sobre educación financiera</p>
				</div>

				<div className="space-y-3">
					{faqs.map((faq, index) => {
						const isOpen = openIndex === index
						return (
							<div
								key={index}
								className={`rounded-xl border bg-white transition-all duration-200 overflow-hidden ${
									isOpen ? "border-burnt-peach-300 shadow-sm" : "border-border"
								}`}
							>
								<button
									className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 hover:bg-burnt-peach-50/50 transition-colors"
									onClick={() => setOpenIndex(isOpen ? null : index)}
								>
									<span className="font-semibold text-foreground text-sm md:text-base">{faq.question}</span>
									{isOpen
										? <ChevronUp className="w-4 h-4 text-burnt-peach-500 shrink-0" />
										: <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
									}
								</button>
								{isOpen && (
									<div className="px-6 pb-5 border-t border-burnt-peach-100">
										<p className="text-muted-foreground text-sm leading-relaxed pt-4">{faq.answer}</p>
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
