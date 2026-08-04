'use server';

import { getMethod } from './utils';

export type CurrencyOption = {
	currency: string;
	symbol: string;
	label: string;
};

export async function getAvailableCurrencies(): Promise<CurrencyOption[]> {
	return await getMethod<CurrencyOption[]>('currency');
}
