/**
 * This file contains type definitions for the transfer movement object
 * (POST movement/transfer) — moving money between the user's balance and/or
 * financial elements.
 */

import { z } from 'zod';

export enum TransferSideType {
	BALANCE = 'balance', // the user's main balance
	ASSET = 'asset', // a specific financial element
}

export type TransferSide = {
	type: TransferSideType;
	// Required when type is ASSET, absent/ignored when type is BALANCE
	financialElementId?: string;
};

// ✅ For posting data (client → server)
export type Transfer = {
	userId?: string; // optional, backend sets it
	from: TransferSide;
	to: TransferSide;
	amountFrom: number;
	// Required when from/to are in different currencies; defaults to amountFrom
	// server-side when they share a currency, so it's safe to omit in that case.
	amountTo?: number;
	description?: string;
};

// Response shape isn't confirmed yet (whatever movementService.createTransfer resolves
// to) — typed loosely for now, refine once we see a real payload.
export type TransferResult = Record<string, unknown>;

/**
 * Transfer schema to post, also validate with zod.
 * ACTION already adds userId.
 */
const transferSideSchema = z
	.object({
		type: z.nativeEnum(TransferSideType),
		financialElementId: z.string().optional(),
	})
	.refine((side) => side.type !== TransferSideType.ASSET || !!side.financialElementId, {
		message: 'Selecciona un activo',
		path: ['financialElementId'],
	});

export const transferSchema = z.object({
	from: transferSideSchema,
	to: transferSideSchema,
	amountFrom: z.coerce
		.number({ invalid_type_error: 'Ingresa un monto mayor a $0' })
		.gt(0, { message: 'El monto debe ser mayor a $0' }),
	amountTo: z.coerce.number().gt(0, { message: 'El monto debe ser mayor a $0' }).optional(),
	description: z.string().trim().optional(),
});

export type TransferFormData = z.infer<typeof transferSchema>;
