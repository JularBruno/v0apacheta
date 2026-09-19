import type { MetadataRoute } from 'next'
import { projects } from '@/lib/portfolio/projects'

const siteUrl = 'https://apacheta.ar'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: siteUrl,
			changeFrequency: 'monthly',
			priority: 1,
		},
		{
			url: `${siteUrl}/brunojular`,
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		...projects
			.filter((project) => !project.href)
			.map((project) => ({
				url: `${siteUrl}/brunojular/${project.slug}`,
				changeFrequency: 'yearly' as const,
				priority: 0.5,
			})),
	]
}
