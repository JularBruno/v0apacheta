"use client"
import Header from "@/components/home/header"
import Hero from "@/components/home/hero"
import About from "@/components/home/about"
import Features from "@/components/home/features"
import FAQ from "@/components/home/faq"
import Footer from "@/components/home/footer"

export default function Home() {

	return (
		<main className="font-manrope">
			<Header />
			<Hero />
			<About />
			{/* <Features /> */}
			<FAQ />
			{/* <Footer /> */}
		</main>
	)
}
