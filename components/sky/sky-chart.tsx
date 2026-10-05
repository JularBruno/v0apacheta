"use client"

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"
import TimeBar, { type TimePreset } from "@/components/sky/time-bar"
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
	nearestSunMinute,
	parseCoordinate,
	parseUtcOffset,
	project,
	referenceDeclination,
	sunAtClock,
	sunDay,
	type Location,
} from "@/lib/astro/chart"
import { PLACES, findPlace, zoneUtcOffset, type Place } from "@/lib/astro/places"
import { moonAltAz, moonElongation, moonIllumination, moonRaDec, nextPhase, phaseName } from "@/lib/astro/moon"
import { moonCycleReferences, moonPassNear, moonPassOnDay, nearestMoonMinute, type MoonPass } from "@/lib/astro/moon-chart"
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

const minuteOf = (hours: number | null) => (hours === null ? null : Math.round(hours * 60) % 1440)

const pathOf = (points: { alt: number; az: number }[]) =>
	points
		.map((p, i) => {
			const { x, y } = project(p.alt, p.az)
			return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
		})
		.join(" ")

// 16px on phones (iOS zooms the page on focus into anything smaller), compact on larger screens; 44px tall to tap.
const FIELD =
	"min-h-11 rounded-md border border-[#2a3648] bg-[#0d1420] px-3 font-mono text-base text-[#e8edf4] aria-[invalid=true]:border-[#e0343c] sm:text-xs"
const BUTTON =
	"min-h-11 rounded-md border border-[#2a3648] bg-[#0d1420] px-3 font-mono text-[11px] text-[#8b9bb0] transition-colors hover:border-[#3d5170] hover:text-[#e8edf4]"
const CHIP = `${BUTTON} shrink-0 whitespace-nowrap`
const ARROW = `${BUTTON} min-w-11 shrink-0 px-0 text-lg text-[#e8edf4]`

// Legend cells: a table on desktop; on phones every row becomes a small card whose cells show their own label.
const CELL =
	"border-b border-[#202b3c] p-1.5 max-md:border-0 max-md:p-0 max-md:before:block max-md:before:text-[10px] max-md:before:uppercase max-md:before:tracking-wide max-md:before:text-[#8b9bb0] max-md:before:content-[attr(data-label)]"
const FIRST_CELL = "border-b border-[#202b3c] p-1.5 max-md:col-span-2 max-md:border-0 max-md:p-0"
const ROW =
	"max-md:mb-2 max-md:grid max-md:grid-cols-2 max-md:gap-x-3 max-md:gap-y-1 max-md:rounded-lg max-md:border max-md:border-[#2a3648] max-md:p-2"

type Body = "sol" | "luna"

// ---- the chart --------------------------------------------------------------------------------
// Drawn in a 1000-unit box that scales to the screen: on a 360px phone one unit is 0.36px, so labels,
// lines and the marker are sized in those units to stay readable.

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
						<circle cx={500} cy={500} r={r} fill="none" stroke="#26334a" strokeWidth={alt === 0 ? 2.4 : 1.6} />
						<text x={508} y={500 - r - 6} fill="#6b7e99" fontSize={20} fontFamily="monospace">
							{alt}°
						</text>
					</g>
				)
			})}
			<circle cx={500} cy={500} r={4} fill="#6b7e99" />
			{SPOKES.map((az) => {
				const end = project(0, az)
				const label = project(-5, az)
				const major = az % 90 === 0
				return (
					<g key={az}>
						<line x1={500} y1={500} x2={end.x} y2={end.y} stroke="#202b3f" strokeWidth={major ? 2 : 1} />
						<text
							x={label.x}
							y={label.y}
							fill={major ? "#e8edf4" : "#6b7e99"}
							fontSize={major ? 30 : 18}
							fontFamily="monospace"
							fontWeight={major ? 800 : 400}
							textAnchor="middle"
							dominantBaseline="middle"
							className={major ? undefined : "max-sm:hidden"}
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
							r={today ? 7.5 : 6}
							fill={today ? "#0f1620" : color}
							stroke={today ? color : "none"}
							strokeWidth={today ? 3.5 : 0}
						/>
						<text x={x} y={y - 15} fill={color} fontSize={20} fontFamily="monospace" textAnchor="middle" fontWeight={700}>
							{m.solarHour}
						</text>
					</g>
				)
			})}
		</g>
	)
}

interface DragHandlers {
	onPointerDown: (e: ReactPointerEvent<SVGGElement>) => void
	onPointerMove: (e: ReactPointerEvent<SVGGElement>) => void
	onPointerUp: (e: ReactPointerEvent<SVGGElement>) => void
}

/**
 * A body marker (Sun or Moon): a faint line from the zenith, a glow and a disc, plus an invisible touch area
 * much bigger than the disc (a 22-unit disc is ~8px on a phone). With `drag` it can be grabbed and moved; it
 * is the only part of the chart that stops the page from scrolling under a finger.
 */
function BodyMarker({ alt, az, color, kind, drag }: { alt: number; az: number; color: string; kind: "sun" | "moon"; drag?: DragHandlers }) {
	const spot = project(alt, az)
	const edge = project(0, az)
	const marker = kind === "sun" ? { "data-sun-marker": "" } : { "data-moon-marker": "" }
	return (
		<g
			{...marker}
			{...drag}
			onPointerCancel={drag?.onPointerUp}
			style={{ touchAction: "none", cursor: drag ? "grab" : undefined }}
		>
			<line x1={500} y1={500} x2={edge.x} y2={edge.y} stroke={color} strokeWidth={3} strokeDasharray="8,12" opacity={0.5} pointerEvents="none" />
			<circle cx={spot.x} cy={spot.y} r={44} fill={color} opacity={0.22} pointerEvents="none" />
			<circle cx={spot.x} cy={spot.y} r={22} fill={color} stroke="#fff" strokeWidth={3.5} />
			<circle cx={spot.x} cy={spot.y} r={64} fill="transparent" />
		</g>
	)
}

function Tile({ label, value, detail }: { label: string; value: string; detail: string }) {
	return (
		<div className="rounded-lg border border-[#2a3648] bg-[#161f2c] p-2">
			<p className="font-mono text-[10px] uppercase tracking-wide text-[#8b9bb0]">{label}</p>
			<p className="font-mono text-lg font-bold tabular-nums text-[#ffd666]">{value}</p>
			<p className="font-mono text-[11px] text-[#8b9bb0]">{detail}</p>
		</div>
	)
}

// ---- the component -----------------------------------------------------------------------------

/**
 * The interactive sky chart. By default it has a Sol/Luna switch; pass `fixedBody` to pin it to one body
 * and drop the switch (the post shows one chart in the Sun section and one in the Moon section).
 * Built phone-first: chart, then the time controls (sticky), the day summary, the date, the (collapsed)
 * place and the legend.
 */
export default function SkyChart({
	initialDate,
	syncToNow = true,
	fixedBody,
}: {
	initialDate: string
	syncToNow?: boolean
	fixedBody?: Body
}) {
	const ids = { date: useId(), lat: useId(), lon: useId(), offset: useId() }
	const svgRef = useRef<SVGSVGElement>(null)
	const dragging = useRef(false)

	const [body, setBody] = useState<Body>(fixedBody ?? "sol")
	const [date, setDate] = useState(parseDate(initialDate) ? initialDate : "2026-12-21")
	const [minutes, setMinutes] = useState(13 * 60 + 15)
	const [playing, setPlaying] = useState(false)

	// "Usar mi ubicación": the browser's geolocation, answered asynchronously.
	const [locating, setLocating] = useState(false)
	const [geoError, setGeoError] = useState<string | null>(null)
	const [fromDevice, setFromDevice] = useState(false)
	const [geoSupported, setGeoSupported] = useState(true) // optimistic until mounted, so server and first client render agree
	const mounted = useRef(true)

	const [latText, setLatText] = useState(String(CORDOBA.lat))
	const [lonText, setLonText] = useState(String(CORDOBA.lon))
	const [offsetText, setOffsetText] = useState(String(ARGENTINA_UTC_OFFSET))
	const [lat, setLat] = useState(CORDOBA.lat)
	const [lon, setLon] = useState(CORDOBA.lon)
	const [manualOffset, setOffset] = useState(ARGENTINA_UTC_OFFSET)
	const [placeId, setPlaceId] = useState<string | null>(PLACES[0].id)

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
		mounted.current = true
		setGeoSupported(typeof navigator !== "undefined" && Boolean(navigator.geolocation))
		return () => {
			mounted.current = false
		}
	}, [])

	useEffect(() => {
		if (!playing) return
		const id = setInterval(() => setMinutes((m) => (m + 5) % 1440), 50)
		return () => clearInterval(id)
	}, [playing])

	const when = parseDate(date) as { y: number; m: number; d: number }
	const doy = dayOfYear(when.y, when.m, when.d)
	const loc = useMemo<Location>(() => ({ lat, lon }), [lat, lon])
	// A quick-pick place stays in force only while the coordinates still match it. Its clock offset is worked out from
	// its time zone for the chosen date (so Norway moves between +1 and +2); otherwise the typed offset is used.
	const activePlace = PLACES.find((p) => p.id === placeId && p.lat === lat && p.lon === lon)
	const zoneOffset = activePlace ? (zoneUtcOffset(activePlace.timeZone, when.y, when.m, when.d) ?? activePlace.utcOffset) : null
	const offset = zoneOffset ?? manualOffset
	// the typed offset mirrors the computed one, so editing a coordinate (which leaves the place) never makes the clock jump
	useEffect(() => {
		if (zoneOffset === null) return
		setOffset(zoneOffset)
		setOffsetText(String(zoneOffset))
	}, [zoneOffset])
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

	const known = findPlace(lat, lon)
	const place = known ? known.name : formatLatLon(loc)
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
	const minuteInDay = (ms: number) => (((Math.round((ms - dayStart) / MIN) % 1440) + 1440) % 1440) as number

	const errors = [
		latInvalid && "Latitud: usá un número entre -90 y 90 (el sur lleva signo menos).",
		lonInvalid && "Longitud: usá un número entre -180 y 180 (el oeste lleva signo menos).",
		offsetInvalid && "Huso horario: usá un número entre -12 y 14 (Argentina: -3).",
		geoError,
	].filter(Boolean) as string[]

	const pickDate = (month: number, day: number) => setDate(`${when.y}-${pad2(month)}-${pad2(day)}`)
	const shiftDay = (delta: number) => {
		const next = new Date(Date.UTC(when.y, when.m - 1, when.d + delta))
		setDate(`${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`)
	}
	const goTo = (ms: number) => {
		const parts = localParts(ms, offset)
		setDate(parts.date)
		setMinutes(parts.minutes)
	}
	const goNow = () => {
		const now = nowAt(offset)
		setDate(now.date)
		setMinutes(now.minutes)
	}

	/** Typing in any place field means the place no longer comes from the device, and old geolocation errors are stale. */
	const edited = () => {
		setFromDevice(false)
		setGeoError(null)
	}

	const resetToCordoba = () => {
		setLatText(String(CORDOBA.lat))
		setLonText(String(CORDOBA.lon))
		setOffsetText(String(ARGENTINA_UTC_OFFSET))
		setLat(CORDOBA.lat)
		setLon(CORDOBA.lon)
		setOffset(ARGENTINA_UTC_OFFSET)
		setPlaceId(PLACES[0].id)
		edited()
	}

	/** A quick-pick place: its coordinates now, and its time zone decides the clock offset for whatever date is shown. */
	const selectPlace = (target: Place) => {
		setLatText(String(target.lat))
		setLonText(String(target.lon))
		setLat(target.lat)
		setLon(target.lon)
		setPlaceId(target.id)
		edited()
	}

	const geoMessage = (code: number) => {
		if (code === 1)
			return "No pudimos usar tu ubicación porque el permiso está bloqueado. Podés habilitarlo en tu navegador o escribir las coordenadas."
		if (code === 3) return "Tardó demasiado en responder. Probá de nuevo o escribí las coordenadas."
		return "No se pudo determinar tu ubicación. Probá de nuevo o escribí las coordenadas."
	}

	/**
	 * Fills latitude and longitude from the device and takes the time zone from the device's own clock
	 * (you are where the device is). The position never leaves the browser: nothing is sent anywhere.
	 */
	const locateMe = () => {
		if (locating || typeof navigator === "undefined" || !navigator.geolocation) return
		setGeoError(null)
		setLocating(true)
		navigator.geolocation.getCurrentPosition(
			(position) => {
				if (!mounted.current) return
				const nextLat = Number(position.coords.latitude.toFixed(4))
				const nextLon = Number(position.coords.longitude.toFixed(4))
				setLat(nextLat)
				setLatText(String(nextLat))
				setLon(nextLon)
				setLonText(String(nextLon))
				const deviceOffset = -new Date().getTimezoneOffset() / 60
				// an offset outside what the field accepts leaves the current time zone alone
				if (parseUtcOffset(String(deviceOffset)) !== null) {
					setOffset(deviceOffset)
					setOffsetText(String(deviceOffset))
				}
				setFromDevice(true)
				setLocating(false)
			},
			(error) => {
				if (!mounted.current) return
				setGeoError(geoMessage(error.code))
				setLocating(false)
			},
			{ enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
		)
	}

	// ---- dragging the Sun along its path
	const toChartUnits = (e: ReactPointerEvent<SVGGElement>) => {
		const rect = svgRef.current?.getBoundingClientRect()
		const width = rect && rect.width > 0 ? rect.width : 1000
		const height = rect && rect.height > 0 ? rect.height : 1000
		return {
			x: ((e.clientX - (rect?.left ?? 0)) * 1000) / width,
			y: ((e.clientY - (rect?.top ?? 0)) * 1000) / height,
		}
	}
	/** Grab, drag and release behave the same for both bodies; only the "closest minute" lookup differs. */
	const makeDrag = (closestMinute: (point: { x: number; y: number }) => number | null): DragHandlers => ({
		onPointerDown: (e) => {
			dragging.current = true
			setPlaying(false)
			e.currentTarget.setPointerCapture?.(e.pointerId)
		},
		onPointerMove: (e) => {
			if (!dragging.current) return
			const minute = closestMinute(toChartUnits(e))
			if (minute !== null) setMinutes(minute)
		},
		onPointerUp: (e) => {
			dragging.current = false
			e.currentTarget.releasePointerCapture?.(e.pointerId)
		},
	})
	const sunDrag = makeDrag((point) => nearestSunMinute(loc, doy, offset, point))
	const moonDrag = makeDrag((point) => nearestMoonMinute(loc, dayStart, point))

	const direction = (az: number | null) => (az === null ? "—" : `${Math.round(az)}° ${compass(az)}`)

	// ---- time presets
	const moonPass = moon?.day.pass ?? null
	const presets: TimePreset[] =
		body === "sol"
			? [
					{ label: "Amanecer", minutes: minuteOf(today.sunrise) },
					{ label: "Mediodía solar", minutes: minuteOf(today.noon) },
					{ label: "Atardecer", minutes: minuteOf(today.sunset) },
					{ label: "Ahora", minutes: null, onSelect: goNow },
				]
			: [
					{ label: "Sale la Luna", minutes: moonPass && !moonPass.circumpolar ? minuteInDay(moonPass.rise as number) : null },
					{ label: "Punto más alto", minutes: moonPass ? minuteInDay(moonPass.transit) : null },
					{ label: "Se pone la Luna", minutes: moonPass && !moonPass.circumpolar ? minuteInDay(moonPass.set as number) : null },
					{ label: "Ahora", minutes: null, onSelect: goNow },
				]

	// ---- text for the status box
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

	let sunSummary: ReactNode = null
	if (body === "sol") {
		if (today.kind === "polarDay") sunSummary = <p className="mt-2">Sol de medianoche: el Sol no se pone en todo el día.</p>
		else if (today.kind === "polarNight") sunSummary = <p className="mt-2">Noche polar: el Sol no sale en todo el día.</p>
		else
			sunSummary = (
				<div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
					<Tile label="Sale" value={formatClock(today.sunrise as number)} detail={direction(today.riseAz)} />
					<Tile label="Mediodía solar" value={formatClock(today.noon)} detail={`${fmt1(today.maxAlt)}° de altura`} />
					<Tile label="Se pone" value={formatClock(today.sunset as number)} detail={direction(today.setAz)} />
					<Tile label="Duración" value={formatDuration(today.dayLength)} detail="de luz" />
				</div>
			)
	}

	const readout =
		body === "sol"
			? sunUp
				? `A las ${formatClock(minutes / 60)} el Sol está a ${fmt1(sun.alt)}° de altura, hacia el ${compass(sun.az)} (${Math.round(sun.az)}°).`
				: `A las ${formatClock(minutes / 60)} el Sol está debajo del horizonte (${fmt1(sun.alt)}° de altura).`
			: moonUp && moonNow
				? `A las ${formatClock(minutes / 60)} la Luna está a ${fmt1(moonNow.alt)}° de altura, hacia el ${compass(moonNow.az)} (${Math.round(moonNow.az)}°).`
				: `A las ${formatClock(minutes / 60)} La Luna está debajo del horizonte (${fmt1(moonNow ? moonNow.alt : 0)}° de altura).`

	return (
		<section
			aria-label={fixedBody ? (fixedBody === "sol" ? "Mapa del Sol interactivo" : "Mapa de la Luna interactivo") : "Mapa del cielo interactivo"}
			className="not-prose rounded-2xl border border-[#2a3648] bg-gradient-to-b from-[#161f2c] to-[#0f1620] p-3 text-[#e8edf4] sm:p-5"
		>
			{!fixedBody && (
				<div role="radiogroup" aria-label="Astro" className="mb-4 inline-flex gap-1.5">
					{(["sol", "luna"] as const).map((b) => (
						<button
							key={b}
							type="button"
							role="radio"
							aria-checked={body === b}
							onClick={() => setBody(b)}
							className={`min-h-11 rounded-md border px-5 font-mono text-xs font-bold transition-colors ${
								body === b
									? "border-[#ffd666] bg-[#ffd666]/15 text-[#ffd666]"
									: "border-[#2a3648] bg-[#0d1420] text-[#8b9bb0] hover:text-[#e8edf4]"
							}`}
						>
							{b === "sol" ? "Sol" : "Luna"}
						</button>
					))}
				</div>
			)}

			<div role="group" aria-label="Lugares" className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
				{PLACES.map((target) => (
					<button
						key={target.id}
						type="button"
						aria-pressed={known?.id === target.id}
						title={target.blurb}
						onClick={() => selectPlace(target)}
						className={`${CHIP} ${known?.id === target.id ? "border-[#ffd666] bg-[#ffd666]/15 font-bold text-[#ffd666]" : ""}`}
					>
						{target.label}
					</button>
				))}
			</div>

			<div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
				<div className="min-w-0 space-y-3">
					<svg ref={svgRef} viewBox="0 0 1000 1000" role="img" aria-label={svgLabel} className="h-auto w-full select-none">
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
											strokeWidth={curve.emphasize ? 6 : 4.5}
											opacity={0.95}
										/>
										{curve.emphasize && <HourDots points={markers} color={curve.color} />}
									</g>
								),
							)}
						{body === "sol" && todayPoints.length > 0 && (
							<g>
								<path data-curve="hoy" d={pathOf(todayPoints)} fill="none" stroke="#f5f5f5" strokeWidth={6.5} strokeDasharray="14,9" />
								<HourDots points={todayMarkers} color="#f5f5f5" today />
							</g>
						)}
						{body === "sol" && sunUp && <BodyMarker kind="sun" alt={sun.alt} az={sun.az} color="#ffd666" drag={sunDrag} />}

						{moon &&
							moon.refs.map(({ ref, pass }) =>
								pass === null ? null : (
									<path
										key={ref.id}
										data-curve={ref.id}
										d={pathOf(pass.points)}
										fill="none"
										stroke={ref.color}
										strokeWidth={ref.id === "nodo" ? 6 : 4.5}
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
									strokeWidth={6.5}
									strokeDasharray="14,9"
								/>
								<circle
									cx={project(moon.day.pass.maxAlt, moon.day.pass.maxAz).x}
									cy={project(moon.day.pass.maxAlt, moon.day.pass.maxAz).y}
									r={7.5}
									fill="#0f1620"
									stroke="#f5f5f5"
									strokeWidth={3.5}
								/>
								<text
									x={project(moon.day.pass.maxAlt, moon.day.pass.maxAz).x}
									y={project(moon.day.pass.maxAlt, moon.day.pass.maxAz).y - 16}
									fill="#f5f5f5"
									fontSize={22}
									fontFamily="monospace"
									textAnchor="middle"
									fontWeight={700}
								>
									{clockOf(moon.day.pass.transit)}
								</text>
							</g>
						)}
						{moonUp && moonNow && <BodyMarker kind="moon" alt={moonNow.alt} az={moonNow.az} color="#e8edf4" drag={moonDrag} />}
					</svg>
					<p className="font-mono text-[11px] leading-relaxed text-[#8b9bb0]">
						Es el cielo mirando hacia arriba: el centro es el cénit y el borde el horizonte; norte arriba, este a la izquierda.{" "}
						{body === "sol"
							? "Arrastrá el Sol por su camino, o usá los controles de abajo. Los números son horas solares."
							: "Arrastrá la Luna por su camino, o usá los controles de abajo. Cada curva es un arco completo, de salida a puesta; el número blanco es la hora de su punto más alto."}
					</p>

					<TimeBar minutes={minutes} onChange={setMinutes} playing={playing} onTogglePlay={() => setPlaying((p) => !p)} presets={presets}>
						<p data-testid="sun-readout" className="mt-2 font-mono text-xs leading-relaxed">
							{readout}
						</p>
					</TimeBar>
				</div>

				<div className="min-w-0 space-y-4">
					<div role="status" className="rounded-xl border border-dashed border-[#3d4f6b] bg-[#0d1420] p-3 font-mono text-xs leading-relaxed">
						<p className="font-sans text-sm font-bold">
							{place} · {longDate(when.y, when.m, when.d)}
						</p>
						{body === "sol" ? (
							<>
								{sunSummary}
								<p className="mt-2 text-[11px] text-[#8b9bb0]">
									Declinación solar <span className="font-bold text-[#f0b429]">{fmt1(today.dec)}°</span> · hora de reloj {zone}
								</p>
							</>
						) : (
							moon && (
								<>
									<p className="mt-1">
										Fase: <span className="font-bold text-[#f0b429]">{phaseName(moon.elongation)}</span> (
										{Math.round(moon.illumination * 100)}% iluminada) · declinación{" "}
										<span className="font-bold text-[#f0b429]">{fmt1(moon.dec)}°</span>.
									</p>
									<p className="mt-1">{moonRiseSet(moon.day.pass, moon.day.outsideDay)}</p>
									<p className="mt-1">Ciclo del mes: {cycleText}.</p>
								</>
							)
						)}
					</div>

					<div className="space-y-2">
						<label htmlFor={ids.date} className="block font-mono text-xs text-[#8b9bb0]">
							Fecha
						</label>
						<div className="flex items-center gap-2">
							<button type="button" aria-label="Día anterior" className={ARROW} onClick={() => shiftDay(-1)}>
								‹
							</button>
							<input
								id={ids.date}
								type="date"
								value={date}
								onChange={(e) => parseDate(e.target.value) && setDate(e.target.value)}
								className={`${FIELD} min-w-0 flex-1`}
							/>
							<button type="button" aria-label="Día siguiente" className={ARROW} onClick={() => shiftDay(1)}>
								›
							</button>
						</div>
						<div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
							<button type="button" className={CHIP} onClick={goNow}>
								Hoy
							</button>
							{body === "sol" ? (
								<>
									<button type="button" className={CHIP} onClick={() => pickDate(12, 21)}>
										Solsticio de diciembre
									</button>
									<button type="button" className={CHIP} onClick={() => pickDate(3, 20)}>
										Equinoccio de marzo
									</button>
									<button type="button" className={CHIP} onClick={() => pickDate(6, 21)}>
										Solsticio de junio
									</button>
									<button type="button" className={CHIP} onClick={() => pickDate(9, 23)}>
										Equinoccio de septiembre
									</button>
								</>
							) : (
								<>
									<button type="button" className={CHIP} onClick={() => goTo(nextPhase(instant, 0))}>
										Próxima luna nueva
									</button>
									<button type="button" className={CHIP} onClick={() => goTo(nextPhase(instant, 180))}>
										Próxima luna llena
									</button>
								</>
							)}
						</div>
					</div>

					<div
						role="group"
						aria-label="Lugar"
						className="rounded-xl border border-[#2a3648] bg-[#0d1420]"
					>
						<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-3 pt-3 font-mono text-sm font-bold">
							<span>
								{place} · {zone}
							</span>
							{fromDevice && <span className="text-[11px] font-normal text-[#ffd666]">Detectada con tu dispositivo</span>}
						</div>
						<div className="space-y-3 p-3 pt-2">
							<button
								type="button"
								className={`${BUTTON} w-full whitespace-nowrap font-bold text-[#ffd666] disabled:cursor-not-allowed disabled:opacity-50`}
								disabled={locating || !geoSupported}
								onClick={locateMe}
							>
								{locating ? "Buscando tu ubicación…" : "Usar mi ubicación"}
							</button>
							<p className="font-mono text-[11px] leading-relaxed text-[#8b9bb0]">
								{geoSupported
									? "Tu ubicación no sale de tu navegador: solo se usa para calcular el cielo."
									: "Tu navegador no permite obtener la ubicación. Escribí las coordenadas a mano."}
							</p>
							<div className="grid grid-cols-2 gap-2">
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
											edited()
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
											edited()
											const n = parseCoordinate(e.target.value, 180)
											if (n !== null) setLon(n)
										}}
										className={`${FIELD} w-full`}
									/>
								</div>
								<div className="col-span-2">
									<label htmlFor={ids.offset} className="block font-mono text-[11px] text-[#8b9bb0]">
										Huso horario (UTC)
									</label>
									<input
										id={ids.offset}
										type="text"
										inputMode="decimal"
										value={activePlace ? String(offset) : offsetText}
										aria-invalid={offsetInvalid || undefined}
										onChange={(e) => {
											setOffsetText(e.target.value)
											setPlaceId(null)
											edited()
											const n = parseUtcOffset(e.target.value)
											if (n !== null) setOffset(n)
										}}
										className={`${FIELD} w-full`}
									/>
								</div>
							</div>
							<p className="font-mono text-[11px] text-[#8b9bb0]">Sur y oeste llevan signo menos. Podés usar punto o coma.</p>
								{activePlace && (
									<p className="font-mono text-[11px] text-[#8b9bb0]">
										El huso se calcula solo para este lugar y esta fecha, con horario de verano incluido.
									</p>
								)}
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
				</div>
			</div>

			<div className="mt-5">
				<table className="w-full border-collapse font-mono text-[11.5px] max-md:block">
					<caption className="pb-2 text-left text-[11px] text-[#8b9bb0] max-md:block">
						{body === "sol"
							? "Recorrido del Sol en 7 fechas de referencia y en la fecha elegida"
							: "Recorrido de la Luna en 5 momentos del ciclo de declinación del mes y en la fecha elegida"}
					</caption>
					<thead className="max-md:sr-only">
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
					<tbody className="max-md:block">
						{body === "sol" &&
							rows.map(({ curve, day }) => (
								<tr key={curve.id} className={`${ROW} ${curve.emphasize ? "bg-[#2ea043]/10" : ""}`}>
									<td className={FIRST_CELL}>
										<span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: curve.color }} aria-hidden="true" />
										{curve.label}
										{curveSubtitle(curve, lat) && (
											<span className="block pl-[18px] text-[10.5px] text-[#8b9bb0]">{curveSubtitle(curve, lat)}</span>
										)}
									</td>
									<td data-label="Orto" className={CELL}>{direction(day.riseAz)}</td>
									<td data-label="Ocaso" className={CELL}>{direction(day.setAz)}</td>
									<td data-label="Alt. máx" className={CELL}>{fmt1(day.maxAlt)}°</td>
									<td data-label="Día" className={CELL}>{formatDuration(day.dayLength)}</td>
								</tr>
							))}
						{body === "sol" && (
							<tr className={`${ROW} bg-[#f0b429]/10 font-bold`}>
								<td className={FIRST_CELL}>
									<span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-[#f5f5f5]" aria-hidden="true" />
									HOY — {longDate(when.y, when.m, when.d)}
								</td>
								<td data-label="Orto" className={CELL}>{direction(today.riseAz)}</td>
								<td data-label="Ocaso" className={CELL}>{direction(today.setAz)}</td>
								<td data-label="Alt. máx" className={CELL}>{fmt1(today.maxAlt)}°</td>
								<td data-label="Día" className={CELL}>{formatDuration(today.dayLength)}</td>
							</tr>
						)}
						{moon &&
							moon.refs.map(({ ref, pass }) => {
								const cells = passCells(pass)
								return (
									<tr key={ref.id} className={`${ROW} ${ref.id === "nodo" ? "bg-[#2ea043]/10" : ""}`}>
										<td className={FIRST_CELL}>
											<span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: ref.color }} aria-hidden="true" />
											{ref.label}
											<span className="block pl-[18px] text-[10.5px] text-[#8b9bb0]">{dayMonth(ref.t)}</span>
										</td>
										<td data-label="Sale" className={CELL}>{cells.rise}</td>
										<td data-label="Se pone" className={CELL}>{cells.set}</td>
										<td data-label="Alt. máx" className={CELL}>{cells.alt}</td>
										<td data-label="Declin." className={CELL}>{fmt1(ref.dec)}°</td>
									</tr>
								)
							})}
						{moon && (
							<tr className={`${ROW} bg-[#f0b429]/10 font-bold`}>
								<td className={FIRST_CELL}>
									<span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-[#f5f5f5]" aria-hidden="true" />
									HOY — {longDate(when.y, when.m, when.d)}
								</td>
								<td data-label="Sale" className={CELL}>{passCells(moon.day.pass).rise}</td>
								<td data-label="Se pone" className={CELL}>{passCells(moon.day.pass).set}</td>
								<td data-label="Alt. máx" className={CELL}>{passCells(moon.day.pass).alt}</td>
								<td data-label="Declin." className={CELL}>{fmt1(moon.dec)}°</td>
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
