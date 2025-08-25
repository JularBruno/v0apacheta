"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, CheckCircle, Lock, PlayCircle, Star, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface MapStepProps {
  id: string
  level: number
  title: string
  description: string
  longDescription: string
  status: "completed" | "unlocked" | "locked"
  icon: React.ElementType
  type: "major" | "minor" | "chapter"
}

export default function MapStep({
  id,
  level,
  title,
  description,
  longDescription,
  status,
  icon: Icon,
  type,
}: MapStepProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 767px)")

  const statusColors = {
    completed: "bg-primary-600 text-white",
    unlocked: "bg-primary-500 text-white",
    locked: "bg-gray-300 text-gray-600",
  }

  const iconStatus = {
    completed: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
    unlocked: <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
    locked: <Lock className="w-5 h-5 sm:w-6 sm:h-6" />,
  }

  const isMajor = type === "major"
  const isChapter = type === "chapter"

  // Mobile layout - Much bigger and more accessible
  if (isMobile) {
    return (
      <div id={id} className="w-full h-full">
        <Card
          className={cn(
            "w-full flex flex-col shadow-lg transition-all duration-300 relative",
            isChapter
              ? "border-4 border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 min-h-[400px]"
              : isMajor
                ? "border-2 border-primary-400 bg-white/90 min-h-[380px]"
                : "border border-gray-200 bg-white min-h-[320px]",
            status === "locked" ? "cursor-not-allowed opacity-70" : "hover:shadow-xl cursor-pointer",
          )}
          onClick={() => status !== "locked" && !isMajor && !isChapter && setIsOpen(!isOpen)}
          role="article"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
        >
          {/* Mobile Header - Rearranged elements */}
          <CardHeader className="flex flex-col space-y-3 p-6 pb-4">
            {/* Top row: Level and Completado check */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isChapter && (
                  <span className="px-3 py-1 bg-amber-500 text-amber-900 text-sm font-bold rounded-full">CAPÍTULO</span>
                )}
                <p className="text-sm text-gray-500 font-medium">Nivel {level}</p>
              </div>
              {status === "completed" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Completado</span>
                </div>
              )}
            </div>

            {/* Second row: Icon and Title */}
            <div className="flex items-start space-x-4">
              <div
                className={cn(
                  "rounded-full flex items-center justify-center shrink-0",
                  isChapter
                    ? "w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 text-white"
                    : isMajor
                      ? `w-14 h-14 ${statusColors[status]}`
                      : `w-12 h-12 ${statusColors[status]}`,
                )}
                aria-hidden="true"
              >
                {isChapter ? <Star className="w-8 h-8" /> : isMajor ? <Icon className="w-7 h-7" /> : iconStatus[status]}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle
                  id={`${id}-title`}
                  className={cn(
                    "font-bold text-gray-900 leading-tight",
                    isChapter ? "text-xl" : isMajor ? "text-lg" : "text-base",
                  )}
                >
                  {title}
                </CardTitle>
              </div>
              {!isMajor &&
                !isChapter &&
                status !== "locked" &&
                (isOpen ? (
                  <ChevronUp className="w-6 h-6 text-gray-600 shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600 shrink-0" aria-hidden="true" />
                ))}
            </div>
          </CardHeader>

          {/* Mobile Content - Much bigger and more readable */}
          <CardContent className="p-6 pt-2 flex-grow flex flex-col min-h-0">
            <p id={`${id}-description`} className="text-base text-gray-600 mb-4 leading-relaxed">
              {description}
            </p>

            {/* For major and chapter cards - always show scrollable content */}
            {(isMajor || isChapter) && (
              <div className="flex-grow overflow-hidden">
                <div className="border-t border-gray-200 pt-4 h-full">
                  <div className="h-full overflow-y-auto pr-2">
                    <p className="text-sm text-gray-700 leading-relaxed">{longDescription}</p>
                  </div>
                </div>
              </div>
            )}

            {/* For minor cards - expandable content */}
            {!isMajor && !isChapter && isOpen && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-700 leading-relaxed">{longDescription}</p>
              </div>
            )}

            {/* Status indicator for accessibility */}
            <div className="sr-only">
              Estado: {status === "completed" ? "Completado" : status === "unlocked" ? "Disponible" : "Bloqueado"}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Desktop layout - with completado check and brownish chapters
  const getCardStyles = () => {
    if (isChapter) {
      return "border-4 border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 min-h-[320px] sm:min-h-[380px]"
    }
    if (isMajor) {
      return "border-2 border-primary-400 bg-white/90 min-h-[280px] sm:min-h-[320px]"
    }
    return "border border-gray-200 bg-white min-h-[240px] sm:min-h-[280px]"
  }

  const getIconContainer = () => {
    if (isChapter) {
      return "w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-amber-700 text-white"
    }
    if (isMajor) {
      return `w-10 h-10 sm:w-12 sm:h-12 ${statusColors[status]}`
    }
    return `w-8 h-8 sm:w-10 sm:h-10 ${statusColors[status]}`
  }

  return (
    <div id={id} className="w-full h-full">
      <Card
        className={cn(
          "w-full h-full flex flex-col shadow-lg transition-all duration-300 relative",
          getCardStyles(),
          status === "locked" ? "cursor-not-allowed opacity-70" : "hover:shadow-xl cursor-pointer",
        )}
        onClick={() => status !== "locked" && !isMajor && !isChapter && setIsOpen(!isOpen)}
        role="article"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
      >
        <CardHeader className="flex flex-row items-start justify-between p-3 sm:p-4 pb-2">
          <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div
              className={cn("rounded-full flex items-center justify-center shrink-0", getIconContainer())}
              aria-hidden="true"
            >
              {isChapter ? (
                <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              ) : isMajor ? (
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              ) : (
                iconStatus[status]
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {isChapter && (
                  <span className="px-2 py-1 bg-amber-500 text-amber-900 text-xs font-semibold rounded-full">
                    CAPÍTULO
                  </span>
                )}
                <p className="text-xs sm:text-sm text-gray-500">Nivel {level}</p>
                {status === "completed" && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                    <Check className="w-3 h-3" />
                    <span className="text-xs font-medium">Completado</span>
                  </div>
                )}
              </div>
              <CardTitle
                id={`${id}-title`}
                className={cn(
                  "font-semibold text-gray-900",
                  isChapter
                    ? "text-lg sm:text-xl md:text-2xl"
                    : isMajor
                      ? "text-base sm:text-lg md:text-xl"
                      : "text-sm sm:text-base md:text-lg",
                )}
              >
                {title}
              </CardTitle>
            </div>
          </div>
          {!isMajor &&
            !isChapter &&
            status !== "locked" &&
            (isOpen ? (
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 shrink-0" aria-hidden="true" />
            ))}
        </CardHeader>

        <CardContent className="p-3 sm:p-4 pt-2 flex-grow flex flex-col min-h-0">
          <p id={`${id}-description`} className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
            {description}
          </p>

          {/* For major and chapter cards on desktop, make content scrollable */}
          {(isMajor || isChapter) && (
            <div className="flex-grow overflow-hidden">
              <div className="mt-3 sm:mt-4 border-t border-gray-200 pt-3 sm:pt-4 h-full">
                <div className="h-full overflow-y-auto pr-2">
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{longDescription}</p>
                </div>
              </div>
            </div>
          )}

          {/* For minor cards, show expandable content */}
          {!isMajor && !isChapter && isOpen && (
            <div className="mt-3 sm:mt-4 border-t border-gray-200 pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{longDescription}</p>
            </div>
          )}

          {/* Status indicator for accessibility */}
          <div className="sr-only">
            Estado: {status === "completed" ? "Completado" : status === "unlocked" ? "Disponible" : "Bloqueado"}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
