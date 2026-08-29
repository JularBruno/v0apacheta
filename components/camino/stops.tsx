import Link from "next/link"
import CairnIcon from "@/components/trail-map/cairn-icon"
import type { Chapter } from "@/lib/trail/chapters"
import { CLOSING, HERO } from "@/lib/trail/chapters"

function ArrowRight({ className }: { className?: string }) {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className} aria-hidden>
			<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
		</svg>
	)
}

const stopClass =
	"flex min-h-[56vh] flex-col justify-center px-5 py-16 sm:px-8 md:min-h-screen md:px-12 md:py-24 lg:px-16"

function CtaButton({ children, large }: { children: React.ReactNode; large?: boolean }) {
	return (
		<Link
			href="/onboarding"
			className={`inline-flex items-center gap-2 rounded-lg bg-foreground font-semibold text-background transition-opacity hover:opacity-90 ${
				large ? "px-6 py-3.5 text-base" : "px-6 py-3 text-sm"
			}`}
		>
			{children}
			<ArrowRight />
		</Link>
	)
}

function ProgressDots({ current }: { current: number }) {
	return (
		<div className="mt-8 flex items-center gap-1.5" aria-hidden>
			{[1, 2, 3, 4, 5].map((n) => (
				<span
					key={n}
					className="h-1.5 rounded-full transition-all duration-300"
					style={{
						width: n === current ? 20 : 6,
						backgroundColor: n <= current ? "hsl(var(--primary))" : "hsl(var(--border))",
					}}
				/>
			))}
		</div>
	)
}

export function HeroStop() {
	const [line1, line2] = HERO.title.split("\n")
	return (
		<div className={stopClass}>
			<div className="max-w-md">
				<span className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
					<span aria-hidden>🇦🇷</span> {HERO.badge}
				</span>
				<h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
					{line1}
					<br />
					<span className="text-primary">{line2}</span>
				</h1>
				<p className="mb-8 text-base leading-relaxed text-muted-foreground">{HERO.tagline}</p>
				<div className="mb-10">
					<CtaButton>{HERO.cta}</CtaButton>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce" aria-hidden>
						<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
					</svg>
					<span>{HERO.scrollHint}</span>
				</div>
			</div>
		</div>
	)
}

export function ChapterStop({ chapter, index }: { chapter: Chapter; index: number }) {
	const { locked } = chapter
	return (
		<div className={stopClass}>
			<div className="max-w-md">
				{locked && (
					<span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
						<span aria-hidden>🔒</span> Próximamente
					</span>
				)}
				<p
					className={`mb-3 text-xs font-bold uppercase tracking-widest ${
						locked ? "text-muted-foreground/70" : "text-primary"
					}`}
				>
					{chapter.chapter}
				</p>
				<h2
					className={`mb-5 whitespace-pre-line text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl ${
						locked ? "text-muted-foreground" : "text-foreground"
					}`}
				>
					{chapter.title}
				</h2>
				<p
					className={`mb-4 text-lg font-medium leading-snug ${
						locked ? "text-muted-foreground/80" : "text-primary"
					}`}
				>
					{chapter.tagline}
				</p>
				<p className="text-base leading-relaxed text-muted-foreground">{chapter.desc}</p>
				{!locked && <ProgressDots current={index + 1} />}
			</div>
		</div>
	)
}

export function ClosingStop() {
	return (
		<div className={stopClass}>
			<div className="max-w-md">
				<span className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
					<CairnIcon size={24} color="hsl(var(--primary-foreground))" />
				</span>
				<h2 className="mb-4 text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
					Tu camino
					<br />
					<span className="text-primary">empieza acá.</span>
				</h2>
				<div className="mb-8 rounded-xl border border-border bg-secondary p-5">
					<p className="mb-1 text-sm font-medium text-foreground">{CLOSING.kicker}</p>
					<p className="text-sm text-muted-foreground">{CLOSING.line}</p>
				</div>
				<CtaButton large>{CLOSING.cta}</CtaButton>
			</div>
		</div>
	)
}
