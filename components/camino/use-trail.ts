"use client"

import { useEffect, useRef, useState, type RefObject } from "react"

interface Point {
	x: number
	y: number
}

export interface TrailGeometry {
	/** the trail path `d`, in a `0 0 width height` coordinate space */
	pathD: string
	width: number
	height: number
	/** points sampled along the trail, for placing scenery near the path */
	trailPoints: Point[]
	/** cairn centres + which side of the trail they sit on */
	cairns: Array<Point & { side: "left" | "right" }>
}

interface Args {
	trailRef: RefObject<HTMLDivElement | null>
	fullRef: RefObject<SVGPathElement | null>
	walkedRef: RefObject<SVGPathElement | null>
	count: number
}

/** Catmull-Rom through the points, emitted as a cubic-bezier path string. */
function smoothPath(pts: Point[]): string {
	let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[i - 1] || pts[i]
		const p1 = pts[i]
		const p2 = pts[i + 1]
		const p3 = pts[i + 2] || p2
		const c1x = p1.x + (p2.x - p0.x) / 6
		const c1y = p1.y + (p2.y - p0.y) / 6
		const c2x = p2.x - (p3.x - p1.x) / 6
		const c2y = p2.y - (p3.y - p1.y) / 6
		d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
	}
	return d
}

/**
 * Draws a curve through the cairns and links how much of it is "walked" to the
 * scroll position — solid behind the reader, dotted ahead, both directions.
 * Also reports which chapter is active and which have been reached.
 *
 * SSR / jsdom safe: bails out where SVG geometry APIs are missing.
 */
export function useTrail({ trailRef, fullRef, walkedRef, count }: Args) {
	const [activeIndex, setActiveIndex] = useState(0)
	const [reachedCount, setReachedCount] = useState(0)
	const [inView, setInView] = useState<boolean[]>(() => Array(count).fill(false))
	const [geometry, setGeometry] = useState<TrailGeometry | null>(null)

	const geo = useRef({ len: 0, anchorsY: [] as number[], anchorsL: [] as number[] })

	useEffect(() => {
		const trail = trailRef.current
		const full = fullRef.current
		const walked = walkedRef.current
		if (!trail || !full || !walked) return
		if (typeof walked.getTotalLength !== "function" || typeof walked.getPointAtLength !== "function") return

		let cancelled = false
		const svg = walked.ownerSVGElement
		const cairns = () => Array.from(trail.querySelectorAll<HTMLElement>("[data-cairn]"))

		function build() {
			if (cancelled) return
			const box = trail!.getBoundingClientRect()
			const w = trail!.clientWidth
			const h = trail!.clientHeight
			svg?.setAttribute("viewBox", `0 0 ${w} ${h}`)

			const nodes: Point[] = cairns().map((el) => {
				const r = el.getBoundingClientRect()
				return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 }
			})
			if (nodes.length < 2) return

			const pts: Point[] = [
				{ x: nodes[0].x, y: 0 },
				...nodes,
				{ x: nodes[nodes.length - 1].x, y: h },
			]
			const d = smoothPath(pts)
			full!.setAttribute("d", d)
			walked!.setAttribute("d", d)

			const len = walked!.getTotalLength()
			walked!.style.strokeDasharray = String(len)

			const N = 700
			const sample: Point[] = []
			for (let i = 0; i <= N; i++) {
				const p = walked!.getPointAtLength((len * i) / N)
				sample.push({ x: p.x, y: p.y })
			}
			const lenNear = (n: Point) => {
				let best = 0
				let bd = Infinity
				for (let j = 0; j <= N; j++) {
					const dx = sample[j].x - n.x
					const dy = sample[j].y - n.y
					const dd = dx * dx + dy * dy
					if (dd < bd) {
						bd = dd
						best = j
					}
				}
				return (len * best) / N
			}

			geo.current = {
				len,
				anchorsY: [0, ...nodes.map((n) => n.y), h],
				anchorsL: [0, ...nodes.map(lenNear), len],
			}

			const trailPoints: Point[] = []
			for (let i = 0; i <= N; i += 16) trailPoints.push(sample[i])
			setGeometry({
				pathD: d,
				width: w,
				height: h,
				trailPoints,
				cairns: nodes.map((n) => ({ x: n.x, y: n.y, side: n.x < w / 2 ? "left" : "right" })),
			})

			update()
		}

		function update() {
			const { len, anchorsY, anchorsL } = geo.current
			if (!len) return

			const box = trail!.getBoundingClientRect()
			let mid = window.innerHeight / 2 - box.top
			mid = Math.max(anchorsY[0], Math.min(anchorsY[anchorsY.length - 1], mid))

			let reach = 0
			for (let i = 0; i < anchorsY.length - 1; i++) {
				if (mid >= anchorsY[i] && mid <= anchorsY[i + 1]) {
					const span = anchorsY[i + 1] - anchorsY[i] || 1
					const t = (mid - anchorsY[i]) / span
					reach = anchorsL[i] + t * (anchorsL[i + 1] - anchorsL[i])
					break
				}
			}
			walked!.style.strokeDashoffset = String(len - reach)

			const vmid = window.innerHeight / 2
			let here = 0
			let hd = Infinity
			let reached = 0
			cairns().forEach((el, i) => {
				const r = el.getBoundingClientRect()
				const centre = r.top + r.height / 2
				const dist = Math.abs(centre - vmid)
				if (dist < hd) {
					hd = dist
					here = i
				}
				if (r.top < window.innerHeight * 0.62) reached = i + 1
			})
			setActiveIndex((prev) => (prev === here ? prev : here))
			setReachedCount((prev) => (prev === reached ? prev : reached))
		}

		let ticking = false
		const onScroll = () => {
			if (ticking) return
			ticking = true
			requestAnimationFrame(() => {
				update()
				ticking = false
			})
		}

		const io = new IntersectionObserver(
			(entries) => {
				setInView((prev) => {
					let changed = false
					const next = prev.slice()
					entries.forEach((e) => {
						const idx = Number((e.target as HTMLElement).dataset.station)
						if (e.isIntersecting && !next[idx]) {
							next[idx] = true
							changed = true
						}
					})
					return changed ? next : prev
				})
			},
			{ rootMargin: "0px 0px -35% 0px" },
		)
		trail.querySelectorAll<HTMLElement>("[data-station]").forEach((el) => io.observe(el))

		let resizeTimer: number | undefined
		const onResize = () => {
			window.clearTimeout(resizeTimer)
			resizeTimer = window.setTimeout(build, 150)
		}

		window.addEventListener("scroll", onScroll, { passive: true })
		window.addEventListener("resize", onResize)
		if (document.fonts?.ready) document.fonts.ready.then(build)
		build()

		return () => {
			cancelled = true
			window.removeEventListener("scroll", onScroll)
			window.removeEventListener("resize", onResize)
			io.disconnect()
			window.clearTimeout(resizeTimer)
		}
	}, [trailRef, fullRef, walkedRef, count])

	return { activeIndex, reachedCount, inView, geometry }
}
