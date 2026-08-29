"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Tracks which of a vertical stack of sections is currently in the middle of the
 * viewport. Used to drive the trail map as the reader scrolls the chapter stops.
 *
 * `count` is the number of sections. Returns the active index (0-based) and a
 * `setRef(i)` factory to attach to each section element.
 */
export function useActiveSection(count: number) {
	const [active, setActive] = useState(0)
	const refs = useRef<(HTMLElement | null)[]>([])

	const setRef = useCallback(
		(i: number) => (el: HTMLElement | null) => {
			refs.current[i] = el
		},
		[],
	)

	useEffect(() => {
		const observers: IntersectionObserver[] = []
		refs.current.slice(0, count).forEach((el, i) => {
			if (!el) return
			const obs = new IntersectionObserver(
				(entries) => {
					if (entries.some((e) => e.isIntersecting)) setActive(i)
				},
				{ threshold: 0, rootMargin: "-40% 0px -40% 0px" },
			)
			obs.observe(el)
			observers.push(obs)
		})
		return () => observers.forEach((o) => o.disconnect())
	}, [count])

	return { active, setRef }
}
