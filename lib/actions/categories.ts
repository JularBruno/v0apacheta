'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Category } from '../schemas/category';
import { z } from 'zod';
import { getSession, getMethod, postMethod, deleteMethod } from "./utils";

const url = 'category'

//// All Categories methods and form validations
export async function getCategoriesByUser(): Promise<Array<Category>> {
    const session = await getSession();
    const url = 'category/user'

    return await getMethod<Array<Category>>(url, await session?.user.id);
    // INSERT INTO "Categories" (id, "userId", name, color, icon, type, "createdAt", "updatedAt") VALUES
    // -- expenses
    // (gen_random_uuid(), 'c7bbdef4-9ad0-4a08-9486-5ccd814714a0', 'Comida', 'bg-orange-500', 'Utensils', 'expense', now(), now());
    // (gen_random_uuid(), 'c7bbdef4-9ad0-4a08-9486-5ccd814714a0', 'Comestibles', 'bg-green-500', 'ShoppingCart', 'expense', now(), now()),
    // (gen_random_uuid(), 'c7bbdef4-9ad0-4a08-9486-5ccd814714a0', 'Transporte', 'bg-blue-500', 'Car', 'expense', now(), now()),
    // (gen_random_uuid(), 'c7bbdef4-9ad0-4a08-9486-5ccd814714a0', 'Hogar', 'bg-purple-500', 'Home', 'expense', now(), now()),
    // (gen_random_uuid(), 'c7bbdef4-9ad0-4a08-9486-5ccd814714a0', 'Entretenimiento', 'bg-red-500', 'Gamepad2', 'expense', now(), now()),
    // (gen_random_uuid(), 'c7bbdef4-9ad0-4a08-9486-5ccd814714a0', 'Servicios', 'bg-yellow-500', 'Zap', 'expense', now(), now()),
    // (gen_random_uuid(), 'c7bbdef4-9ad0-4a08-9486-5ccd814714a0', 'Regalos', 'bg-pink-500', 'Gift', 'expense', now(), now()),
    // (gen_random_uuid(), 'c7bbdef4-9ad0-4a08-9486-5ccd814714a0', 'Belleza', 'bg-indigo-500', 'Sparkles', 'expense', now(), now()),
    // (gen_random_uuid(), 'c7bbdef4-9ad0-4a08-9486-5ccd814714a0', 'Viajes', 'bg-cyan-500', 'Plane', 'expense', now(), now()),

    // -- incomes
    // (gen_random_uuid(), 'c7bbdef4-9ad0-4a08-9486-5ccd814714a0', 'Trabajo', 'bg-gray-500', 'Briefcase', 'income', now(), now()),
    // (gen_random_uuid(), 'c7bbdef4-9ad0-4a08-9486-5ccd814714a0', 'Ingreso', 'bg-green-600', 'DollarSign', 'income', now(), now());
}

export async function deleteCategory(id: string) {

    await deleteMethod<Category>(url, id);
    revalidatePath('/dashboard');
}

const PostCategoryFormSchema = z.object({
    userId: z.string(),
    name: z.string().min(1, 'Name is required'),
    icon: z.string().min(1, 'icon is required'),
    color: z.string().min(1, 'color is required'),
    type: z.string().min(1, 'type is required'),
})

const PostCategory = PostCategoryFormSchema.omit({ userId: true });

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
    console.log('Received data:', data); // Log THIS first

    const validatedData = PostCategory.safeParse(data); 

    if (!validatedData.success) {
        throw new Error(validatedData.error.errors.map(e => e.message).join(', '));
    }

    const result = await postMethod<Category>(url, {
        ...validatedData.data,
        userId: session.user.id
    });

    return result;
}
