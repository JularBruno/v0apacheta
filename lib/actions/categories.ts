'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Category } from '../schemas/category';
import { z } from 'zod';
import { getSession, getMethod, postMethod, putMethod, deleteMethod } from "./utils";
import { TxType } from '../schemas/definitions';

const url = 'category'

//// All Categories methods and form validations
export async function getCategoriesByUser(): Promise<Array<Category>> {
    const session = await getSession();
    const url = 'category/user'

    return await getMethod<Array<Category>>(url, await session?.user.id);
}

export async function deleteCategoryById(id: string) {

    await deleteMethod<Category>(url, id);
    revalidatePath('/dashboard');
}

const PostCategorySchema = z.object({
    userId: z.string(),
    name: z.string().min(1, 'Name is required'),
    icon: z.string().min(1, 'icon is required'),
    color: z.string().min(1, 'color is required'),
    type: z.enum([TxType.EXPENSE, TxType.INCOME])
})

const PostCategoryFormSchema = PostCategorySchema.omit({ userId: true });

export type CategoryState = {
    errors?: {
      name?: string[];
      icon?: string[];
      color?: string[];
      type?: string[];
    };
    message?: string | null;
};

export async function postCategory(data: {
  name: string;
  icon: string;
  color: string;
  type: string;
}): Promise<Category>  {
    const session = await getSession();

    if (!session?.user.id) throw new Error('User ID is missing'); // not sure if required

    const validatedData = PostCategoryFormSchema.safeParse(data); 

    if (!validatedData.success) {
        throw new Error(validatedData.error.errors.map(e => e.message).join(', '));
    }

    const result = await postMethod<Category>(url, {
        ...validatedData.data,
        userId: session.user.id
    });

    return result;
}

export async function putCategory( id: string, data: {
  name: string;
  icon: string;
  color: string;
  type: string;
}): Promise<Category>  {
    const session = await getSession();

    if (!session?.user.id) throw new Error('User ID is missing'); // not sure if required

    const validatedData = PostCategoryFormSchema.safeParse(data); 

    if (!validatedData.success) {
        throw new Error(validatedData.error.errors.map(e => e.message).join(', '));
    }

    const result = await putMethod<Category>(url, id, {
        ...validatedData.data,
        userId: session.user.id
    });

    return result;
}
