import { TxType } from "./definitions";
import { z } from 'zod';

/**
 * Category type with userId, equal to api
 */
export type Category = {
  id: string 
  // userId: string 
  name: string
  color: string
  icon: string
  type: TxType
}

/**
 * Category schema to post and update, also validate with zod
 * ACTION already adds userId
 * Update requires id on path
 */
export const categorySchema = z.object({
    name: z.string().min(1, 'Ingresa un nombre').max(20, "Intenta que tenga menos de 20 caracteres"),
    icon: z.string().min(1, 'icon is required'),
    color: z.string().min(1, 'color is required'),
    type: z.enum([TxType.EXPENSE, TxType.INCOME])
})

