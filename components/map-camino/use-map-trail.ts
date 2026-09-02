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
 * Curve through the cairns, solid up to the current step (dotted after), and
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

			const pts: Point[] = [{ x: nodes[0].x, y: 0 }, ...nodes, { x: nodes[nodes.length - 1].x, y: h }]
			const d = smoothPath(pts)
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

			const trailPoints: Point[] = []
			for (let i = 0; i <= N; i += 20) trailPoints.push(sample[i])
			setGeometry({
				pathD: d,
				width: w,
				height: h,
				trailPoints,
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
		const onResize = () => {
			window.clearTimeout(resizeTimer)
			resizeTimer = window.setTimeout(build, 150)
		}
		window.addEventListener("resize", onResize)
		if (document.fonts?.ready) document.fonts.ready.then(build)

		return () => {
			cancelled = true
			window.removeEventListener("resize", onResize)
			window.clearTimeout(resizeTimer)
		}
	}, [trailRef, fullRef, walkedRef, currentIndex, count])

	return { geometry }
}
