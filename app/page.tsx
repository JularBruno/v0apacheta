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
			<section className="py-20">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<a href="https://malvinas.argentinadatos.com/" target="_blank" rel="noopener noreferrer">
						<img
							src="https://malvinas.argentinadatos.com/header.png"
							width={1500}
							height={500}
							alt="Islas Malvinas Argentinas — Portada de perfil"
							className="w-full h-auto rounded-xl"
						/>
					</a>
				</div>
			</section>
		</main>
	)
}
