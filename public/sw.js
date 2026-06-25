// v2
self.addEventListener('push', function (event) {
	let data = {}

	try {
		data = event.data ? event.data.json() : {}
	} catch {
		data = { body: event.data?.text() }
	}

	const options = {
		body: data.body,
		icon: '/iconwbg-192x192.png',  // expanded notification icon — must be PNG, SVG not supported
		badge: '/logo.svg',            // status bar badge — SVG works here
		data: {
			url: data.url || 'https://apacheta.ar/dashboard/mapa'
		},
		tag: 'apacheta',       // replaces previous notification with same tag
		renotify: true,
		requireInteraction: false,
		timestamp: Date.now(),
	}

	event.waitUntil(
		self.registration.showNotification(data.title || 'Apacheta', options)
	)
})

self.addEventListener('notificationclick', function (event) {
	event.notification.close()

	if (event.action === 'dismiss') return

	const url = event.notification.data?.url || 'https://apacheta.ar/dashboard/mapa'

	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
			// Focus existing tab if already open
			for (const client of clientList) {
				if (client.url === url && 'focus' in client) {
					return client.focus()
				}
			}
			return clients.openWindow(url)
		})
	)
})