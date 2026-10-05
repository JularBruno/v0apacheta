export default function Glossary({ terms }: { terms: { term: string; definition: string }[] }) {
	if (terms.length === 0) return null
	return (
		<section aria-labelledby="glosario-heading">
			<h2 id="glosario-heading" className="text-2xl font-bold tracking-tight text-foreground">
				Glosario
			</h2>
			<dl className="mt-4 space-y-3">
				{terms.map(({ term, definition }) => (
					<div key={term}>
						<dt className="font-semibold text-foreground">{term}</dt>
						<dd className="text-sm text-foreground/80">{definition}</dd>
					</div>
				))}
			</dl>
		</section>
	)
}
