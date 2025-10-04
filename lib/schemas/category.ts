import { TxType } from "./definitions";

/**
 * as for now movements will be a type, when finished on api should be updated TODO
 */
export type Category = {
  id: string
  name: string
  color: string
  icon: string
  kind: TxType
}

