/**
 * A code sample shown as text. React escapes `code`, so markup in it never becomes elements.
 * Keep long samples in a `*.snippets.ts` file next to the page (see CLAUDE.md, security rules).
 */
export default function CodeBlock({
	code,
	language,
	filename,
}: {
	code: string
	language?: string
	filename?: string
}) {
	return (
		<figure className="overflow-hidden rounded-lg border border-border bg-muted/50">
			{filename && (
				<figcaption className="border-b border-border px-3 py-1.5 font-mono text-xs text-muted-foreground">{filename}</figcaption>
			)}
			<pre className="overflow-x-auto p-4 text-sm leading-relaxed">
				<code className={language ? `language-${language} font-mono` : "font-mono"}>{code}</code>
			</pre>
		</figure>
	)
}
