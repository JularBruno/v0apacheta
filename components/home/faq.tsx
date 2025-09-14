"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "¿Qué es Apacheta y cómo puede ayudarme?",
    answer:
      "Apacheta es una plataforma de educación financiera diseñada específicamente para Argentina. Te ayudamos a gestionar tus ingresos, gastos y carteras de ahorro e inversión de manera intuitiva, con un enfoque práctico adaptado a nuestra realidad económica.",
  },
  {
    question: "¿Es gratuito usar Apacheta?",
    answer:
      "Ofrecemos una versión gratuita con funcionalidades básicas para que puedas comenzar tu camino hacia la alfabetización financiera. También tenemos planes premium con herramientas avanzadas para usuarios que buscan un análisis más profundo.",
  },
  {
    question: "¿Necesito conocimientos previos de finanzas?",
    answer:
      "¡Para nada! Apacheta está diseñado especialmente para personas sin conocimientos financieros previos. Comenzamos desde lo básico y te acompañamos paso a paso en tu aprendizaje.",
  },
  {
    question: "¿Cómo protegen mis datos financieros?",
    answer:
      "La seguridad es nuestra prioridad. Utilizamos encriptación de nivel bancario y nunca almacenamos información sensible como contraseñas de bancos. Toda tu información está protegida bajo los más altos estándares de seguridad.",
  },
  {
    question: "¿Puedo usar Apacheta si vivo fuera de Argentina?",
    answer:
      "Aunque Apacheta está optimizado para la realidad financiera argentina, muchos de nuestros conceptos y herramientas son aplicables en otros países. Sin embargo, recomendamos especialmente su uso para residentes en Argentina.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-earth-900 mb-4 font-manrope">Preguntas Frecuentes</h2>
          <p className="text-xl text-earth-600 font-manrope">Resolvemos tus dudas sobre educación financiera</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-earth-200 rounded-lg">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-earth-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-earth-900 font-manrope">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primary-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-primary-600" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-earth-600 font-manrope">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
