"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Receipt } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import MemberManager from "@/components/dividir-cuenta/member-manager"
import ExpenseForm, { type ExpenseDraft } from "@/components/dividir-cuenta/expense-form"
import ExpenseList from "@/components/dividir-cuenta/expense-list"
import SettlementsPanel from "@/components/dividir-cuenta/settlements-panel"
import { calculateBalances, calculateSettlements, type Expense, type Member } from "@/components/dividir-cuenta/types"

export default function DividirCuentaPage() {
	const { toast } = useToast()

	const [members, setMembers] = useState<Member[]>([])
	const [expenses, setExpenses] = useState<Expense[]>([])
	const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)

	const handleAddMember = (name: string) => {
		setMembers((prev) => [...prev, { id: `member-${Date.now()}`, name }])
	}

	const handleRemoveMember = (id: string) => {
		const paidSomething = expenses.some((e) => e.paidBy === id)
		if (paidSomething) {
			toast({
				title: "No se puede quitar",
				description: "Esta persona pagó al menos un gasto — eliminá o reasigná esos gastos primero.",
				variant: "destructive",
			})
			return
		}

		setMembers((prev) => prev.filter((m) => m.id !== id))
		// Drop them from any expense they were splitting, so totals stay correct.
		setExpenses((prev) => prev.map((e) => ({ ...e, participants: e.participants.filter((p) => p !== id) })))
	}

	const editingExpense = expenses.find((e) => e.id === editingExpenseId) ?? null

	const handleSubmitExpense = (draft: ExpenseDraft) => {
		if (editingExpense) {
			setExpenses((prev) => prev.map((e) => (e.id === editingExpense.id ? { ...e, ...draft } : e)))
			setEditingExpenseId(null)
		} else {
			setExpenses((prev) => [...prev, { id: `expense-${Date.now()}`, createdAt: Date.now(), ...draft }])
		}
	}

	const handleDeleteExpense = (id: string) => {
		setExpenses((prev) => prev.filter((e) => e.id !== id))
		if (editingExpenseId === id) setEditingExpenseId(null)
	}

	const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
	const balances = calculateBalances(members, expenses)
	const settlements = calculateSettlements(balances)

	return (
		<div className="container mx-auto p-4 md:p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
					<Calculator className="w-5 h-5 text-primary" />
				</div>
				<div>
					<h1 className="text-2xl font-bold">Dividir Cuenta</h1>
					<p className="text-sm text-muted-foreground">Cargá gastos y mirá quién le debe a quién</p>
				</div>
			</div>

			<Tabs defaultValue="gastos" className="space-y-4">
				<TabsList className="w-full h-auto grid grid-cols-2 p-1.5">
					<TabsTrigger value="gastos" className="gap-2 py-3 text-base md:text-lg font-semibold">
						<Receipt className="w-5 h-5" />
						Gastos
					</TabsTrigger>
					<TabsTrigger value="liquidacion" className="gap-2 py-3 text-base md:text-lg font-semibold">
						<Calculator className="w-5 h-5" />
						Liquidación
						{settlements.length > 0 && (
							<span className="ml-1 rounded-full bg-primary/20 text-primary text-xs font-semibold px-1.5 py-0.5">
								{settlements.length}
							</span>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="gastos" className="space-y-4">
					<Card>
						<CardContent className="pt-6">
							<MemberManager members={members} onAdd={handleAddMember} onRemove={handleRemoveMember} />
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6 space-y-4">
							<ExpenseForm
								members={members}
								editingExpense={editingExpense}
								onSubmit={handleSubmitExpense}
								onCancelEdit={() => setEditingExpenseId(null)}
							/>
							<ExpenseList
								expenses={expenses}
								members={members}
								onEdit={(e) => setEditingExpenseId(e.id)}
								onDelete={handleDeleteExpense}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="liquidacion">
					<SettlementsPanel members={members} expenses={expenses} settlements={settlements} totalSpent={totalSpent} />
				</TabsContent>
			</Tabs>
		</div>
	)
}
