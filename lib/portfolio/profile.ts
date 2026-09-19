/**
 * Portfolio profile content. Taken from the English CV (Bruno_Jular_SrFullStack_Resume)
 * as-is, to be improved later. Project cards/case studies (lib/portfolio/projects.ts)
 * are still Spanish and get translated separately.
 */

export interface ExperienceEntry {
	readonly org: string
	readonly role?: string
	readonly period: string
	readonly bullets: readonly string[]
}

export const profile = {
	name: "Bruno Jular",
	role: "Sr. Full-Stack Engineer | React, TypeScript, Node.js, Cloud Architecture",
	// Used as the page meta description (app/brunojular/layout.tsx)
	tagline:
		"Sr. Full-Stack Engineer with 7+ years designing and building production-scale systems and APIs across frontend and backend architecture, from design through deployment.",
	location: "Córdoba, Argentina",
	links: [
		{ label: "LinkedIn", href: "https://www.linkedin.com/in/brunojular" },
		{ label: "GitHub", href: "https://github.com/JularBruno" },
		// Email is rendered as a copy-to-clipboard button (see CopyEmailButton), not a mailto link.
		{ label: "Email", href: "mailto:brunojular00@gmail.com" },
		{ label: "WhatsApp", href: "https://wa.me/5493512613917" },
	],

	/** CV "Summary" */
	about: [
		"Sr. Full-Stack Engineer with 7+ years designing and building production-scale systems and APIs across frontend and backend architecture, from design through deployment. Daily driver in TypeScript across React, Angular, Node.js, and NestJS, with strong SQL/NoSQL experience, CI/CD, and cloud infrastructure (AWS, GCP, Azure, Docker, Kubernetes) as standard practice. Led technical architecture and a 5-year product roadmap as Partner & Tech Lead at CyberPsi, and mentors developers through code review, working closely with product and design. Also completed Cyfrin Academy's Solidity, Foundry, and EVM curriculum, covering Web3, DeFi protocols, wallet integration, and tokenized assets (ERC-20/721). Fluent (C1) English communicator.",
	],

	/** CV "Skills", grouped by area (same items as the CV's flat list) */
	skills: [
		{
			category: "Frontend & Mobile",
			items: ["React", "Next.js", "Angular", "Ionic", "TypeScript", "HTML", "CSS", "Tailwind", "Bootstrap", "UI/UX Design", "TanStack Query", "Zod"],
		},
		{
			category: "Backend",
			items: ["Node.js", "NestJS", "Express", "Microservices", "ORM tools", "Mongoose", "Python", "Django", ".NET", "C#"],
		},
		{
			category: "Databases",
			items: ["PostgreSQL", "MySQL", "SQL", "MongoDB", "PL/SQL", "SQLite", "Firebase Firestore", "Firebase Realtime Database"],
		},
		{
			category: "Cloud & DevOps",
			items: ["AWS", "Google Cloud Platform (GCP)", "Microsoft Azure", "Cloud services", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Cloudflare", "Vercel"],
		},
		{
			category: "Testing & Tools",
			items: ["Jest", "React Testing Library", "Cypress", "TDD", "Git", "Jira", "Azure DevOps", "Trello", "Slack", "Agile", "Scrum"],
		},
		{
			category: "AI-Native Development",
			items: ["Claude Code"],
		},
		{
			category: "Web3",
			items: ["Web3", "Solidity", "Foundry", "EVM", "Chainlink", "Ethers.js", "ERC-20", "ERC-721", "Wallet integration", "DeFi"],
		},
	],

	/** CV "Courses & Additional Training" */
	courses:
		"Oratoria para Inconformistas (Spanish-language public speaking and storytelling course) and Ecodiem Marketing (digital acquisition strategy). Also completed Cyfrin Academy's Solidity, Foundry, and EVM curriculum.",

	/** CV "Experience" */
	experience: [
		{
			org: "CRAFTLabs",
			role: "Full-Stack Engineer",
			period: "Oct 2022 - Oct 2024",
			bullets: [
				"Delivered 3 of 5+ projects on a 3-person team in a regulated healthcare domain, including 2 full-stack builds (Angular, .NET).",
				"Built and tested features across Angular frontends and .NET APIs; owned PL/SQL reporting logic for automated document generation.",
				"Served as direct English-speaking point of contact for a Philadelphia-based lab client, weekly.",
			],
		},
		{
			org: "VOLT Motors",
			role: "Full-Stack Developer",
			period: "Feb 2020 - Jan 2021",
			bullets: [
				"Built embedded Android interfaces and a Flutter remote-control app for an electric-vehicle software ecosystem.",
				"Designed GCP backend services with Firebase Realtime Database for real-time vehicle location and telemetry.",
				"Built corporate web platform (React + Django) enabling non-technical content updates.",
			],
		},
		{
			org: "Diproach",
			role: "Full-Stack Developer",
			period: "Jul 2019 - Feb 2020",
			bullets: [
				"Owned full development cycle for web/mobile apps (Angular, Ionic): requirements, mockups, database/API design, frontend, deployment, while leadership focused on client acquisition.",
			],
		},
	] satisfies ExperienceEntry[],

	/** CV "Founder & Independent Work" */
	founderWorkPeriod: "Jan 2021 - Present | Argentina",
	founderWork: [
		{
			org: "CyberPsi",
			role: "Partner & Tech Lead",
			period: "Feb 2021 - Feb 2026",
			bullets: [
				"Led backend architecture (Node.js, Express, Angular, MongoDB/Mongoose, Docker, AWS, Kubernetes) for a B2B platform digitizing psychological care; owned the 5-year technical roadmap and led the 2026 relaunch evaluation with an expanded dev team.",
			],
		},
		{
			org: "Apacheta",
			period: "Oct 2024 - Present",
			bullets: [
				"Built a personal finance app (Next.js, NestJS, PostgreSQL) from concept to near-launch; reached 5 daily active users, testing monetization strategies.",
			],
		},
		{
			org: "Freelance Development",
			period: "Jan 2021 - Oct 2022",
			bullets: [
				"Delivered mobile (Ionic) and web (Angular, Node.js/Express) applications for 12+ clients end to end, including Arcoíris, a solo-built financial literacy app.",
			],
		},
	] satisfies ExperienceEntry[],
	linkedInExperienceHref: "https://www.linkedin.com/in/brunojular/details/experience/",

	/** CV "Education" */
	education: ["Programming Technician Degree, ITS Villada | 2011 - 2018"],
	languages: "Spanish (Native) | English (C1, fluent)",
} as const
