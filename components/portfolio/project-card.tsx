import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import ApachetaCardScenery from "@/components/portfolio/apacheta-card-scenery"
import type { Project } from "@/lib/portfolio/projects"

export default function ProjectCard({ project }: { project: Project }) {
	// Most cards go to their own case-study page; a project with a custom `href`
	// (e.g. Apacheta, linking to the live app at "/") goes somewhere else entirely,
	// call that out explicitly instead of leaving it to look like every other card.
	const isExternal = !!project.href && project.href !== `/brunojular/${project.slug}`
	const isApacheta = project.slug === "apacheta"

	return (
		<Link
			href={project.href ?? `/brunojular/${project.slug}`}
			className={cn(
				"group flex flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				// Apacheta's card body takes the app's warm accent (burnt peach) instead of the plain card white
				isApacheta ? "border-accent/50 bg-accent/25" : "border-border bg-card",
			)}
		>
			<div
				className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br ${project.appScreenColor}`}
			>
				{isApacheta && <ApachetaCardScenery />}
				{/* Apacheta's card shows the summit scenery instead, the generic app icon
				    would clutter that illustration. `project.logo` itself stays intact for
				    the case-study page, which still wants it next to the title there. */}
				{project.logo && !isApacheta ? (
					<Image
						src={project.logo}
						alt={project.title}
						width={96}
						height={96}
						className="relative z-10 h-20 w-20 object-contain drop-shadow-lg"
					/>
				) : project.cover ? (
					<Image
						src={project.cover}
						alt={project.title}
						fill
						sizes="(max-width: 640px) 100vw, 400px"
						className="object-cover"
					/>
				) : (
					<span className="absolute bottom-3 left-4 font-mono text-sm font-medium tracking-wide text-white/90">
						{project.title}
					</span>
				)}
			</div>

			<div className="flex flex-1 flex-col p-5">
				<div className="flex items-start justify-between gap-3">
					<h2 className="text-lg font-bold tracking-tight text-foreground">
						{project.title}
					</h2>
					<Badge variant="secondary" className={cn("shrink-0 font-mono font-medium", isApacheta && "bg-accent/30 text-foreground hover:bg-accent/30")}>
						{project.category}
					</Badge>
				</div>
				<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
					{project.description}
				</p>
				<div className="mt-4 flex flex-wrap gap-1.5">
					{project.technologies.map((tech) => (
						<span
							key={tech}
							className={cn(
								"rounded-full px-2 py-0.5 font-mono text-[11px]",
								isApacheta ? "bg-accent/20 text-foreground/70" : "bg-muted text-muted-foreground",
							)}
						>
							{tech}
						</span>
					))}
				</div>
				{isExternal && (
					<p className={cn("mt-4 inline-flex items-center gap-1 text-sm font-semibold", isApacheta ? "text-foreground" : "text-primary")}>
						{isApacheta ? "Comienza tu camino" : "Ver app en vivo"}
						<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
					</p>
				)}
			</div>
		</Link>
	)
}
