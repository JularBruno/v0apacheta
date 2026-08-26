import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Apacheta',
		short_name: 'Apacheta',
		description: 'Tu guía financiera personal',
		start_url: '/dashboard/mapa',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#ffffff',
		icons: [
			{
				src: '/iconwbg-192x192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/iconwbg-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any',
			},
		],
	}
}