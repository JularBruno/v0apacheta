self.addEventListener('push', function (event) {
	console.log('event.data ', event.data);
	console.log('event push');

	if (event.data) {
		console.log(event.data);

		const data = event.data.json()
		const options = {
			body: data.body,              // Main notification text
			// icon: data.icon || '/icon-192x192.png',  // Large icon (remove ./public)
			icon: '/icon-192x192.png',  // Large icon (remove ./public)
			badge: '/icon-192x192.png',   // Small icon in notification tray
			// vibrate: [100, 50, 100],      // Vibration pattern [vibrate, pause, vibrate] in ms
			data: {                       // Custom data you can access on click
				dateOfArrival: Date.now(),
				primaryKey: '2',
				url: '/dashboard/mapa'  // Add this for dynamic routing
			},
			// ADD THESE:
			tag: 'budget-alert',          // Replaces old notifications with same tag
			renotify: true,               // Vibrate again even if tag exists
			requireInteraction: false,    // Auto-dismiss or stay until clicked
			actions: [                    // Action buttons (Android/some browsers)
				{ action: 'view', title: 'Ver detalles', icon: '/icons/view.png' },
				{ action: 'dismiss', title: 'Descartar', icon: '/icons/close.png' }
			],
			image: '/icon-192x192.png',         // Large banner image (optional)
			// silent: false,                // Don't vibrate/sound
			timestamp: Date.now(),        // When notification occurred
		}
		event.waitUntil(self.registration.showNotification(data.title, options))
	}

})

self.addEventListener('notificationclick', function (event) {
	console.log('Notification click received.')
	event.notification.close()
	event.waitUntil(clients.openWindow('https://v0apacheta-production.up.railway.app/dashboard/inicio'))
})