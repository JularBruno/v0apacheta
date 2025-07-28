import { Users, Target, Heart } from "lucide-react"

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Quiénes Somos</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Apacheta nace con la misión de mejorar la educación financiera en Argentina
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Empoderamiento</h3>
            <p className="text-gray-600">
              Ayudamos a quienes no cuentan con conocimientos financieros a tomar control de su economía personal.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Objetivos Claros</h3>
            <p className="text-gray-600">
              Enseñamos cómo y cuánto ahorrar e invertir con un mapa claro para lograr tus metas financieras.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bienestar Integral</h3>
            <p className="text-gray-600">
              Priorizamos el uso de nuestra moneda para asegurar tu estabilidad y bienestar económico.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
