import { Users, Target, Heart } from "lucide-react"

const cards = [
	{
		icon: Users,
		title: "Seguí tus movimientos",
		body: "Solamente anotando diariamente, tu relación con tu dinero va a mejorar. Un hábito simple que cambia todo.",
		bg: "bg-burnt-peach-500",
		iconBg: "bg-burnt-peach-600",
		text: "text-white",
		muted: "text-white/75",
	},
	{
		icon: Heart,
		title: "Trabajás demasiado para sentirte tan quebrado",
		body: "Planificá cómo gestionar cada peso. A largo plazo, eso significa ahorrar e invertir mejor.",
		bg: "bg-berry-crush-500",
		iconBg: "bg-berry-crush-600",
		text: "text-white",
		muted: "text-white/75",
	},
	{
		icon: Target,
		title: "Objetivos claros",
		body: "Seguí el mapa para cumplir metas, elaborando presupuestos para cada gasto y objetivo de vida.",
		bg: "bg-primary",
		iconBg: "bg-primary-600",
		text: "text-coffee-bean-800",
		muted: "text-coffee-bean-700",
	},
]

export default function About() {
	return (
		<section id="about" className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

				<div className="text-center mb-14">
					<p className="text-xs font-bold tracking-widest text-primary-600 uppercase mb-3">Por qué Apacheta</p>
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						El camino para gestionar tu dinero
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Apacheta nace con la misión de mejorar la educación financiera en Argentina.
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{cards.map((card) => (
						<div key={card.title} className={`${card.bg} rounded-2xl p-8 flex flex-col gap-5`}>
							<div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
								<card.icon className={`w-6 h-6 ${card.text}`} />
							</div>
							<div>
								<h3 className={`text-lg font-bold ${card.text} mb-2 leading-snug`}>{card.title}</h3>
								<p className={`text-sm ${card.muted} leading-relaxed`}>{card.body}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
