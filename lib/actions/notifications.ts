'use server'

import { Subscriptions } from '../schemas/subscriptionNotification';
import { getSession, getMethod, postMethod } from './utils';

const url = 'notifications';

/**
 * All services required to interact with server subscription-notifications
 * since we just suscribe and unsuscribe user and well get
 * attempted to set functions available for many components here in server components NAVIGATOR and WINDOW don't work
 * for proper notifications information: components/notifications/subscription-notification-button.tsx
 */

export async function postSubscriptionNotifications(data: {
	endpoint: string
	p256dh: string
	auth: string
}): Promise<Subscriptions> {
	return await postMethod<Subscriptions>(url, data);
}

export async function getSubscriptionNotifications(): Promise<Array<Subscriptions>> {
	return await getMethod<Array<Subscriptions>>('notifications/user');
}


//
// export async function getSubscriptionNotificationsByEndpoint(endpoint: string): Promise<Array<Subscriptions>> {
// 	const session = await getSession();

// 	const url = 'endpoint/';

// 	return await getMethod<Array<Subscriptions>>(url, session?.user.id);
// }

export async function deleteSubscriptionNotifications(endpoint: string) {
	const session = await getSession();
	const apiUrl = process.env.API_URL;

	const response = await fetch(`${apiUrl}/notifications/endpoint?url=${encodeURIComponent(endpoint)}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${session?.accessToken}`,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to delete subscription: ${response.status}`);
	}

	const text = await response.text();
	return text ? JSON.parse(text) : null;
}
