'use server';

import { Category } from '../schemas/category';
import {
  getSession,
  getMethod,
  postMethod,
  putMethod,
  deleteMethod,
} from './utils';
import { TxType } from '../schemas/definitions';

const url = 'category';

//// All Categories methods and form validations
export async function getCategoriesByUser(): Promise<Array<Category>> {
  const session = await getSession();
  const url = 'category/user';

  return await getMethod<Array<Category>>(url, await session?.user.id);
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

  const result = await postMethod<Category>(url, {
    ...data,
    userId: session!.user.id,
  });

  return result;
}

export async function putCategory(
  id: string,
  data: {
    name: string;
    icon: string;
    color: string;
    type: string;
  },
): Promise<Category> {
  const session = await getSession();

  if (!session?.user.id) throw new Error('User ID is missing');

  const result = await putMethod<Category>(url, id, {
    ...data,
    userId: session.user.id,
  });

  return result;
}
