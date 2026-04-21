'use server';

import { FinancialElement, FinancialElements, FinancialElementsAndNetWorth } from '../schemas/financialElement';
import {
	getSession,
	getMethod,
	postMethod,
	putMethod,
	deleteMethod,
	getMethodWithoutSession,
} from './utils';
import { FinancialElementType } from '../schemas/definitions';
import { unstable_cache } from 'next/cache';
import { revalidateTag } from "next/cache";
import { getCurrentMonthRange, getDateStringsForFilter, getLastNMonths } from '../dateUtils';

const url = 'financial-element';

export async function getFinancialElementsByUser(): Promise<FinancialElementsAndNetWorth> {
	const session = await getSession();
	const url = 'financial-element/patrimony';

	const getFinancialElements = unstable_cache(async () => {
		return await getMethodWithoutSession<any>(url, session, session?.user.id);
	},
		['financial-elements'],
		{ revalidate: 3600, tags: ['financial-elements'] }
	);

	return await getFinancialElements();
}

export async function getFinancialElementById(id: string): Promise<FinancialElements> {
	const session = await getSession();
	const url = 'financial-element';

	return await getMethod<any>(url, id);
}

export async function postFinancialElement(data: {
	name: string;
	type: FinancialElementType;
}): Promise<FinancialElement> {
	const session = await getSession();

	const result = await postMethod<FinancialElement>(url, {
		...data,
		userId: session!.user.id,
	});

	return result;
}

export async function putFinancialElement(
	id: string,
	data: FinancialElement
): Promise<FinancialElements> {
	const session = await getSession();

	if (!session?.user.id) throw new Error('User ID is missing');

	const result = await putMethod<FinancialElements>(url, id, {
		...data,
		userId: session.user.id,
	});

	return result;
}

export async function deleteFinancialElementById(id: string) {
	console.log('im deleting');

	return await deleteMethod<FinancialElement>(url, id);
}

export async function revalidateFinancialElements() {
	revalidateTag('financial-elements'); // get categories from api! revalidate cache
}