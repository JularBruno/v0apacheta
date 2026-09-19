import Link from "next/link"
import type { Metadata } from "next"
import { profile } from "@/lib/portfolio/profile"
import CopyEmailButton from "@/components/portfolio/copy-email-button"

export const metadata: Metadata = {
	title: {
		default: `${profile.name} Portfolio`,
		template: `%s ${profile.name}`,
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
						href="/brunojular"
						className="text-sm font-extrabold tracking-tight text-foreground"
					>
						{profile.name}
					</Link>
					{/* Jumps to the hero's link row (LinkedIn/GitHub/Email/WhatsApp) instead of
					    forcing straight into a mailto, let the visitor pick the channel. */}
					<Link
						href="/brunojular#contacto"
						className="font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
					>
						Contact
					</Link>
				</div>
			</header>
			{children}
			<footer className="mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border px-5 pb-12 pt-6 font-mono text-xs tracking-wide text-muted-foreground sm:px-6">
				<span>
					{profile.name} · {profile.location}
				</span>
				<span className="flex gap-4">
					{profile.links.map((link) =>
						link.label === "Email" ? (
							<CopyEmailButton key={link.label} email={link.href.replace(/^mailto:/, "")} variant="text" />
						) : (
							<a
								key={link.label}
								href={link.href}
								target={link.href.startsWith("http") ? "_blank" : undefined}
								rel={link.href.startsWith("http") ? "noreferrer" : undefined}
								className="transition-colors hover:text-foreground"
							>
								{link.label}
							</a>
						),
					)}
				</span>
			</footer>
		</div>
	)
}
