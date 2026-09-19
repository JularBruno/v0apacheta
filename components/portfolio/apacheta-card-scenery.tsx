"use client"

import { useRef } from "react"

/**
 * Parchment/scenery treatment for the Apacheta card, scoped to just this one
 * card (not the whole portfolio page). Featured element is the "summit"
 * milestone illustration (public/scenery/milestones/summit.webp), same
 * cairn-on-a-hill artwork used as a trail landmark elsewhere in the app,
 * fitting for a finance app about reaching a goal. Since this is a small,
 * fixed-size element rather than a tall scrollable page, "parallax" here
 * means the two layers drifting slightly on mouse move instead of on scroll.
 */

const SUMMIT_SRC = "/scenery/milestones/summit.webp"

export default function ApachetaCardScenery() {
	const groundRef = useRef<HTMLDivElement>(null)
	const summitRef = useRef<HTMLImageElement>(null)

	// Summit is horizontally centered (translateX(-50%)) as its resting position:
	// that offset has to stay baked into every transform we set imperatively,
	// since setting `style.transform` replaces the whole property, not just adds to it.
	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const relX = (e.clientX - rect.left) / rect.width - 0.5
		const relY = (e.clientY - rect.top) / rect.height - 0.5

		if (groundRef.current) groundRef.current.style.transform = `translate3d(${relX * 4}px, ${relY * 4}px, 0)`
		if (summitRef.current) {
			summitRef.current.style.transform = `translate3d(calc(-50% + ${relX * 14}px), ${relY * 8}px, 0)`
		}
	}

	const reset = () => {
		if (groundRef.current) groundRef.current.style.transform = "translate3d(0, 0, 0)"
		if (summitRef.current) summitRef.current.style.transform = "translate3d(-50%, 0, 0)"
	}

	return (
		<div
			className="absolute inset-0 overflow-hidden"
			onMouseMove={handleMouseMove}
			onMouseLeave={reset}
			aria-hidden="true"
		>
			<div
				ref={groundRef}
				className="absolute inset-0 transition-transform duration-150 ease-out"
				style={{
					// Full-opacity, same as the real trail's page background (see
					// components/auth/auth-shell.module.css), a translucent ground
					// layer over the card's amber gradient was what made the summit sit
					// on top of it looking mismatched; this makes the parchment the
					// actual surface, the same way it is everywhere else in the app.
					backgroundColor: "var(--map-parchment-light)",
					backgroundImage:
						"linear-gradient(180deg, color-mix(in srgb, var(--map-parchment-light) 70%, transparent) 0%, color-mix(in srgb, var(--map-parchment-mid) 45%, transparent) 100%), url('/scenery/ground.webp')",
					// Zoomed in, a small tile here would repeat many times over a card
					// this size and read as a busy pattern instead of a paper texture.
					backgroundSize: "100% 100%, 900px auto",
					backgroundRepeat: "no-repeat, repeat",
					backgroundBlendMode: "multiply, normal",
				}}
			/>
			{/* Same treatment as a real trail milestone (camino.module.css .milestone img),
			    full opacity, just a soft drop-shadow, no extra dimming/tinting. */}
			<img
				ref={summitRef}
				src={SUMMIT_SRC}
				alt=""
				className="absolute bottom-0 left-1/2 w-[85%] max-w-none transition-transform duration-150 ease-out drop-shadow-[0_6px_10px_rgba(27,14,19,0.16)]"
				style={{ transform: "translate3d(-50%, 0, 0)" }}
			/>
		</div>
	)
}
