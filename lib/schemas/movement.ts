/**
 * This file contains type definitions for movements object
 */

import { TxType } from './definitions';
import { User } from '@/lib/schemas/user';
import { Tags } from '@/lib/schemas/tag';
import { Category } from '@/lib/schemas/category';
import { z } from 'zod';

// ✅ For posting data (client → server)
export type Movement = {
	userId?: string; // optional, backend sets it
	type: TxType;
	categoryId: string;
	tagId?: string;
	tagName: string;
	amount: number;
	description: string;
	createdAt?: string; // Optional, defaults to now if not provided
};


// ✅ For retrieved data (server → client)
export type Movements = Movement & {
	id: string;
	lastBalance: number;
	createdAt: string; // comes as ISO string from API (e.g., "2025-10-28T19:53:28.725Z")
	updatedAt: string;
	user: User;
	tag: Tags;
	category: Category;
};

/**
 * Movement schema to post, also validate with zod
 * ACTION already adds userId
 */
export const movementSchema = z.object({
	type: z.enum([TxType.EXPENSE, TxType.INCOME]),
	// categoryId: z.string().min(1, 'Selecciona una categoría').optional(),
	categoryId: z.string().optional(),
	tagId: z.string().optional(), // Tag id is optional when creating new
	tagName: z
		.string()
		.min(1, 'Ingresa una descripción, o selecciona una debajo'),
	amount: z.coerce
		.number({ invalid_type_error: 'Ingresa un monto mayor a $0' })
		.gt(0, { message: 'El monto debe ser mayor a $0' }),
	description: z.string().optional(),
});

export type MovementFormData = z.infer<typeof movementSchema>;
