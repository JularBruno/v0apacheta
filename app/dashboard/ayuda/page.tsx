"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, HelpCircle, Star, Circle, Dot, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FAQItem {
	id: string
	question: string
	answer: string
	category: "esenciales" | "fundamentos" | "presupuesto" | "inversion" | "avanzado"
	type: "chapter" | "major" | "minor"
}

const faqData: FAQItem[] = [
	// Esenciales - PWA and Notifications
	{
		id: "esen-1",
		question: "¿Cómo instalar Apacheta como aplicación?",
		answer:
			"📱 **En Android (Chrome):**\n1. Abre Apacheta en Chrome\n2. Toca el menú (⋮) en la esquina superior derecha\n3. Selecciona 'Instalar aplicación' o 'Añadir a pantalla de inicio'\n4. Confirma tocando 'Instalar'\n\n🍎 **En iPhone/iPad (Safari):**\n1. Abre Apacheta en Safari (obligatorio usar Safari)\n2. Toca el botón Compartir (⬆️) en la barra inferior\n3. Desplázate y selecciona 'Añadir a pantalla de inicio'\n4. Ponle nombre y toca 'Añadir'\n\n💻 **En computadora (Chrome/Edge):**\n1. Busca el ícono de instalación (⊕) en la barra de direcciones\n2. O abre el menú y selecciona 'Instalar Apacheta'",
		category: "esenciales",
		type: "chapter",
	},
	{
		id: "esen-2",
		question: "¿Cómo activar las notificaciones?",
		answer:
			"Las notificaciones te ayudan a:\n• Recordar pagos pendientes\n• Seguir tus metas de ahorro\n• Recibir consejos financieros\n\n**Para activar:**\n1. Ve al Mapa > Bienvenida a Apacheta\n2. Toca 'Activar Notificaciones'\n3. Acepta el permiso cuando el navegador lo solicite\n\n**Si las bloqueaste por error:**\n• Android: Configuración > Apps > Chrome > Notificaciones\n• iPhone: Configuración > Safari > Notificaciones\n• PC: Click en el candado 🔒 junto a la URL > Notificaciones > Permitir",
		category: "esenciales",
		type: "major",
	},

	// Fundamentos - Chapter
	{
		id: "fund-1",
		question: "¿Qué es Apacheta y cómo me ayuda con mis finanzas?",
		answer:
			"Apacheta es tu compañero digital para el control financiero personal. Te ayuda a rastrear gastos, crear presupuestos, y tomar decisiones informadas sobre tu dinero. Como una apacheta marca el camino en la montaña, nosotros marcamos tu camino hacia la libertad financiera.",
		category: "fundamentos",
		type: "chapter",
	},
	{
		id: "fund-2",
		question: "¿Cómo empiezo a usar la aplicación?",
		answer:
			"Comienza por completar tu perfil financiero en la sección 'Mapa'. Luego agrega tus cuentas y tarjetas en 'Assets', y empieza a registrar tus transacciones diarias usando la tarjeta de gasto rápido en 'Inicio'.",
		category: "fundamentos",
		type: "major",
	},
	{
		id: "fund-3",
		question: "¿Es seguro conectar mis cuentas bancarias?",
		answer:
			"Sí, utilizamos encriptación de nivel bancario y nunca almacenamos tus credenciales. Solo accedemos a información de solo lectura para ayudarte a categorizar y rastrear tus transacciones.",
		category: "fundamentos",
		type: "minor",
	},

	// Presupuesto - Chapter
	{
		id: "pres-1",
		question: "¿Cómo crear mi primer presupuesto?",
		answer:
			"Ve a la sección 'Presupuesto' y define tus ingresos mensuales. Luego asigna cantidades a diferentes categorías como comida, transporte, entretenimiento. La app te sugerirá distribuciones basadas en la regla 50/30/20.",
		category: "presupuesto",
		type: "chapter",
	},
	{
		id: "pres-2",
		question: "¿Qué hago si me paso del presupuesto?",
		answer:
			"No te preocupes, es normal al principio. Revisa en qué categorías te excediste y ajusta para el próximo mes. Puedes usar la función de alertas para recibir notificaciones cuando te acerques al límite.",
		category: "presupuesto",
		type: "major",
	},
	{
		id: "pres-3",
		question: "¿Puedo tener presupuestos semanales?",
		answer:
			"Sí, puedes configurar presupuestos semanales, quincenales o mensuales según tu flujo de ingresos. Ve a Configuración > Presupuesto para cambiar la frecuencia.",
		category: "presupuesto",
		type: "minor",
	},

	// Inversión - Chapter
	{
		id: "inv-1",
		question: "¿Cuándo debería empezar a invertir?",
		answer:
			"Deberías empezar a invertir cuando tengas un fondo de emergencia de 3-6 meses de gastos, hayas pagado deudas de alto interés, y tengas un presupuesto estable. La sección 'Mapa' te guiará paso a paso.",
		category: "inversion",
		type: "chapter",
	},
	{
		id: "inv-2",
		question: "¿Qué tipos de inversión recomienda Apacheta?",
		answer:
			"Recomendamos empezar con fondos indexados diversificados, luego explorar ETFs y acciones individuales. La app te mostrará simulaciones y te ayudará a entender el riesgo de cada opción.",
		category: "inversion",
		type: "major",
	},
	{
		id: "inv-3",
		question: "¿Puedo conectar mi cuenta de inversiones?",
		answer:
			"Sí, puedes conectar cuentas de brokers compatibles para rastrear tu portafolio automáticamente. Ve a Assets > Agregar Cuenta > Inversiones.",
		category: "inversion",
		type: "minor",
	},

	// Avanzado - Chapter
	{
		id: "adv-1",
		question: "¿Cómo optimizar mis impuestos?",
		answer:
			"La sección avanzada incluye herramientas para rastrear gastos deducibles, calcular impuestos sobre ganancias de capital, y planificar estrategias de ahorro fiscal. Consulta siempre con un contador para tu situación específica.",
		category: "avanzado",
		type: "chapter",
	},
	{
		id: "adv-2",
		question: "¿Puedo exportar mis datos?",
		answer:
			"Sí, puedes exportar todos tus datos en formato CSV o PDF desde Configuración > Exportar Datos. Esto incluye transacciones, presupuestos, y reportes de inversiones.",
		category: "avanzado",
		type: "major",
	},
	{
		id: "adv-3",
		question: "¿Cómo configurar alertas personalizadas?",
		answer:
			"Ve a Configuración > Notificaciones para configurar alertas por límites de presupuesto, metas de ahorro, fechas de pago, y cambios importantes en tus inversiones.",
		category: "avanzado",
		type: "minor",
	},
]

const categoryInfo = {
	esenciales: { name: "Esenciales", icon: Star, color: "text-primary-600", order: 0 },
	fundamentos: { name: "Fundamentos", icon: Circle, color: "text-blue-600", order: 1 },
	presupuesto: { name: "Presupuesto", icon: Dot, color: "text-green-600", order: 2 },
	inversion: { name: "Inversión", icon: Star, color: "text-purple-600", order: 3 },
	avanzado: { name: "Avanzado", icon: HelpCircle, color: "text-amber-600", order: 4 },
}

const typeInfo = {
	chapter: { icon: Star, color: "border-amber-500 bg-amber-50", badge: "CAPÍTULO" },
	major: { icon: Circle, color: "border-blue-500 bg-blue-50", badge: "IMPORTANTE" },
	minor: { icon: Dot, color: "border-gray-300 bg-gray-50", badge: "BÁSICO" },
}

export default function HelpPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [openItems, setOpenItems] = useState<string[]>([])

	const toggleItem = (id: string) => {
		setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
	}

	const filteredFAQs = faqData.filter(
		(faq) =>
			faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
			faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	const groupedFAQs = filteredFAQs.reduce(
		(acc, faq) => {
			if (!acc[faq.category]) {
				acc[faq.category] = []
			}
			acc[faq.category].push(faq)
			return acc
		},
		{} as Record<string, FAQItem[]>,
	)

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col space-y-4">
				<div className="flex items-center gap-3">
					<HelpCircle className="w-8 h-8 text-blue-600" />
					<div>
						<h1 className="text-2xl font-bold">Centro de Ayuda</h1>
						<p className="text-gray-600">Encuentra respuestas a tus preguntas sobre Apacheta</p>
					</div>
				</div>

				{/* Search */}
				<div className="relative max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
					<Input
						placeholder="Buscar en preguntas frecuentes..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{/* FAQ Categories */}
			<div className="space-y-6">
				{Object.entries(groupedFAQs).map(([category, faqs]) => {
					const categoryData = categoryInfo[category as keyof typeof categoryInfo]
					const CategoryIcon = categoryData.icon

					return (
						<Card key={category}>
							<CardHeader className="pb-4">
								<CardTitle className="flex items-center gap-3">
									<CategoryIcon className={cn("w-6 h-6", categoryData.color)} />
									<span className="text-xl">{categoryData.name}</span>
									<span className="text-sm text-gray-500">({faqs.length} preguntas)</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{faqs
									.sort((a, b) => {
										const order = { chapter: 0, major: 1, minor: 2 }
										return order[a.type] - order[b.type]
									})
									.map((faq) => {
										const isOpen = openItems.includes(faq.id)
										const typeData = typeInfo[faq.type]
										const TypeIcon = typeData.icon

										return (
											<Collapsible key={faq.id} open={isOpen} onOpenChange={() => toggleItem(faq.id)}>
												<CollapsibleTrigger asChild>
													<div
														className={cn(
															"w-full p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
															typeData.color,
															isOpen && "shadow-md",
														)}
													>
														<div className="flex items-start justify-between gap-3">
															<div className="flex items-start gap-3 min-w-0 flex-1">
																<TypeIcon className="w-5 h-5 mt-0.5 shrink-0 text-gray-600" />
																<div className="min-w-0 flex-1">
																	<div className="flex items-center gap-2 mb-1">
																		<span className="text-xs font-medium px-2 py-1 rounded-full bg-white/80 text-gray-700">
																			{typeData.badge}
																		</span>
																	</div>
																	<h3 className="font-medium text-gray-900 text-left">{faq.question}</h3>
																</div>
															</div>
															<div className="shrink-0">
																{isOpen ? (
																	<ChevronDown className="w-5 h-5 text-gray-500" />
																) : (
																	<ChevronRight className="w-5 h-5 text-gray-500" />
																)}
															</div>
														</div>
													</div>
												</CollapsibleTrigger>
												<CollapsibleContent className="mt-2">
													<div className="pl-8 pr-4 py-3 bg-white rounded-lg border border-gray-200">
														<p className="text-gray-700 leading-relaxed">{faq.answer}</p>
													</div>
												</CollapsibleContent>
											</Collapsible>
										)
									})}
							</CardContent>
						</Card>
					)
				})}
			</div>

			{/* No results */}
			{filteredFAQs.length === 0 && searchTerm && (
				<Card>
					<CardContent className="text-center py-12">
						<HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
						<p className="text-gray-600">
							Intenta con otros términos de búsqueda o explora las categorías disponibles.
						</p>
					</CardContent>
				</Card>
			)}

			{/* Contact Support */}
			<Card className="border-blue-200 bg-blue-50">
				<CardContent className="p-6">
					<div className="flex items-start gap-4">
						<HelpCircle className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
						<div>
							<h3 className="font-semibold text-blue-900 mb-2">¿No encuentras lo que buscas?</h3>
							<p className="text-blue-800 mb-4">
								Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
							</p>
							<div className="flex flex-col sm:flex-row gap-2">
								<a
									href="mailto:soporte@apacheta.com"
									className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									Enviar Email
								</a>
								<a
									href="#"
									className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
								>
									Chat en Vivo
								</a>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
