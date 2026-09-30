import type { MetadataRoute } from 'next'
import { entries } from '@/lib/content/registry'
import { contentUrl } from '@/lib/content/urls'
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
		{
			url: `${siteUrl}/blog`,
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${siteUrl}/herramientas`,
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${siteUrl}/donaciones`,
			changeFrequency: 'monthly',
			priority: 0.4,
		},
		...entries.map((entry) => ({
			url: contentUrl(entry),
			lastModified: entry.updatedAt ?? entry.publishedAt,
			changeFrequency: 'monthly' as const,
			priority: entry.kind === 'tool' ? 0.8 : 0.6,
		})),
	]
}
