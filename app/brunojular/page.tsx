import PortfolioHero from "@/components/portfolio/portfolio-hero"
import ProjectCard from "@/components/portfolio/project-card"
import AboutSection from "@/components/portfolio/about-section"
import SkillsSection from "@/components/portfolio/skills-section"
import CoursesSection from "@/components/portfolio/courses-section"
import ExperienceSection from "@/components/portfolio/experience-section"
import EducationSection from "@/components/portfolio/education-section"
import { projects } from "@/lib/portfolio/projects"

export default function PortfolioPage() {
	return (
		<main>
			<PortfolioHero />

			<AboutSection />
			<div className="mt-16">
				<SkillsSection />
			</div>
			<div className="mt-16">
				<CoursesSection />
			</div>
			<div className="mt-16">
				<ExperienceSection />
			</div>
			<div className="mt-16">
				<EducationSection />
			</div>

			<section className="mx-auto mt-16 max-w-3xl px-5 pb-16 sm:px-6">
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
