"use client"

import { useId, type ReactNode } from "react"
import { formatClock } from "@/lib/astro/chart"
import styles from "./time-bar.module.css"

export interface TimePreset {
	label: string
	/** minute of the day to jump to; null when there is no such moment (no sunrise in polar night) */
	minutes: number | null
	/** an action (such as "Ahora", which also changes the date) instead of just a minute */
	onSelect?: () => void
}

const STEP_BUTTON =
	"min-h-11 min-w-11 shrink-0 rounded-md border border-[#2a3648] bg-[#0d1420] px-3 font-mono text-xs font-semibold text-[#e8edf4] transition-colors hover:border-[#3d5170] active:bg-[#1c2735]"
const PRESET_BUTTON =
	"min-h-11 shrink-0 whitespace-nowrap rounded-full border border-[#3d4f6b] bg-[#161f2c] px-4 font-mono text-xs font-semibold text-[#e8edf4] transition-colors hover:border-[#ffd666] disabled:cursor-not-allowed disabled:opacity-40"

const wrap = (minutes: number) => ((minutes % 1440) + 1440) % 1440

/**
 * The time-of-day control, built for thumbs: a big readout, a fat slider, Play, 10-minute and 1-hour steppers
 * and presets (sunrise, solar noon, sunset, now). The controls stick to the bottom of the screen on phones while
 * the chart is on screen; whatever the parent passes as children (the text readout) sits below and scrolls normally.
 */
export default function TimeBar({
	minutes,
	onChange,
	playing,
	onTogglePlay,
	presets,
	children,
}: {
	minutes: number
	onChange: (minutes: number) => void
	playing: boolean
	onTogglePlay: () => void
	presets: TimePreset[]
	children?: ReactNode
}) {
	const id = useId()
	return (
		// `contents`: the sticky controls then stick within the chart's column, not within this wrapper
		<div className="contents">
			<div className="sticky bottom-2 z-20 rounded-xl border border-dashed border-[#3d4f6b] bg-[#0d1420]/95 p-3 shadow-lg backdrop-blur lg:static lg:shadow-none">
				<div className="flex items-center gap-3">
					<span className="w-14 shrink-0 text-center font-mono text-xl font-bold tabular-nums text-[#ffd666]">
						{formatClock(minutes / 60)}
					</span>
					<label htmlFor={id} className="sr-only">
						Hora del día
					</label>
					<input
						id={id}
						type="range"
						min={0}
						max={1439}
						step={1}
						value={minutes}
						onChange={(e) => onChange(Number(e.target.value))}
						className={styles.range}
					/>
					<button
						type="button"
						aria-pressed={playing}
						onClick={onTogglePlay}
						className={`${STEP_BUTTON} px-4 text-[#ffd666]`}
					>
						{playing ? "Pausar" : "Reproducir"}
					</button>
				</div>

				<div className="mt-2 flex gap-2 overflow-x-auto pb-1">
					<button type="button" aria-label="Una hora antes" className={STEP_BUTTON} onClick={() => onChange(wrap(minutes - 60))}>
						−1 h
					</button>
					<button type="button" aria-label="10 minutos antes" className={STEP_BUTTON} onClick={() => onChange(wrap(minutes - 10))}>
						−10 min
					</button>
					<button type="button" aria-label="10 minutos después" className={STEP_BUTTON} onClick={() => onChange(wrap(minutes + 10))}>
						+10 min
					</button>
					<button type="button" aria-label="Una hora después" className={STEP_BUTTON} onClick={() => onChange(wrap(minutes + 60))}>
						+1 h
					</button>
					{presets.map((preset) => (
						<button
							key={preset.label}
							type="button"
							className={PRESET_BUTTON}
							disabled={preset.minutes === null && !preset.onSelect}
							onClick={() => {
								if (preset.onSelect) preset.onSelect()
								else if (preset.minutes !== null) onChange(preset.minutes)
							}}
						>
							{preset.label}
						</button>
					))}
				</div>
			</div>
			{children}
		</div>
	)
}
