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
		return [{ source: '/camino', destination: '/', permanent: true }]
	},
	// experimental: {
	// 	serverActions: true,
	// 	dynamicIO: true,
	// },
}

export default nextConfig;
