import { AMBIENCES, CUSTOM_TRACKS, createSoundEngine } from "../sounds"

function makeParam() {
	return {
		value: 0,
		setValueAtTime: jest.fn(),
		linearRampToValueAtTime: jest.fn(),
		exponentialRampToValueAtTime: jest.fn(),
		setTargetAtTime: jest.fn(),
		cancelScheduledValues: jest.fn(),
	}
}

class FakeContext {
	static instances: FakeContext[] = []
	currentTime = 0
	state = "running"
	sampleRate = 44100
	destination = {}
	oscillators: { type: string; frequency: ReturnType<typeof makeParam>; start: jest.Mock; stop: jest.Mock; connect: jest.Mock }[] = []
	gains: { gain: ReturnType<typeof makeParam>; connect: jest.Mock; disconnect: jest.Mock }[] = []
	sources: { start: jest.Mock; stop: jest.Mock; connect: jest.Mock; loop: boolean; buffer: unknown }[] = []
	close = jest.fn(async () => {
		this.state = "closed"
	})
	resume = jest.fn(async () => {})
	constructor() {
		FakeContext.instances.push(this)
	}
	createOscillator() {
		const osc = { type: "sine", frequency: makeParam(), start: jest.fn(), stop: jest.fn(), connect: jest.fn() }
		this.oscillators.push(osc)
		return osc
	}
	createGain() {
		const g = { gain: makeParam(), connect: jest.fn(), disconnect: jest.fn() }
		this.gains.push(g)
		return g
	}
	createBiquadFilter() {
		return { type: "lowpass", frequency: makeParam(), Q: makeParam(), connect: jest.fn() }
	}
	createBuffer(_c: number, length: number) {
		return { getChannelData: () => new Float32Array(length) }
	}
	createBufferSource() {
		const s = { start: jest.fn(), stop: jest.fn(), connect: jest.fn(), loop: false, buffer: null as unknown }
		this.sources.push(s)
		return s
	}
}

const ctor = FakeContext as unknown as typeof AudioContext
beforeEach(() => {
	FakeContext.instances = []
})

describe("createSoundEngine", () => {
	test("returns null when the browser has no Web Audio, never throws", () => {
		expect(createSoundEngine(null)).toBeNull()
	})

	test("offers silence plus three synthesized ambiences", () => {
		expect(AMBIENCES.map((a) => a.id)).toEqual(["silencio", "grave", "aire", "cuenco"])
	})

	test("silence makes no background sound; an ambience starts its voices", () => {
		const engine = createSoundEngine(ctor)!
		engine.start("silencio", 0.5)
		const ctx = FakeContext.instances[0]
		expect(ctx.oscillators).toHaveLength(0)
		expect(ctx.sources).toHaveLength(0)
		engine.start("grave", 0.5)
		expect(ctx.oscillators.length + ctx.sources.length).toBeGreaterThan(0)
	})

	test("only the three signals are cues (hold, recovery, end): no tone goes back and forth with each breath", () => {
		const engine = createSoundEngine(ctor)!
		engine.start("silencio", 0.5)
		const ctx = FakeContext.instances[0]
		for (const kind of ["hold", "recovery", "end"] as const) {
			const before = ctx.oscillators.length
			engine.cue(kind)
			expect(ctx.oscillators.length).toBe(before + 1)
			expect(ctx.oscillators[before].start).toHaveBeenCalled()
			expect(ctx.oscillators[before].stop).toHaveBeenCalled()
		}
		for (const kind of ["inhale", "exhale"]) {
			const before = ctx.oscillators.length
			engine.cue(kind as never)
			expect(ctx.oscillators.length).toBe(before)
		}
	})

	test("volume is clamped between 0 and 1", () => {
		const engine = createSoundEngine(ctor)!
		engine.start("silencio", 5)
		const master = FakeContext.instances[0].gains[0]
		expect(master.gain.value).toBeLessThanOrEqual(1)
		engine.setVolume(-3)
		expect(master.gain.setTargetAtTime.mock.calls.at(-1)?.[0]).toBe(0)
	})

	test("stop closes the audio context and later cues do nothing", () => {
		const engine = createSoundEngine(ctor)!
		engine.start("grave", 0.5)
		const ctx = FakeContext.instances[0]
		engine.stop()
		expect(ctx.close).toHaveBeenCalled()
		const before = ctx.oscillators.length
		engine.cue("end")
		expect(ctx.oscillators.length).toBe(before)
	})
})

describe("CUSTOM_TRACKS (where you add your own audio files later)", () => {
	test("every entry has an id, a label and a local path under /, never an external or odd URL", () => {
		for (const track of CUSTOM_TRACKS) {
			expect(track.id).toMatch(/^[a-z0-9-]+$/)
			expect(track.label.length).toBeGreaterThan(0)
			expect(track.src.startsWith("/")).toBe(true)
			expect(track.src.startsWith("//")).toBe(false)
			expect(track.src).not.toMatch(/\.\.|:/)
		}
	})
})
