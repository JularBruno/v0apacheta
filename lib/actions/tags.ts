'use server';

import { Tags } from '../schemas/tag';
import { getSession, getMethod } from './utils';
import { revalidateTag } from "next/cache";

export async function getTagsByUser(): Promise<Array<Tags>> {
	const session = await getSession();
	return await getMethod<Array<Tags>>('tag/user', session?.user.id);
}