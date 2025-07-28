import Header from "@/components/header"
import Hero from "@/components/hero"
import About from "@/components/about"
import Features from "@/components/features"
import FAQ from "@/components/faq"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="font-manrope">
      <Header />
      <Hero />
      <About />
      <Features />
      <FAQ />
      <Footer />
    </main>
  )
}
