/**
 * Static illustrated scenery for the trail map — parchment ground, river, rocks,
 * scrub, ridge, and the SVG filter/gradient defs. Rendered once per map, inside
 * the map's <svg>. Nothing here reacts to state.
 *
 * `uid` namespaces the def ids so multiple maps can coexist on one page (and so a
 * `display:none` instance can't shadow a visible one via duplicate ids).
 */

function RockCluster({ cx, cy, s = 1 }: { cx: number; cy: number; s?: number }) {
	return (
		<g
			transform={`translate(${cx},${cy}) scale(${s})`}
			fill="none"
			stroke="var(--map-rock)"
			strokeWidth="1.2"
			strokeLinejoin="round"
		>
			<path d="M -22,8 C -20,-4 -8,-10 4,-6 C 16,-2 18,8 12,16 C 6,24 -18,20 -22,10 Z" />
			<path d="M -4,-8 C -2,-18 10,-22 20,-18 C 30,-14 31,-4 24,2 C 17,8 -2,4 -4,-4 Z" />
			<path d="M -28,14 C -26,8 -18,6 -10,9 C -2,12 0,20 -6,24 C -12,28 -26,24 -28,18 Z" />
			<line x1="-14" y1="8" x2="-12" y2="14" strokeWidth="0.7" stroke="var(--map-rock-highlight)" />
			<line x1="2" y1="4" x2="4" y2="10" strokeWidth="0.7" stroke="var(--map-rock-highlight)" />
		</g>
	)
}

function Scrub({ x, y }: { x: number; y: number }) {
	return (
		<g stroke="var(--map-scrub)" strokeWidth="1.1" fill="none" strokeLinecap="round">
			<path d={`M ${x},${y} C ${x - 2},${y - 8} ${x - 4},${y - 14} ${x - 3},${y - 18}`} />
			<path d={`M ${x + 4},${y} C ${x + 5},${y - 9} ${x + 3},${y - 15} ${x + 4},${y - 20}`} />
			<path d={`M ${x + 9},${y - 1} C ${x + 11},${y - 8} ${x + 10},${y - 13} ${x + 12},${y - 16}`} />
			<path d={`M ${x - 5},${y - 1} C ${x - 8},${y - 7} ${x - 7},${y - 12} ${x - 9},${y - 15}`} />
		</g>
	)
}

export default function Scenery({ uid }: { uid: string }) {
	return (
		<>
			<defs>
				{/* Literal colors mirror the --map-* tokens in globals.css. SVG <stop stop-color>
				   does not reliably resolve CSS var() across rendering engines. */}
				<linearGradient id={`${uid}-bg`} x1="0" y1="1" x2="0.15" y2="0">
					<stop offset="0%" stopColor="#e9dcba" />
					<stop offset="55%" stopColor="#ddc492" />
					<stop offset="100%" stopColor="#cfae6c" />
				</linearGradient>
				<radialGradient id={`${uid}-vignette`} gradientUnits="userSpaceOnUse" cx="350" cy="270" r="440">
					<stop offset="62%" stopColor="rgba(45,26,14,0)" />
					<stop offset="100%" stopColor="rgba(45,26,14,0.2)" />
				</radialGradient>
				<linearGradient id={`${uid}-fog`} x1="0" y1="1" x2="0" y2="0">
					<stop offset="0%" stopColor="#f2ead4" stopOpacity="0" />
					<stop offset="45%" stopColor="#f2ead4" stopOpacity="0.55" />
					<stop offset="100%" stopColor="#f6f0dd" stopOpacity="0.92" />
				</linearGradient>
				<filter id={`${uid}-rough`} x="-5%" y="-5%" width="110%" height="110%">
					<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="5" result="n" />
					<feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
				</filter>
				<filter id={`${uid}-glow`}>
					<feGaussianBlur stdDeviation="4" result="b" />
					<feComposite in="SourceGraphic" in2="b" operator="over" />
				</filter>
			</defs>

			{/* Ground */}
			<rect width="700" height="530" fill={`url(#${uid}-bg)`} />

			{/* River (Río Suquía), lower-left */}
			<path
				d="M 62,530 C 55,505 44,480 50,452 C 56,424 70,408 62,380 C 54,352 66,332 58,305 C 50,278 68,255 62,230"
				fill="none"
				stroke="var(--map-river)"
				strokeWidth="5"
				strokeLinecap="round"
				opacity="0.5"
				filter={`url(#${uid}-rough)`}
			/>
			<path
				d="M 57,530 C 50,505 40,482 46,455 C 52,428 64,412 58,385"
				fill="none"
				stroke="var(--map-river-light)"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.32"
			/>

			{/* Rocks */}
			<RockCluster cx={575} cy={458} s={1.1} />
			<RockCluster cx={108} cy={388} s={0.9} />
			<RockCluster cx={582} cy={288} s={0.85} />
			<RockCluster cx={124} cy={192} s={0.8} />
			<RockCluster cx={562} cy={162} s={0.75} />
			<RockCluster cx={340} cy={430} s={0.65} />
			<RockCluster cx={490} cy={340} s={0.7} />
			<RockCluster cx={160} cy={280} s={0.75} />

			{/* Scrub (espinillo / molle) */}
			<Scrub x={148} y={465} />
			<Scrub x={490} y={420} />
			<Scrub x={620} y={360} />
			<Scrub x={178} y={335} />
			<Scrub x={528} y={220} />
			<Scrub x={190} y={148} />
			<Scrub x={380} y={175} />
			<Scrub x={610} y={195} />

			{/* Ridge line near the top */}
			<path
				d="M 0,80 C 60,55 120,90 180,65 C 240,40 300,70 360,50 C 420,30 480,60 540,40 C 600,20 660,50 700,35 L 700,0 L 0,0 Z"
				fill="var(--map-ridge)"
				opacity="0.28"
			/>
		</>
	)
}
