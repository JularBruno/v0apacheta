import { profile } from "@/lib/portfolio/profile"

export default function SkillsSection() {
	return (
		<section className="mx-auto max-w-3xl px-5 sm:px-6">
			<h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
				Skills
			</h2>
			<div className="mt-5 space-y-5">
				{profile.skills.map((group) => (
					<div key={group.category}>
						<h3 className="text-sm font-semibold text-foreground">{group.category}</h3>
						<div className="mt-2 flex flex-wrap gap-1.5">
							{group.items.map((item) => (
								<span
									key={item}
									className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
								>
									{item}
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	)
}
