"use client"
import Header from "@/components/home/header"
import Hero from "@/components/home/hero"
import About from "@/components/home/about"
import Features from "@/components/home/features"
import FAQ from "@/components/home/faq"
import Footer from "@/components/home/footer"
import { useState, useEffect } from 'react'
// import { subscribeUser, unsubscribeUser, sendNotification } from '@/lib/actions/notifications'

export default function Home() {

	// function urlBase64ToUint8Array(base64String: string) {
	// 	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	// 	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

	// 	const rawData = window.atob(base64)
	// 	const outputArray = new Uint8Array(rawData.length)

	// 	for (let i = 0; i < rawData.length; ++i) {
	// 		outputArray[i] = rawData.charCodeAt(i)
	// 	}
	// 	return outputArray
	// }

	// const [isSupported, setIsSupported] = useState(false)
	// const [subscription, setSubscription] = useState<PushSubscription | null>(
	// 	null
	// )
	// const [message, setMessage] = useState('')

	// useEffect(() => {
	// 	if ('serviceWorker' in navigator && 'PushManager' in window) {
	// 		console.log('setIsSupported(true)');

	// 		setIsSupported(true)
	// 		registerServiceWorker()
	// 	}
	// }, [])

	// async function registerServiceWorker() {
	// 	const registration = await navigator.serviceWorker.register('/sw.js', {
	// 		scope: '/',
	// 		updateViaCache: 'none',
	// 	})
	// 	const sub = await registration.pushManager.getSubscription()
	// 	setSubscription(sub)
	// }

	// async function subscribeToPush() {
	// 	console.log('subscribeToPush');

	// 	try {
	// 		// First, register the service worker if not already registered
	// 		const registration = await navigator.serviceWorker.register('/sw.js');
	// 		console.log('Service Worker registered:', registration);

	// 		// Now subscribe to push
	// 		const sub = await registration.pushManager.subscribe({
	// 			userVisibleOnly: true,
	// 			applicationServerKey: urlBase64ToUint8Array(
	// 				// process.env.VAPID_PUBLIC_KEY!
	// 				"BLFgXjeFk6n3oiCzbu7CHk8NFQ_aOkrgPxpxXIQpoV1o8IywksuGqvhRZEKmGecFbC1BLft6VCEiLjXqIRu52Is"
	// 			),
	// 		});

	// 		console.log('Subscription:', sub);
	// 		setSubscription(sub);

	// 		const serializedSub = JSON.parse(JSON.stringify(sub));
	// 		await subscribeUser(serializedSub);
	// 	} catch (error) {
	// 		console.error('Push subscription failed:', error);
	// 	}
	// }

	// async function unsubscribeFromPush() {
	// 	await subscription?.unsubscribe()
	// 	setSubscription(null)
	// 	await unsubscribeUser()
	// }

	// async function sendTestNotification() {
	// 	if (!isSupported) {
	// 		return <p>Push notifications are not supported in this browser.</p>
	// 	}

	// 	console.log('sendTestNotification ');

	// 	if (subscription) {
	// 		await sendNotification(message)
	// 		setMessage('')
	// 	}
	// }

	return (
		<main className="font-manrope">
			<Header />

			{/* <div>
				<h3>Push Notifications</h3>
				{subscription ? (
					<>
						<p>You are subscribed to push notifications.</p>
						<button onClick={unsubscribeFromPush}>Unsubscribe</button>
						<input
							type="text"
							placeholder="Enter notification message"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
						<button onClick={sendTestNotification}>Send Test</button>
					</>
				) : (
					<>
						<p>You are not subscribed to push notifications.</p>
						<button onClick={subscribeToPush}>Subscribe</button>
					</>
				)}
			</div> */}
			<Hero />
			<About />
			{/* <Features /> */}
			<FAQ />
			{/* <Footer /> */}
		</main>
	)
}
