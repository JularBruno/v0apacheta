import fs from "fs"
import path from "path"
import { SECURITY_RULES, scanSource, type Violation } from "@/lib/content/__fixtures__/security-rules"

const ROOT = path.resolve(__dirname, "..")

// The public, unauthenticated content surface. Dashboard code is out of scope.
const SURFACE = [
	"app/blog",
	"app/herramientas",
	"app/donaciones",
	"components/content",
	"components/donations/public-donations.tsx",
	"lib/content",
]
const SKIP_DIRS = new Set(["__tests__", "__fixtures__", "node_modules"])

function listFiles(rel: string): string[] {
	const abs = path.join(ROOT, rel)
	if (!fs.existsSync(abs)) return []
	if (fs.statSync(abs).isFile()) return [rel]
	return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) ? [] : listFiles(path.join(rel, entry.name))
		return /\.(ts|tsx)$/.test(entry.name) ? [path.join(rel, entry.name)] : []
	})
}

const ids = (violations: Violation[]) => violations.map((v) => v.rule)

describe("security rules flag what they should (each rule has teeth)", () => {
	const JSON_LD = "components/content/json-ld.tsx"
	const PAGE = "app/blog/un-post/page.tsx"
	const cases: { rule: string; bad: [string, string]; good?: [string, string] }[] = [
		{
			rule: "no-raw-html",
			bad: [PAGE, `<div dangerouslySetInnerHTML={{ __html: body }} />`],
			good: [JSON_LD, `import { serializeJsonLd } from "x"\n<script dangerouslySetInnerHTML={{ __html: serializeJsonLd(d) }} />`],
		},
		{ rule: "no-raw-html", bad: [PAGE, `el.innerHTML = body`] },
		{ rule: "no-inline-script", bad: [PAGE, `<script>alert(1)</script>`], good: [JSON_LD, `<script type="application/ld+json" />`] },
		{ rule: "no-dynamic-code", bad: [PAGE, `eval("1+1")`] },
		{ rule: "no-dynamic-code", bad: [PAGE, `new Function("return 1")()`] },
		{
			rule: "external-links-noopener",
			bad: [PAGE, `<a href="https://x.com" target="_blank">x</a>`],
			good: [PAGE, `<a href="https://x.com" target="_blank" rel="noopener noreferrer">x</a>`],
		},
		{
			rule: "no-insecure-urls",
			bad: [PAGE, `<a href="http://example.com">x</a>`],
			good: [PAGE, `<a href="https://example.com">x</a>`],
		},
		{ rule: "no-dangerous-schemes", bad: [PAGE, `<a href="javascript:alert(1)">x</a>`] },
		{ rule: "no-auth-or-server-code", bad: [PAGE, `import { auth } from "@/auth"`] },
		{ rule: "no-auth-or-server-code", bad: [PAGE, `import { getUser } from "@/lib/actions/user"`] },
		{ rule: "no-auth-or-server-code", bad: [PAGE, `"use server"\nexport async function go() {}`] },
		{ rule: "no-env-access", bad: [PAGE, `const key = process.env.SECRET`] },
		{ rule: "no-iframes", bad: [PAGE, `<iframe src="https://www.youtube.com/embed/x" />`] },
		{
			rule: "no-runtime-fetch",
			bad: [PAGE, `const r = await fetch("/api/x")`],
			good: ["app/herramientas/dolar/widget.tsx", `const r = await fetch("https://api.example.com/rate")`],
		},
		{ rule: "json-ld-is-escaped", bad: [JSON_LD, `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />`] },
	]

	for (const { rule, bad, good } of cases) {
		test(`${rule}: flags ${JSON.stringify(bad[1]).slice(0, 50)}`, () => {
			expect(ids(scanSource(bad[0], bad[1]))).toContain(rule)
		})
		if (good) {
			test(`${rule}: allows ${JSON.stringify(good[1]).slice(0, 50)}`, () => {
				expect(ids(scanSource(good[0], good[1]))).not.toContain(rule)
			})
		}
	}

	test("ignores mentions inside comments but still sees https:// urls as code", () => {
		const commented = `/** renders <script> and calls eval( and fetch( */\n// process.env and <iframe>\n{/* <script> */}\nconst a = 1`
		expect(scanSource(PAGE, commented)).toEqual([])
		expect(ids(scanSource(PAGE, `const u = "http://example.com" // https://ok.com`))).toContain("no-insecure-urls")
	})

	test("every rule in the list is exercised above", () => {
		const covered = new Set(cases.map((c) => c.rule))
		expect(SECURITY_RULES.map((r) => r.id).filter((id) => !covered.has(id))).toEqual([])
	})
})

describe("the public content surface", () => {
	const files = SURFACE.flatMap(listFiles)

	test("the scan actually finds files", () => {
		expect(files.length).toBeGreaterThan(20)
		expect(files).toContain("components/content/content-shell.tsx")
		expect(files).toContain("components/donations/public-donations.tsx")
	})

	test("has no security-rule violations", () => {
		const violations = files.flatMap((file) =>
			scanSource(file, fs.readFileSync(path.join(ROOT, file), "utf8")).map((v) => `${v.file}: [${v.rule}] ${v.detail}`),
		)
		expect(violations).toEqual([])
	})
})
