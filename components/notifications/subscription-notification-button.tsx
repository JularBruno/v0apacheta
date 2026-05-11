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

			// if first time useffect is used since it runs 2 times
			if (mounted) {

				setUserSubscriptions(userSubscriptions) // set geted user already suscribed devices
				setSubscription(sub) // set the device information from registering service worker, with like endpoint and required things to save on db and use to send nots

				if (!userSubscriptions.length) {
					setIsRegistered(false);
				}

				setIsRegistered(!!sub);

				// const subJSON = sub?.toJSON();

				console.log('userSubscriptions ', userSubscriptions);
				console.log('sub ', sub);

				// COMPARE SUBSCRIPTIONS TO GET IF USER SUBSCRIBED
				// for (let index = 0; index < userSubscriptions.length; index++) {
				// 	const element = userSubscriptions[index];
				// 	if (element.endpoint === subJSON?.endpoint) {
				// 		setIsRegistered(true);
				// 	}
				// }
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
			await postSubscriptionNotification(subJSON);
			setSubscription(sub);
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
			}).then((res: Subscriptions) => {
				setUserSubscriptions(prev => [...prev, res])
			})
		} catch (error) {
			console.error('Failed:', error);
		}
	};

	async function unsubscribeFromPush() {
		setIsNotificationsLoading(true);

		try {
			console.log(0);
			// check here quickly
			if (isRegistered) {

				// console.log(userSubscriptions.find(sub => sub.endpoint === subscription?.endpoint));

				// find id for db
				// const subscriptionOfThisDevice = userSubscriptions ? userSubscriptions.find(sub => sub.endpoint === subscription?.endpoint) : null;

				// console.log('subscriptionOfThisDevice ', subscriptionOfThisDevice);
				// console.log('subscription ', subscription);

				console.log(1);
				if (subscription) {
					// delete
					console.log(2);

					await deleteSubscriptionNotifications(subscription.endpoint);

					await subscription.unsubscribe();
					// remove from state array
					// setUserSubscriptions(prev => prev ? prev.filter(item => item.id === subscription.id) : [])
				}

				setIsRegistered(false);
				toast({
					title: "Notificaciones Desactivadas",
					description: "Activalas para recibir nuevamente notificaciones.",
					variant: "default",
				})

			}
		} catch (error) {
			console.error('Failed:', error);
		} finally {
			setIsNotificationsLoading(false);

		}

	}

	/**
	 * Very good indeed requests toast of browser for permissons and retrieves response based on the user interaction
	 * Subscribe user to notifications service on permission granted
	 * @returns 
	 */
	const requestNotificationPermission = async () => {
		setIsNotificationsLoading(true);

		if (!("Notification" in window)) {
			toast({
				title: "No soportado",
				description: "Tu navegador no soporta notificaciones.",
				variant: "destructive",
			})
			setIsNotificationsLoading(false);
			return;
		}

		if (Notification.permission === "granted") {
			console.log('subscription ', subscription);
			if (!isRegistered)
				subscribeToPush(); // TODO FIX THIS

			toast({
				title: "Ya activadas",
				description: "Las notificaciones ya están habilitadas.",
			})
			setIsNotificationsLoading(false);
			return;
		}

		if (Notification.permission === "denied") {
			toast({
				title: "Bloqueadas",
				description: "Las notificaciones están bloqueadas. Habilítalas desde la configuración del navegador.",
				variant: "destructive",
			})
			setIsNotificationsLoading(false);
			return;
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
			} finally {
				setIsNotificationsLoading(false);
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