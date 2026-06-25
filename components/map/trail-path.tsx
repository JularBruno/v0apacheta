interface TrailPathProps {
	steps: Array<{ x: number; y: number; status: string }>
}

export default function TrailPath({ steps }: TrailPathProps) {
	if (steps.length < 2) return null

	const points = steps.map(s => `${s.x},${s.y}`).join(" ")

	const lastCompletedIdx = steps.reduce<number>((acc, s, i) => s.status === "completed" ? i : acc, -1)
	const traveledPoints = lastCompletedIdx >= 1
		? steps.slice(0, lastCompletedIdx + 1).map(s => `${s.x},${s.y}`).join(" ")
		: null

	return (

		<svg
			className="absolute inset-0 w-full h-full pointer-events-none"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			aria-hidden
		>
			<polyline
				points={points}
				fill="none"
				stroke="hsl(var(--accent))"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
				strokeDasharray="9 7"
			/>

			{traveledPoints && (
				<polyline
					points={traveledPoints}
					fill="none"
					stroke="hsl(var(--accent))"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
					vectorEffect="non-scaling-stroke"
				/>
			)}
		</svg>
	)
}
