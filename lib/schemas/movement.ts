/**
 * This file contains type definitions for movements object
 */

import { TxType } from "./definitions";



/**
 * as for now movements will be a type, when finished on api should be updated TODO
 */
export type Movement = {
  type: TxType
  categoryId: string
  tagId: string
  tagName: string
  amount: number
  date: string
  time: string
}