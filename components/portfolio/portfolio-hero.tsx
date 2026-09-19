import { Github, Linkedin, MessageCircle, type LucideIcon } from "lucide-react"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import CopyEmailButton from "@/components/portfolio/copy-email-button"
import { profile } from "@/lib/portfolio/profile"

const ICONS: Record<string, LucideIcon> = {
	LinkedIn: Linkedin,
	GitHub: Github,
	WhatsApp: MessageCircle,
}

// LinkedIn gets the prominent treatment; the rest stay one step quieter.
const PRIMARY_LABELS = new Set(["LinkedIn"])

// Avatar is commented out for now (photo lives at /photo-avatar.jpg, already
// cropped and compressed). To bring it back: uncomment the Avatar import above,
// this `initials` const, and the <Avatar> block in the JSX below.
// const initials = profile.name
// 	.split(" ")
// 	.map((part) => part[0])
// 	.join("")
// 	.slice(0, 2)
// 	.toUpperCase()

export default function PortfolioHero() {
	return (
		<header className="mx-auto max-w-3xl px-5 pb-10 pt-14 sm:px-6 sm:pt-20">
			{/* <Avatar className="mb-5 h-20 w-20 border border-border sm:h-24 sm:w-24">
				<AvatarImage src="/photo-avatar.jpg" alt={profile.name} className="object-cover" />
				<AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary sm:text-3xl">
					{initials}
				</AvatarFallback>
			</Avatar> */}

			<h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
				{profile.name}
			</h1>
			<p className="mt-2 text-base text-muted-foreground sm:text-lg">
				{profile.role}
			</p>

			<div id="contacto" className="mt-7 flex flex-wrap items-center gap-2.5 scroll-mt-24">
				{profile.links.map((link) => {
					if (link.label === "Email") {
						return <CopyEmailButton key={link.label} email={link.href.replace(/^mailto:/, "")} />
					}

					const Icon = ICONS[link.label]
					const primary = PRIMARY_LABELS.has(link.label)
					const external = link.href.startsWith("http")

					return (
						<a
							key={link.label}
							href={link.href}
							target={external ? "_blank" : undefined}
							rel={external ? "noreferrer" : undefined}
							className={cn(
								"inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
								primary
									? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
									: "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
							)}
						>
							{Icon && <Icon className="h-4 w-4" />}
							{link.label}
						</a>
					)
				})}
			</div>

			<p className="mt-5 font-mono text-xs tracking-wide text-muted-foreground">
				{profile.location}
			</p>
		</header>
	)
}
