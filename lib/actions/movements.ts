'use server';

import { getSession, getMethod, postMethod } from "./utils";
import { Movement } from '../schemas/movement';
import { TxType } from '../schemas/definitions';

const url = 'movement'

//// get Movements with filter TODO FILTERS
export async function getMovementsByUserAndFilter(): Promise<Array<Movement>> {
    const session = await getSession();
    const url = 'movement/user'

    return await getMethod<Array<Movement>>(url, await session?.user.id);
}

export async function deleteMovement() {

    // await deleteMethod<Category>(url, id);
}

export async function postMovement(data: {
    // userId: string 
    type: TxType
    categoryId: string
    tagId?: string
    tagName: string
    amount: number
    description: string
}): Promise<Movement>  {
    const session = await getSession();

    const result = await postMethod<Movement>(url, {
        ...data,
        userId: session!.user.id
    });

    return result;
}

// const PostMovementFormSchema = z.object({
//     userId: z.string(),
//     categoryId: z.string(),
//     tagId: z.string(),
//     amount: z.coerce
//       .number()
//       .gt(0, { message: 'Please enter an amount greater than $0.' }),
//     type: z.string(),
//     description: z.string(),
// })
  
// const PostMovement = PostMovementFormSchema.omit({ userId: true });


// export type MovementState = {
//     errors?: {
//         categoryId?: string[];
//         tagId?: string[];
//         amount?: string[];
//         type?: string[];
//         description?: string[];
//     };
//     message?: string | null;
// };


