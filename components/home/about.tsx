import { Users, Target, Heart } from "lucide-react"

/**  */
export default function About() {
	return (
		<section id="about" className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">El camino para gestionar tu dinero correctamente</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Apacheta nace con la misión de mejorar la educación financiera
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					<div className="text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<Users className="w-8 h-8 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">Sigue tus moviemientos</h3>
						<p className="text-gray-600">
							Solamente anotando diariamente, tu relación con tu dinero va a mejorar.
						</p>
					</div>

					<div className="text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<Heart className="w-8 h-8 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">Trabajas demasiado como para sentirte tan quebrado</h3>
						<p className="text-gray-600">
							{/* Cambia tu relación con el dinero,  */}
							Planifica como gestionar cada centavo, para a largo plazo, ahorrar e invertir mejor.
						</p>
					</div>

					<div className="text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<Target className="w-8 h-8 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">Objetivos Claros</h3>
						<p className="text-gray-600">
							Sigue <b>el mapa</b> para cumplir metas, elaborando presupuestos para cada gasto y objetivo.
						</p>
					</div>

					{/* <div className="text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<Heart className="w-8 h-8 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">Bienestar Integral</h3>
						<p className="text-gray-600">
							Aprende a ahorrar para estar más seguro, y a planificar como gestionar tu dinero para a largo plazo ahorrar e invertir mejor.
						</p>
					</div> */}
				</div>
			</div>
		</section>
	)
}
