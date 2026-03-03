
/**
 * This file contains type definitions for movements object
 */

import { TxType } from './definitions';
import { User } from '@/lib/schemas/user';
import { Tags } from '@/lib/schemas/tag';
import { Category } from '@/lib/schemas/category';
import { z } from 'zod';

export enum PaymentType {
	MONTHLY = 'monthly',
	ONE_TIME = 'one_time',
}

// ✅ For posting data (client → server)
export type PaymentReminder = {
	id: string;
	title: string;
	amount: string;
	type: PaymentType;
	period?: string;
	isPaid: boolean;
	userId?: string; // optional, backend sets it
	categoryId: string;
	tagId?: string;
};

/**
 * 
 */
export const paymentReminderSchema = z.object({
	title: z.string(),
	amount: z.coerce
		.number({ invalid_type_error: 'Ingresa un monto mayor a $0' })
		.gt(0, { message: 'El monto debe ser mayor a $0' }),
	type: z.enum([PaymentType.MONTHLY, PaymentType.ONE_TIME]),
	period: z.string().optional(),
	// isPaid: boolean;
	userId: z.string(),
	categoryId: z.string().optional(),
	tagId: z.string().optional(),
});

export type PaymentReminderFormData = z.infer<typeof paymentReminderSchema>;
