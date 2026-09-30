export default function Toc({ items }: { items: { id: string; label: string }[] }) {
	return (
		<nav aria-label="Contenido del artículo" className="rounded-lg border border-border p-4">
			<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">En este artículo</p>
			<ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
				{items.map((item) => (
					<li key={item.id}>
						<a href={`#${item.id}`} className="text-primary hover:underline">
							{item.label}
						</a>
					</li>
				))}
			</ol>
		</nav>
	)
}
