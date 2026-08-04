
import { FinancialElementType } from './definitions';
import { User } from '@/lib/schemas/user';
import { Tags } from '@/lib/schemas/tag';
import { Category } from '@/lib/schemas/category';
import { z } from 'zod';
import { Movements } from './movement';
// the ai comments are actually useful to understand steps
// ✅ For posting data (client → server)
export type FinancialElement = {
	userId?: string; // optional, backend sets it
	type: FinancialElementType;
	name: string;
	// Not the Currency enum — the API's currency list is dynamic (/currency),
	// and Currency is just a small set of known defaults.
	currency: string;
};

// ✅ For retrieved data (server → client)
export type FinancialElements = FinancialElement & {
	createdAt: string;
	id: string;
	currentAmount: number;
	// currentAmount converted to the user's preferredCurrency, computed by the backend
	convertedAmount: number;
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
	// Not z.nativeEnum(Currency) — the picker lists whatever /currency returns,
	// which can include codes beyond this static enum. Validate presence only.
	currency: z.string().min(1, 'Selecciona una moneda'),
});