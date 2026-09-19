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

const siteUrl = 'https://apacheta.ar'
const title = 'Apacheta Tu guía financiera personal'
const description =
	'Seguí el camino para salir de deudas, ahorrar más y construir patrimonio. Educación financiera hecha para Argentina.'

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title,
	description,
	manifest: '/manifest.webmanifest',
	appleWebApp: {
		capable: true,
		title: 'Apacheta',
		statusBarStyle: 'black-translucent',
	},
	icons: {
		icon: [
			{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
			{ url: '/logo.svg', type: 'image/svg+xml' },
		],
		apple: '/apple-touch-icon.png',
	},
	openGraph: {
		type: 'website',
		url: siteUrl,
		siteName: 'Apacheta',
		title,
		description,
		locale: 'es_AR',
	},
	twitter: {
		card: 'summary_large_image',
		title,
		description,
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
