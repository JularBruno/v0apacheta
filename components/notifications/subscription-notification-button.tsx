"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Loading } from "../ui/loading"
import { useSubscriptionNotifications, useSubscribe, useUnsubscribe } from "@/lib/hooks/use-subscription-notification"

export default function SubscriptionButtonNotification() {

	const [isSupported, setIsSupported] = useState(false)
	const [isRegistered, setIsRegistered] = useState(false)
	const [subscription, setSubscription] = useState<PushSubscription | null>(null)

	const { data: userSubscriptions, isLoading: isLoadingSubscriptions } = useSubscriptionNotifications()
	const subscribeMutation = useSubscribe()
	const unsubscribeMutation = useUnsubscribe()

	const isBusy = isLoadingSubscriptions || subscribeMutation.isPending || unsubscribeMutation.isPending

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
			if (!('serviceWorker' in navigator && 'PushManager' in window)) {
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
		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
		})

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

		await unsubscribeMutation.mutateAsync(subscription.endpoint)
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
			toast({ title: "Bloqueadas", description: "Habilítalas desde la configuración del navegador.", variant: "destructive" })
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

	return (
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
					{isRegistered ? 'Desactivar notificaciones' : 'Activar notificaciones'}
				</>
			)}
		</Button>
	)
}
