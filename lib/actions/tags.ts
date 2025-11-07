'use server';

import { Tags } from '../schemas/tag';
import { getSession, getMethod, postMethod } from './utils';

const url = 'tag';

//// All Tag methods
export async function getTagsByUser(): Promise<Array<Tags>> {
	const session = await getSession();
	const url = 'tag/user';

	return await getMethod<Array<Tags>>(url, await session?.user.id);
}
