"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
	BREATH_MS,
	DEFAULTS,
	LIMITS,
	completeBreath,
	createSession,
	finishRecovery,
	formatHold,
	normalizeConfig,
	registerTap,
	startHold,
	stopHold,
	summarize,
	type Session,
	type SessionConfig,
} from "@/lib/breathing/session"
import { DISCLAIMER } from "@/lib/breathing/disclaimer"
import { AMBIENCES, CUSTOM_TRACKS, createSoundEngine, type SoundEngine } from "@/lib/breathing/sounds"

const range = ([min, max]: readonly [number, number], step = 1) =>
	Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step)

const BUTTON = "min-h-12 rounded-xl px-5 text-base font-bold transition-colors"
const PRIMARY = `${BUTTON} bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50`
const SECONDARY = `${BUTTON} border border-border bg-card text-foreground hover:border-primary/40`

export default function BreathingWidget() {
	const [config, setConfig] = useState<SessionConfig>({ ...DEFAULTS })
	const [session, setSession] = useState<Session | null>(null)
	const [half, setHalf] = useState<"in" | "out">("in")
	const [now, setNow] = useState(() => Date.now())
	const engine = useRef<SoundEngine | null>(null)
	const lastTap = useRef<number | null>(null)

	const ambiences = useMemo(() => [...AMBIENCES, ...CUSTOM_TRACKS.map(({ id, label }) => ({ id, label }))], [])
	const phase = session?.phase
	const round = session?.round
	const breath = session?.breath
	const running = session !== null && session.phase !== "summary"

	const update = (patch: Partial<SessionConfig>) => setConfig((current) => normalizeConfig({ ...current, ...patch }))

	const begin = () => {
		const cleaned = normalizeConfig(config)
		engine.current?.stop()
		engine.current = createSoundEngine()
		engine.current?.start(cleaned.ambience, cleaned.volume)
		lastTap.current = null
		setSession(createSession(cleaned))
	}

	const end = useCallback(() => {
		engine.current?.stop()
		engine.current = null
		setSession(null)
	}, [])

	// the breathing: a breath is 1.5 s in and 1.5 s out, and each completed one moves the counter
	useEffect(() => {
		if (phase !== "breathing") return
		setHalf("in")
		const out = setTimeout(() => setHalf("out"), BREATH_MS / 2)
		const done = setTimeout(() => setSession((s) => (s ? completeBreath(s) : s)), BREATH_MS)
		return () => {
			clearTimeout(out)
			clearTimeout(done)
		}
	}, [phase, round, breath])

	// the hold: the timer starts by itself when the breaths are over
	useEffect(() => {
		if (phase !== "hold") return
		engine.current?.cue("hold")
		setNow(Date.now())
		setSession((s) => (s ? startHold(s, Date.now()) : s))
		const tick = setInterval(() => setNow(Date.now()), 100)
		return () => clearInterval(tick)
	}, [phase, round])

	// the 15 s recovery, then the next round (or the results)
	const recoveryEndsAt = session?.recoveryEndsAt ?? null
	useEffect(() => {
		if (phase !== "recovery" || recoveryEndsAt === null) return
		engine.current?.cue("recovery")
		setNow(Date.now())
		const tick = setInterval(() => setNow(Date.now()), 100)
		const finish = setTimeout(() => {
			engine.current?.cue("end")
			setSession((s) => (s ? finishRecovery(s) : s))
		}, Math.max(0, recoveryEndsAt - Date.now()))
		return () => {
			clearInterval(tick)
			clearTimeout(finish)
		}
	}, [phase, recoveryEndsAt])

	// the results: let the last sound ring, then free the audio
	useEffect(() => {
		if (phase !== "summary") return
		const release = setTimeout(() => {
			engine.current?.stop()
			engine.current = null
		}, 1500)
		return () => clearTimeout(release)
	}, [phase])

	// keep the screen on while the session runs, if the browser can
	useEffect(() => {
		if (!running) return
		let sentinel: { release: () => Promise<void> } | null = null
		let cancelled = false
		const wakeLock = (navigator as unknown as { wakeLock?: { request: (kind: "screen") => Promise<{ release: () => Promise<void> }> } })
			.wakeLock
		wakeLock
			?.request("screen")
			.then((lock) => {
				if (cancelled) void lock.release().catch(() => {})
				else sentinel = lock
			})
			.catch(() => {})
		return () => {
			cancelled = true
			void sentinel?.release().catch(() => {})
		}
	}, [running])

	useEffect(() => () => engine.current?.stop(), [])

	const onPad = () => {
		const tapAt = Date.now()
		const first = lastTap.current
		const tap = registerTap(first, tapAt)
		lastTap.current = tap.last
		if (tap.double) setSession((s) => (s ? stopHold(s, first ?? tapAt) : s))
	}

	if (!session) {
		return (
			<div className="space-y-6 rounded-2xl border border-border bg-card p-5">
				<section aria-labelledby="disclaimer-heading" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
					<h2 id="disclaimer-heading" className="text-lg font-bold text-foreground">
						Importante
					</h2>
					<div className="mt-2 space-y-2 text-sm text-foreground/90">
						{DISCLAIMER.map((paragraph) => (
							<p key={paragraph}>{paragraph}</p>
						))}
					</div>
				</section>

				<div className="grid gap-4 sm:grid-cols-2">
					<label className="block text-sm font-semibold text-foreground">
						Rondas
						<select
							value={config.rounds}
							onChange={(event) => update({ rounds: Number(event.target.value) })}
							className="mt-1 block min-h-12 w-full rounded-xl border border-border bg-background px-3 text-base"
						>
							{range(LIMITS.rounds).map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</label>
					<label className="block text-sm font-semibold text-foreground">
						Respiraciones por ronda
						<select
							value={config.breaths}
							onChange={(event) => update({ breaths: Number(event.target.value) })}
							className="mt-1 block min-h-12 w-full rounded-xl border border-border bg-background px-3 text-base"
						>
							{range(LIMITS.breaths, 5).map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</label>
				</div>

				<fieldset>
					<legend className="text-sm font-semibold text-foreground">Sonido de fondo</legend>
					<div className="mt-2 flex flex-wrap gap-2">
						{ambiences.map((ambience) => (
							<label
								key={ambience.id}
								className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-4 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10"
							>
								<input
									type="radio"
									name="ambience"
									value={ambience.id}
									checked={config.ambience === ambience.id}
									onChange={() => update({ ambience: ambience.id })}
									className="accent-primary"
								/>
								{ambience.label}
							</label>
						))}
					</div>
				</fieldset>

				<label className="block text-sm font-semibold text-foreground">
					Volumen
					<input
						type="range"
						min={0}
						max={1}
						step={0.05}
						value={config.volume}
						onChange={(event) => update({ volume: Number(event.target.value) })}
						className="mt-2 block w-full accent-primary"
					/>
				</label>

				<button type="button" onClick={begin} className={`${PRIMARY} w-full`}>
					Empezar
				</button>
			</div>
		)
	}

	const { config: active } = session
	const summary = summarize(session.holds)
	const holdMs = session.holdStartedAt === null ? 0 : now - session.holdStartedAt
	const recoverySeconds = Math.max(0, Math.ceil(((session.recoveryEndsAt ?? now) - now) / 1000))

	return (
		<div className="space-y-5 rounded-2xl border border-border bg-card p-5 text-center">
			{session.phase !== "summary" && (
				<div className="flex items-center justify-between gap-3">
					<p className="font-mono text-sm text-muted-foreground">
						Ronda {session.round} de {active.rounds}
					</p>
					<button type="button" onClick={end} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold">
						Terminar ahora
					</button>
				</div>
			)}

			{session.phase === "breathing" && (
				<div className="flex justify-center py-4">
					<div
						data-breath-circle
						className="flex aspect-square w-[min(20rem,100%)] items-center justify-center rounded-full border-4 border-primary/70 bg-primary/10 transition-transform ease-in-out motion-reduce:transition-none"
						style={{ transform: `scale(${half === "in" ? 1 : 0.88})`, transitionDuration: `${BREATH_MS / 2}ms` }}
					>
						<p className="font-mono text-5xl font-extrabold tabular-nums text-foreground">
							{session.breath} / {active.breaths}
						</p>
						<p aria-live="polite" className="sr-only">
							{half === "in" ? "Inhalá" : "Soltá"}
						</p>
					</div>
				</div>
			)}

			{session.phase === "hold" && (
				<div className="space-y-4">
					<p className="text-lg font-semibold text-foreground">Soltá el aire y aguantá sin respirar.</p>
					<button
						type="button"
						onClick={onPad}
						className="flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-3xl border-4 border-primary bg-primary/10 p-6"
					>
						<span className="font-mono text-6xl font-extrabold tabular-nums text-foreground">{formatHold(holdMs)}</span>
						<span className="text-base font-bold text-foreground">Tocá dos veces para detener</span>
					</button>
					<p className="text-sm text-muted-foreground">Cuando necesites aire, tocá dos veces seguidas la pantalla.</p>
				</div>
			)}

			{session.phase === "recovery" && (
				<div className="space-y-4 py-4">
					<p className="text-xl font-bold text-foreground">Inhalá profundo y sostené.</p>
					<p className="font-mono text-7xl font-extrabold tabular-nums text-foreground" aria-live="off">
						{recoverySeconds}
					</p>
					<p className="text-sm text-muted-foreground">Después de soltar, empieza la siguiente ronda.</p>
				</div>
			)}

			{session.phase === "summary" && (
				<section aria-labelledby="results-heading" className="space-y-4 text-left">
					<h2 id="results-heading" className="text-2xl font-extrabold text-foreground">
						Resultados
					</h2>
					<ul className="divide-y divide-border rounded-xl border border-border">
						{summary.rounds.map((ms, index) => (
							<li key={index} className="flex items-center justify-between px-4 py-3">
								<span>Ronda {index + 1}</span>
								<span className="font-mono text-lg font-bold tabular-nums">{formatHold(ms)}</span>
							</li>
						))}
					</ul>
					{summary.best && (
						<div className="grid gap-3 sm:grid-cols-2">
							<p className="rounded-xl bg-muted px-4 py-3">
								<span className="block text-xs uppercase tracking-widest text-muted-foreground">Mejor</span>
								<span className="font-mono text-xl font-bold tabular-nums">{formatHold(summary.best.ms)}</span>
							</p>
							<p className="rounded-xl bg-muted px-4 py-3">
								<span className="block text-xs uppercase tracking-widest text-muted-foreground">Promedio</span>
								<span className="font-mono text-xl font-bold tabular-nums">{formatHold(summary.average)}</span>
							</p>
						</div>
					)}
					<p className="text-sm text-muted-foreground">No se guarda nada: si cerrás la página, estos tiempos se pierden.</p>
					<button type="button" onClick={end} className={`${PRIMARY} w-full`}>
						Volver a empezar
					</button>
				</section>
			)}
		</div>
	)
}
