"use client"

import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { profile, type ExperienceEntry } from "@/lib/portfolio/profile"

function EntryAccordion({ entries }: { entries: readonly ExperienceEntry[] }) {
	return (
		<Accordion type="single" collapsible className="mt-4">
			{entries.map((entry) => (
				<AccordionItem key={entry.org} value={entry.org}>
					<AccordionTrigger className="font-mono text-sm text-foreground hover:no-underline">
						<span className="text-left">
							{entry.org}{" "}
							<span className="text-muted-foreground">
								{entry.role ? `· ${entry.role} ` : ""}· {entry.period}
							</span>
						</span>
					</AccordionTrigger>
					<AccordionContent className="leading-relaxed text-muted-foreground">
						<ul className="list-disc space-y-1.5 pl-5">
							{entry.bullets.map((bullet) => (
								<li key={bullet.slice(0, 32)}>{bullet}</li>
							))}
						</ul>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	)
}

export default function ExperienceSection() {
	return (
		<section className="mx-auto max-w-3xl space-y-12 px-5 sm:px-6">
			<div>
				<h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
					Experience
				</h2>
				<EntryAccordion entries={profile.experience} />
			</div>

			<div>
				<h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
					Founder &amp; Independent Work
				</h2>
				<p className="mt-1 text-xs italic text-muted-foreground">{profile.founderWorkPeriod}</p>
				<EntryAccordion entries={profile.founderWork} />
				<p className="mt-4 text-sm">
					<Link
						href={profile.linkedInExperienceHref}
						target="_blank"
						rel="noreferrer"
						className="text-muted-foreground underline hover:text-foreground"
					>
						View complete experience on LinkedIn
					</Link>
				</p>
			</div>
		</section>
	)
}
