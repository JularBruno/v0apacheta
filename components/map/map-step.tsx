"use client"

import type React from "react"
import { useState } from "react"
import {
	ChevronDown,
	ChevronUp,
	CheckCircle2,
	Lock,
	CircleDot,
	MapPin,
	BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import SubscriptionButtonNotification from "@/components/notifications/subscription-notification-button"

interface MapStepProps {
	id: string
	level: string
	title: string
	description: string
	longDescription: string
	appInstruction?: string
	validationButton?: string
	validationFallback?: string
	customComponent?: "notification-button"
	status: "completed" | "unlocked" | "locked"
	icon: React.ElementType
	type: "major" | "minor" | "chapter"
}

export default function MapStep({
	id,
	title,
	description,
	longDescription,
	appInstruction,
	validationButton,
	validationFallback,
	customComponent,
	status,
	icon: Icon,
	type,
}: MapStepProps) {
	const isMobile = useMediaQuery("(max-width: 767px)")
	const [isOpen, setIsOpen] = useState(false)

	const isChapter = type === "chapter"
	const isMajor = type === "major"
	const isLocked = status === "locked"
	const isCompleted = status === "completed"
	const isActive = status === "unlocked"

	// Minor cards: open on desktop by default, collapsed on mobile
	const showContent = isMajor || isChapter || (!isMobile) || isOpen

	// ─── Chapter card — burnt-peach ─────────────────────────────────────────
	if (isChapter) {
		return (
			<div
				id={id}
				className={cn(
					"w-full rounded-xl overflow-hidden border shadow-sm transition-all duration-200",
					"bg-burnt-peach-50 border-burnt-peach-200",
					isActive && "shadow-md border-burnt-peach-300",
					isLocked && "opacity-50",
				)}
			>
				{/* Label bar */}
				<div className={cn(
					"px-4 py-2.5 flex items-center gap-2",
					isCompleted || isActive ? "bg-burnt-peach-500" : "bg-burnt-peach-400/70",
				)}>
					<div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
						<BookOpen className="w-3.5 h-3.5 text-white" />
					</div>
					<span className="text-[10px] font-bold tracking-widest text-white uppercase flex-1">Capítulo</span>
					{isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />}
					{isLocked && <Lock className="w-3.5 h-3.5 text-white/40" />}
				</div>

				{/* Body */}
				<div className="px-5 py-4">
					<h3 className="text-base font-bold text-burnt-peach-900 leading-snug mb-1">{title}</h3>
					<p className="text-sm text-burnt-peach-700 leading-relaxed">{description}</p>

					{isActive && (
						<>
							<p className="mt-3 text-sm text-burnt-peach-800 leading-relaxed border-t border-burnt-peach-200 pt-3">
								{longDescription}
							</p>
							{appInstruction && (
								<div className="mt-4 flex gap-2 bg-burnt-peach-100 rounded-lg p-3 border-l-2 border-l-burnt-peach-400">
									<MapPin className="w-4 h-4 text-burnt-peach-600 shrink-0 mt-0.5" />
									<p className="text-xs text-burnt-peach-800 leading-relaxed whitespace-pre-line">{appInstruction}</p>
								</div>
							)}
							<div className="mt-4 flex flex-col gap-2">
								{customComponent === "notification-button" && (
									<SubscriptionButtonNotification />
								)}
								{validationButton && (
									<Button size="sm" className="w-full bg-burnt-peach-500 hover:bg-burnt-peach-600 text-white border-0">
										{validationButton}
									</Button>
								)}
								{validationFallback && (
									<Button size="sm" variant="ghost" className="w-full text-burnt-peach-600 hover:text-burnt-peach-700 text-xs">
										{validationFallback}
									</Button>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		)
	}

	// ─── Major step card ──────────────────────────────────────────────────────
	if (isMajor) {
		return (
			<div
				id={id}
				className={cn(
					"w-full rounded-xl bg-card border overflow-hidden shadow-sm transition-all duration-200",
					isActive && "border-primary/50 shadow-md ring-1 ring-primary/10",
					isCompleted && "border-border opacity-60",
					isLocked && "border-border opacity-40 cursor-not-allowed",
				)}
			>
				{/* Accent stripe */}
				<div className={cn(
					"h-1 w-full",
					isCompleted && "bg-primary/40",
					isActive && "bg-primary",
					isLocked && "bg-muted",
				)} />

				<div className="p-5">
					{/* Header */}
					<div className="flex items-start gap-3 mb-3">
						<div className={cn(
							"w-10 h-10 rounded-full flex items-center justify-center shrink-0",
							isCompleted && "bg-primary/15",
							isActive && "bg-primary",
							isLocked && "bg-muted",
						)}>
							{isCompleted
								? <CheckCircle2 className="w-5 h-5 text-primary" />
								: isLocked
									? <Lock className="w-5 h-5 text-muted-foreground" />
									: <Icon className="w-5 h-5 text-primary-foreground" />
							}
						</div>
						<div className="flex-1 min-w-0">
							<span className={cn(
								"text-[10px] font-bold tracking-widest uppercase",
								isCompleted && "text-primary",
								isActive && "text-primary",
								isLocked && "text-muted-foreground",
							)}>
								{isCompleted ? "Completado" : isActive ? "En curso" : "Bloqueado"}
							</span>
							<h3 className="text-base font-bold text-foreground leading-snug">{title}</h3>
						</div>
					</div>

					<p className="text-sm text-muted-foreground leading-relaxed mb-3">{description}</p>

					{!isLocked && (
						<>
							<p className="text-sm text-foreground/80 leading-relaxed">{longDescription}</p>
							{appInstruction && (
								<div className="mt-4 flex gap-2 bg-secondary rounded-lg p-3 border-l-2 border-l-primary">
									<MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
									<p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-line">{appInstruction}</p>
								</div>
							)}
							{isActive && (
								<div className="mt-4 flex flex-col gap-2">
									{customComponent === "notification-button" && (
										<SubscriptionButtonNotification />
									)}
									{validationButton && (
										<Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
											{validationButton}
										</Button>
									)}
									{validationFallback && (
										<Button size="sm" variant="ghost" className="w-full text-muted-foreground text-xs">
											{validationFallback}
										</Button>
									)}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		)
	}

	// --- Minor step card ---
	return (
		<div
			id={id}
			className={cn(
				"w-full rounded-xl bg-card border transition-all duration-200",
				isActive && "border-primary/40 shadow-sm",
				isCompleted && "border-border opacity-55",
				isLocked && "border-border opacity-35 cursor-not-allowed",
				isActive && isMobile && "cursor-pointer",
			)}
			onClick={() => isActive && isMobile && setIsOpen(!isOpen)}
			role={isActive && isMobile ? "button" : undefined}
			aria-expanded={isActive && isMobile ? isOpen : undefined}
		>
			<div className="px-4 py-3 flex items-center gap-3">
				<div className={cn(
					"w-7 h-7 rounded-full flex items-center justify-center shrink-0",
					isCompleted && "bg-primary/15",
					isActive && "bg-primary/10",
					isLocked && "bg-muted",
				)}>
					{isCompleted
						? <CheckCircle2 className="w-4 h-4 text-primary" />
						: isLocked
							? <Lock className="w-3.5 h-3.5 text-muted-foreground" />
							: <CircleDot className="w-4 h-4 text-primary" />
					}
				</div>

				<div className="flex-1 min-w-0">
					<p className={cn(
						"text-sm font-semibold leading-snug",
						isActive ? "text-foreground" : "text-foreground/70",
					)}>{title}</p>
					{/* On desktop always show, on mobile show when collapsed */}
					{(!showContent || !isActive) && (
						<p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{description}</p>
					)}
				</div>

				{/* Chevron only on mobile for active steps */}
				{isActive && isMobile && (
					isOpen
						? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
						: <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
				)}
			</div>

			{/* Expandable body */}
			{isActive && showContent && (
				<div className="px-4 pb-4 border-t border-border">
					<p className="text-sm text-foreground/80 leading-relaxed pt-3 mb-3">{longDescription}</p>
					{appInstruction && (
						<div className="flex gap-2 bg-secondary rounded-lg p-3 border-l-2 border-l-primary">
							<MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
							<p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-line">{appInstruction}</p>
						</div>
					)}
					{(customComponent || validationButton || validationFallback) && (
						<div className="mt-4 flex flex-col gap-2">
							{customComponent === "notification-button" && (
								<SubscriptionButtonNotification />
							)}
							{validationButton && (
								<Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
									{validationButton}
								</Button>
							)}
							{validationFallback && (
								<Button size="sm" variant="ghost" className="w-full text-muted-foreground text-xs">
									{validationFallback}
								</Button>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
