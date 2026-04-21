
import { FinancialElementType } from './definitions';
import { User } from '@/lib/schemas/user';
import { Tags } from '@/lib/schemas/tag';
import { Category } from '@/lib/schemas/category';
import { z } from 'zod';
import { Movements } from './movement';

// ✅ For posting data (client → server)
export type FinancialElement = {
	userId?: string; // optional, backend sets it
	type: FinancialElementType;
	name: string;
};

// ✅ For retrieved data (server → client)
export type FinancialElements = FinancialElement & {
	createdAt: string;
	id: string;
	currentAmount: number;
	movements: Array<Movements>;
};

export type FinancialElementsAndNetWorth = { // actual api response json
	elements: Array<FinancialElements>
	netWorth: number,
	totalAssets: number,
	totalLiabilities: number
}

/**
 * Category schema to post and update, also validate with zod
 * ACTION already adds userId
 * Update requires id on path
 */
export const financialElementSchema = z.object({
	name: z
		.string()
		.min(1, 'Ingresa un nombre')
		.max(20, 'Intenta que tenga menos de 20 caracteres'),
	type: z.enum([FinancialElementType.ASSET, FinancialElementType.LIABILITY]),
});