/**
 * The state of a guided breathing session, as pure functions: rounds of breaths, then a hold timed by the
 * person (stopped with a double tap), then a 15 s recovery hold, then the next round, and a summary of the
 * hold times at the end. No clocks or timers in here: the widget passes the time in, so every step is testable.
 */

/** One breath: 1.5 s in and 1.5 s out. */
export const BREATH_MS = 3_000
/** The recovery breath is held for 15 s before the next round. */
export const RECOVERY_MS = 15_000
/** Two taps this close together count as a double tap. */
export const DOUBLE_TAP_MS = 450

export const LIMITS = { rounds: [1, 6], breaths: [10, 60] } as const

export type AmbienceId = string

export interface SessionConfig {
	rounds: number
	breaths: number
	ambience: AmbienceId
	/** 0 to 1 */
	volume: number
}

export const DEFAULTS: SessionConfig = { rounds: 3, breaths: 30, ambience: "silencio", volume: 0.6 }

const clamp = (value: number, [min, max]: readonly [number, number], fallback: number) =>
	Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback

export function normalizeConfig(input: Partial<SessionConfig>): SessionConfig {
	const volume = Number.isFinite(input.volume) ? Math.min(1, Math.max(0, input.volume as number)) : DEFAULTS.volume
	return {
		rounds: clamp(input.rounds ?? DEFAULTS.rounds, LIMITS.rounds, DEFAULTS.rounds),
		breaths: clamp(input.breaths ?? DEFAULTS.breaths, LIMITS.breaths, DEFAULTS.breaths),
		ambience: input.ambience || DEFAULTS.ambience,
		volume,
	}
}

export type Phase = "breathing" | "hold" | "recovery" | "summary"

export interface Session {
	phase: Phase
	config: SessionConfig
	/** 1-based */
	round: number
	/** breaths completed in this round */
	breath: number
	/** instant (ms) the hold started, null before */
	holdStartedAt: number | null
	/** instant (ms) the recovery ends, null outside it */
	recoveryEndsAt: number | null
	/** hold time of each finished round, ms */
	holds: number[]
}

export function createSession(config: SessionConfig): Session {
	return { phase: "breathing", config, round: 1, breath: 0, holdStartedAt: null, recoveryEndsAt: null, holds: [] }
}

export function completeBreath(session: Session): Session {
	if (session.phase !== "breathing") return session
	const breath = session.breath + 1
	return { ...session, breath, phase: breath >= session.config.breaths ? "hold" : "breathing" }
}

export function startHold(session: Session, now: number): Session {
	if (session.phase !== "hold") return session
	return { ...session, holdStartedAt: now }
}

/** Ends the hold, records its length and starts the 15 s recovery. Ignored if the hold never started. */
export function stopHold(session: Session, now: number): Session {
	if (session.phase !== "hold" || session.holdStartedAt === null) return session
	const elapsed = Math.max(0, now - session.holdStartedAt)
	return {
		...session,
		phase: "recovery",
		holds: [...session.holds, elapsed],
		holdStartedAt: null,
		recoveryEndsAt: now + RECOVERY_MS,
	}
}

export function finishRecovery(session: Session): Session {
	if (session.phase !== "recovery") return session
	if (session.round >= session.config.rounds) return { ...session, phase: "summary", recoveryEndsAt: null }
	return { ...session, phase: "breathing", round: session.round + 1, breath: 0, recoveryEndsAt: null }
}

export interface Summary {
	rounds: number[]
	best: { round: number; ms: number } | null
	average: number
}

export function summarize(holds: number[]): Summary {
	if (holds.length === 0) return { rounds: [], best: null, average: 0 }
	let bestIndex = 0
	holds.forEach((ms, i) => {
		if (ms > holds[bestIndex]) bestIndex = i
	})
	return {
		rounds: holds,
		best: { round: bestIndex + 1, ms: holds[bestIndex] },
		average: holds.reduce((sum, ms) => sum + ms, 0) / holds.length,
	}
}

/** `last` is the instant of a pending first tap, or null. A second tap inside the window is a double tap. */
export function registerTap(last: number | null, now: number): { double: boolean; last: number | null } {
	if (last !== null && now - last <= DOUBLE_TAP_MS) return { double: true, last: null }
	return { double: false, last: now }
}

/** "m:ss.t", with the tenths cut, never rounded up. */
export function formatHold(ms: number): string {
	const tenths = Math.floor(Math.max(0, ms) / 100)
	const minutes = Math.floor(tenths / 600)
	const seconds = Math.floor((tenths % 600) / 10)
	return `${minutes}:${String(seconds).padStart(2, "0")}.${tenths % 10}`
}
