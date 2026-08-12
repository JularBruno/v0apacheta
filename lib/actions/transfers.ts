'use server';

import { getSession, postMethod } from './utils';
import { Transfer, TransferResult } from '../schemas/transfer';

const url = 'movement';

// Deletion reuses the existing movement delete endpoint/action (DELETE movement/:id) —
// a transfer is created off the same movement resource, so no separate delete here.
export async function postTransfer(data: Transfer): Promise<TransferResult> {
	const session = await getSession();

	return await postMethod<TransferResult>(`${url}/transfer`, {
		...data,
		userId: session!.user.id,
	});
}
