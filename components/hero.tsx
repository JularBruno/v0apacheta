import { ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link" // Import Link

export default function Hero() {
  return (
    <section id="hero" className="bg-gradient-to-br from-green-50 to-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo grande */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            El mapa para llegar a
            {/* <span className="block text-green-600">A fin de mes</span>
            <span className="block text-green-600">A ahorrar</span>
            <span className="block text-green-600">A seguir tus inversiones</span> */}
            <span className="block text-green-600">entender mejor tu dinero</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empodera tu economía personal. Aprende a gestionar, ahorrar e invertir con sabiduría práctica para tu
            bienestar financiero.
          </p>

          {/* CTA Button - Updated to Link to onboarding */}
          <Link
            href="/onboarding"
            className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
          >
            <span>Comienza tu Camino</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Badge */}
          <div className="mt-12">
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              🇦🇷 Educación financiera para Argentina
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
