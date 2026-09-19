import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: ['/', '/brunojular', '/brunojular/*', '/blog', '/blog/*'],
			disallow: [
				'/dashboard',
				'/dashboard/*',
				'/api',
				'/api/*',
				'/login',
				'/onboarding',
				'/recover-password',
				'/reset-password',
			],
		},
		sitemap: 'https://apacheta.ar/sitemap.xml',
	}
}
