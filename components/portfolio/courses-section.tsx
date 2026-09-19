import { profile } from "@/lib/portfolio/profile"

export default function CoursesSection() {
	return (
		<section className="mx-auto max-w-3xl px-5 sm:px-6">
			<h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
				Courses &amp; Additional Training
			</h2>
			<p className="mt-4 leading-relaxed text-foreground/90">{profile.courses}</p>
		</section>
	)
}
