'use server'

import { Subscription, Subscriptions } from '../schemas/subscriptionNotification';
import {
	getSession,
	getMethod,
	postMethod,
	deleteMethod,
} from './utils';

const url = 'notifications';

// Save already fetched subscription
let subscription: PushSubscription | null = null

export async function postSubscriptionNotifications(data: {
	endpoint: string
	p256dh: string
	auth: string
}
): Promise<Subscriptions> {
	const session = await getSession();

	const result = await postMethod<Subscriptions>(url, {
		...data,
		userId: session!.user.id,
	});

	return result;
}

//
export async function getSubscriptionNotifications(): Promise<Array<Subscriptions>> {
	const session = await getSession();
	console.log(session);

	const url = 'notifications/user';

	// make in api the get method
	console.log('await session?.user.id ', await session?.user.id);

	return await getMethod<Array<Subscriptions>>(url, session?.user.id);
}

export async function deleteSubscriptionNotifications(id: string) {
	return await deleteMethod<Subscriptions>(url, id);
}
