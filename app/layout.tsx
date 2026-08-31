import type { Metadata, Viewport } from 'next'
import { Manrope, DM_Mono } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-sans',
})

const dmMono = DM_Mono({
	subsets: ['latin'],
	weight: ['400', '500'],
	display: 'swap',
	variable: '--font-mono',
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
		<html lang="es" className={`${manrope.variable} ${dmMono.variable}`}>
			<body>{children}</body>
		</html>
	)
}
