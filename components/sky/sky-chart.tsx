"use client"

import { useEffect, useId, useMemo, useState, type ReactNode } from "react"
import {
	ARGENTINA_UTC_OFFSET,
	CORDOBA,
	REFERENCE_CURVES,
	compass,
	curvePoints,
	curveSubtitle,
	formatClock,
	formatDuration,
	hourMarkers,
	parseCoordinate,
	parseUtcOffset,
	project,
	referenceDeclination,
	sunAtClock,
	sunDay,
	type Location,
} from "@/lib/astro/chart"
import { moonAltAz, moonElongation, moonIllumination, moonRaDec, nextPhase, phaseName } from "@/lib/astro/moon"
import { moonCycleReferences, moonPassNear, moonPassOnDay, type MoonPass } from "@/lib/astro/moon-chart"
import { SUNRISE_ALTITUDE, dayOfYear } from "@/lib/astro/sun"

// ---- formatting --------------------------------------------------------------------------------

const HOUR = 3_600_000
const MIN = 60_000
const DAY = 24 * HOUR

const oneDecimal = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const upToTwoDecimals = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 })
// ASCII minus sign (some locales use U+2212), and no "-0,0"
const fmt1 = (n: number) => oneDecimal.format(Math.abs(n) < 0.05 ? 0 : n).replace("−", "-")
const pad2 = (n: number) => String(n).padStart(2, "0")

function formatLatLon({ lat, lon }: Location): string {
	return `${upToTwoDecimals.format(Math.abs(lat))}° ${lat < 0 ? "S" : "N"}, ${upToTwoDecimals.format(Math.abs(lon))}° ${lon < 0 ? "O" : "E"}`
}

function parseDate(text: string): { y: number; m: number; d: number } | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
	if (!match) return null
	const [y, m, d] = match.slice(1).map(Number)
	const check = new Date(Date.UTC(y, m - 1, d))
	return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d ? { y, m, d } : null
}

const longDate = (y: number, m: number, d: number) =>
	new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("es-AR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" })

/** Date ("YYYY-MM-DD") and minute of the day of an instant, on the clock of a UTC offset. */
function localParts(ms: number, utcOffset: number): { date: string; minutes: number } {
	const shifted = new Date(ms + utcOffset * HOUR)
	return {
		date: `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}`,
		minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
	}
}

/** Today's date and minute of the day on the clock of a UTC offset, whatever the visitor's own timezone. */
const nowAt = (utcOffset: number) => localParts(Date.now(), utcOffset)

const pathOf = (points: { alt: number; az: number }[]) =>
	points
		.map((p, i) => {
			const { x, y } = project(p.alt, p.az)
			return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
		})
		.join(" ")

const FIELD =
	"rounded-md border border-[#2a3648] bg-[#0d1420] px-2 py-1 font-mono text-xs text-[#e8edf4] aria-[invalid=true]:border-[#e0343c]"
const BUTTON =
	"rounded-md border border-[#2a3648] bg-[#0d1420] px-2.5 py-1 font-mono text-[11px] text-[#8b9bb0] transition-colors hover:border-[#3d5170] hover:text-[#e8edf4]"

type Body = "sol" | "luna"

// ---- the chart --------------------------------------------------------------------------------

const RINGS = [0, 10, 20, 30, 40, 50, 60, 70, 80]
const SPOKES = Array.from({ length: 24 }, (_, i) => i * 15)
const CARDINALS: Record<number, string> = { 0: "N", 90: "E", 180: "S", 270: "O" }

function Grid() {
	return (
		<g>
			{RINGS.map((alt) => {
				const r = (430 * (90 - alt)) / 90
				return (
					<g key={alt}>
						<circle cx={500} cy={500} r={r} fill="none" stroke="#26334a" strokeWidth={alt === 0 ? 1.6 : 1} />
						<text x={504} y={500 - r - 4} fill="#5c6f8a" fontSize={11} fontFamily="monospace">
							{alt}°
						</text>
					</g>
				)
			})}
			<circle cx={500} cy={500} r={2.5} fill="#5c6f8a" />
			{SPOKES.map((az) => {
				const end = project(0, az)
				const label = project(-3, az)
				const major = az % 90 === 0
				return (
					<g key={az}>
						<line x1={500} y1={500} x2={end.x} y2={end.y} stroke="#202b3f" strokeWidth={major ? 1.4 : 0.7} />
						<text
							x={label.x}
							y={label.y}
							fill={major ? "#e8edf4" : "#5c6f8a"}
							fontSize={major ? 15 : 10.5}
							fontFamily="monospace"
							fontWeight={major ? 800 : 400}
							textAnchor="middle"
							dominantBaseline="middle"
						>
							{major ? CARDINALS[az] : `${az}°`}
						</text>
					</g>
				)
			})}
		</g>
	)
}

function HourDots({ points, color, today }: { points: { solarHour: number; alt: number; az: number }[]; color: string; today?: boolean }) {
	return (
		<g>
			{points.map((m) => {
				const { x, y } = project(m.alt, m.az)
				return (
					<g key={m.solarHour}>
						<circle
							cx={x}
							cy={y}
							r={today ? 3.6 : 2.8}
							fill={today ? "#0f1620" : color}
							stroke={today ? color : "none"}
							strokeWidth={today ? 2 : 0}
						/>
						<text x={x} y={y - 9} fill={color} fontSize={11} fontFamily="monospace" textAnchor="middle" fontWeight={700}>
							{m.solarHour}
						</text>
					</g>
				)
			})}
		</g>
	)
}

/** A body marker (Sun or Moon): a glow, a disc and a faint line from the zenith along its direction. */
function BodyMarker({ alt, az, color }: { alt: number; az: number; color: string }) {
	const spot = project(alt, az)
	const edge = project(0, az)
	return (
		<g>
			<line x1={500} y1={500} x2={edge.x} y2={edge.y} stroke={color} strokeWidth={1.2} strokeDasharray="4,6" opacity={0.5} />
			<circle cx={spot.x} cy={spot.y} r={26} fill={color} opacity={0.22} />
			<circle cx={spot.x} cy={spot.y} r={11} fill={color} stroke="#fff" strokeWidth={2} />
		</g>
	)
}

// ---- the component -----------------------------------------------------------------------------

export default function SkyChart({ initialDate, syncToNow = true }: { initialDate: string; syncToNow?: boolean }) {
	const ids = { date: useId(), lat: useId(), lon: useId(), offset: useId(), time: useId() }

	const [body, setBody] = useState<Body>("sol")
	const [date, setDate] = useState(parseDate(initialDate) ? initialDate : "2026-12-21")
	const [minutes, setMinutes] = useState(13 * 60 + 15)
	const [playing, setPlaying] = useState(false)

	const [latText, setLatText] = useState(String(CORDOBA.lat))
	const [lonText, setLonText] = useState(String(CORDOBA.lon))
	const [offsetText, setOffsetText] = useState(String(ARGENTINA_UTC_OFFSET))
	const [lat, setLat] = useState(CORDOBA.lat)
	const [lon, setLon] = useState(CORDOBA.lon)
	const [offset, setOffset] = useState(ARGENTINA_UTC_OFFSET)

	const latInvalid = parseCoordinate(latText, 90) === null
	const lonInvalid = parseCoordinate(lonText, 180) === null
	const offsetInvalid = parseUtcOffset(offsetText) === null

	// The page is static, so "today" is only known in the browser: after mounting, jump to now at the clock of the chosen zone.
	useEffect(() => {
		if (!syncToNow) return
		const now = nowAt(ARGENTINA_UTC_OFFSET)
		setDate(now.date)
		setMinutes(now.minutes)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (!playing) return
		const id = setInterval(() => setMinutes((m) => (m + 5) % 1440), 50)
		return () => clearInterval(id)
	}, [playing])

	const when = parseDate(date) as { y: number; m: number; d: number }
	const doy = dayOfYear(when.y, when.m, when.d)
	const loc = useMemo<Location>(() => ({ lat, lon }), [lat, lon])
	const dayStart = Date.UTC(when.y, when.m - 1, when.d) - offset * HOUR
	const instant = dayStart + minutes * MIN

	// ---- Sun
	const today = useMemo(() => sunDay(loc, doy, offset), [loc, doy, offset])
	const todayPoints = useMemo(() => curvePoints(loc, today.dec), [loc, today.dec])
	const todayMarkers = useMemo(() => hourMarkers(loc, today.dec), [loc, today.dec])
	const rows = useMemo(
		() =>
			REFERENCE_CURVES.map((curve) => {
				const dec = referenceDeclination(curve, when.y)
				return {
					curve,
					day: sunDay(loc, doy, offset, dec),
					points: curvePoints(loc, dec),
					markers: curve.emphasize ? hourMarkers(loc, dec) : [],
				}
			}),
		[loc, when.y, doy, offset],
	)
	const sun = sunAtClock(loc, doy, offset, minutes / 60)
	const sunUp = sun.alt >= SUNRISE_ALTITUDE

	// ---- Moon (only computed in Moon mode)
	const moon = useMemo(() => {
		if (body !== "luna") return null
		const noon = dayStart + 12 * HOUR
		return {
			refs: moonCycleReferences(noon).map((ref) => ({ ref, pass: moonPassNear(loc, ref.t) })),
			day: moonPassOnDay(loc, offset, when.y, when.m, when.d),
			elongation: moonElongation(noon),
			illumination: moonIllumination(noon),
			dec: moonRaDec(noon).dec,
		}
	}, [body, loc, offset, dayStart, when.y, when.m, when.d])
	const moonNow = body === "luna" ? moonAltAz(loc, instant) : null
	const moonUp = moonNow !== null && moonNow.alt >= SUNRISE_ALTITUDE

	const isCordoba = lat === CORDOBA.lat && lon === CORDOBA.lon
	const place = isCordoba ? CORDOBA.name : formatLatLon(loc)
	const zone = `UTC${offset >= 0 ? "+" : ""}${offset}`

	const clockOf = (ms: number) => formatClock((((ms / HOUR + offset) % 24) + 24) % 24)
	const dayMark = (ms: number) => {
		const diff = Math.floor((ms + offset * HOUR) / DAY) - Math.floor((dayStart + offset * HOUR) / DAY)
		return diff < 0 ? " (día anterior)" : diff > 0 ? " (día siguiente)" : ""
	}
	const dayMonth = (ms: number) => {
		const d = new Date(ms + offset * HOUR)
		return `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth() + 1)}`
	}

	const errors = [
		latInvalid && "Latitud: usá un número entre -90 y 90 (el sur lleva signo menos).",
		lonInvalid && "Longitud: usá un número entre -180 y 180 (el oeste lleva signo menos).",
		offsetInvalid && "Huso horario: usá un número entre -12 y 14 (Argentina: -3).",
	].filter(Boolean) as string[]

	const pickDate = (month: number, day: number) => setDate(`${when.y}-${pad2(month)}-${pad2(day)}`)
	const goTo = (ms: number) => {
		const parts = localParts(ms, offset)
		setDate(parts.date)
		setMinutes(parts.minutes)
	}

	const resetToCordoba = () => {
		setLatText(String(CORDOBA.lat))
		setLonText(String(CORDOBA.lon))
		setOffsetText(String(ARGENTINA_UTC_OFFSET))
		setLat(CORDOBA.lat)
		setLon(CORDOBA.lon)
		setOffset(ARGENTINA_UTC_OFFSET)
	}

	const direction = (az: number | null) => (az === null ? "—" : `${Math.round(az)}° ${compass(az)}`)

	// ---- text for the status box
	let dayText: ReactNode
	if (body === "sol") {
		if (today.kind === "polarDay") dayText = "Sol de medianoche: el Sol no se pone en todo el día."
		else if (today.kind === "polarNight") dayText = "Noche polar: el Sol no sale en todo el día."
		else
			dayText = `El Sol sale a las ${formatClock(today.sunrise as number)} hacia el ${compass(today.riseAz as number)} (${Math.round(today.riseAz as number)}°) y se pone a las ${formatClock(today.sunset as number)} hacia el ${compass(today.setAz as number)} (${Math.round(today.setAz as number)}°). El día dura ${formatDuration(today.dayLength)}.`
	}

	const moonRiseSet = (pass: MoonPass | null, outsideDay: boolean): string => {
		if (pass === null) return "Hoy la Luna no sale."
		if (pass.circumpolar) return "La Luna queda sobre el horizonte durante todo este tramo."
		const text = `La Luna sale a las ${clockOf(pass.rise as number)}${dayMark(pass.rise as number)} hacia el ${compass(pass.riseAz as number)} (${Math.round(pass.riseAz as number)}°), pasa por su punto más alto a las ${clockOf(pass.transit)}${dayMark(pass.transit)} (${fmt1(pass.maxAlt)}° de altura) y se pone a las ${clockOf(pass.set as number)}${dayMark(pass.set as number)} hacia el ${compass(pass.setAz as number)} (${Math.round(pass.setAz as number)}°).`
		return outsideDay ? `${text} Hoy la Luna no pasa por su punto más alto: este es el arco siguiente, porque su día dura 24 h 50 min.` : text
	}

	const passCells = (pass: MoonPass | null) => ({
		rise: pass === null ? "No sale" : pass.circumpolar ? "Todo el día arriba" : `${clockOf(pass.rise as number)} · ${direction(pass.riseAz)}`,
		set: pass === null ? "—" : pass.circumpolar ? "—" : `${clockOf(pass.set as number)} · ${direction(pass.setAz)}`,
		alt: pass === null ? "—" : `${fmt1(pass.maxAlt)}°`,
	})

	const cycleText = moon
		? [...moon.refs]
				.filter(({ ref }) => ref.id === "extremo-sur" || ref.id === "nodo" || ref.id === "extremo-norte")
				.sort((a, b) => a.ref.t - b.ref.t)
				.map(({ ref }) => `${ref.label.toLowerCase()} el ${dayMonth(ref.t)} (${fmt1(ref.dec)}°)`)
				.join(" → ")
		: ""

	const svgLabel =
		body === "sol"
			? "Mapa del cielo: recorrido del Sol en 7 fechas de referencia y en la fecha elegida, visto mirando hacia arriba, con el norte arriba y el este a la izquierda"
			: "Mapa del cielo: recorrido de la Luna en 5 momentos del ciclo de declinación del mes y en la fecha elegida, visto mirando hacia arriba, con el norte arriba y el este a la izquierda"

	return (
		<section
			aria-label="Mapa del cielo interactivo"
			className="not-prose rounded-2xl border border-[#2a3648] bg-gradient-to-b from-[#161f2c] to-[#0f1620] p-4 text-[#e8edf4] sm:p-5"
		>
			<div role="radiogroup" aria-label="Astro" className="mb-4 inline-flex gap-1.5">
				{(["sol", "luna"] as const).map((b) => (
					<button
						key={b}
						type="button"
						role="radio"
						aria-checked={body === b}
						onClick={() => setBody(b)}
						className={`rounded-md border px-4 py-1.5 font-mono text-xs font-bold transition-colors ${
							body === b
								? "border-[#ffd666] bg-[#ffd666]/15 text-[#ffd666]"
								: "border-[#2a3648] bg-[#0d1420] text-[#8b9bb0] hover:text-[#e8edf4]"
						}`}
					>
						{b === "sol" ? "Sol" : "Luna"}
					</button>
				))}
			</div>

			<div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
				<div>
					<svg viewBox="0 0 1000 1000" role="img" aria-label={svgLabel} className="h-auto w-full">
						<Grid />
						{body === "sol" &&
							rows.map(({ curve, points, markers }) =>
								points.length === 0 ? null : (
									<g key={curve.id}>
										<path
											data-curve={curve.id}
											d={pathOf(points)}
											fill="none"
											stroke={curve.color}
											strokeWidth={curve.emphasize ? 3.2 : 2.2}
											opacity={0.95}
										/>
										{curve.emphasize && <HourDots points={markers} color={curve.color} />}
									</g>
								),
							)}
						{body === "sol" && todayPoints.length > 0 && (
							<g>
								<path data-curve="hoy" d={pathOf(todayPoints)} fill="none" stroke="#f5f5f5" strokeWidth={3.6} strokeDasharray="9,6" />
								<HourDots points={todayMarkers} color="#f5f5f5" today />
							</g>
						)}
						{body === "sol" && sunUp && <BodyMarker alt={sun.alt} az={sun.az} color="#ffd666" />}

						{moon &&
							moon.refs.map(({ ref, pass }) =>
								pass === null ? null : (
									<path
										key={ref.id}
										data-curve={ref.id}
										d={pathOf(pass.points)}
										fill="none"
										stroke={ref.color}
										strokeWidth={ref.id === "nodo" ? 3.2 : 2.2}
										opacity={0.95}
									/>
								),
							)}
						{moon && moon.day.pass && (
							<g>
								<path
									data-curve="hoy"
									d={pathOf(moon.day.pass.points)}
									fill="none"
									stroke="#f5f5f5"
									strokeWidth={3.6}
									strokeDasharray="9,6"
								/>
								<circle
									cx={project(moon.day.pass.maxAlt, moon.day.pass.maxAz).x}
									cy={project(moon.day.pass.maxAlt, moon.day.pass.maxAz).y}
									r={4.2}
									fill="#0f1620"
									stroke="#f5f5f5"
									strokeWidth={2}
								/>
								<text
									x={project(moon.day.pass.maxAlt, moon.day.pass.maxAz).x}
									y={project(moon.day.pass.maxAlt, moon.day.pass.maxAz).y - 10}
									fill="#f5f5f5"
									fontSize={11}
									fontFamily="monospace"
									textAnchor="middle"
									fontWeight={700}
								>
									{clockOf(moon.day.pass.transit)}
								</text>
							</g>
						)}
						{moonUp && moonNow && <BodyMarker alt={moonNow.alt} az={moonNow.az} color="#e8edf4" />}
					</svg>
					<p className="mt-2 font-mono text-[11px] leading-relaxed text-[#8b9bb0]">
						Centro = justo arriba tuyo (cénit), borde = horizonte. Norte arriba, este a la izquierda, sur abajo, oeste a la
						derecha: así se ve el cielo cuando mirás hacia arriba.{" "}
						{body === "sol"
							? "Los números sobre las curvas son horas solares (12 = mediodía solar)."
							: "Cada curva es un arco completo de la Luna, de salida a puesta. El número blanco es la hora a la que pasa por su punto más alto."}
					</p>
				</div>

				<div className="space-y-4">
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
						<div className="space-y-2">
							<label htmlFor={ids.date} className="block font-mono text-xs text-[#8b9bb0]">
								Fecha
							</label>
							<input
								id={ids.date}
								type="date"
								value={date}
								onChange={(e) => parseDate(e.target.value) && setDate(e.target.value)}
								className={FIELD}
							/>
							<div className="flex flex-wrap gap-1.5">
								<button
									type="button"
									className={BUTTON}
									onClick={() => {
										const now = nowAt(offset)
										setDate(now.date)
										setMinutes(now.minutes)
									}}
								>
									Hoy
								</button>
								{body === "sol" ? (
									<>
										<button type="button" className={BUTTON} onClick={() => pickDate(12, 21)}>
											Solsticio de diciembre
										</button>
										<button type="button" className={BUTTON} onClick={() => pickDate(3, 20)}>
											Equinoccio de marzo
										</button>
										<button type="button" className={BUTTON} onClick={() => pickDate(6, 21)}>
											Solsticio de junio
										</button>
										<button type="button" className={BUTTON} onClick={() => pickDate(9, 23)}>
											Equinoccio de septiembre
										</button>
									</>
								) : (
									<>
										<button type="button" className={BUTTON} onClick={() => goTo(nextPhase(instant, 0))}>
											Próxima luna nueva
										</button>
										<button type="button" className={BUTTON} onClick={() => goTo(nextPhase(instant, 180))}>
											Próxima luna llena
										</button>
									</>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<p className="font-mono text-xs text-[#8b9bb0]">Lugar (por defecto, Córdoba)</p>
							<div className="grid grid-cols-3 gap-2">
								<div>
									<label htmlFor={ids.lat} className="block font-mono text-[11px] text-[#8b9bb0]">
										Latitud
									</label>
									<input
										id={ids.lat}
										type="text"
										inputMode="decimal"
										value={latText}
										aria-invalid={latInvalid || undefined}
										onChange={(e) => {
											setLatText(e.target.value)
											const n = parseCoordinate(e.target.value, 90)
											if (n !== null) setLat(n)
										}}
										className={`${FIELD} w-full`}
									/>
								</div>
								<div>
									<label htmlFor={ids.lon} className="block font-mono text-[11px] text-[#8b9bb0]">
										Longitud
									</label>
									<input
										id={ids.lon}
										type="text"
										inputMode="decimal"
										value={lonText}
										aria-invalid={lonInvalid || undefined}
										onChange={(e) => {
											setLonText(e.target.value)
											const n = parseCoordinate(e.target.value, 180)
											if (n !== null) setLon(n)
										}}
										className={`${FIELD} w-full`}
									/>
								</div>
								<div>
									<label htmlFor={ids.offset} className="block font-mono text-[11px] text-[#8b9bb0]">
										Huso horario (UTC)
									</label>
									<input
										id={ids.offset}
										type="text"
										inputMode="decimal"
										value={offsetText}
										aria-invalid={offsetInvalid || undefined}
										onChange={(e) => {
											setOffsetText(e.target.value)
											const n = parseUtcOffset(e.target.value)
											if (n !== null) setOffset(n)
										}}
										className={`${FIELD} w-full`}
									/>
								</div>
							</div>
							<p className="font-mono text-[11px] text-[#8b9bb0]">Sur y oeste llevan signo menos. Podés usar punto o coma.</p>
							<button type="button" className={BUTTON} onClick={resetToCordoba}>
								Volver a Córdoba
							</button>
							{errors.length > 0 && (
								<div
									role="alert"
									className="space-y-1 rounded-md border border-[#e0343c]/60 bg-[#e0343c]/10 p-2 font-mono text-[11px] text-[#ffb4b8]"
								>
									{errors.map((message) => (
										<p key={message}>{message}</p>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="space-y-2 rounded-xl border border-dashed border-[#3d4f6b] bg-[#0d1420] p-3">
						<label htmlFor={ids.time} className="block font-mono text-xs text-[#8b9bb0]">
							Hora del día
						</label>
						<div className="flex items-center gap-3">
							<input
								id={ids.time}
								type="range"
								min={0}
								max={1439}
								step={1}
								value={minutes}
								onChange={(e) => setMinutes(Number(e.target.value))}
								className="w-full accent-[#ffd666]"
							/>
							<button type="button" className={BUTTON} aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>
								{playing ? "Pausar" : "Reproducir"}
							</button>
						</div>
						<p data-testid="sun-readout" className="font-mono text-xs leading-relaxed">
							{body === "sol"
								? sunUp
									? `A las ${formatClock(minutes / 60)} el Sol está a ${fmt1(sun.alt)}° de altura, hacia el ${compass(sun.az)} (${Math.round(sun.az)}°).`
									: `A las ${formatClock(minutes / 60)} el Sol está debajo del horizonte (${fmt1(sun.alt)}° de altura).`
								: moonUp && moonNow
									? `A las ${formatClock(minutes / 60)} la Luna está a ${fmt1(moonNow.alt)}° de altura, hacia el ${compass(moonNow.az)} (${Math.round(moonNow.az)}°).`
									: `A las ${formatClock(minutes / 60)} La Luna está debajo del horizonte (${fmt1(moonNow ? moonNow.alt : 0)}° de altura).`}
						</p>
					</div>

					<div role="status" className="rounded-xl border border-dashed border-[#3d4f6b] bg-[#0d1420] p-3 font-mono text-xs leading-relaxed">
						<p className="font-sans text-sm font-bold">
							{place} · {longDate(when.y, when.m, when.d)}
						</p>
						{body === "sol" ? (
							<>
								<p>
									Declinación solar <span className="font-bold text-[#f0b429]">{fmt1(today.dec)}°</span> · altura máxima{" "}
									<span className="font-bold text-[#f0b429]">{fmt1(today.maxAlt)}°</span> al mediodía solar, que cae a las{" "}
									<span className="font-bold text-[#f0b429]">{formatClock(today.noon)}</span> de la hora de reloj ({zone}).
								</p>
								<p>{dayText}</p>
							</>
						) : (
							moon && (
								<>
									<p>
										Fase: <span className="font-bold text-[#f0b429]">{phaseName(moon.elongation)}</span> (
										{Math.round(moon.illumination * 100)}% iluminada) · declinación{" "}
										<span className="font-bold text-[#f0b429]">{fmt1(moon.dec)}°</span>.
									</p>
									<p>{moonRiseSet(moon.day.pass, moon.day.outsideDay)}</p>
									<p>Ciclo del mes: {cycleText}.</p>
								</>
							)
						)}
					</div>
				</div>
			</div>

			<div className="mt-5 overflow-x-auto">
				<table className="w-full border-collapse font-mono text-[11.5px]">
					<caption className="pb-2 text-left text-[11px] text-[#8b9bb0]">
						{body === "sol"
							? "Recorrido del Sol en 7 fechas de referencia y en la fecha elegida"
							: "Recorrido de la Luna en 5 momentos del ciclo de declinación del mes y en la fecha elegida"}
					</caption>
					<thead>
						<tr className="text-left text-[10.5px] uppercase tracking-wider text-[#8b9bb0]">
							<th scope="col" className="border-b border-[#2a3648] p-1.5 font-semibold">
								{body === "sol" ? "Fecha(s)" : "Momento"}
							</th>
							<th scope="col" className="border-b border-[#2a3648] p-1.5 font-semibold">{body === "sol" ? "Orto" : "Sale"}</th>
							<th scope="col" className="border-b border-[#2a3648] p-1.5 font-semibold">{body === "sol" ? "Ocaso" : "Se pone"}</th>
							<th scope="col" className="border-b border-[#2a3648] p-1.5 font-semibold">Alt. máx</th>
							<th scope="col" className="border-b border-[#2a3648] p-1.5 font-semibold">{body === "sol" ? "Día" : "Declin."}</th>
						</tr>
					</thead>
					<tbody>
						{body === "sol" &&
							rows.map(({ curve, day }) => (
								<tr key={curve.id} className={curve.emphasize ? "bg-[#2ea043]/10" : undefined}>
									<td className="border-b border-[#202b3c] p-1.5">
										<span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: curve.color }} aria-hidden="true" />
										{curve.label}
										{curveSubtitle(curve, lat) && (
											<span className="block pl-[18px] text-[10.5px] text-[#8b9bb0]">{curveSubtitle(curve, lat)}</span>
										)}
									</td>
									<td className="border-b border-[#202b3c] p-1.5">{direction(day.riseAz)}</td>
									<td className="border-b border-[#202b3c] p-1.5">{direction(day.setAz)}</td>
									<td className="border-b border-[#202b3c] p-1.5">{fmt1(day.maxAlt)}°</td>
									<td className="border-b border-[#202b3c] p-1.5">{formatDuration(day.dayLength)}</td>
								</tr>
							))}
						{body === "sol" && (
							<tr className="bg-[#f0b429]/10 font-bold">
								<td className="p-1.5">
									<span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-[#f5f5f5]" aria-hidden="true" />
									HOY — {longDate(when.y, when.m, when.d)}
								</td>
								<td className="p-1.5">{direction(today.riseAz)}</td>
								<td className="p-1.5">{direction(today.setAz)}</td>
								<td className="p-1.5">{fmt1(today.maxAlt)}°</td>
								<td className="p-1.5">{formatDuration(today.dayLength)}</td>
							</tr>
						)}
						{moon &&
							moon.refs.map(({ ref, pass }) => {
								const cells = passCells(pass)
								return (
									<tr key={ref.id} className={ref.id === "nodo" ? "bg-[#2ea043]/10" : undefined}>
										<td className="border-b border-[#202b3c] p-1.5">
											<span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: ref.color }} aria-hidden="true" />
											{ref.label}
											<span className="block pl-[18px] text-[10.5px] text-[#8b9bb0]">{dayMonth(ref.t)}</span>
										</td>
										<td className="border-b border-[#202b3c] p-1.5">{cells.rise}</td>
										<td className="border-b border-[#202b3c] p-1.5">{cells.set}</td>
										<td className="border-b border-[#202b3c] p-1.5">{cells.alt}</td>
										<td className="border-b border-[#202b3c] p-1.5">{fmt1(ref.dec)}°</td>
									</tr>
								)
							})}
						{moon && (
							<tr className="bg-[#f0b429]/10 font-bold">
								<td className="p-1.5">
									<span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-[#f5f5f5]" aria-hidden="true" />
									HOY — {longDate(when.y, when.m, when.d)}
								</td>
								<td className="p-1.5">{passCells(moon.day.pass).rise}</td>
								<td className="p-1.5">{passCells(moon.day.pass).set}</td>
								<td className="p-1.5">{passCells(moon.day.pass).alt}</td>
								<td className="p-1.5">{fmt1(moon.dec)}°</td>
							</tr>
						)}
					</tbody>
				</table>
				<p className="mt-2 font-mono text-[11px] leading-relaxed text-[#8b9bb0]">
					{body === "sol"
						? "Orto y ocaso oficiales (el centro del Sol a 0,83° bajo el horizonte, por la refracción). Declinación y ecuación del tiempo: serie de NOAA, con un error de unos 0,05°."
						: "Posición de la Luna: serie de Meeus, con un error de pocas centésimas de grado, y paralaje incluido. Salida y puesta con el centro de la Luna a 0,83° bajo el horizonte."}
				</p>
			</div>
		</section>
	)
}
