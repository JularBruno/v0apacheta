export default function Summary({ text }: { text: string }) {
	return (
		<section aria-labelledby="resumen-heading" className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
			<h2 id="resumen-heading" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
				En resumen
			</h2>
			<p className="mt-2 text-lg leading-relaxed text-foreground">{text}</p>
		</section>
	)
}
