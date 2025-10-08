/**
 * This file contains type definitions for movements object
 */

import { TxType } from "./definitions";

export type Movement = {
  type: TxType
  categoryId: string
  tagId: string
  tagName: string
  amount: number
  date: string
  description: string
}