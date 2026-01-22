/**
 * This file contains type definitions for Subscription object
 */
// ✅ For posting data (client → server)
export type Subscription = {
	endpoint: string;
	p256dh: string;
	auth: string;
};

// ✅ For retrieved data (server → client)
export type Subscriptions = Subscription & {
	id: string;
	createdAt: string;
	updatedAt: string;
};