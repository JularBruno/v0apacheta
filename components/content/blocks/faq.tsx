import type { FaqItem } from "@/lib/content/types"

/** Native <details>: every answer is always in the server-rendered HTML for crawlers. Pass the same `items` as seo.faq. */
export default function Faq({ items, heading = "Preguntas frecuentes" }: { items: FaqItem[]; heading?: string }) {
	if (items.length === 0) return null
	return (
		<section aria-labelledby="faq-heading">
			<h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-foreground">
				{heading}
			</h2>
			<div className="mt-4 divide-y divide-border rounded-lg border border-border">
				{items.map((item) => (
					<details key={item.question} className="p-4">
						<summary className="cursor-pointer font-semibold text-foreground">{item.question}</summary>
						<p className="mt-2 text-sm text-foreground/80">{item.answer}</p>
					</details>
				))}
			</div>
		</section>
	)
}
