import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/lib/portfolio/projects"

export default function ProjectCard({ project }: { project: Project }) {
	return (
		<Link
			href={`/portfolio/${project.slug}`}
			className="group flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-card shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			<div className={`relative aspect-[16/10] bg-gradient-to-br ${project.appScreenColor}`}>
				{project.cover ? (
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
					<Badge variant="secondary" className="shrink-0 font-mono font-medium">
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
							className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
						>
							{tech}
						</span>
					))}
				</div>
			</div>
		</Link>
	)
}
