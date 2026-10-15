/**
 * The sound of a breathing session, synthesized in the browser with Web Audio (no audio files, so nothing to
 * license and nothing to download): a soft background ambience plus short signals for the hold, the recovery and
 * the end. Nothing sounds with each breath: while breathing you only hear the ambience. Audio can only start after
 * a tap, so `start` is called from the "Empezar" button.
 *
 * To add your own tracks later, drop the files under `public/audio/breathing/` and list them in CUSTOM_TRACKS.
 * Only paths that start with "/" are accepted, so a track can never point to another site.
 */

export interface Ambience {
	id: string
	label: string
}

export const AMBIENCES: Ambience[] = [
	{ id: "silencio", label: "Silencio" },
	{ id: "grave", label: "Grave" },
	{ id: "aire", label: "Aire" },
	{ id: "cuenco", label: "Cuenco" },
]

export interface CustomTrack {
	id: string
	label: string
	/** local path under /public, e.g. "/audio/breathing/olas.mp3" */
	src: string
}

/** Your own audio files, once you have them. Example: { id: "olas", label: "Olas", src: "/audio/breathing/olas.mp3" } */
export const CUSTOM_TRACKS: CustomTrack[] = []

export type Cue = "hold" | "recovery" | "end"

export interface SoundEngine {
	/** Starts the audio (call it from a tap) with an ambience id and a volume from 0 to 1. */
	start(ambience: string, volume: number): void
	setVolume(volume: number): void
	cue(kind: Cue): void
	stop(): void
}

const CUES: Record<Cue, { from: number; to: number; seconds: number; peak: number }> = {
	hold: { from: 440, to: 440.5, seconds: 0.35, peak: 0.35 },
	recovery: { from: 523, to: 524, seconds: 0.5, peak: 0.3 },
	end: { from: 392, to: 784, seconds: 1.2, peak: 0.35 },
}

const clamp01 = (value: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0)

type AudioCtor = typeof AudioContext

function detectAudioContext(): AudioCtor | null {
	if (typeof window === "undefined") return null
	const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor }
	return w.AudioContext ?? w.webkitAudioContext ?? null
}

interface Stoppable {
	stop(when?: number): void
}

export function createSoundEngine(
	Ctor: AudioCtor | null = detectAudioContext(),
	createAudio: ((src: string) => HTMLAudioElement) | null = typeof Audio === "undefined" ? null : (src) => new Audio(src),
): SoundEngine | null {
	if (!Ctor) return null
	let ctx: AudioContext | null = null
	let master: GainNode | null = null
	let bed: Stoppable[] = []
	let track: HTMLAudioElement | null = null
	let volume = 0

	const stopBed = () => {
		for (const node of bed) {
			try {
				node.stop()
			} catch {
				// already stopped
			}
		}
		bed = []
		if (track) {
			track.pause()
			track = null
		}
	}

	const tone = (freq: number, gainValue: number) => {
		const c = ctx as AudioContext
		const osc = c.createOscillator()
		const g = c.createGain()
		osc.type = "sine"
		osc.frequency.value = freq
		g.gain.value = gainValue
		osc.connect(g)
		g.connect(master as GainNode)
		osc.start()
		bed.push(osc)
	}

	const startBed = (ambience: string) => {
		const c = ctx as AudioContext
		const custom = CUSTOM_TRACKS.find((t) => t.id === ambience)
		if (custom && createAudio) {
			track = createAudio(custom.src)
			track.loop = true
			track.volume = volume
			void track.play().catch(() => {})
			return
		}
		if (ambience === "grave") {
			tone(55, 0.5)
			tone(82.5, 0.3)
		} else if (ambience === "cuenco") {
			tone(220, 0.18)
			tone(330.4, 0.12)
			tone(441, 0.08)
		} else if (ambience === "aire") {
			const length = c.sampleRate * 2
			const buffer = c.createBuffer(1, length, c.sampleRate)
			const data = buffer.getChannelData(0)
			for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
			const source = c.createBufferSource()
			source.buffer = buffer
			source.loop = true
			const filter = c.createBiquadFilter()
			filter.type = "lowpass"
			filter.frequency.value = 500
			const g = c.createGain()
			g.gain.value = 0.18
			source.connect(filter)
			filter.connect(g)
			g.connect(master as GainNode)
			source.start()
			bed.push(source)
		}
	}

	return {
		start(ambience, requestedVolume) {
			if (!ctx || ctx.state === "closed") {
				ctx = new Ctor()
				master = ctx.createGain()
				master.connect(ctx.destination)
			}
			void ctx.resume?.()
			volume = clamp01(requestedVolume)
			;(master as GainNode).gain.value = volume
			stopBed()
			startBed(ambience)
		},
		setVolume(requestedVolume) {
			if (!ctx || !master || ctx.state === "closed") return
			volume = clamp01(requestedVolume)
			master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05)
			if (track) track.volume = volume
		},
		cue(kind) {
			if (!ctx || !master || ctx.state === "closed") return
			const c = CUES[kind]
			if (!c) return
			const t = ctx.currentTime
			const osc = ctx.createOscillator()
			const g = ctx.createGain()
			osc.type = "sine"
			osc.frequency.setValueAtTime(c.from, t)
			osc.frequency.exponentialRampToValueAtTime(c.to, t + c.seconds)
			g.gain.setValueAtTime(0.0001, t)
			g.gain.linearRampToValueAtTime(c.peak, t + Math.min(0.08, c.seconds / 4))
			g.gain.exponentialRampToValueAtTime(0.0001, t + c.seconds)
			osc.connect(g)
			g.connect(master)
			osc.start(t)
			osc.stop(t + c.seconds + 0.05)
		},
		stop() {
			stopBed()
			if (ctx && ctx.state !== "closed") void ctx.close()
			master = null
		},
	}
}
