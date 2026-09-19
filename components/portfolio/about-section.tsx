import { profile } from "@/lib/portfolio/profile"

export default function AboutSection() {
	return (
		<section className="mx-auto max-w-3xl px-5 sm:px-6">
			<h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
				About
			</h2>
			<div className="mt-4 space-y-4">
				{profile.about.map((paragraph) => (
					<p key={paragraph.slice(0, 24)} className="leading-relaxed text-foreground/90">
						{paragraph}
					</p>
				))}
			</div>
		</section>
	)
}
