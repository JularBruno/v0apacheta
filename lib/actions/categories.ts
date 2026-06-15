'use server';

import { Category, CategoryBudget } from '../schemas/category';
import {
	getSession,
	getMethod,
	postMethod,
	putMethod,
	deleteMethod,
} from './utils';
import { TxType } from '../schemas/definitions';
import { revalidateTag } from "next/cache";
import { getCurrentMonthRange, getDateStringsForFilter } from '../dateUtils';

const url = 'category';

export async function getCategoriesByUser(): Promise<Array<Category>> {
	const session = await getSession();
	return await getMethod<Array<Category>>('category/user', session?.user.id);
}

export async function getBudgetByUserAndPeriod(
	startDate?: string,
	endDate?: string
): Promise<Array<CategoryBudget>> {
	const session = await getSession();

	const { start, end } = getCurrentMonthRange(); // on default use current month
	const result = getDateStringsForFilter(start, end);

	const params = new URLSearchParams();
	params.append('startDate', startDate ?? result.startDate);
	params.append('endDate', endDate ?? result.endDate);

	return await getMethod<Array<CategoryBudget>>(
		`category/user/${session!.user.id}/budget?${params.toString()}`
	);
}

export async function deleteCategoryById(id: string) {
	return await deleteMethod<Category>(url, id);
}

export async function postCategory(data: {
	name: string;
	icon: string;
	color: string;
	type: TxType;
}): Promise<Category> {
	const session = await getSession();

	return await postMethod<Category>(url, {
		...data,
		userId: session!.user.id,
	});
}

export async function putCategory(
	id: string,
	data: {
		name?: string;
		icon?: string;
		color?: string;
		type?: string;
		budget?: number;
	}
): Promise<Category> {
	const session = await getSession();
	if (!session?.user.id) throw new Error('User ID is missing');

	return await putMethod<Category>(url, id, {
		...data,
		userId: session.user.id,
	});
}
