import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-sans',
})

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
		icon: '/logo.svg',
		apple: '/iconwbg-192x192.png',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className={manrope.variable}>
			<body>{children}</body>
		</html>
	)
}
