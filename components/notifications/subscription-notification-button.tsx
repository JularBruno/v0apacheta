"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"

import { toast } from "@/hooks/use-toast"
import { getSubscriptionNotifications, postSubscriptionNotifications, deleteSubscriptionNotifications } from '@/lib/actions/notifications'
import { Subscription, Subscriptions } from '@/lib/schemas/subscriptionNotification'
import { Loading } from "../ui/loading"

{/** 
* SUPER COMPONENT FOR activating notifications and suscribing user to them 
* might be required to be differently on implementation, but an actual button to show on map and settings now work
* 
*/ }
export default function SubscriptionButtonNotification() {

	/**
	 * 
	 * NOTIFICATIONS
	 * 
	 */

	// Use this condition to let or not user activate notifications
	const [isSupported, setIsSupported] = useState(false)
	// IF DEVICE IS ALREADY REGISTERED AND ACTIVATED
	const [isRegistered, setIsRegistered] = useState(false)

	// This is like the actual Browser Subscription on current state
	const [subscription, setSubscription] = useState<PushSubscription | null>(null)

	// this is the user subscriptions from api
	const [userSubscriptions, setUserSubscriptions] = useState<Subscriptions[]>([])

	const [isNotificationsLoading, setIsNotificationsLoading] = useState(true)

	/**
	 * Required to suscribe applicationServerKey
	 */
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

	/**
	 * This is the only comment that should be writen READ THIS
	 * Get browser subscription and user subscriptions
	 * compare subscriptions for checking if enpoints match, then user is already suscribed
	 * mounted is because useffect runs twice or something
	 */
	async function initializeNotifications(mounted: boolean) {
		try {
			// Run both in parallel
			const [userSubscriptions, sub] = await Promise.all([
				getSubscriptionNotifications(), // get user subscriptions
				registerServiceWorker() // get browser subscription
			])

			// if first time useffect is used sinnce it runs 2
			if (mounted) {
				setUserSubscriptions(userSubscriptions) // set geted user already suscribed devices
				setSubscription(sub) // set the device information from registering service worker, with like endpoint and required things to save on db and use to send nots
				if (!userSubscriptions.length) {
					setIsRegistered(false);
				}

				const subJSON = sub?.toJSON()
				// COMPARE SUBSCRIPTIONS TO GET IF USER SUBSCRIBED
				for (let index = 0; index < userSubscriptions.length; index++) {
					const element = userSubscriptions[index];
					if (element.endpoint === subJSON?.endpoint) {
						setIsRegistered(true);
					}
				}
			}
		} catch (error) {
			console.error('Failed:', error)
		} finally {
			if (mounted) setIsNotificationsLoading(false)
			//
		}
	}

	/**
	 * First useEffect
	 */
	useEffect(() => {
		let mounted = true

		const init = async () => {
			if ('serviceWorker' in navigator && 'PushManager' in window) {
				setIsSupported(true)
				await initializeNotifications(mounted)
			} else {
				setIsSupported(false)
				setIsNotificationsLoading(false)
			}
		}

		init()

		return () => {
			mounted = false
		}
	}, [])


	/**
	 * Just the service worker being registered
	 * @returns the browser subscription! Which is cchecked against user subscriptions to allow or not to suscribe
	 */
	async function registerServiceWorker() {
		const registration = await navigator.serviceWorker.register('/sw.js', {
			scope: '/',
			updateViaCache: 'none',
		})
		const sub = await registration.pushManager.getSubscription()
		return sub;  // Return the subscription
	}

	async function subscribeToPush() {
		try {
			// First, the service worker sohuld be ready
			const registration = await navigator.serviceWorker.ready;
			// Now subscribe to push
			const sub = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey:
					urlBase64ToUint8Array(
						process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
					),
			});

			const subJSON = sub.toJSON() // Converts to JSON-serializable format

			/**
			 * Register to DB the actual subscritption information to send notifications to
			 */
			postSubscriptionNotification(subJSON);
			setIsRegistered(true);
		} catch (error) {
			console.error('Push subscription failed:', error);
		}
	}

	const postSubscriptionNotification = async (subJSON: any) => {
		try {
			await postSubscriptionNotifications({ // TODO set strings properly or return error
				endpoint: subJSON.endpoint || '',
				p256dh: subJSON.keys?.p256dh || '',
				auth: subJSON.keys?.auth || ''
			})
		} catch (error) {
			console.error('Failed:', error);
		}
	};

	async function unsubscribeFromPush() {

		try {
			// check here quickly
			if (isRegistered) {

				// find id for db
				const subscriptionOfThisDevice = userSubscriptions ? userSubscriptions.find(sub => sub.endpoint === subscription?.endpoint) : null;
				if (subscriptionOfThisDevice) {

					// delete
					await deleteSubscriptionNotifications(subscriptionOfThisDevice.id);
					// remove from state array
					setUserSubscriptions(prev => prev ? prev.filter(item => item.id === subscriptionOfThisDevice.id) : [])
				}

				setIsRegistered(false);
				toast({
					title: "Notificaciones Desactivadas",
					description: "Acctivalas para recibir nuevamente notificaciones.",
					variant: "destructive",
				})
			}
		} catch (error) {
			console.error('Failed:', error);
		}

	}

	/**
	 * Very good indeed requests toast of browser for permissons and retrieves response based on the user interaction
	 * Subscribe user to notifications service on permission granted
	 * @returns 
	 */
	const requestNotificationPermission = async () => {
		if (!("Notification" in window)) {
			toast({
				title: "No soportado",
				description: "Tu navegador no soporta notificaciones.",
				variant: "destructive",
			})
			return
		}

		if (Notification.permission === "granted") {
			console.log('subscription ', subscription);
			if (!isRegistered)
				subscribeToPush(); // TODO FIX THIS

			toast({
				title: "Ya activadas",
				description: "Las notificaciones ya están habilitadas.",
			})
			return
		}

		if (Notification.permission === "denied") {
			toast({
				title: "Bloqueadas",
				description: "Las notificaciones están bloqueadas. Habilítalas desde la configuración del navegador.",
				variant: "destructive",
			})
			return
		}

		// Request permission first
		const permission = await Notification.requestPermission();
		// back when granted
		if (permission === "granted") {
			try {
				// await susciribe and then toast
				await subscribeToPush();
				toast({
					title: "Notificaciones activadas",
					description: "Te recordaremos anotar tus gastos y cosas importantes.",
				})
			} catch (error) {
				console.error('Failed:', error)
				toast({
					title: "Error",
					description: "Las notificaciones están bloqueadas. Habilítalas desde la configuración del navegador.",
					variant: "destructive",
				})
			}
		}

	}

	const handleClick = async (e: React.MouseEvent) => {
		e.stopPropagation()
		try {
			isRegistered
				? await unsubscribeFromPush()
				: await requestNotificationPermission()
		} finally {

		}
	}

	return (
		<Button
			onClick={handleClick}
			disabled={isNotificationsLoading || !isSupported}
			className="w-full gap-2"
		>
			{isNotificationsLoading ? (
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