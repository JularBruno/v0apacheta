"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Loading } from "../ui/loading"
import { useSubscriptionNotifications, useSubscribe, useUnsubscribe, useUnsubscribeAll } from "@/lib/hooks/use-subscription-notification"
import { InstallAppButton } from "@/components/pwa/install-app-button"
import { isIOS, isStandalone } from "@/lib/pwa/install-state"

/**
 * Why push can't be turned on here, shown on the card itself (a toast is gone
 * before anyone reads it). iOS only allows push in the installed app.
 */
type Blocker = "ios-not-installed" | "unsupported" | "denied" | null

function detectBlocker(): Blocker {
	if (isIOS() && !isStandalone()) return "ios-not-installed"
	if (!("serviceWorker" in navigator && "PushManager" in window && "Notification" in window)) return "unsupported"
	if (Notification.permission === "denied") return "denied"
	return null
}

export default function SubscriptionButtonNotification() {

	const [isSupported, setIsSupported] = useState(false)
	const [blocker, setBlocker] = useState<Blocker>(null)
	// true once we know whether this browser has a push subscription; until then
	// its own row in the API would look like "another device"
	const [browserChecked, setBrowserChecked] = useState(false)
	const [isRegistered, setIsRegistered] = useState(false)
	const [subscription, setSubscription] = useState<PushSubscription | null>(null)

	const { data: userSubscriptions, isLoading: isLoadingSubscriptions, isError: subscriptionsFailed, isFetching: refetchingSubscriptions, refetch: refetchSubscriptions } = useSubscriptionNotifications()
	const subscribeMutation = useSubscribe()
	const unsubscribeMutation = useUnsubscribe()
	const unsubscribeAllMutation = useUnsubscribeAll()

	const isBusy = isLoadingSubscriptions || subscribeMutation.isPending || unsubscribeMutation.isPending || unsubscribeAllMutation.isPending
	// the user's devices other than this browser (a phone, another computer); 0 until
	// this browser's own subscription is known, so it never counts itself
	const otherDevices = browserChecked
		? (userSubscriptions ?? []).filter((s) => s.endpoint !== subscription?.endpoint).length
		: 0

	function urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
		const rawData = window.atob(base64)
		const outputArray = new Uint8Array(rawData.length)
		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i)
		}
		return outputArray
	}

	async function registerServiceWorker() {
		const registration = await navigator.serviceWorker.register('/sw.js', {
			scope: '/',
			updateViaCache: 'none',
		})
		return registration.pushManager.getSubscription()
	}

	// On mount: get browser subscription and compare against DB subscriptions
	useEffect(() => {
		let mounted = true

		const init = async () => {
			const found = detectBlocker()
			setBlocker(found)
			if (found === "ios-not-installed" || found === "unsupported") {
				setIsSupported(false)
				return
			}
			setIsSupported(true)

			try {
				const sub = await registerServiceWorker()
				if (!mounted) return
				setSubscription(sub)
			} catch (error) {
				console.error('Service worker init failed:', error)
			} finally {
				if (mounted) setBrowserChecked(true)
			}
		}

		init()
		return () => { mounted = false }
	}, [])

	// Derive isRegistered from browser subscription + DB subscriptions
	useEffect(() => {
		if (!subscription || !userSubscriptions) return
		setIsRegistered(userSubscriptions.some(s => s.endpoint === subscription.endpoint))
	}, [subscription, userSubscriptions])

	async function subscribeToPush() {
		const registration = await navigator.serviceWorker.ready
		const options = {
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
		}
		let sub: PushSubscription
		try {
			sub = await registration.pushManager.subscribe(options)
		} catch (error) {
			// A subscription made with another VAPID key (an old deploy) blocks a new
			// one: drop it and subscribe again, once.
			if ((error as Error)?.name !== 'InvalidStateError') throw error
			const stale = await registration.pushManager.getSubscription()
			await stale?.unsubscribe()
			// drop its row too, so the server doesn't keep pushing to a dead endpoint
			if (stale) unsubscribeMutation.mutateAsync(stale.endpoint).catch(() => undefined)
			sub = await registration.pushManager.subscribe(options)
		}

		const subJSON = sub.toJSON()
		await subscribeMutation.mutateAsync({
			endpoint: subJSON.endpoint || '',
			p256dh: subJSON.keys?.p256dh || '',
			auth: subJSON.keys?.auth || '',
		})

		setSubscription(sub)
		setIsRegistered(true)
	}

	async function unsubscribeFromPush() {
		if (!subscription) return

		// API first: if it fails, keep the browser subscribed so both sides agree
		try {
			await unsubscribeMutation.mutateAsync(subscription.endpoint)
		} catch (error) {
			console.error('Unsubscribe failed:', error)
			toast({ title: "Error", description: "No se pudieron desactivar las notificaciones. Probá de nuevo.", variant: "destructive" })
			return
		}
		await subscription.unsubscribe()

		setSubscription(null)
		setIsRegistered(false)

		toast({
			title: "Notificaciones Desactivadas",
			description: "Activalas para recibir nuevamente notificaciones.",
		})
	}

	const requestNotificationPermission = async () => {
		if (!("Notification" in window)) {
			toast({ title: "No soportado", description: "Tu navegador no soporta notificaciones.", variant: "destructive" })
			return
		}

		if (Notification.permission === "denied") {
			setBlocker("denied")
			return
		}

		if (Notification.permission === "granted") {
			if (!isRegistered) {
				try {
					await subscribeToPush()
					toast({ title: "Notificaciones activadas", description: "Te recordaremos anotar tus gastos y cosas importantes." })
				} catch (error) {
					console.error('Subscribe failed:', error)
					toast({ title: "Error", description: "No se pudo activar las notificaciones.", variant: "destructive" })
				}
			} else {
				toast({ title: "Ya activadas", description: "Las notificaciones ya están habilitadas." })
			}
			return
		}

		const permission = await Notification.requestPermission()
		if (permission === "denied") setBlocker("denied")
		if (permission === "granted") {
			try {
				await subscribeToPush()
				toast({ title: "Notificaciones activadas", description: "Te recordaremos anotar tus gastos y cosas importantes." })
			} catch (error) {
				console.error('Subscribe failed:', error)
				toast({ title: "Error", description: "No se pudo activar las notificaciones.", variant: "destructive" })
			}
		}
	}

	const handleClick = async (e: React.MouseEvent) => {
		e.stopPropagation()
		try {
			if (isRegistered) {
				await unsubscribeFromPush()
			} else {
				await requestNotificationPermission()
			}
		} catch (error) {
			console.error('Notification toggle failed:', error)
		}
	}

	if (blocker === "ios-not-installed") {
		return (
			<div className="space-y-2">
				<p className="text-sm text-foreground/80">En iPhone, las notificaciones funcionan solo con la app instalada.</p>
				<InstallAppButton />
			</div>
		)
	}
	if (blocker === "unsupported") {
		return <p className="text-sm text-foreground/80">Tu navegador no permite notificaciones. Probá con Chrome, Edge o Firefox.</p>
	}
	if (blocker === "denied") {
		return <p className="text-sm text-foreground/80">Las bloqueaste: habilitalas en la configuración del navegador para este sitio y recargá la página.</p>
	}
	if (subscriptionsFailed) {
		return (
			<div className="space-y-2">
				<p className="text-sm text-foreground/80">No pudimos comprobar si las notificaciones están activas.</p>
				<Button variant="outline" className="w-full" disabled={refetchingSubscriptions} onClick={() => refetchSubscriptions()}>
					{refetchingSubscriptions ? <Loading /> : "Reintentar"}
				</Button>
			</div>
		)
	}

	async function unsubscribeEverywhere() {
		try {
			await unsubscribeAllMutation.mutateAsync()
		} catch {
			toast({ title: "Error", description: "No se pudieron desactivar las notificaciones. Probá de nuevo.", variant: "destructive" })
			return
		}
		await subscription?.unsubscribe()
		setSubscription(null)
		setIsRegistered(false)
		toast({ title: "Notificaciones desactivadas", description: "Ya no las vas a recibir en ningún dispositivo." })
	}

	return (
		<div className="space-y-2">
			{!isRegistered && otherDevices > 0 && (
				<p className="text-sm text-foreground/80">Ya las recibís en otro dispositivo.</p>
			)}
			<Button
				onClick={handleClick}
				disabled={isBusy || !isSupported}
				className="w-full gap-2"
			>
				{isBusy ? (
					<Loading />
				) : (
					<>
						{isRegistered ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
						{isRegistered
							? 'Desactivar notificaciones'
							: otherDevices > 0 ? 'Activar también en este dispositivo' : 'Activar notificaciones'}
					</>
				)}
			</Button>
			{otherDevices > 0 && (
				<Button
					variant="ghost"
					onClick={(e) => { e.stopPropagation(); void unsubscribeEverywhere() }}
					disabled={isBusy}
					className="w-full text-sm text-muted-foreground"
				>
					Desactivar en todos los dispositivos
				</Button>
			)}
		</div>
	)
}
