/**
 * The ikigai: four overlapping circles (what you love, what you're good at, what the world needs, what you can be
 * paid for), the four pairs where two meet, and the center where all four do. Inline SVG, so the words are real text
 * in the server-rendered HTML; title and desc are the accessible name and description.
 */
const CIRCLES = [
	{ id: "amas", cx: 240, cy: 135, color: "#e0343c", label: ["Lo que amás", "hacer"], lx: 240, ly: 78 },
	{ id: "mundo", cx: 315, cy: 210, color: "#2ea043", label: ["Lo que el mundo", "necesita"], lx: 380, ly: 205 },
	{ id: "pago", cx: 240, cy: 285, color: "#7c9cff", label: ["Por lo que", "te pagarían"], lx: 240, ly: 342 },
	{ id: "bien", cx: 165, cy: 210, color: "#f2b01d", label: ["Lo que se te", "da bien"], lx: 100, ly: 205 },
]

const PAIRS = [
	{ name: "Pasión", x: 190, y: 163 },
	{ name: "Misión", x: 290, y: 163 },
	{ name: "Vocación", x: 290, y: 262 },
	{ name: "Profesión", x: 190, y: 262 },
]

const R = 95

export default function IkigaiDiagram() {
	return (
		<figure className="overflow-hidden rounded-xl border border-border bg-muted/20 p-3">
			<svg viewBox="0 0 480 420" role="img" aria-labelledby="ikigai-title ikigai-desc" className="mx-auto h-auto w-full max-w-xl">
				<title id="ikigai-title">Diagrama del ikigai</title>
				<desc id="ikigai-desc">
					Cuatro círculos que se superponen: lo que amás hacer, lo que se te da bien, lo que el mundo necesita y por lo que te pagarían.
					Donde se juntan dos aparecen la pasión, la misión, la vocación y la profesión, y en el centro, donde coinciden los cuatro, el ikigai.
				</desc>
				{CIRCLES.map((c) => (
					<circle key={c.id} cx={c.cx} cy={c.cy} r={R} fill={c.color} fillOpacity={0.22} stroke={c.color} strokeWidth={2} />
				))}
				<g className="fill-foreground" textAnchor="middle" fontSize="13" fontWeight="600">
					{CIRCLES.map((c) => (
						<text key={c.id} x={c.lx} y={c.ly}>
							<tspan x={c.lx} dy="0">
								{c.label[0]}
							</tspan>
							<tspan x={c.lx} dy="16">
								{c.label[1]}
							</tspan>
						</text>
					))}
				</g>
				<g className="fill-foreground" textAnchor="middle" fontSize="11" opacity={0.85}>
					{PAIRS.map((p) => (
						<text key={p.name} x={p.x} y={p.y}>
							{p.name}
						</text>
					))}
				</g>
				<text x={240} y={215} textAnchor="middle" fontSize="18" fontWeight="800" className="fill-foreground">
					Ikigai
				</text>
			</svg>
			<figcaption className="mt-2 text-center text-xs text-muted-foreground">
				Lo que te conviene hacer está donde se juntan las cuatro.
			</figcaption>
		</figure>
	)
}
