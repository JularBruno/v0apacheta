'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Tag } from '../schemas/tag';
import { Category } from '../schemas/category';
import { z } from 'zod';
import { getSession, getMethod, postMethod } from './utils';

const url = 'tag';

//// All Tag methods
export async function getTagsByUser(): Promise<Array<Tag>> {
	const session = await getSession();
	const url = 'tag/user';

	return await getMethod<Array<Tag>>(url, await session?.user.id);
}
