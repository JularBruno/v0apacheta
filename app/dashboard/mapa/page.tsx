"use client"

import { cn } from "@/lib/utils"

import { useState, useMemo } from "react"
import MapStep from "@/components/map/map-step"
import {
	Map,
	Wallet,
	PiggyBank,
	CreditCard,
	TrendingUp,
	Mountain,
	DollarSign,
	HandCoins,
	Scale,
	BarChart,
	ChevronLeft,
	ChevronRight,
	BookOpen,
	Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

import { useDashboard } from '@/app/dashboard/dashboardContext';


const mapSteps = [
	// --- Chapter 1: Fundamentos ---
	{
		id: "chapter-1",
		level: 0,
		title: "Sigue el mapa...",
		description: "Fundamentos Financieros: Vive con menos de lo que ganas.",
		longDescription:
			// "Aprende la importancia de rastrear todos tus gastos. A planear los presupuestos para saber cuanto gastar el mes que viene. Pudiendo ahorrar o salir de deudas.",
			"Aprende a rastrear tus gastos, planificar presupuestos y tomar control de tu dinero. Esto te permitirá ahorrar o salir de deudas. Solo seguir el camino te llevará a ello, sigue el mapa, sigue las apachetas.",
		status: "completed" as const,
		icon: BookOpen,
		type: "chapter" as const,
		image:
			// "/map1.png?height=400&width=800&text=🏔️%20Fundamentos%20(Completado)%20→%20🗻%20Bienvenida%20→%20⚪%20Ingresos",
			"/map1.png",
		mobileImage:
			"/map1.png",
	},

	// --- Major Goal 1: Bienvenida e Introducción ---
	{
		id: "major-1",
		level: 1,
		title: "Primer Apacheta",
		description: "Tu punto de partida en el camino",
		longDescription:
			"Aparte de seguir el mapa, deberás anotar tus ingresos y tus gastos, todos los días, esto hará que seas mucho más consciente de tus movimientos. Cambiará tus hábitos de gasto, mejorará tu gestión de recursos y oportunidades.",
		status: "completed" as const,
		icon: Map,
		type: "major" as const,
		image:
			"/map1.png",
		mobileImage:
			"/map1.png",
	},

	// --- Small Steps leading to Major Goal 2 ---
	{
		id: "minor-1-1",
		level: 1.1,
		title: "Conoce tus Ingresos",
		description: "Identifica todas tus fuentes de dinero.",
		longDescription: "Primera actividad, ve al inicio, lo ideal sería que anotes tu ingreso al principio del mes, luego anotaremos gastos. Si sientes que esto es mucho, puedes poner tu balance actual... Ve al inicio -> Agrega un Ingreso: con tu primer ingreso del mes (Recuerda que puedes especificar la fecha). Podrás continuar a la siguiente apacheta una vez hayas actualizado tu balance. ",
		status: "completed" as const,
		icon: DollarSign,
		type: "minor" as const,
		image:
			"/map2.png",
		mobileImage:
			"/map2.png",
	},

	{
		id: "minor-1-2",
		level: 1.2,
		title: "Registra tus Gastos",
		description: "El primer paso para el control: saber dónde va tu dinero.",
		longDescription: "Aprende a registrar y categorizar cada gasto, por pequeño que sea, para identificar patrones. Si anotaste tus ingresos desde el inicio del mes, ahora deberás anotar tus gastos. Puedes continuar a la siguiente apacheta cuando quieras. Recuerda crear nuevas categorías para acomodarse a tus gastos. Mientras más anotes más fácil te será ;) (Podrás ver referencias de cada gasto que crees).",
		status: "unlocked" as const,
		icon: HandCoins,
		type: "minor" as const,
		image:
			"/map3.png",
		mobileImage:
			"/map3.png",
	},

	// --- Major Goal 2: Presupuesto Maestro ---
	{
		id: "chapter-2",
		level: 2,
		title: "Dominio del Presupuesto",
		description: "Crea un presupuesto que funcione para ti y te dé control total.",
		longDescription:
			"Este objetivo te capacita para diseñar un presupuesto personalizado que se adapte a tu estilo de vida y metas. Aprenderás a asignar fondos, priorizar gastos, y ajustar tu plan para maximizar tu ahorro y minimizar el estrés financiero. Es la herramienta fundamental para la gestión diaria de tu dinero. Dominarás técnicas como el presupuesto 50/30/20, el método de sobres, y cómo adaptar tu presupuesto a los cambios de la economía argentina.",
		status: "unlocked" as const,
		icon: Wallet,
		type: "major" as const,
		image:
			"/20250519_162612.jpg",
		mobileImage:
			"/20250519_162612.jpg",
	},

	// --- Chapter 2: Protección y Ahorro ---
	{
		id: "major-2-1",
		level: 2.5,
		title: "Protección y Ahorro",
		description: "Construye tu escudo financiero y desarrolla el hábito del ahorro.",
		longDescription:
			"En este capítulo aprenderás a proteger tu patrimonio y a desarrollar estrategias de ahorro efectivas. Cubriremos desde la creación de fondos de emergencia hasta la eliminación de deudas tóxicas. Es fundamental para crear la estabilidad financiera que necesitas antes de comenzar a invertir.",
		status: "locked" as const,
		icon: Target,
		type: "chapter" as const,
		image:
			"/placeholder.svg?height=400&width=800&text=🗻%20Presupuesto%20→%20🏔️%20Protección%20(Bloqueado)%20→%20⚫%20Emergencia",
		mobileImage:
			"/placeholder.svg?height=600&width=400&text=🗻%20Presupuesto%20→%20🏔️%20Protección%20(Bloqueado)%20→%20⚫%20Emergencia",
	},

	// --- Small Steps leading to Major Goal 3 ---
	{
		id: "minor-2-1",
		level: 2.1,
		title: "Fondo de Emergencia",
		description: "Construye tu colchón de seguridad financiera.",
		longDescription: "Define el tamaño ideal de tu fondo de emergencia y estrategias para construirlo rápidamente.",
		status: "locked" as const,
		icon: PiggyBank,
		type: "minor" as const,
		image:
			"/placeholder.svg?height=400&width=800&text=🏔️%20Protección%20→%20⚫%20Emergencia%20(Bloqueado)%20→%20⚫%20Deudas",
		mobileImage:
			"/placeholder.svg?height=600&width=400&text=🏔️%20Protección%20→%20⚫%20Emergencia%20(Bloqueado)%20→%20⚫%20Deudas",
	},

	{
		id: "minor-2-2",
		level: 2.2,
		title: "Adiós Deudas Malas",
		description: "Estrategias para eliminar deudas de consumo.",
		longDescription:
			"Aprende métodos como la bola de nieve o avalancha para liberarte de deudas de tarjetas y préstamos.",
		status: "locked" as const,
		icon: CreditCard,
		type: "minor" as const,
		image:
			"/placeholder.svg?height=400&width=800&text=⚫%20Emergencia%20→%20⚫%20Deudas%20(Bloqueado)%20→%20⚫%20Inversiones",
		mobileImage:
			"/placeholder.svg?height=600&width=400&text=⚫%20Emergencia%20→%20⚫%20Deudas%20(Bloqueado)%20→%20⚫%20Inversiones",
	},

	// --- Major Goal 3: Inversiones Inteligentes ---
	{
		id: "major-3",
		level: 3,
		title: "Inversiones con Propósito",
		description: "Haz que tu dinero trabaje para ti, conociendo el mercado argentino.",
		longDescription:
			"Este objetivo te introduce al fascinante mundo de las inversiones, con un enfoque práctico y adaptado a la realidad económica de Argentina. Aprenderás sobre los diferentes instrumentos disponibles, cómo evaluar riesgos y oportunidades, y a construir una cartera diversificada que te acerque a tus metas a largo plazo. Desde plazos fijos hasta fondos comunes y bonos, te daremos las herramientas para empezar a invertir con confianza. También cubriremos estrategias para protegerte de la inflación y maximizar tus retornos en pesos y dólares.",
		status: "locked" as const,
		icon: TrendingUp,
		type: "major" as const,
		image:
			"/placeholder.svg?height=400&width=800&text=⚫%20Deudas%20→%20⚫%20Inversiones%20(Bloqueado)%20→%20⚫%20Diversificar",
		mobileImage:
			"/placeholder.svg?height=600&width=400&text=⚫%20Deudas%20→%20⚫%20Inversiones%20(Bloqueado)%20→%20⚫%20Diversificar",
	},

	// --- Small Steps leading to Major Goal 4 ---
	{
		id: "minor-3-1",
		level: 3.1,
		title: "Diversifica tu Cartera",
		description: "No pongas todos los huevos en la misma canasta.",
		longDescription:
			"Entiende la importancia de diversificar tus inversiones para minimizar riesgos y maximizar retornos.",
		status: "locked" as const,
		icon: Scale,
		type: "minor" as const,
		image:
			"/placeholder.svg?height=400&width=800&text=⚫%20Inversiones%20→%20⚫%20Diversificar%20(Bloqueado)%20→%20⚫%20Análisis",
		mobileImage:
			"/placeholder.svg?height=600&width=400&text=⚫%20Inversiones%20→%20⚫%20Diversificar%20(Bloqueado)%20→%20⚫%20Análisis",
	},

	{
		id: "minor-3-2",
		level: 3.2,
		title: "Análisis de Mercado",
		description: "Herramientas básicas para entender el contexto económico.",
		longDescription: "Aprende a interpretar indicadores económicos clave y noticias que afectan tus inversiones.",
		status: "locked" as const,
		icon: BarChart,
		type: "minor" as const,
		image:
			"/placeholder.svg?height=400&width=800&text=⚫%20Diversificar%20→%20⚫%20Análisis%20(Bloqueado)%20→%20⚫%20Libertad",
		mobileImage:
			"/placeholder.svg?height=600&width=400&text=⚫%20Diversificar%20→%20⚫%20Análisis%20(Bloqueado)%20→%20⚫%20Libertad",
	},

	// --- Major Goal 4: Libertad Financiera ---
	{
		id: "major-4",
		level: 4,
		title: "Cima de la Libertad Financiera",
		description: "Alcanza la independencia y vive la vida que siempre soñaste.",
		longDescription:
			"Este es el objetivo cumbre de tu viaje con Apacheta. Aquí consolidarás todos tus conocimientos y habilidades para asegurar una vida de independencia financiera. Aprenderás a optimizar tus ingresos pasivos, planificar tu retiro, gestionar tu patrimonio y dejar un legado. Es el momento de disfrutar los frutos de tu disciplina y sabiduría financiera. Cubriremos estrategias avanzadas de inversión, planificación fiscal, y cómo mantener y hacer crecer tu riqueza a largo plazo.",
		status: "locked" as const,
		icon: Mountain,
		type: "major" as const,
		image: "/placeholder.svg?height=400&width=800&text=⚫%20Análisis%20→%20⚫%20Libertad%20(Bloqueado)%20🏆",
		mobileImage: "/placeholder.svg?height=600&width=400&text=⚫%20Análisis%20→%20⚫%20Libertad%20(Bloqueado)%20🏆",
	},
]

export default function MapaPage() {
	const isMobile = useMediaQuery("(max-width: 767px)")
	const [currentStepIndex, setCurrentStepIndex] = useState(0)

	const { user, userBalance, loadingUser } = useDashboard();
	// Just about to be used to get user information and display map step
	// console.log('user ', user);

	const displayedImage = useMemo(() => {
		return isMobile ? mapSteps[currentStepIndex]?.mobileImage : mapSteps[currentStepIndex]?.image || mapSteps[0].image
	}, [isMobile, currentStepIndex])

	const handlePrev = () => {
		setCurrentStepIndex((prevIndex) => Math.max(0, prevIndex - 1))
	}

	const handleNext = () => {
		setCurrentStepIndex((prevIndex) => Math.min(mapSteps.length - 1, prevIndex + 1))
	}

	return (
		// <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
		// 	{/* Image Section - Much bigger on mobile */}
		// 	<div
		// 		className={cn(
		// 			"w-full bg-gray-200 flex items-center justify-center overflow-hidden relative",
		// 			isMobile ? "h-80 sm:h-96" : "h-48 sm:h-64 md:h-80 lg:h-96",
		// 		)}
		// 	>
		// 		<img
		// 			key={displayedImage}
		// 			src={displayedImage || "/placeholder.svg"}
		// 			alt="Map Background"
		// 			className="w-full h-full object-cover transition-opacity duration-500"
		// 		/>
		// 		<div className="absolute inset-0 bg-gradient-to-t from-gray-50/80 to-transparent"></div>
		// 		<h2
		// 			className={cn(
		// 				"absolute font-bold text-gray-900 font-manrope text-center px-4",
		// 				isMobile
		// 					? "bottom-6 text-2xl sm:text-3xl"
		// 					: "bottom-2 sm:bottom-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl",
		// 			)}
		// 		>
		// 			Tu Camino Financiero
		// 		</h2>
		// 	</div>


		<div className="flex flex-col h-full bg-gray-50 overflow-hidden">
			{/* Image Section - 32rem height */}
			<div className="w-full h-[32rem] bg-gray-200 flex items-center justify-center overflow-hidden relative">
				{/* <div className="w-full h-[32rem] bg-gray-200 flex items-center justify-center overflow-hidden relative"> */}
				<img
					key={displayedImage}
					src={displayedImage || "/placeholder.svg"}
					alt="Map Background"
					// className="w-full h-full object-cover transition-opacity duration-500 opacity-60"
					// className="w-full h-full "
					className={cn(
						"h-full",
						isMobile ? "w-[152%] max-w-[152%]" : "w-full",
					)}
				/>
				{/* <div className="absolute inset-0 bg-gradient-to-b from-gray-50/40 via-transparent to-gray-50/80"></div> */}
				<h2 className="absolute top-6 font-bold text-gray-100 font-manrope text-center px-4 text-2xl sm:text-3xl md:text-4xl">
					Tu Camino Financiero
				</h2>
			</div>

			{/* Steps Section - Much bigger cards on mobile */}
			<div className="flex-grow p-2 sm:p-4 md:p-8 flex flex-col items-center justify-center min-h-0">
				<div className="flex items-center w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
					<Button
						variant="ghost"
						size="icon"
						onClick={handlePrev}
						disabled={currentStepIndex === 0}
						className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
						aria-label="Paso anterior"
					>
						<ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
					</Button>

					<div className="flex-grow flex justify-center px-1 sm:px-2 overflow-hidden">
						<div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
							<MapStep {...mapSteps[currentStepIndex]} />
						</div>
					</div>

					<Button
						variant="ghost"
						size="icon"
						onClick={handleNext}
						disabled={currentStepIndex === mapSteps.length - 1}
						className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
						aria-label="Siguiente paso"
					>
						<ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
					</Button>
				</div>

				{/* Dots for navigation - Mobile optimized */}
				<div
					className="flex space-x-1 sm:space-x-2 mt-3 sm:mt-4 overflow-x-auto pb-2"
					role="tablist"
					aria-label="Navegación del mapa"
				>
					{mapSteps.map((step, index) => (
						<button
							key={index}
							onClick={() => setCurrentStepIndex(index)}
							role="tab"
							aria-selected={index === currentStepIndex}
							aria-label={`Ir a ${step.title}`}
							className={`block shrink-0 transition-all duration-200 ${step.type === "chapter"
								? "w-3 h-3 sm:w-4 sm:h-4 rounded-sm"
								: step.type === "major"
									? "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
									: "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
								} ${index === currentStepIndex
									? step.type === "chapter"
										? "bg-amber-600"
										: "bg-primary-600"
									: "bg-gray-300"
								}`}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
