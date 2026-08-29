/**
 * Shared types for the illustrated trail map.
 *
 * The map is a presentational SVG world: a winding path up a parchment hillside
 * with stone-cairn nodes. It is used on the landing page (scroll-driven, 5 chapter
 * nodes) and is intended to later back the dashboard map (many nodes, click-driven).
 */

/** A cairn on the trail. Coordinates are in the map's 700×530 viewBox. */
export interface TrailNode {
	id: string
	x: number
	y: number
	/** Short label shown on a parchment tag next to the cairn. Omitted → no tag. */
	label?: string
	/** Locked nodes render faded, with a "?" instead of a cairn. */
	locked?: boolean
}

/** A path segment between two consecutive nodes. `d` is an SVG path string. */
export interface TrailSegment {
	d: string
	locked?: boolean
}

export interface TrailMapProps {
	nodes: TrailNode[]
	segments: TrailSegment[]
	/**
	 * Index into `nodes` of the node the traveller is currently at.
	 * `-1` means "before the first node" (e.g. the hero, nothing active yet).
	 *
	 * - node `i` is *reached* when `activeIndex >= i`
	 * - node `i` is *current* when `activeIndex === i`
	 * - segment `i` (node i → node i+1) is *revealed* when `activeIndex >= i + 1`
	 */
	activeIndex: number
	/** y-coordinate (in viewBox units) below which fog-of-war fades in. `0` disables. */
	fogHeight?: number
	/** SVG preserveAspectRatio. Default `xMidYMid meet` (fit). `xMidYMid slice` fills+crops. */
	preserveAspectRatio?: string
	className?: string
}
