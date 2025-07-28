"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, CheckCircle, Lock, PlayCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils" // Assuming cn utility is available

interface MapStepProps {
  id: string
  level: number
  title: string
  description: string
  longDescription: string
  status: "completed" | "unlocked" | "locked"
  // icon: React.ElementType // Lucide React icon component
  type: "major" | "minor" // New prop for step type
  // Removed positionClass and lineClass
}

export default function MapStep({
  id,
  level,
  title,
  description,
  longDescription,
  status,
  // icon: Icon,
  type,
}: MapStepProps) {
  const [isOpen, setIsOpen] = useState(false)

  const statusColors = {
    completed: "bg-primary-600 text-white",
    unlocked: "bg-primary-500 text-white",
    locked: "bg-gray-300 text-gray-600",
  }

  const iconStatus = {
    completed: <CheckCircle className="w-6 h-6" />,
    unlocked: <PlayCircle className="w-6 h-6" />,
    locked: <Lock className="w-6 h-6" />,
  }

  const isMajor = type === "major"

  return (
    <div
      id={id}
      className={cn(
        "flex-shrink-0 transition-all duration-300", // Ensure it doesn't shrink in flex container
        isMajor ? "w-72 md:w-80" : "w-56 md:w-64", // Different widths for major/minor
        status === "locked" ? "opacity-70" : "", // Opacity for locked state
      )}
    >
      <Card
        className={cn(
          "w-full h-full flex flex-col shadow-lg transition-all duration-300 relative", // Ensure card takes full height
          isMajor ? "border-2 border-primary-400 bg-white/90" : "border border-gray-200 bg-white", // Distinct border/bg for major
          status === "locked" ? "cursor-not-allowed" : "hover:shadow-xl cursor-pointer",
        )}
        onClick={() => status !== "locked" && !isMajor && setIsOpen(!isOpen)} // Only minor steps are expandable
      >
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "rounded-full flex items-center justify-center shrink-0",
                isMajor ? "w-12 h-12" : "w-10 h-10", // Larger icon container for major
                statusColors[status],
              )}
            >
              {/* {isMajor ? <Icon className="w-7 h-7" /> : iconStatus[status]}  */}
              {/* Use actual icon for major */}
            </div>
            <div>
              <CardTitle className={cn("font-semibold text-gray-900", isMajor ? "text-xl" : "text-lg")}>
                {title}
              </CardTitle>
              <p className="text-sm text-gray-500">Nivel {level}</p>
            </div>
          </div>
          {!isMajor &&
            status !== "locked" &&
            (isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ))}
        </CardHeader>
        <CardContent className="p-4 pt-2 flex-grow">
          {" "}
          {/* flex-grow to push content down */}
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          {(isOpen || isMajor) && ( // Always show longDescription for major goals
            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-700">{longDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
