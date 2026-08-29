"use client"

import { Fragment, useId } from "react"
import CairnIcon from "./cairn-icon"
import Scenery from "./scenery"
import type { TrailMapProps, TrailNode } from "./types"

const NODE_R = 22

function nodeFill(reached: boolean, locked: boolean) {
	if (locked) return "var(--map-node-locked)"
	if (reached) return "hsl(var(--primary))"
	return "var(--map-node-idle)"
}

function nodeStroke(reached: boolean, locked: boolean) {
	if (locked) return "var(--map-node-locked-stroke)"
	if (reached) return "var(--map-ink)"
	return "var(--map-node-idle-stroke)"
}

function Node({
	node,
	index,
	reached,
	current,
	uid,
}: {
	node: TrailNode
	index: number
	reached: boolean
	current: boolean
	uid: string
}) {
	const locked = !!node.locked
	const showCairn = reached && !locked
	const labelText = node.label
	const labelOnLeft = node.x > 350
	const labelWidth = labelText ? labelText.length * 4.6 + 16 : 0

	return (
		<g transform={`translate(${node.x},${node.y})`}>
			{current && !locked && (
				<g className="trail-map-pulse">
					<circle
						r={NODE_R + 10}
						fill="none"
						stroke="hsl(var(--primary))"
						strokeWidth="1.5"
						filter={`url(#${uid}-glow)`}
					/>
				</g>
			)}

			{/* Drop shadow */}
			<circle r={NODE_R + 1} fill="rgba(45,26,14,0.22)" transform="translate(2,3)" />

			{/* Marker */}
			<circle
				r={NODE_R}
				fill={nodeFill(reached, locked)}
				stroke={nodeStroke(reached, locked)}
				strokeWidth="2"
				style={{ transition: "fill 0.5s ease, stroke 0.5s ease" }}
			/>
			<circle
				r={NODE_R - 5}
				fill="none"
				stroke={showCairn ? "rgba(45,26,14,0.22)" : "var(--map-node-idle-stroke)"}
				strokeWidth="1"
				strokeDasharray="3,3"
			/>

			{showCairn ? (
				<g transform="translate(-10,-11)">
					<CairnIcon size={20} color="rgba(45,26,14,0.85)" />
				</g>
			) : (
				<text
					textAnchor="middle"
					dominantBaseline="central"
					fontSize="13"
					fontWeight="600"
					fill="rgba(45,26,14,0.5)"
				>
					{locked ? "?" : index + 1}
				</text>
			)}

			{/* Chapter number badge */}
			<g transform={`translate(${NODE_R - 4},${-NODE_R + 4})`}>
				<circle
					r="9"
					fill={reached && !locked ? "var(--map-ink)" : "var(--map-node-idle-stroke)"}
					style={{ transition: "fill 0.5s ease" }}
				/>
				<text textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="700" fill="#fff">
					{index + 1}
				</text>
			</g>

			{/* Parchment label tag */}
			{labelText && showCairn && (
				<g
					transform={`translate(${
						labelOnLeft ? -(labelWidth / 2 + NODE_R - 2) : labelWidth / 2 + NODE_R - 2
					},${-NODE_R - 16})`}
				>
					<rect
						x={-labelWidth / 2}
						y="-10"
						width={labelWidth}
						height="19"
						rx="9.5"
						fill="var(--map-parchment-light)"
						stroke="var(--map-parchment-mid)"
						strokeWidth="1"
					/>
					<text
						textAnchor="middle"
						dominantBaseline="central"
						fontSize="8.5"
						fontWeight="600"
						fill="var(--map-ink)"
					>
						{labelText}
					</text>
				</g>
			)}
		</g>
	)
}

/**
 * The illustrated trail map. Purely presentational — the caller owns `activeIndex`.
 */
export default function TrailMap({
	nodes,
	segments,
	activeIndex,
	fogHeight = 0,
	preserveAspectRatio = "xMidYMid meet",
	className,
}: TrailMapProps) {
	const uid = useId().replace(/:/g, "")

	return (
		<svg
			viewBox="0 0 700 530"
			preserveAspectRatio={preserveAspectRatio}
			className={className}
			role="img"
			aria-label="El camino — mapa del recorrido"
		>
			<Scenery uid={uid} />

			{/* Trail segments — revealed by drawing the dash on */}
			{segments.map((seg, i) => {
				const revealed = activeIndex >= i + 1
				return (
					<path
						key={i}
						d={seg.d}
						fill="none"
						stroke={seg.locked ? "var(--map-trail-locked)" : "var(--map-trail-open)"}
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeDasharray="1000"
						strokeDashoffset={revealed ? 0 : 1000}
						opacity={seg.locked ? 0.4 : 1}
						filter={`url(#${uid}-rough)`}
						style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
					/>
				)
			})}

			{/* Fog of war over the locked upper reaches */}
			{fogHeight > 0 && (
				<rect x="0" y="0" width="700" height={fogHeight} fill={`url(#${uid}-fog)`} style={{ pointerEvents: "none" }} />
			)}
			<rect width="700" height="530" fill={`url(#${uid}-vignette)`} style={{ pointerEvents: "none" }} />

			{/* Nodes */}
			{nodes.map((node, i) => (
				<Fragment key={node.id}>
					<Node node={node} index={i} reached={activeIndex >= i} current={activeIndex === i} uid={uid} />
				</Fragment>
			))}
		</svg>
	)
}
