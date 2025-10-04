'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Tag } from '../schemas/tag';
import { Category } from '../schemas/category';
import { z } from 'zod';
import { getSession, getMethod, postMethod } from "./utils";

//// All Tag methods
export async function getTagsByUser(): Promise<Array<Tag>> {
    // const session = await getSession();
    // const url = 'tag/user'

    // return await getMethod<Array<Tag>>(url, await session?.user.id);

    const initialTags: Tag[] = [
        // Gastos
        { id: "t-cafe", name: "Café", categoryId: "comida", defaultAmount: 12000, color: "bg-orange-400" },
        { id: "t-almuerzo", name: "Almuerzo", categoryId: "comida", defaultAmount: 25000, color: "bg-orange-600" },
        { id: "t-coto", name: "Coto", categoryId: "comestibles", defaultAmount: 8500, color: "bg-green-600" },
        { id: "t-gas", name: "Gasolina", categoryId: "transporte", defaultAmount: 40000, color: "bg-blue-600" },
        { id: "t-uber", name: "Uber", categoryId: "transporte", defaultAmount: 15000, color: "bg-blue-400" },
        // Ingresos
        { id: "t-sueldo", name: "Sueldo", categoryId: "trabajo", defaultAmount: 25000000, color: "bg-gray-600" },
        { id: "t-intereses", name: "Intereses", categoryId: "ingreso", defaultAmount: 30000, color: "bg-green-700" },
    ]

    return initialTags;
}

const PostTagFormSchema = z.object({
    userId: z.string(),
    name: z.string().min(1, 'Name is required'),
    categoryId: z.string({
      invalid_type_error: 'Please select a category.',
    }),
})
  
const PostTag = PostTagFormSchema.omit({ userId: true });

export type TagState = {
    errors?: {
      name?: string[];
      categoryId?: string[];
    };
    message?: string | null;
};
  
export async function postTag(prevState: TagState, formData: FormData) {
    const session = await getSession();
    const url = 'tag';

    if (!session?.user.id) throw new Error('User ID is missing'); // not sure if required

    const validatedData = PostTag.safeParse({
        name: formData.get('name'),
        categoryId: formData.get('categoryId'),
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
