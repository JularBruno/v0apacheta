"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
	ChevronDown,
	ChevronRight,
	HelpCircle,
	Search,
	BookOpen,
	Wallet,
	Shield,
	TrendingUp,
	Mountain,
	MapPin,
	Star,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import SubscriptionButtonNotification from "@/components/notifications/subscription-notification-button"

type ItemType = "major" | "minor"

interface HelpItem {
	id: string
	type: ItemType
	question: string
	answer: string
}

interface HelpStage {
	stageId: string
	title: string
	subtitle: string
	icon: React.ElementType
	items: HelpItem[]
}

const helpStages: HelpStage[] = [
	{
		stageId: "stage-1",
		title: "Conocé el camino",
		subtitle: "El primer paso es mirar",
		icon: BookOpen,
		items: [
			{
				id: "1.0",
				type: "major",
				question: "¿Cómo instalo Apacheta en mi celular?",
				answer:
					"📱 Android (Chrome): tocá el menú ⋮ en la esquina superior derecha → 'Instalar aplicación' o 'Agregar a pantalla de inicio' → confirmá.\n\n🍎 iPhone/iPad (Safari): abrí Apacheta en Safari (tiene que ser Safari) → tocá el botón Compartir ⬆️ en la barra inferior → 'Agregar a inicio' → poné un nombre y tocá Agregar.\n\n💻 Computadora (Chrome/Edge): buscá el ícono de instalación ⊕ en la barra de direcciones, o abrí el menú y elegí 'Instalar Apacheta'.",
			},
			{
				id: "1.0b",
				type: "minor",
				question: "¿Cómo activo las notificaciones?",
				answer:
					"Las notificaciones te recuerdan anotar tus gastos y te avisan cuando completás una apacheta.\n\nActivalas desde el paso '1.0 Primera Apacheta' en el Mapa → tocá 'Activar notificaciones' → aceptá el permiso que pide el navegador.\n\nSi las bloqueaste por error:\n• Android: Configuración → Apps → Chrome → Notificaciones\n• iPhone: Configuración → Safari → Notificaciones\n• PC: tocá el candado 🔒 junto a la URL → Notificaciones → Permitir",
			},
			{
				id: "1.1",
				type: "major",
				question: "¿Por qué tengo que anotar mis movimientos todos los días?",
				answer:
					"La mayoría de las personas subestima sus gastos en un 30 a 50%. Anotar rompe esa ilusión. No es un presupuesto todavía — es solo mirar. Este hábito, sostenido en el tiempo, cambia cómo tomás decisiones con el dinero.\n\nUn día de registro no sirve. Una semana ya empieza a revelar algo. Un mes te da un cuadro completo.",
			},
			{
				id: "1.1.1",
				type: "minor",
				question: "¿Qué es el balance personal y cómo lo cargo?",
				answer:
					"El balance personal es todo lo que tenés disponible ahora mismo: el efectivo en tu billetera, lo que tenés en el banco, cualquier plata que considerás tuya. No son inversiones ni deudas — eso viene después.\n\nCómo cargarlo: Inicio → tocá tu balance actual → editá y poné el número en pesos.",
			},
			{
				id: "1.1.2",
				type: "minor",
				question: "¿Cómo registro mi ingreso del mes?",
				answer:
					"Inicio → Quick Spend Card → seleccioná tipo 'Ingreso' → ingresá el monto → asegurate de poner la fecha correcta si ya arrancó el mes.\n\nAnotá tu sueldo, honorarios, o cualquier entrada de dinero. El ingreso es el techo de todo lo demás — lo que planeás tiene que caber dentro de ese número.",
			},
			{
				id: "1.1.3",
				type: "minor",
				question: "¿Cómo registro un gasto?",
				answer:
					"Inicio → Quick Spend Card → seleccioná tipo 'Gasto' → ingresá el monto → elegí una categoría (o creá una nueva).\n\nNo hay gastos vergonzosos. El punto es verlos. Con el tiempo, los registros van a mostrar patrones que hoy no ves.",
			},
			{
				id: "1.1.4",
				type: "minor",
				question: "¿Dónde configuro los recordatorios de registro?",
				answer:
					"Configuración → Notificaciones → activá el recordatorio diario de registro.\n\nPodés activarlos o desactivarlos cuando quieras. El recordatorio te avisa a la hora que elijas para que no se te pase anotar los gastos del día.",
			},
			{
				id: "1.2",
				type: "major",
				question: "¿Qué significa 'gastá menos de lo que ganás'?",
				answer:
					"Es la regla de la abuela. La única que importa. Esto no es matemática — es comportamiento.\n\nSi gastás más de lo que ganás (aunque sea poquito, aunque sea en cuotas) estás construyendo una deuda que crece sola. Si gastás menos, tenés un sobrante. Y ese sobrante es el material con el que se construye cualquier libertad financiera.\n\nNo hay app, ni inversión, ni truco que reemplace esta regla. Todo lo demás es técnica para aplicarla mejor.",
			},
		],
	},
	{
		stageId: "stage-2",
		title: "Presupuesto — Gestioná tus recursos",
		subtitle: "Dale un nombre a cada peso antes de gastarlo",
		icon: Wallet,
		items: [
			{
				id: "2.0",
				type: "major",
				question: "¿Qué es un presupuesto de base cero?",
				answer:
					"Significa que tu ingreso menos todos tus gastos planeados da cero. Cada peso tiene un nombre: alquiler, comida, transporte, ahorro. No sobra plata sin nombre porque la plata sin nombre siempre se gasta en algo que no importa.\n\nEsto no es restricción — es intención. Decidís vos adónde va el dinero, antes de que el mes lo decida por vos.",
			},
			{
				id: "2.1",
				type: "minor",
				question: "¿Cómo asigno un presupuesto a cada categoría?",
				answer:
					"Presupuesto → seleccioná una categoría → asigná un monto máximo mensual → repetí para al menos 3 categorías.\n\nNo tiene que ser perfecto. El primer presupuesto nunca lo es. Lo importante es que exista. El mes que viene lo ajustás con lo que aprendiste este mes.",
			},
			{
				id: "2.2",
				type: "minor",
				question: "¿Cómo sé cuánto me queda para gastar?",
				answer:
					"Presupuesto → mirá la barra de progreso de cada categoría.\n\nLa sugerencia de gasto diario te dice cuánto podés gastar por día en lo que resta del mes sin pasarte del límite. Este número te ayuda a tomar decisiones en el momento.",
			},
			{
				id: "2.3",
				type: "minor",
				question: "¿Cómo uso el historial para mejorar mi presupuesto?",
				answer:
					"Historial → filtrá por categoría → identificá dónde gastaste más de lo planeado.\n\nTu historial de gastos es un espejo. Filtrarlo por categoría revela dónde va más plata de lo que creías. Es el input más honesto para ajustar el presupuesto del mes que viene.",
			},
			{
				id: "2.4",
				type: "major",
				question: "¿Cuándo debería hacer el presupuesto del próximo mes?",
				answer:
					"Antes de que empiece el mes. No a fin de mes mirando qué pasó — antes de que empiece, decidiendo qué va a pasar.\n\nSentate unos minutos antes del primero de cada mes y asigná cada peso de tu ingreso esperado: Presupuesto → actualizá los límites para el mes siguiente según lo que aprendiste.",
			},
		],
	},
	{
		stageId: "stage-3",
		title: "Protección — Antes de crecer, protegerse",
		subtitle: "Construí el escudo. Después escalá",
		icon: Shield,
		items: [
			{
				id: "3.0",
				type: "major",
				question: "¿Qué es el patrimonio neto y cómo lo calculo?",
				answer:
					"El patrimonio neto es todo lo que tenés (activos) menos todo lo que debés (pasivos). Es el único número financiero que importa a largo plazo.\n\nPuede ser negativo al principio — eso no es un fracaso, es el punto de partida honesto. El objetivo del camino es que ese número crezca, mes a mes.\n\nPodés verlo en la página Patrimonio.",
			},
			{
				id: "3.1",
				type: "minor",
				question: "¿Qué es el fondo de emergencia inicial y cuánto necesito?",
				answer:
					"Es un colchón mínimo antes de atacar deudas — el equivalente a $500–$1000 USD en pesos o dólares. ¿Por qué? Porque sin ese colchón, cualquier emergencia (el auto, la salud, un electrodoméstico) te va a hacer volver al crédito.\n\nEs un escudo, no una inversión. Guardalo en algo líquido: caja de ahorro, billetera virtual, o efectivo dolarizado.\n\nCómo cargarlo: Patrimonio → Nuevo activo → nombralo 'Fondo de emergencia inicial'.",
			},
			{
				id: "3.2",
				type: "minor",
				question: "¿Cómo registro mis deudas en la app?",
				answer:
					"Patrimonio → Nuevo pasivo → cargá cada deuda con su nombre y monto actual.\n\nSi no tenés deudas, tocá 'No tengo deudas, continuar' en el paso 3.2 del Mapa.\n\nLas deudas de consumo (tarjeta, préstamos, cuotas) en Argentina pueden superar el 100% anual. La deuda crece más rápido de lo que cualquier inversión puede rendir.",
			},
			{
				id: "3.3",
				type: "minor",
				question: "¿Cuánto debería tener en el fondo de emergencia completo?",
				answer:
					"3 meses de gastos esenciales como mínimo, 6 meses como ideal. Este fondo te da tiempo: si perdés el trabajo, no entrás en pánico el primer mes.\n\nEn Argentina el desafío es que los pesos pierden valor. Opciones: dolarizar una parte, plazo fijo UVA, o FCI de ahorro con rendimiento por encima de la inflación.\n\nCómo seguirlo: Seguidor de Ahorro → creá un objetivo 'Fondo de emergencia completo' → calculá 3 veces tus gastos mensuales fijos.",
			},
			{
				id: "3.4",
				type: "minor",
				question: "¿Cómo pago mis deudas más rápido?",
				answer:
					"Dos métodos:\n\n❄️ Bola de nieve: pagás primero la deuda más chica, ganás momentum psicológico y vas tachando. Funciona para quienes necesitan motivación.\n\n🏔️ Avalancha: pagás primero la deuda con mayor tasa, pagás menos interés total. En Argentina con tasas altísimas, tiene más sentido matemático.\n\nElegí el que más se adapte a vos y committete: Patrimonio → actualizá el saldo de cada pasivo a medida que pagás.",
			},
			{
				id: "3.5",
				type: "minor",
				question: "¿Las cuotas sin interés son realmente gratis?",
				answer:
					"No. El precio está en el producto o en la oportunidad perdida. Las cuotas sin interés del comercio suelen incluir el costo financiero en el precio de lista.\n\nAdemás, dividir un gasto en cuotas hace que parezca más chico de lo que es — y eso cambia tu percepción de cuánto gastás realmente. Enojarse con las cuotas funciona mejor que entenderlas matemáticamente.",
			},
			{
				id: "3.6",
				type: "minor",
				question: "¿Cómo funciona el seguidor de ahorro?",
				answer:
					"Seguidor de Ahorro → creá metas para cada objetivo (viaje, electrodoméstico, emprendimiento, emergencia) → definí cuánto podés aportar por mes.\n\nLa clave es pagarte a vos mismo primero: el día que te depositan el sueldo, transferís tu porcentaje de ahorro antes de pagar cualquier otra cosa. Si esperás a ver qué sobra al final del mes, no va a sobrar nada.",
			},
		],
	},
	{
		stageId: "stage-4",
		title: "Lo que enseña el camino",
		subtitle: "El interés compuesto no perdona — ni a favor ni en contra",
		icon: TrendingUp,
		items: [
			{
				id: "4.0",
				type: "major",
				question: "¿Qué es el interés compuesto y por qué importa?",
				answer:
					"Es la capacidad de que los rendimientos generen nuevos rendimientos. No es lineal — es exponencial. Una pequeña diferencia en el porcentaje de ahorro o en el tiempo sostenido produce resultados enormes a 10 o 20 años.\n\nMuy pocos ahorran el 25% de sus ingresos. Menos aún invierten el 25% de lo que ahorran. Los que lo hacen, con tiempo, llegan a donde los demás no pueden. No requiere ser rico para empezar. Requiere empezar.",
			},
			{
				id: "4.1",
				type: "minor",
				question: "¿Cómo empiezo a invertir en Argentina?",
				answer:
					"Con el fondo de emergencia completo y sin deudas (o con el plan en marcha), arrancás a invertir. Objetivo mínimo: 15% de tu ingreso mensual.\n\nEl primer objetivo de una inversión en Argentina es ganarle a la inflación. Opciones para empezar:\n• Plazo fijo UVA: ajusta por inflación\n• FCI money market: rinde diario, se puede retirar en 24hs\n• Cedears: acciones de empresas globales en pesos\n• Dólar MEP: cobertura cambiaria legal\n\nRegistralo: Patrimonio → Nuevo activo → ingresá nombre, tipo y monto.",
			},
			{
				id: "4.2",
				type: "minor",
				question: "¿Cómo planeo a 5 años en un país con alta inflación?",
				answer:
					"Trabajando con dólares o unidades ajustadas (UVA) como referencia, no en pesos nominales. La meta tiene que ser: X dólares o X meses de gastos, no X pesos.\n\nUn objetivo con número y fecha cambia cómo tomás decisiones hoy. La incertidumbre económica hace que la mayoría viva mirando solo el mes que viene — eso es exactamente por qué planear a largo plazo es una ventaja competitiva en Argentina.\n\nCómo hacerlo: Seguidor de Ahorro → creá un objetivo con fecha a más de 12 meses.",
			},
			{
				id: "4.3",
				type: "minor",
				question: "¿Seguir el mapa significa vivir de privaciones?",
				answer:
					"No. Significa gastar con intención: más en lo que importa, menos en lo que no.\n\nLas personas que planean bien no gastan menos — a veces gastan más, pero en lo que eligieron. La calidad de vida mejora cuando el dinero fluye hacia lo que vos decidís, no hacia donde te lleva el impulso o la costumbre.\n\nRevisá tu historial y tu presupuesto: ¿hay categorías donde gastás más de lo que querías? ¿Hay cosas que valorás y no estás priorizando?",
			},
		],
	},
	{
		stageId: "stage-5",
		title: "Libertad — La cima",
		subtitle: "Construí lo que dura",
		icon: Mountain,
		items: [
			{
				id: "5.0",
				type: "major",
				question: "¿Cómo construyo un portafolio diversificado?",
				answer:
					"Contenido próximamente. La regla simple para empezar: algo líquido en pesos, algo en dólares, algo que crezca con el tiempo.\n\nNingún instrumento gana siempre — pero una cartera diversificada pierde menos en las malas y captura crecimiento en las buenas.\n\nRegistralo en Patrimonio con al menos 3 tipos de activos distintos.",
			},
			{
				id: "5.1",
				type: "minor",
				question: "¿Cómo ahorro para emprender?",
				answer:
					"Contenido próximamente. Si tenés una idea, ponele número: ¿cuánto necesitás para arrancar? Ese es tu próximo objetivo de ahorro.\n\nSeguidor de Ahorro → creá un objetivo 'Capital para emprender' → poné el monto que necesitarías para arrancar.",
			},
			{
				id: "5.2",
				type: "minor",
				question: "¿Por qué necesito un fondo de retiro propio si existe ANSES?",
				answer:
					"Contenido próximamente. El sistema previsional argentino (ANSES) probablemente no sea suficiente cuando llegues a retirarte. No es una crítica — es una realidad que hay que planear.\n\nEmpezar desde los 30 años, con un porcentaje fijo del ingreso, hace una diferencia exponencial a los 60.",
			},
			{
				id: "5.3",
				type: "major",
				question: "¿Qué es la libertad financiera?",
				answer:
					"Contenido próximamente. No es ser rico. Es que tus activos generen suficiente para cubrir tu vida sin depender de trabajo activo. Desde ahí, el trabajo es una elección, no una obligación.\n\nLa regla del 4%: a retiro, podés retirar máximo el 4% de tu portafolio por año para que dure. Eso significa que si tus gastos anuales son $X, necesitás X / 0.04 = tu patrimonio objetivo.",
			},
		],
	},
]

const stageColors = {
	"stage-1": "border-primary bg-primary/5",
	"stage-2": "border-primary bg-primary/5",
	"stage-3": "border-accent bg-accent/5",
	"stage-4": "border-primary bg-primary/5",
	"stage-5": "border-accent bg-accent/5",
}

const stageIconColors = {
	"stage-1": "text-primary",
	"stage-2": "text-primary",
	"stage-3": "text-accent",
	"stage-4": "text-primary",
	"stage-5": "text-accent",
}

export default function HelpPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [openItems, setOpenItems] = useState<string[]>([])

	const toggleItem = (id: string) => {
		setOpenItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
	}

	const filteredStages = helpStages
		.map((stage) => ({
			...stage,
			items: stage.items.filter(
				(item) =>
					!searchTerm ||
					item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
					item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
			),
		}))
		.filter((stage) => stage.items.length > 0)

	const totalResults = filteredStages.reduce((sum, s) => sum + s.items.length, 0)

	return (
		<div className="space-y-6 pb-8">

			{/* Header */}
			<div className="flex flex-col space-y-4">
				<div className="flex items-center gap-3">
					<HelpCircle className="w-8 h-8 text-primary" />
					<div>
						<h1 className="text-2xl font-bold text-foreground">Centro de Ayuda</h1>
						<p className="text-muted-foreground text-sm">Guía paso a paso del camino financiero</p>
					</div>
				</div>

				<div className="relative max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
					<Input
						placeholder="Buscar en la guía..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>

				{searchTerm && (
					<p className="text-sm text-muted-foreground">
						{totalResults === 0 ? "Sin resultados" : `${totalResults} resultado${totalResults !== 1 ? "s" : ""}`}
					</p>
				)}
			</div>

			{/* Stages */}
			<div className="space-y-6">
				{filteredStages.map((stage) => {
					const Icon = stage.icon
					const borderColor = stageColors[stage.stageId as keyof typeof stageColors] ?? "border-border bg-muted/30"
					const iconColor = stageIconColors[stage.stageId as keyof typeof stageIconColors] ?? "text-primary"

					return (
						<Card key={stage.stageId} className={cn("border-2", borderColor)}>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-start gap-3">
									<Icon className={cn("w-6 h-6 mt-0.5 shrink-0", iconColor)} />
									<div>
										<p className={cn("text-lg font-bold text-foreground leading-tight")}>{stage.title}</p>
										<p className="text-sm font-normal text-muted-foreground mt-0.5">{stage.subtitle}</p>
									</div>
								</CardTitle>
							</CardHeader>

							<CardContent className="space-y-2 pt-0">
								{stage.items.map((item) => {
									const isOpen = openItems.includes(item.id)
									const isMajor = item.type === "major"

									return (
										<Collapsible key={item.id} open={isOpen} onOpenChange={() => toggleItem(item.id)}>
											<CollapsibleTrigger asChild>
												<div
													className={cn(
														"w-full p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm",
														isMajor
															? "border-border bg-card hover:border-primary/40"
															: "border-border/60 bg-muted/20 hover:border-border",
														isOpen && "shadow-sm border-primary/30",
													)}
												>
													<div className="flex items-start justify-between gap-3">
														<div className="flex items-start gap-2.5 min-w-0 flex-1">
															{isMajor ? (
																<Star className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
															) : (
																<MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
															)}
															<div className="min-w-0 flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<span className={cn(
																		"text-xs font-medium px-1.5 py-0.5 rounded text-muted-foreground",
																		isMajor ? "bg-primary/10" : "bg-muted",
																	)}>
																		{item.id}
																	</span>
																</div>
																<h3 className={cn(
																	"text-left text-foreground leading-snug",
																	isMajor ? "font-semibold text-sm" : "font-medium text-sm",
																)}>
																	{item.question}
																</h3>
															</div>
														</div>
														<div className="shrink-0 mt-0.5">
															{isOpen
																? <ChevronDown className="w-4 h-4 text-muted-foreground" />
																: <ChevronRight className="w-4 h-4 text-muted-foreground" />
															}
														</div>
													</div>
												</div>
											</CollapsibleTrigger>

											<CollapsibleContent>
												<div className={cn(
													"ml-6 mr-1 mt-1 mb-2 p-3 rounded-lg border border-border/50 bg-card",
												)}>
													{item.answer.split("\n").map((line, i) =>
														line === "" ? (
															<div key={i} className="h-2" />
														) : (
															<p key={i} className="text-sm text-foreground/80 leading-relaxed">
																{line}
															</p>
														)
													)}
													{item.id === "1.0b" && (
														<div className="mt-3">
															<SubscriptionButtonNotification />
														</div>
													)}
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
			{totalResults === 0 && searchTerm && (
				<Card>
					<CardContent className="text-center py-12">
						<HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-medium text-foreground mb-2">Sin resultados</h3>
						<p className="text-muted-foreground text-sm">Probá con otros términos.</p>
					</CardContent>
				</Card>
			)}

			{/* Contact */}
			<Card className="border border-primary/20 bg-primary/5">
				<CardContent className="p-5">
					<div className="flex items-start gap-4">
						<HelpCircle className="w-7 h-7 text-primary shrink-0 mt-0.5" />
						<div>
							<h3 className="font-semibold text-foreground mb-1">¿No encontrás lo que buscás?</h3>
							<p className="text-muted-foreground text-sm mb-3">
								Escribinos y te respondemos lo antes posible.
							</p>
							<a
								href="mailto:soporte@apacheta.com"
								className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
							>
								Enviar Email
							</a>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
