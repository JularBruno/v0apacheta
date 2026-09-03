import PortfolioHero from "@/components/portfolio/portfolio-hero"
import ProjectCard from "@/components/portfolio/project-card"
import { projects } from "@/lib/portfolio/projects"

export default function PortfolioPage() {
	return (
		<main>
			<PortfolioHero />

			<section className="mx-auto max-w-3xl px-5 pb-16 sm:px-6">
				<h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
					Proyectos ({projects.length})
				</h2>
				<div className="mt-5 grid gap-6 sm:grid-cols-2">
					{projects.map((project) => (
						<ProjectCard key={project.slug} project={project} />
					))}
				</div>
			</section>
		</main>
	)
}
