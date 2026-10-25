"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import type { TrailGeometry } from "@/components/camino/use-trail"

interface Point {
	x: number
	y: number
}

/** Catmull-Rom through the points as a cubic-bezier path string. */
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
 * The points the trail curve passes through: from the start landmark (the
 * river, so the walk begins on its bank) or else from the top edge, through
 * every cairn, and off the bottom edge.
 */
export function trailPoints(cairns: Point[], height: number, start?: Point): Point[] {
	const first = cairns[0]
	const last = cairns[cairns.length - 1]
	return [start ?? { x: first.x, y: 0 }, ...cairns, { x: last.x, y: height }]
}

interface Args {
	trailRef: RefObject<HTMLDivElement | null>
	fullRef: RefObject<SVGPathElement | null>
	walkedRef: RefObject<SVGPathElement | null>
	/** index of the unlocked ("you are here") step */
	currentIndex: number
	/** trail count — rebuild when it changes */
	count: number
}

/**
 * Curve from the river through the cairns, solid up to the current step (dotted after), and
 * scroll to the current step once. SSR / jsdom safe. Returns geometry for
 * `<Scenery>`.
 */
export function useMapTrail({ trailRef, fullRef, walkedRef, currentIndex, count }: Args) {
	const [geometry, setGeometry] = useState<TrailGeometry | null>(null)
	const scrolledTo = useRef<number | null>(null)

	useEffect(() => {
		const trail = trailRef.current
		const full = fullRef.current
		const walked = walkedRef.current
		if (!trail || !full || !walked) return
		if (typeof walked.getTotalLength !== "function" || typeof walked.getPointAtLength !== "function") return

		let cancelled = false
		const svg = walked.ownerSVGElement

		function build() {
			if (cancelled) return
			const box = trail!.getBoundingClientRect()
			const w = trail!.clientWidth
			const h = trail!.clientHeight
			svg?.setAttribute("viewBox", `0 0 ${w} ${h}`)

			const cairnEls = Array.from(trail!.querySelectorAll<HTMLElement>("[data-cairn]"))
			const nodes: Point[] = cairnEls.map((el) => {
				const r = el.getBoundingClientRect()
				return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 }
			})
			if (nodes.length < 2) return

			const startEl = trail!.querySelector<HTMLElement>("[data-trail-start]")
			const startBox = startEl?.getBoundingClientRect()
			const start = startBox
				? { x: startBox.left - box.left + startBox.width / 2, y: startBox.top - box.top + startBox.height / 2 }
				: undefined
			const d = smoothPath(trailPoints(nodes, h, start))
			full!.setAttribute("d", d)
			walked!.setAttribute("d", d)

			const len = walked!.getTotalLength()
			walked!.style.strokeDasharray = String(len)

			const N = 900
			const sample: Point[] = []
			for (let i = 0; i <= N; i++) {
				const p = walked!.getPointAtLength((len * i) / N)
				sample.push({ x: p.x, y: p.y })
			}
			const lenNear = (n: Point) => {
				let best = 0
				let bd = Infinity
				for (let i = 0; i <= N; i++) {
					const dx = sample[i].x - n.x
					const dy = sample[i].y - n.y
					const dd = dx * dx + dy * dy
					if (dd < bd) {
						bd = dd
						best = i
					}
				}
				return (len * best) / N
			}

			const cur = nodes[Math.min(Math.max(currentIndex, 0), nodes.length - 1)]
			walked!.style.strokeDashoffset = String(len - lenNear(cur))

			const points: Point[] = []
			for (let i = 0; i <= N; i += 20) points.push(sample[i])
			setGeometry({
				pathD: d,
				width: w,
				height: h,
				trailPoints: points,
				cairns: nodes.map((n) => ({ x: n.x, y: n.y, side: n.x < w / 2 ? "left" : "right" })),
			})

			if (scrolledTo.current !== currentIndex) {
				scrolledTo.current = currentIndex
				const el = cairnEls[Math.min(Math.max(currentIndex, 0), cairnEls.length - 1)]
				requestAnimationFrame(() => el?.scrollIntoView({ block: "center", behavior: "auto" }))
			}
		}

		build()
		let resizeTimer: number | undefined
		let fadeTimer: number | undefined
		let lastWidth = trail.clientWidth
		const rebuild = () => {
			build()
			// let <Scenery> re-measure and regenerate before fading back in
			fadeTimer = window.setTimeout(() => delete trail.dataset.resizing, 120)
		}
		const onResize = () => {
			// A width change (sidebar opening/closing, window resize) moves every cairn
			// sideways: fade the trail and scenery out while it settles (CSS keys off
			// data-resizing), redraw, then fade back in. Height-only changes (milestone
			// images loading) just redraw.
			if (trail.clientWidth !== lastWidth) {
				lastWidth = trail.clientWidth
				window.clearTimeout(fadeTimer)
				trail.dataset.resizing = ""
			}
			window.clearTimeout(resizeTimer)
			resizeTimer = window.setTimeout(rebuild, 150)
		}
		// Watch the trail box itself, not the window: milestone images load late and
		// push the cairns down, and the dashboard sidebar changes the width without a
		// window resize — either one leaves the path off the cairns until rebuilt.
		const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null
		if (ro) ro.observe(trail)
		else window.addEventListener("resize", onResize)
		if (document.fonts?.ready) document.fonts.ready.then(build)

		return () => {
			cancelled = true
			ro?.disconnect()
			window.removeEventListener("resize", onResize)
			window.clearTimeout(resizeTimer)
			window.clearTimeout(fadeTimer)
			delete trail.dataset.resizing
		}
	}, [trailRef, fullRef, walkedRef, currentIndex, count])

	return { geometry }
}
