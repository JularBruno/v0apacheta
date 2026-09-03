import Image from "next/image"
import type { Project } from "@/lib/portfolio/projects"

export default function ProjectScreens({ project }: { project: Project }) {
	return (
		<div className="grid gap-6 sm:grid-cols-2">
			{project.screenshots.map((shot) => (
				<figure key={shot.title} className="flex flex-col">
					<div
						className={`relative aspect-[16/10] overflow-hidden rounded-lg border border-gray-300 bg-gradient-to-br ${project.appScreenColor}`}
					>
						{shot.image ? (
							<Image
								src={shot.image}
								alt={shot.title}
								fill
								sizes="(max-width: 640px) 100vw, 500px"
								className="object-cover"
							/>
						) : (
							<span className="absolute bottom-3 left-4 font-mono text-xs uppercase tracking-widest text-white/85">
								{shot.title}
							</span>
						)}
					</div>
					<figcaption className="mt-3">
						<p className="text-sm font-semibold text-foreground">{shot.title}</p>
						<p className="mt-0.5 text-sm text-muted-foreground">
							{shot.description}
						</p>
					</figcaption>
				</figure>
			))}
		</div>
	)
}
