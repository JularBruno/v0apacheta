import {
	BREATH_MS,
	DEFAULTS,
	DOUBLE_TAP_MS,
	RECOVERY_MS,
	completeBreath,
	createSession,
	finishRecovery,
	formatHold,
	normalizeConfig,
	registerTap,
	startHold,
	stopHold,
	summarize,
} from "../session"

describe("normalizeConfig", () => {
	test("defaults are 3 rounds of 30 breaths", () => {
		expect(DEFAULTS).toMatchObject({ rounds: 3, breaths: 30 })
		expect(normalizeConfig({})).toMatchObject({ rounds: 3, breaths: 30 })
	})

	test("clamps to sensible limits and rounds to whole numbers, never NaN", () => {
		expect(normalizeConfig({ rounds: 0 }).rounds).toBe(1)
		expect(normalizeConfig({ rounds: 99 }).rounds).toBe(6)
		expect(normalizeConfig({ breaths: 2 }).breaths).toBe(10)
		expect(normalizeConfig({ breaths: 500 }).breaths).toBe(60)
		expect(normalizeConfig({ rounds: 2.6 }).rounds).toBe(3)
		expect(normalizeConfig({ rounds: Number.NaN, breaths: Number.NaN })).toMatchObject({ rounds: 3, breaths: 30 })
	})

	test("volume stays between 0 and 1", () => {
		expect(normalizeConfig({ volume: 5 }).volume).toBe(1)
		expect(normalizeConfig({ volume: -1 }).volume).toBe(0)
	})
})

describe("a session: breathing -> hold -> recovery, round after round", () => {
	const config = normalizeConfig({ rounds: 2, breaths: 10 })

	test("starts breathing, round 1, no breaths done", () => {
		const s = createSession(config)
		expect(s).toMatchObject({ phase: "breathing", round: 1, breath: 0, holds: [] })
	})

	test("counts breaths one by one and moves to the hold after the last one", () => {
		let s = createSession(config)
		for (let i = 1; i < 10; i++) {
			s = completeBreath(s)
			expect(s).toMatchObject({ phase: "breathing", breath: i })
		}
		s = completeBreath(s)
		expect(s.phase).toBe("hold")
		expect(s.breath).toBe(10)
	})

	test("completing a breath outside the breathing phase changes nothing", () => {
		const hold = { ...createSession(config), phase: "hold" as const }
		expect(completeBreath(hold)).toBe(hold)
	})

	test("the hold records how long it lasted and starts the 15 s recovery", () => {
		let s = createSession(config)
		for (let i = 0; i < 10; i++) s = completeBreath(s)
		s = startHold(s, 1_000)
		expect(s.holdStartedAt).toBe(1_000)
		s = stopHold(s, 1_000 + 62_400)
		expect(s.phase).toBe("recovery")
		expect(s.holds).toEqual([62_400])
		expect(s.recoveryEndsAt).toBe(1_000 + 62_400 + RECOVERY_MS)
		expect(RECOVERY_MS).toBe(15_000)
	})

	test("stopHold before the hold has started is ignored", () => {
		const s = createSession(config)
		expect(stopHold(s, 5_000)).toBe(s)
	})

	test("after the recovery it goes to the next round, and after the last round to the summary", () => {
		const finishHold = (state: ReturnType<typeof createSession>, at: number) => {
			let s = state
			for (let i = 0; i < 10; i++) s = completeBreath(s)
			s = startHold(s, at)
			return stopHold(s, at + 30_000)
		}
		let s = finishHold(createSession(config), 0)
		s = finishRecovery(s)
		expect(s).toMatchObject({ phase: "breathing", round: 2, breath: 0 })
		s = finishHold(s, 100_000)
		s = finishRecovery(s)
		expect(s.phase).toBe("summary")
		expect(s.holds).toEqual([30_000, 30_000])
	})
})

describe("summarize", () => {
	test("gives every round's time, the best, and the average", () => {
		const r = summarize([60_000, 90_000, 75_000])
		expect(r.best).toEqual({ round: 2, ms: 90_000 })
		expect(r.average).toBe(75_000)
		expect(r.rounds).toEqual([60_000, 90_000, 75_000])
	})

	test("no holds gives null best and zero average, never NaN", () => {
		expect(summarize([])).toEqual({ rounds: [], best: null, average: 0 })
	})
})

describe("registerTap (a quick double tap stops the hold)", () => {
	test("the second tap inside the window is a double tap; a slow second tap is just a new first tap", () => {
		const first = registerTap(null, 1_000)
		expect(first).toEqual({ double: false, last: 1_000 })
		expect(registerTap(first.last, 1_000 + DOUBLE_TAP_MS - 1)).toEqual({ double: true, last: null })
		expect(registerTap(first.last, 1_000 + DOUBLE_TAP_MS + 50)).toEqual({ double: false, last: 1_000 + DOUBLE_TAP_MS + 50 })
	})

	test("a double tap resets, so a third tap starts over", () => {
		const a = registerTap(null, 0)
		const b = registerTap(a.last, 100)
		expect(b.double).toBe(true)
		expect(registerTap(b.last, 150).double).toBe(false)
	})
})

describe("formatHold", () => {
	test("m:ss with tenths", () => {
		expect(formatHold(0)).toBe("0:00.0")
		expect(formatHold(62_400)).toBe("1:02.4")
		expect(formatHold(9_950)).toBe("0:09.9")
		expect(formatHold(600_000)).toBe("10:00.0")
	})
})

test("a breath is 3 seconds: 1.5 in, 1.5 out, so 30 breaths take a minute and a half", () => {
	expect(BREATH_MS).toBe(3_000)
})
