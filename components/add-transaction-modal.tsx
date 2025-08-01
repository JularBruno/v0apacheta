"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import TransactionForm from "@/components/transaction-form" // Import the new form component

interface FinancialItem {
  id: string
  name: string
  type: "asset" | "liability"
  currentValue: number
}

interface TransactionFormData {
  type: "gasto" | "ingreso"
  amount: number
  title: string
  category: string
  date: string
  time: string
}

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: TransactionFormData) => void
  item: FinancialItem | null
  initialTransactionType: "gasto" | "ingreso"
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSave,
  item,
  initialTransactionType,
}: AddTransactionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialTransactionType === "gasto" ? "Agregar Gasto" : "Agregar Ingreso"} para {item?.name}
          </DialogTitle>
        </DialogHeader>
        <TransactionForm onComplete={onSave} onCancel={onClose} initialType={initialTransactionType} />
      </DialogContent>
    </Dialog>
  )
}
