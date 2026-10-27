"use client"

import { useEffect } from "react"
import { startInstallListening } from "@/lib/pwa/install-state"

/**
 * Mounted once in the dashboard layout. Starts catching the browser's install
 * offer early, and registers the service worker so the app is installable
 * before anyone turns on notifications. Same script and options as
 * SubscriptionButtonNotification, so registering twice is a no-op.
 */
// Start at module load, not in the effect: on a repeat visit Chrome can offer
// the install before hydration finishes, and it won't offer again on that page.
startInstallListening()

export function InstallPromptListener() {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined)
		}
	}, [])
	return null
}
