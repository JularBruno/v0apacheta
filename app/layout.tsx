import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
	themeColor: '#1a1a1a',
}

export const metadata: Metadata = {
	title: 'Apacheta',
	description: 'Tu guía financiera personal',
	manifest: '/manifest.webmanifest',
	appleWebApp: {
		capable: true,
		title: 'Apacheta',
		statusBarStyle: 'black-translucent',
	},
	icons: {
		icon: '/iconwbg-192x192.png',
		apple: '/iconwbg-192x192.png',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
