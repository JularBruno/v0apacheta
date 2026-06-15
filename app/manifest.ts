import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Apacheta',
		short_name: 'Apacheta',
		description: 'Tu guía financiera personal',
		start_url: '/dashboard/mapa',
		display: 'standalone',
		background_color: '#1a1a1a',
		theme_color: '#1a1a1a',
		icons: [
			{
				// actual size: 192x192 ✓
				src: '/iconwbg-192x192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'any maskable',
			},
			{
				// TODO: regenerate as true 512x512 (currently 176x176)
				src: '/icon-512x512.png',
				sizes: '176x176',
				type: 'image/png',
			},
		],
	}
}