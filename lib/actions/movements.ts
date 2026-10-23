'use server';

import { getSession, getMethod, postMethod, deleteMethod } from './utils';
import { Movement, Movements } from '../schemas/movement';
import type { LastMovementImport, UndoMovementImportResult } from '../schemas/upload';

const url = 'movement';

export type MovementFilters = {
	categoryId?: string;
	tagId?: string;
	startDate?: string;
	endDate?: string;
};

export async function getMovementsByUserAndFilter(
	filters?: MovementFilters,
): Promise<Array<Movements>> {
	const session = await getSession();

	const params = new URLSearchParams({ userId: session!.user.id });
	if (filters?.categoryId) params.append('categoryId', filters.categoryId);
	if (filters?.tagId) params.append('tagId', filters.tagId);
	if (filters?.startDate) params.append('startDate', filters.startDate);
	if (filters?.endDate) params.append('endDate', filters.endDate);

	return await getMethod<Array<Movements>>(`movement?${params.toString()}`);
}

export async function deleteMovement(id: string) {
	await deleteMethod<Movement>(url, id);
}

export async function postMovement(data: Movement): Promise<Movement> {
	const session = await getSession();

	return await postMethod<Movement>(url, {
		...data,
		userId: session!.user.id,
	});
}

/** Most recent movements import still undoable, or null when there is none (404). */
export async function getLastMovementImport(): Promise<LastMovementImport | null> {
	try {
		return await getMethod<LastMovementImport>('movement/upload/last');
	} catch (error) {
		// getMethod throws "HTTP error! status: <code>"; anything but a 404 (incl. the
		// 401 login redirect) has to keep propagating
		if (error instanceof Error && error.message.endsWith('status: 404')) return null;
		throw error;
	}
}

/** Deletes every movement of that import (backend does it atomically and fixes the balance). */
export async function undoMovementImport(importId: string): Promise<UndoMovementImportResult> {
	const result = await deleteMethod<UndoMovementImportResult & { statusCode?: number; message?: string }>(
		'movement/upload',
		importId,
	);
	// deleteMethod hands back error bodies too — only a real result has `deleted`.
	// 4xx messages are written for the user (es); 5xx come back as a generic English one.
	if (typeof result?.deleted !== 'number') {
		const userFacing = result?.statusCode && result.statusCode < 500 ? result.message : undefined;
		throw new Error(userFacing ?? 'No se pudo deshacer la migración. Probá de nuevo en un rato.');
	}
	return result;
}
