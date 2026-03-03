'use server';

import { Tags } from '../schemas/tag';
import { getSession, getMethod, postMethod, getMethodWithoutSession } from './utils';
import { unstable_cache } from 'next/cache';
import { revalidateTag } from "next/cache";

//// All Tag methods
export async function getTagsByUser(): Promise<Array<Tags>> {
	const session = await getSession();
	const url = 'tag/user';

	// return await getMethod<Array<Tags>>(url, await session?.user.id);

	const getTags = unstable_cache(async () => {
		return await getMethodWithoutSession<Array<Tags>>(url, session, session?.user.id);
	},
		['user-tags'],
		{ revalidate: 3600, tags: ['tags'] }
	);

	return await getTags();
}


export async function revalidateTags() {
	console.log('revalidatingTags');
	revalidateTag('tags'); // get categories from api! revalidate cache
}