import Link from "next/link"
import type { Metadata } from "next"
import { profile } from "@/lib/portfolio/profile"

export const metadata: Metadata = {
	title: {
		default: `${profile.name} — Portfolio`,
		template: `%s — ${profile.name}`,
	},
	description: profile.tagline,
}

export default function PortfolioLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
				<div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5 sm:px-6">
					<Link
						href="/portfolio"
						className="text-sm font-extrabold tracking-tight text-foreground"
					>
						{profile.name}
					</Link>
					<a
						href={
							profile.links.find((l) => l.href.startsWith("mailto:"))?.href ??
							"/portfolio"
						}
						className="font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
					>
						Contacto
					</a>
				</div>
			</header>
			{children}
			<footer className="mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border px-5 pb-12 pt-6 font-mono text-xs tracking-wide text-muted-foreground sm:px-6">
				<span>
					{profile.name} · {profile.location}
				</span>
				<span className="flex gap-4">
					{profile.links.map((link) => (
						<a
							key={link.label}
							href={link.href}
							target={link.href.startsWith("http") ? "_blank" : undefined}
							rel={link.href.startsWith("http") ? "noreferrer" : undefined}
							className="transition-colors hover:text-foreground"
						>
							{link.label}
						</a>
					))}
				</span>
			</footer>
		</div>
	)
}
