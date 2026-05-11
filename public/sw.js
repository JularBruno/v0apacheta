self.addEventListener('push', function (event) {
	let data = {}

	try {
		data = event.data ? event.data.json() : {}
	} catch {
		data = { body: event.data?.text() }
	}

	const title = data.title || 'Apacheta'

	const options = {
		body: data.body,
		// icon: data.icon || '/icon-192x192.png',
		icon: '/iconwbg-192x192.png',
		badge: '/icon-192x192.png',
		image: '/icon-512x512.png',

		data: {
			url: data.url || 'https://apacheta.ar/dashboard/mapa' // Add this for dynamic routing
		},

		tag: 'apacheta', // Replaces old notifications with same tag
		renotify: true,
		requireInteraction: false,
		timestamp: Date.now(),

		actions: [
			{ action: 'view', title: 'Ver detalles', icon: '/icons/view.png' },
			{ action: 'dismiss', title: 'Descartar', icon: '/icons/close.png' }
		],

	}

	event.waitUntil(
		self.registration.showNotification(title, options)
	);

})

self.addEventListener('notificationclick', function (event) {
	console.log('Notification click received.')
	event.notification.close()
	event.waitUntil(clients.openWindow('https://apacheta.ar/dashboard/inicio'))
})