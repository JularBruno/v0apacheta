"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export type HItem = {
  id: string
  name: string
  color: string // tailwind bg-* color
  icon?: LucideIcon
}

interface HScrollSelectorProps {
  label: string
  items: HItem[]
  selectedId?: string | null
  onSelect: (id: string) => void
  className?: string
}

// A11y: uses buttons, scroll-snap, and large hit areas for mobile.
export default function HScrollSelector({
  label,
  items,
  selectedId,
  onSelect,
  className,
}: HScrollSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [internalSelected, setInternalSelected] = useState<string | null>(selectedId ?? (items[0]?.id ?? null))

  useEffect(() => {
    if (selectedId && selectedId !== internalSelected) {
      setInternalSelected(selectedId)
      scrollToItem(selectedId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const scrollToItem = (id: string) => {
    const el = containerRef.current
    if (!el) return
    const idx = items.findIndex((i) => i.id === id)
    if (idx < 0) return
    const child = el.children[idx] as HTMLElement | undefined
    if (!child) return
    const parentRect = el.getBoundingClientRect()
    const childRect = child.getBoundingClientRect()
    const targetScrollLeft = el.scrollLeft + (childRect.left + childRect.width / 2 - (parentRect.left + parentRect.width / 2))
    el.scrollTo({ left: targetScrollLeft, behavior: "smooth" })
  }

  // When scrolling ends, snap selected to closest center
  let scrollTimeout: number | null = null
  const onScroll = () => {
    if (scrollTimeout) window.clearTimeout(scrollTimeout)
    scrollTimeout = window.setTimeout(() => {
      const el = containerRef.current
      if (!el) return
      const parentRect = el.getBoundingClientRect()
      const centerX = parentRect.left + parentRect.width / 2
      let bestIdx = 0
      let bestDist = Number.POSITIVE_INFINITY
      Array.from(el.children).forEach((child, idx) => {
        const rect = (child as HTMLElement).getBoundingClientRect()
        const c = rect.left + rect.width / 2
        const dist = Math.abs(c - centerX)
        if (dist < bestDist) {
          bestIdx = idx
          bestDist = dist
        }
      })
      const chosen = items[bestIdx]
      if (chosen && chosen.id !== internalSelected) {
        setInternalSelected(chosen.id)
        onSelect(chosen.id)
      }
    }, 90)
  }

  const handlePrev = () => {
    if (!internalSelected) return
    const idx = items.findIndex((i) => i.id === internalSelected)
    const nextIdx = Math.max(0, idx - 1)
    const nextId = items[nextIdx]?.id
    if (nextId) {
      setInternalSelected(nextId)
      onSelect(nextId)
      scrollToItem(nextId)
    }
  }

  const handleNext = () => {
    if (!internalSelected) return
    const idx = items.findIndex((i) => i.id === internalSelected)
    const nextIdx = Math.min(items.length - 1, idx + 1)
    const nextId = items[nextIdx]?.id
    if (nextId) {
      setInternalSelected(nextId)
      onSelect(nextId)
      scrollToItem(nextId)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrev} aria-label="Anterior">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext} aria-label="Siguiente">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={onScroll}
        className="relative flex gap-3 overflow-x-auto no-scrollbar px-1 scroll-smooth snap-x snap-mandatory"
        aria-label={label}
      >
        {/* gradient edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent"></div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent"></div>

        {items.map((item) => {
          const Icon = item.icon
          const active = item.id === internalSelected
          return (
            <button
              key={item.id}
              onClick={() => {
                setInternalSelected(item.id)
                onSelect(item.id)
                scrollToItem(item.id)
              }}
              className={cn(
                "snap-center shrink-0 px-4 py-3 rounded-2xl border transition-all duration-200 flex items-center gap-3 min-w-[140px]",
                active
                  ? "border-primary-600 bg-primary-50 shadow-md scale-[1.02]"
                  : "border-gray-200 bg-white hover:bg-gray-50",
              )}
            >
              <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center", item.color)}>
                {Icon ? <Icon className="w-4.5 h-4.5 text-white" /> : null}
              </span>
              <span className={cn("font-medium", active ? "text-gray-900" : "text-gray-700")}>{item.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
