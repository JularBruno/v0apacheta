import type { MetadataRoute } from 'next'
import { entries } from '@/lib/content/registry'
import { SITE_URL, contentUrl } from '@/lib/content/urls'
import { projects } from '@/lib/portfolio/projects'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: SITE_URL,
			changeFrequency: 'monthly',
			priority: 1,
		},
		{
			url: `${SITE_URL}/brunojular`,
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		...projects
			.filter((project) => !project.href)
			.map((project) => ({
				url: `${SITE_URL}/brunojular/${project.slug}`,
				changeFrequency: 'yearly' as const,
				priority: 0.5,
			})),
		{
			url: `${SITE_URL}/blog`,
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/herramientas`,
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/donaciones`,
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
