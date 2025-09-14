import { TrendingUp, BookOpen, Shield, Users, Eye, Brain, Scale, Lightbulb } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Empoderamiento Económico",
    description: "Toma control total de tus finanzas personales",
  },
  {
    icon: BookOpen,
    title: "Educación Continua",
    description: "Aprende constantemente sobre finanzas de manera práctica",
  },
  {
    icon: Shield,
    title: "Transparencia Financiera",
    description: "Información clara y honesta sobre tus inversiones",
  },
  {
    icon: Users,
    title: "Comunidad y Apoyo",
    description: "Conecta con otros en su camino hacia la libertad financiera",
  },
  {
    icon: Eye,
    title: "Entendimiento Nacional",
    description: "Educación financiera adaptada a la realidad argentina",
  },
  {
    icon: Brain,
    title: "Autoconocimiento Financiero",
    description: "Descubre tus patrones y mejora tus decisiones",
  },
  {
    icon: Scale,
    title: "Equilibrio y Armonía",
    description: "Encuentra el balance perfecto en tu vida financiera",
  },
  {
    icon: Lightbulb,
    title: "Sabiduría Práctica",
    description: "Soluciones reales para problemas financieros cotidianos",
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nuestros Pilares</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Los valores que guían nuestra misión de transformar la educación financiera en Argentina
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
