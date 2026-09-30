// Code samples shown by page.tsx as text. Only plain template strings are allowed in this file
// (enforced by __tests__/content-security-guardrail.test.ts): no imports, calls or interpolation.

export const MANIFEST = `import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Mi App",
		short_name: "Mi App",
		description: "Qué hace tu app en una frase",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#ffffff",
		icons: [
			{ src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
			{ src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
		],
	}
}`

export const OFFLINE_PAGE = `export default function OfflinePage() {
	return <p>Estás sin conexión. Volvé a intentar cuando tengas internet.</p>
}`

export const SERVICE_WORKER = `const CACHE = "mi-app-v1"
const OFFLINE_URL = "/offline"

// Al instalarse, guarda la página de "sin conexión".
self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)))
	self.skipWaiting()
})

// Al activarse, borra cachés de versiones anteriores y toma el control de las pestañas abiertas.
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
			.then(() => self.clients.claim()),
	)
})

// Si falla la red al navegar, muestra la página de "sin conexión".
self.addEventListener("fetch", (event) => {
	if (event.request.mode !== "navigate") return
	event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)))
})`

export const REGISTER = `"use client"

import { useEffect } from "react"

export function RegisterServiceWorker() {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
		}
	}, [])

	return null
}`

export const LAYOUT = `import { RegisterServiceWorker } from "@/components/register-service-worker"

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="es">
			<body>
				<RegisterServiceWorker />
				{children}
			</body>
		</html>
	)
}`

export const HEADERS = `/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: "/sw.js",
				headers: [
					{ key: "Content-Type", value: "application/javascript; charset=utf-8" },
					{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
					{ key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
				],
			},
		]
	},
}

export default nextConfig`

export const IOS_METADATA = `import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
	appleWebApp: { capable: true, title: "Mi App", statusBarStyle: "black-translucent" },
	icons: { apple: "/apple-touch-icon.png" },
}

export const viewport: Viewport = {
	themeColor: "#ffffff",
}`
