'use server';

import { getSession, getMethod, postMethod, deleteMethod, getMethodWithoutSession } from './utils';
import { Movement, Movements } from '../schemas/movement';
import { TxType } from '../schemas/definitions';
import { revalidateTag, unstable_cache } from 'next/cache';

const url = 'movement';

type MovementFilters = {
	categoryId?: string;
	tagId?: string;
	startDate?: string; // ISO date string
	endDate?: string;
};

export async function getMovementsByUserAndFilterCache(
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

	// return await getMethodWithoutSession<Array<Movements>>(url, session);
	console.log('isoncache');

	const getMovementsCache = unstable_cache(async () => {
		console.log('isoncache');

		return await getMethodWithoutSession<Array<Movements>>(url, session);
	},
		['movements-api'],
		{ revalidate: 3600, tags: ['movements'] }
	);

	return await getMovementsCache();
}

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

	// i didnt want to di because it might be expensive, /dashobard/inicio updates balance
	// revalidateTag('user'); // get user from api! to acutally update context balance

	return result;
}

// export async function migrateMovementsFromExcelFile(file: File): Promise<any> {
// 	const session = await getSession();
// 	const url = 'movement/upload'

// 	// Create FormData to send file as binary
// 	const formData = new FormData();
// 	formData.append('file', file);
// 	formData.append('userId', session!.user.id);

// 	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}`, {
// 		method: 'POST',
// 		headers: {
// 			'Authorization': `Bearer ${session?.user.token}`, // if you use auth
// 		},
// 		body: formData, // Send FormData, not JSON
// 	});

// 	if (!response.ok) {
// 		throw new Error('Failed to upload file');
// 	}

// 	const result = await response.json();
// 	console.log('result ', result);

// 	return result;
// }