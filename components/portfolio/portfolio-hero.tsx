import { profile } from "@/lib/portfolio/profile"

export default function PortfolioHero() {
	return (
		<header className="mx-auto max-w-3xl px-5 pb-10 pt-14 sm:px-6 sm:pt-20">
			<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
				{profile.role}
			</p>
			<h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
				{profile.name}
			</h1>
			<p className="mt-4 text-lg leading-relaxed text-foreground/80">
				{profile.tagline}
			</p>
			<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
				{profile.bio}
			</p>

			<div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs tracking-wide text-muted-foreground">
				<span>{profile.location}</span>
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
			</div>
		</header>
	)
}
