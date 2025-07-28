"use client"

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
} from "lucide-react"
import { Button } from "@/components/ui/button"
// import { useMediaQuery } from "@/hooks/use-media-query" // Assuming this hook is available

const mapSteps = [
  // --- Major Goal 1: Bienvenida e Introducción ---
  {
    id: "major-1",
    level: 1,
    title: "Bienvenida a Apacheta",
    description: "Tu punto de partida en el camino hacia la libertad financiera.",
    longDescription:
      "Este primer gran objetivo te sumerge en el universo de Apacheta. Aprenderás a navegar la plataforma, entenderás la filosofía detrás de nuestra educación financiera adaptada a Argentina y establecerás tus primeras intenciones. Es la base sobre la cual construirás todo tu conocimiento y progreso.",
    status: "completed" as const,
    //  icon: Map,
    type: "major" as const,
    positionClass: "top-[150px] left-1/2 -translate-x-1/2",
    lineClass: "before:h-[100px] before:top-full before:left-1/2 before:-translate-x-1/2",
    image: "/images/map-budget-desktop.png",
    mobileImage: "/images/map-budget-mobile.png",
  },
  // --- Small Steps leading to Major Goal 2 ---
  {
    id: "minor-1-1",
    level: 1.1,
    title: "Conoce tus Ingresos",
    description: "Identifica todas tus fuentes de dinero.",
    longDescription: "Detalla cada ingreso, fijo o variable, para tener una visión clara de tu capacidad económica.",
    status: "completed" as const,
    //  icon: DollarSign,
    type: "minor" as const,
    positionClass: "top-[500px] left-[20%]",
    lineClass: "before:h-[100px] before:top-full before:left-[70%] before:-translate-x-1/2 before:-rotate-12",
  },
  {
    id: "minor-1-2",
    level: 1.2,
    title: "Registra tus Gastos",
    description: "El primer paso para el control: saber dónde va tu dinero.",
    longDescription: "Aprende a registrar y categorizar cada gasto, por pequeño que sea, para identificar patrones.",
    status: "unlocked" as const,
    //  icon: HandCoins,
    type: "minor" as const,
    positionClass: "top-[650px] right-[20%]",
    lineClass: "before:h-[100px] before:top-full before:left-[30%] before:-translate-x-1/2 before:rotate-12",
  },
  // --- Major Goal 2: Presupuesto Maestro ---
  {
    id: "major-2",
    level: 2,
    title: "Dominio del Presupuesto",
    description: "Crea un presupuesto que funcione para ti y te dé control total.",
    longDescription:
      "Este objetivo te capacita para diseñar un presupuesto personalizado que se adapte a tu estilo de vida y metas. Aprenderás a asignar fondos, priorizar gastos, y ajustar tu plan para maximizar tu ahorro y minimizar el estrés financiero. Es la herramienta fundamental para la gestión diaria de tu dinero.",
    status: "unlocked" as const,
    //  icon: Wallet,
    type: "major" as const,
    positionClass: "top-[900px] left-1/2 -translate-x-1/2",
    lineClass: "before:h-[100px] before:top-full before:left-1/2 before:-translate-x-1/2",
  },
  // --- Small Steps leading to Major Goal 3 ---
  {
    id: "minor-2-1",
    level: 2.1,
    title: "Fondo de Emergencia",
    description: "Construye tu colchón de seguridad financiera.",
    longDescription: "Define el tamaño ideal de tu fondo de emergencia y estrategias para construirlo rápidamente.",
    status: "locked" as const,
    //  icon: PiggyBank,
    type: "minor" as const,
    positionClass: "top-[1300px] left-[20%]",
    lineClass: "before:h-[100px] before:top-full before:left-[70%] before:-translate-x-1/2 before:-rotate-12",
  },
  {
    id: "minor-2-2",
    level: 2.2,
    title: "Adiós Deudas Malas",
    description: "Estrategias para eliminar deudas de consumo.",
    longDescription:
      "Aprende métodos como la bola de nieve o avalancha para liberarte de deudas de tarjetas y préstamos.",
    status: "locked" as const,
    //  icon: CreditCard,
    type: "minor" as const,
    positionClass: "top-[1450px] right-[20%]",
    lineClass: "before:h-[100px] before:top-full before:left-[30%] before:-translate-x-1/2 before:rotate-12",
  },
  // --- Major Goal 3: Inversiones Inteligentes ---
  {
    id: "major-3",
    level: 3,
    title: "Inversiones con Propósito",
    description: "Haz que tu dinero trabaje para ti, conociendo el mercado argentino.",
    longDescription:
      "Este objetivo te introduce al fascinante mundo de las inversiones, con un enfoque práctico y adaptado a la realidad económica de Argentina. Aprenderás sobre los diferentes instrumentos disponibles, cómo evaluar riesgos y oportunidades, y a construir una cartera diversificada que te acerque a tus metas a largo plazo. Desde plazos fijos hasta fondos comunes y bonos, te daremos las herramientas para empezar a invertir con confianza.",
    status: "locked" as const,
    //  icon: TrendingUp,
    type: "major" as const,
    positionClass: "top-[2000px] left-1/2 -translate-x-1/2",
    lineClass: "before:h-[100px] before:top-full before:left-1/2 before:-translate-x-1/2",
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
    //  icon: Scale,
    type: "minor" as const,
    positionClass: "top-[2300px] left-[20%]",
    lineClass: "before:h-[100px] before:top-full before:left-[70%] before:-translate-x-1/2 before:-rotate-12",
  },
  {
    id: "minor-3-2",
    level: 3.2,
    title: "Análisis de Mercado",
    description: "Herramientas básicas para entender el contexto económico.",
    longDescription: "Aprende a interpretar indicadores económicos clave y noticias que afectan tus inversiones.",
    status: "locked" as const,
    //  icon: BarChart,
    type: "minor" as const,
    positionClass: "top-[2600px] right-[20%]",
    lineClass: "before:h-[100px] before:top-full before:left-[30%] before:-translate-x-1/2 before:rotate-12",
  },
  // --- Major Goal 4: Libertad Financiera ---
  {
    id: "major-4",
    level: 4,
    title: "Cima de la Libertad Financiera",
    description: "Alcanza la independencia y vive la vida que siempre soñaste.",
    longDescription:
      "Este es el objetivo cumbre de tu viaje con Apacheta. Aquí consolidarás todos tus conocimientos y habilidades para asegurar una vida de independencia financiera. Aprenderás a optimizar tus ingresos pasivos, planificar tu retiro, gestionar tu patrimonio y dejar un legado. Es el momento de disfrutar los frutos de tu disciplina y sabiduría financiera.",
    status: "locked" as const,
    //  icon: Mountain,
    type: "major" as const,
    positionClass: "top-[2900px] left-1/2 -translate-x-1/2",
    lineClass: "before:h-[100px] before:top-full before:left-1/2 before:-translate-x-1/2",
  },
]


export default function MapaPage() {
  // const isMobile = useMediaQuery("(max-width: 767px)") // md breakpoint
  const isMobile = false; // md breakpoint
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Image Section */}
      <div className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center overflow-hidden relative">
        <img
          key={displayedImage} // Key to force re-render on image change
          src={displayedImage || "/placeholder.svg"}
          alt="Map Background"
          className="w-full h-full object-contain transition-opacity duration-500" // Changed to object-contain
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/80 to-transparent"></div>
        <h2 className="absolute bottom-4 text-3xl md:text-4xl font-bold text-gray-900 font-manrope text-center px-4">
          Tu Camino Financado
        </h2>
      </div>

      {/* Steps Carousel Section */}
      <div className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="flex items-center w-full max-w-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex-grow flex justify-center px-2">
            <MapStep {...mapSteps[currentStepIndex]} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentStepIndex === mapSteps.length - 1}
            className="shrink-0"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
        {/* Dots for navigation */}
        <div className="flex space-x-2 mt-4">
          {mapSteps.map((_, index) => (
            <span
              key={index}
              className={`block w-2 h-2 rounded-full ${index === currentStepIndex ? "bg-primary-600" : "bg-gray-300"}`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  )
}
