'use server';

import { Category, CategoryBudget } from '../schemas/category';
import {
	getSession,
	getMethod,
	postMethod,
	putMethod,
	deleteMethod,
	getMethodWithoutSession,
} from './utils';
import { TxType } from '../schemas/definitions';
import { unstable_cache } from 'next/cache';
import { revalidateTag } from "next/cache";

const url = 'category';

//// All Categories methods and form validations
export async function getCategoriesByUser(): Promise<Array<Category>> {
	const session = await getSession();
	const url = 'category/user';

	const getCategories = unstable_cache(async () => {
		return await getMethodWithoutSession<Array<Category>>(url, session, session?.user.id);
	},
		['user-categories'],
		{ revalidate: 3600, tags: ['categories'] }
	);

	return await getCategories();
}

export async function getBudgetByUserAndPeriod(
	startDate: string,
	endDate: string
): Promise<Array<CategoryBudget>> {
	const session = await getSession();

	// Build query params
	const params = new URLSearchParams({
	});

	if (startDate) params.append('startDate ', startDate);
	if (endDate) params.append('endDate ', endDate);

	const url = `category/user/${session!.user.id}/budget?${params.toString()}`;
	console.log('url ', url);

	return await getMethod<Array<CategoryBudget>>(url, await session?.user.id);
}

export async function deleteCategoryById(id: string) {
	return await deleteMethod<Category>(url, id); // REMEMBER THIS IS SOFT DELETE ON API
}

export async function postCategory(data: {
	name: string;
	icon: string;
	color: string;
	type: TxType;
}): Promise<Category> {
	const session = await getSession();

	const result = await postMethod<Category>(url, {
		...data,
		userId: session!.user.id,
	});

	return result;
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

	const result = await putMethod<Category>(url, id, {
		...data,
		userId: session.user.id,
	});

	return result;
}

export async function revalidateCategories() {
	revalidateTag('categories'); // get categories from api! revalidate cache
}