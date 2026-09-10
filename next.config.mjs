/** @type {import('next').NextConfig} */

const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	async redirects() {
		return [
			{ source: '/camino', destination: '/', permanent: true },
			{ source: '/portfolio', destination: '/brunojular', permanent: true },
			{ source: '/portfolio/:slug', destination: '/brunojular/:slug', permanent: true },
			{ source: '/jularbruno', destination: '/brunojular', permanent: true },
			{ source: '/jularbruno/:slug', destination: '/brunojular/:slug', permanent: true },
		]
	},
	// experimental: {
	// 	serverActions: true,
	// 	dynamicIO: true,
	// },
}

export default nextConfig;
