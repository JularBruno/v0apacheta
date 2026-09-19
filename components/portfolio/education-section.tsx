import { profile } from "@/lib/portfolio/profile"

export default function EducationSection() {
	return (
		<section className="mx-auto max-w-3xl px-5 sm:px-6">
			<h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
				Education
			</h2>
			<div className="mt-4 space-y-1 text-foreground/90">
				{profile.education.map((line) => (
					<p key={line}>{line}</p>
				))}
				<p>Languages: {profile.languages}</p>
			</div>
		</section>
	)
}
