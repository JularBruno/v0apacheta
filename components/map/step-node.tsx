"use client"

import { cn } from "@/lib/utils"

interface StepNodeProps {
	step: {
		id: string
		level: string
		title: string
		status: "completed" | "unlocked" | "locked"
		type: "chapter" | "major" | "minor"
	}
	position: { x: number; y: number }
	isPlayerHere: boolean
	isSelected: boolean
	onSelect: () => void
}

const SIZE_BY_TYPE = {
	chapter: "h-20 w-20",
	major: "h-16 w-16",
	minor: "h-12 w-12",
}

const COLOR_BY_STATUS = {
	completed: "bg-primary",
	unlocked: "bg-black",
	locked: "bg-muted-foreground",
}

export default function StepNode({ step, position, isPlayerHere, isSelected, onSelect }: StepNodeProps) {
	const size = SIZE_BY_TYPE[step.type]
	const color = COLOR_BY_STATUS[step.status]
	const isLocked = step.status === "locked"

	return (
		<div
			className="absolute flex flex-col items-center gap-1"
			style={{
				left: `${position.x}%`,
				top: `${position.y}%`,
				transform: "translate(-50%, -50%)",
			}}
		>
			<div className="relative flex items-center justify-center">
				{/* Player wave */}
				{isPlayerHere && (
					<>
						<span className={cn("absolute rounded-full bg-accent/30 animate-ping", size)} />
						<span className={cn("absolute rounded-full border-2 border-accent/60 animate-pulse", size)} />
					</>
				)}

				{/* Cairn button */}
				<button
					onClick={onSelect}
					disabled={isLocked}
					aria-label={`${step.title}${isLocked ? " (bloqueado)" : ""}`}
					aria-current={isPlayerHere ? "step" : undefined}
					className={cn(
						"relative flex items-center justify-center transition-transform duration-150",
						size,
						isLocked && "cursor-not-allowed opacity-50",
						!isLocked && "cursor-pointer hover:scale-105 active:scale-95",
						isSelected && "scale-110",
					)}
				>
					{/* Cairn SVG via CSS mask */}
					<span
						className={cn("block w-full h-full", color)}
						style={{
							maskImage: "url(/logo.svg)",
							WebkitMaskImage: "url(/logo.svg)",
							maskSize: "contain",
							WebkitMaskSize: "contain",
							maskPosition: "center",
							WebkitMaskPosition: "center",
							maskRepeat: "no-repeat",
							WebkitMaskRepeat: "no-repeat",
						}}
					/>

					{/* ID badge */}
					<span
						className={cn(
							"absolute -bottom-1 -right-1 rounded-full px-1 py-0 text-[9px] font-bold leading-tight whitespace-nowrap",
							step.status === "completed"
								? "bg-primary text-primary-foreground"
								: "bg-accent/90 text-accent-foreground",
						)}
					>
						{step.level !== "—" ? step.level : step.id}
					</span>
				</button>
			</div>

			{/* Title label */}
			<span className="max-w-[7rem] rounded-md border bg-card px-1.5 py-0.5 text-center text-[10px] font-semibold leading-tight text-card-foreground line-clamp-2">
				{step.title}
			</span>
		</div>
	)
}
