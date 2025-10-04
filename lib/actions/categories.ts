'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Category } from '../schemas/category';
import { z } from 'zod';
import { getSession, getMethod, postMethod, deleteMethod } from "./utils";

//// All Categories methods and form validations
export async function getCategoriesByUser(): Promise<Array<Category>> {
    // const session = await getSession();
    // const url = 'category/user'

    // return await getMethod<Array<Category>>(url, await session?.user.id);

    const initialCategories: Category[] = [
      // Gastos
      { id: "comida", name: "Comida", color: "bg-orange-500", icon: "Utensils", kind: "gasto" },
      { id: "comestibles", name: "Comestibles", color: "bg-green-500", icon: "ShoppingCart", kind: "gasto" },
      { id: "transporte", name: "Transporte", color: "bg-blue-500", icon: "Car", kind: "gasto" },
      { id: "hogar", name: "Hogar", color: "bg-purple-500", icon: "Home", kind: "gasto" },
      { id: "entretenimiento", name: "Entretenimiento", color: "bg-red-500", icon: "Gamepad2", kind: "gasto" },
      { id: "servicios", name: "Servicios", color: "bg-yellow-500", icon: "Zap", kind: "gasto" },
      { id: "regalos", name: "Regalos", color: "bg-pink-500", icon: "Gift", kind: "gasto" },
      { id: "belleza", name: "Belleza", color: "bg-indigo-500", icon: "Sparkles", kind: "gasto" },
      { id: "viajes", name: "Viajes", color: "bg-cyan-500", icon: "Plane", kind: "gasto" },
    
      // Ingresos
      { id: "trabajo", name: "Trabajo", color: "bg-gray-500", icon: "Briefcase", kind: "ingreso" },
      { id: "ingreso", name: "Ingreso", color: "bg-green-600", icon: "DollarSign", kind: "ingreso" },
    ]

    return initialCategories;
}

export async function deleteCategory(id: string) {
    const url = 'category'

    await deleteMethod<Category>(url, id);
    revalidatePath('/dashboard');
}

const PostCategoryFormSchema = z.object({
    userId: z.string(),
    name: z.string().min(1, 'Name is required'),
})

const PostCategory = PostCategoryFormSchema.omit({ userId: true });

export type CategoryState = {
    errors?: {
      name?: string[];
    };
    message?: string | null;
};

export async function postCategory(prevState: CategoryState, formData: FormData) {
    const session = await getSession();
    const url = 'category';

    if (!session?.user.id) throw new Error('User ID is missing'); // not sure if required

    const validatedData = PostCategory.safeParse({
        name: formData.get('name'),
    });

    if (!validatedData.success) {
        return {
            errors: validatedData.error.flatten().fieldErrors,
            message: 'Missing fields.',
        };
    }
        
    try {
        await postMethod<Category>(url, {
            ...validatedData.data,
            userId: session.user.id
        });
    } catch (error) {
        console.log(error);
    }
    revalidatePath('/dashboard');
    redirect('/dashboard');
}
