'use server';

import { FinancialElement, FinancialElements, FinancialElementsAndNetWorth } from '../schemas/financialElement';
import {
	getSession,
	getMethod,
	postMethod,
	putMethod,
	deleteMethod,
} from './utils';
import { FinancialElementType } from '../schemas/definitions';

const url = 'financial-element';

export async function getFinancialElementsByUser(): Promise<FinancialElementsAndNetWorth> {
	const session = await getSession();
	return await getMethod<FinancialElementsAndNetWorth>('financial-element/patrimony', session!.user.id);
}

export async function getFinancialElementById(id: string): Promise<FinancialElements> {
	return await getMethod<FinancialElements>(url, id);
}

export async function postFinancialElement(data: {
	name: string;
	type: FinancialElementType;
}): Promise<FinancialElement> {
	const session = await getSession();

	return await postMethod<FinancialElement>(url, {
		...data,
		userId: session!.user.id,
	});
}

export async function putFinancialElement(
	id: string,
	data: FinancialElement
): Promise<FinancialElements> {
	const session = await getSession();
	if (!session?.user.id) throw new Error('User ID is missing');

	return await putMethod<FinancialElements>(url, id, {
		...data,
		userId: session.user.id,
	});
}

export async function deleteFinancialElementById(id: string) {
	return await deleteMethod<FinancialElement>(url, id);
}
