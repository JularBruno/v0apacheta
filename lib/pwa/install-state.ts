/**
 * Install-the-app state, shared by every InstallAppButton.
 *
 * Chrome fires `beforeinstallprompt` once per page load, often before the
 * button that needs it has mounted (someone opens Configuración first), so the
 * listener lives at module level and InstallPromptListener starts it from the
 * dashboard layout. iOS has no install API at all: there we can only show how
 * to do it by hand.
 */

export type InstallStatus = "installed" | "can-install" | "ios-safari" | "ios-other-browser" | "unsupported"

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

let deferred: BeforeInstallPromptEvent | null = null
let installed = false
let listening = false
const subscribers = new Set<() => void>()

const notify = () => subscribers.forEach((fn) => fn())

function onBeforeInstallPrompt(event: Event) {
	// Keep Chrome's own mini-infobar from showing; our button opens the dialog
	event.preventDefault()
	deferred = event as BeforeInstallPromptEvent
	notify()
}

function onAppInstalled() {
	installed = true
	deferred = null
	notify()
}

export function startInstallListening() {
	if (listening || typeof window === "undefined") return
	listening = true
	window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
	window.addEventListener("appinstalled", onAppInstalled)
}

export function subscribeInstallState(fn: () => void) {
	subscribers.add(fn)
	return () => {
		subscribers.delete(fn)
	}
}

function isStandalone() {
	return (
		window.matchMedia?.("(display-mode: standalone)").matches === true ||
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true
	)
}

function iosBrowser(): "ios-safari" | "ios-other-browser" | null {
	const ua = window.navigator.userAgent
	// iPadOS reports itself as a Mac; the touch screen gives it away
	const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && window.navigator.maxTouchPoints > 1)
	if (!isIOS) return null
	return /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua) ? "ios-other-browser" : "ios-safari"
}

export function getInstallStatus(): InstallStatus {
	if (typeof window === "undefined") return "unsupported"
	if (installed || isStandalone()) return "installed"
	if (deferred) return "can-install"
	return iosBrowser() ?? "unsupported"
}

/** Opens the browser's install dialog. Resolves true when the person accepts. */
export async function promptInstall(): Promise<boolean> {
	const event = deferred
	if (!event) return false
	// A prompt can only be used once; Chrome sends a new event if it offers again
	deferred = null
	try {
		await event.prompt()
		const { outcome } = await event.userChoice
		if (outcome === "accepted") installed = true
		return outcome === "accepted"
	} catch {
		return false
	} finally {
		notify()
	}
}

export function resetInstallStateForTests() {
	if (typeof window !== "undefined") {
		window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
		window.removeEventListener("appinstalled", onAppInstalled)
	}
	deferred = null
	installed = false
	listening = false
	subscribers.clear()
}
