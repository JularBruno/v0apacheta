/**
 * Static security rules for the public content surface (blog, herramientas, donaciones and the
 * components/lib behind them). Test-only: consumed by __tests__/content-security-guardrail.test.ts,
 * which also keeps the human-readable list in CLAUDE.md honest. Add a rule here, add a bad sample to
 * that test, and add a line to CLAUDE.md.
 */

export interface Violation {
	rule: string
	file: string
	detail: string
}

export interface SecurityRule {
	id: string
	description: string
	/** Returns one detail string per violation found in `source`. */
	check(source: string, file: string): string[]
}

const JSON_LD_FILE = "components/content/json-ld.tsx"
const isJsonLd = (file: string) => file.endsWith(JSON_LD_FILE)

/** `*.snippets.ts` holds code samples a post displays as text (via CodeBlock), never executes. */
const isSnippets = (file: string) => /\.snippets\.ts$/.test(file)

// A snippets file is only `export const NAME = \`...\`` declarations (plus comments). No imports, no calls,
// no `${}` interpolation: the strings are inert, so they may teach about fetch/eval/process.env safely.
const COMMENT = "(?:\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)"
const INERT_TEMPLATE = "`(?:[^`\\\\$]|\\\\[\\s\\S]|\\$(?!\\{))*`"
const SNIPPETS_FILE = new RegExp(
	`^(?:\\s*${COMMENT})*(?:\\s*export const [A-Za-z_][A-Za-z0-9_]* = ${INERT_TEMPLATE}(?:\\s*${COMMENT})*)*\\s*$`,
)

/** Every match of `pattern`, as a short excerpt. */
function matches(source: string, pattern: RegExp): string[] {
	const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`
	return [...source.matchAll(new RegExp(pattern.source, flags))].map((m) => m[0].trim().slice(0, 60))
}

export const SECURITY_RULES: SecurityRule[] = [
	{
		id: "no-raw-html",
		description: "No raw HTML injection (dangerouslySetInnerHTML, innerHTML, document.write). Only json-ld.tsx may inject, and only JSON.",
		check: (source, file) => {
			const pattern = isJsonLd(file)
				? /\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|document\.write\b/
				: /dangerouslySetInnerHTML|\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|document\.write\b/
			return matches(source, pattern)
		},
	},
	{
		id: "no-inline-script",
		description: "No <script> tags in pages or components, except the JSON-LD one in json-ld.tsx.",
		check: (source, file) => (isJsonLd(file) ? [] : matches(source, /<script\b/)),
	},
	{
		id: "json-ld-is-escaped",
		description: "json-ld.tsx must serialize through serializeJsonLd (escapes `<` so content can't close the script tag).",
		check: (source, file) =>
			isJsonLd(file) && !source.includes("serializeJsonLd") ? ["json-ld.tsx does not use serializeJsonLd"] : [],
	},
	{
		id: "no-dynamic-code",
		description: "No eval() or new Function().",
		check: (source) => matches(source, /\beval\s*\(|\bnew\s+Function\s*\(/),
	},
	{
		id: "external-links-noopener",
		description: 'Every target="_blank" link carries rel="noopener noreferrer".',
		check: (source) => {
			const found: string[] = []
			for (const m of source.matchAll(/target\s*=\s*\{?\s*["']_blank["']/g)) {
				const at = m.index ?? 0
				const around = source.slice(Math.max(0, at - 300), at + 300)
				if (!/noopener/.test(around)) found.push(`target="_blank" without noopener near offset ${at}`)
			}
			return found
		},
	},
	{
		id: "no-insecure-urls",
		description: "No http:// URLs (localhost excepted). Links and sources are https.",
		check: (source) => matches(source, /["'`]http:\/\/(?!localhost|127\.0\.0\.1)[^\s"'`]*/),
	},
	{
		id: "no-dangerous-schemes",
		description: "No javascript:, vbscript: or data:text/html URLs.",
		check: (source) => matches(source, /javascript:|vbscript:|data:text\/html/i),
	},
	{
		id: "no-auth-or-server-code",
		description: "Public pages never import auth, server actions, HTTP clients or dashboard code, and never declare 'use server'.",
		check: (source) => [
			...matches(
				source,
				/from\s+["'](?:@\/auth|next-auth|@auth\/|@\/lib\/actions|@\/lib\/http|@\/app\/dashboard|@\/components\/(?:dashboard|auth|app-sidebar)|@\/lib\/hooks\/use-(?:logout|profile))[^"']*["']/,
			),
			...matches(source, /^\s*["']use server["']/m),
		],
	},
	{
		id: "no-env-access",
		description: "No process.env in the public content surface (no secrets reachable from content pages).",
		check: (source) => matches(source, /process\.env\b/),
	},
	{
		id: "no-iframes",
		description: "No <iframe>. Add a sandbox plus an origin allowlist before enabling embeds.",
		check: (source) => matches(source, /<iframe\b/i),
	},
	{
		id: "snippets-are-inert",
		description:
			"*.snippets.ts files contain only `export const NAME = \\`...\\`` strings (no imports, calls or ${} interpolation). They are exempt from the prose-style rules above, but still checked for insecure and dangerous URLs.",
		check: (source, file) =>
			isSnippets(file) && !SNIPPETS_FILE.test(source)
				? ["snippets file has something other than plain `export const NAME = \\`...\\`` strings"]
				: [],
	},
	{
		id: "no-runtime-fetch",
		description: "Posts and shared components fetch nothing at runtime (static pages). Tool widgets under app/herramientas may.",
		check: (source, file) =>
			file.startsWith("app/herramientas/")
				? []
				: matches(source, /\bfetch\s*\(|\baxios\b|XMLHttpRequest|\buseSWR\b|\buseQuery\b/),
	},
]

/** Rules look at code, not prose: drop block comments and whole-line/trailing `//` comments (never the `//` in a URL). */
function stripComments(source: string): string {
	return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1")
}

// Rules that still apply to a snippets file. The rest describe code, and a snippets file holds only text.
const SNIPPET_RULES = new Set(["snippets-are-inert", "no-insecure-urls", "no-dangerous-schemes"])

export function scanSource(file: string, source: string): Violation[] {
	const snippets = isSnippets(file)
	// `//` and `/* */` are ordinary text inside a snippet string, so never strip them there.
	const code = snippets ? source : stripComments(source)
	return SECURITY_RULES.filter((rule) => !snippets || SNIPPET_RULES.has(rule.id)).flatMap((rule) =>
		rule.check(code, file).map((detail) => ({ rule: rule.id, file, detail })),
	)
}
