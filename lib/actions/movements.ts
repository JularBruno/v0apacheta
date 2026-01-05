'use server';

import { getSession, getMethod, postMethod, deleteMethod } from './utils';
import { Movement, Movements } from '../schemas/movement';
import { TxType } from '../schemas/definitions';

const url = 'movement';

type MovementFilters = {
	categoryId?: string;
	tagId?: string;
	startDate?: string; // ISO date string
	endDate?: string;
};

export async function getMovementsByUserAndFilter(
	filters?: MovementFilters,
): Promise<Array<Movements>> {
	const session = await getSession();

	// Build query params
	const params = new URLSearchParams({
		userId: session!.user.id,
	});

	if (filters?.categoryId) params.append('categoryId', filters.categoryId);
	if (filters?.tagId) params.append('tagId', filters.tagId);
	if (filters?.startDate) params.append('startDate', filters.startDate);
	if (filters?.endDate) params.append('endDate', filters.endDate);

	const url = `movement?${params.toString()}`;

	return await getMethod<Array<Movements>>(url);
}

export async function deleteMovement(id: string) {
	await deleteMethod<Movement>(url, id);
}

export async function postMovement(data: Movement): Promise<Movement> {
	const session = await getSession();

	const result = await postMethod<Movement>(url, {
		...data,
		userId: session!.user.id,
	});

	console.log('restult ', result);

	return result;
}
