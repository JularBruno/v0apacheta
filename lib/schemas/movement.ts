/**
 * This file contains type definitions for movements object
 */

import { TxType } from "./definitions";
import { z } from 'zod';


export type Movement = {
  userId: string | undefined // this is required but set on post method
  type: TxType
  categoryId: string
  tagId: string | undefined
  tagName: string
  amount: number
  description: string
}

/**
 * Movement schema to post, also validate with zod
 * ACTION already adds userId
 */
export const movementSchema = z.object({
    type: z.enum([TxType.EXPENSE, TxType.INCOME]),
    // categoryId: z.string().min(1, 'Selecciona una categoría').optional(),
    categoryId: z.string().optional(),
    tagId: z.string().optional(), // Tag id is optional when creating new
    tagName: z.string().min(1, 'Ingresa una descripción, o selecciona una debajo'),
    amount: z.coerce
      .number({ invalid_type_error: 'Ingresa un monto mayor a $0' })
      .gt(0, { message: 'El monto debe ser mayor a $0' }),
    description: z.string().optional(),
})
  

export type MovementFormData = z.infer<typeof movementSchema>;

