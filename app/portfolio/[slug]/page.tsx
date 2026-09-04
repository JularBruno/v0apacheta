import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ProjectScreens from "@/components/portfolio/project-screens"
import {
	getAdjacentProjects,
	getProjectBySlug,
	projects,
} from "@/lib/portfolio/projects"

export function generateStaticParams() {
	return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const project = getProjectBySlug(slug)
	if (!project) return {}
	return {
		title: project.title,
		description: project.description,
	}
}

const NARRATIVE: { key: "problema" | "objetivo" | "solucion" | "resultado"; label: string }[] = [
	{ key: "problema", label: "Problema" },
	{ key: "objetivo", label: "Objetivo" },
	{ key: "solucion", label: "Solución" },
	{ key: "resultado", label: "Resultado" },
]

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const project = getProjectBySlug(slug)
	if (!project) notFound()

	const { prev, next } = getAdjacentProjects(slug)

	return (
		<main className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:px-6">
			<Link
				href="/portfolio"
				className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="h-3.5 w-3.5" />
				Todos los proyectos
			</Link>

			<div className="mt-6">
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="secondary" className="font-mono font-medium">
						{project.category}
					</Badge>
				</div>
				<h1 className="mt-3 flex items-center gap-3 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
					{project.logo && (
						<Image
							src={project.logo}
							alt=""
							width={40}
							height={40}
							className="h-10 w-10 shrink-0 rounded-md object-contain"
						/>
					)}
					{project.title}
				</h1>
				<p className="mt-3 text-lg leading-relaxed text-foreground/80">
					{project.description}
				</p>
				<div className="mt-4 flex flex-wrap gap-1.5">
					{project.technologies.map((tech) => (
						<span
							key={tech}
							className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
						>
							{tech}
						</span>
					))}
				</div>
			</div>

			{project.video ? (
				<video
					controls
					preload="none"
					poster={project.cover}
					className="mt-8 aspect-[16/8] w-full rounded-lg border border-gray-300 bg-black object-contain"
				>
					<source src={project.video} />
				</video>
			) : project.cover ? (
				<div className="relative mt-8 aspect-[16/8] w-full overflow-hidden rounded-lg border border-gray-300">
					<Image
						src={project.cover}
						alt={project.title}
						fill
						sizes="(max-width: 768px) 100vw, 768px"
						className="object-cover"
					/>
				</div>
			) : (
				<div
					className={`mt-8 aspect-[16/8] w-full rounded-lg border border-gray-300 bg-gradient-to-br ${project.appScreenColor}`}
				/>
			)}

			<div className="mt-12 space-y-8">
				{NARRATIVE.map(({ key, label }) => (
					<section key={key}>
						<h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
							{label}
						</h2>
						<p className="mt-2 leading-relaxed text-foreground/90">
							{project[key]}
						</p>
					</section>
				))}
			</div>

			<div className="mt-14">
				<h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
					Pantallas
				</h2>
				<div className="mt-5">
					<ProjectScreens project={project} />
				</div>
			</div>

			<nav className="mt-16 flex items-stretch justify-between gap-4 border-t border-border pt-6 font-mono text-xs">
				{prev ? (
					<Link
						href={`/portfolio/${prev.slug}`}
						className="group flex flex-col gap-1 text-muted-foreground transition-colors hover:text-foreground"
					>
						<span className="inline-flex items-center gap-1.5">
							<ArrowLeft className="h-3.5 w-3.5" />
							Anterior
						</span>
						<span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground">
							{prev.title}
						</span>
					</Link>
				) : (
					<span />
				)}
				{next ? (
					<Link
						href={`/portfolio/${next.slug}`}
						className="group flex flex-col items-end gap-1 text-right text-muted-foreground transition-colors hover:text-foreground"
					>
						<span className="inline-flex items-center gap-1.5">
							Siguiente
							<ArrowRight className="h-3.5 w-3.5" />
						</span>
						<span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground">
							{next.title}
						</span>
					</Link>
				) : (
					<span />
				)}
			</nav>
		</main>
	)
}
