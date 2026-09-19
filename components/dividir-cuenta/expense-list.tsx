"use client"

import { Button } from "@/components/ui/button"
import { Receipt, Pencil, Trash2 } from "lucide-react"
import type { Expense, Member } from "./types"

export default function ExpenseList({
	expenses,
	members,
	onEdit,
	onDelete,
}: {
	expenses: Expense[]
	members: Member[]
	onEdit: (expense: Expense) => void
	onDelete: (id: string) => void
}) {
	const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "?"

	if (expenses.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
				<p className="font-medium">No hay gastos todavía</p>
				<p className="text-sm mt-1">Agregá el primero arriba.</p>
			</div>
		)
	}

	return (
		<div className="space-y-2">
			{[...expenses].reverse().map((expense) => (
				<div
					key={expense.id}
					className="flex items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border"
				>
					<div className="min-w-0 flex-1">
						<p className="font-medium text-foreground truncate">{expense.description}</p>
						<p className="text-sm text-muted-foreground">
							{nameOf(expense.paidBy)} pagó ${expense.amount.toFixed(2)} · dividido entre{" "}
							{expense.participants.length === members.length
								? "todos"
								: expense.participants.map(nameOf).join(", ")}
						</p>
					</div>
					<div className="flex items-center gap-1 shrink-0">
						<Button variant="ghost" size="icon" onClick={() => onEdit(expense)} aria-label="Editar gasto">
							<Pencil className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onDelete(expense.id)}
							className="text-destructive hover:text-destructive hover:bg-destructive/10"
							aria-label="Eliminar gasto"
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>
				</div>
			))}
		</div>
	)
}
