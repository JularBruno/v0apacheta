"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormattedAmountInput } from "@/components/balance-input/formatted-amount-input"
import { useToast } from "@/hooks/use-toast"
import type { Expense, Member } from "./types"

export interface ExpenseDraft {
	description: string
	amount: number
	paidBy: string
	participants: string[]
}

export default function ExpenseForm({
	members,
	editingExpense,
	onSubmit,
	onCancelEdit,
}: {
	members: Member[]
	/** non-null while editing an existing expense — prefills and switches to "save" mode */
	editingExpense: Expense | null
	onSubmit: (draft: ExpenseDraft) => void
	onCancelEdit: () => void
}) {
	const { toast } = useToast()

	const [description, setDescription] = useState("")
	const [amount, setAmount] = useState(0)
	const [paidBy, setPaidBy] = useState("")
	const [participants, setParticipants] = useState<string[]>([])
	// Bumped after a successful "add" submit to force-remount the amount input
	// (it owns its own display text — see FormattedAmountInput — so clearing
	// the outer `amount` state alone wouldn't clear what's shown on screen).
	const [formGeneration, setFormGeneration] = useState(0)

	// Prefill when entering edit mode; reset (all members participating, first
	// member as default payer) whenever the member list changes and nothing's
	// being edited — keeps a fast "just add another expense" flow.
	useEffect(() => {
		if (editingExpense) {
			setDescription(editingExpense.description)
			setAmount(editingExpense.amount)
			setPaidBy(editingExpense.paidBy)
			setParticipants(editingExpense.participants)
		} else {
			setPaidBy((prev) => (members.some((m) => m.id === prev) ? prev : (members[0]?.id ?? "")))
			setParticipants((prev) => (prev.length > 0 ? prev.filter((id) => members.some((m) => m.id === id)) : members.map((m) => m.id)))
		}
	}, [editingExpense, members])

	// Key + seed value for the amount input: remounts fresh (via the changing
	// key) whenever we switch to editing a different expense, or after a
	// successful add — each time computed straight from props/authoritative
	// state, not from `amount` itself, so there's no lag waiting on the effect above.
	const amountInputKey = editingExpense ? `edit-${editingExpense.id}` : `new-${formGeneration}`
	const amountInputSeed = editingExpense ? editingExpense.amount : 0

	const reset = () => {
		setDescription("")
		setAmount(0)
		setParticipants(members.map((m) => m.id))
		setFormGeneration((g) => g + 1)
	}

	const toggleParticipant = (id: string) => {
		setParticipants((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
	}

	const handleSubmit = () => {
		if (!description.trim()) {
			toast({ title: "Error", description: "Ingresá una descripción.", variant: "destructive" })
			return
		}
		if (!amount || amount <= 0) {
			toast({ title: "Error", description: "Ingresá un monto válido.", variant: "destructive" })
			return
		}
		if (!paidBy) {
			toast({ title: "Error", description: "Elegí quién pagó.", variant: "destructive" })
			return
		}
		if (participants.length === 0) {
			toast({ title: "Error", description: "Elegí entre quiénes se divide.", variant: "destructive" })
			return
		}

		onSubmit({ description: description.trim(), amount, paidBy, participants })
		reset()
	}

	if (members.length === 0) {
		return <p className="text-sm text-muted-foreground">Agregá al menos una persona para poder cargar gastos.</p>
	}

	return (
		<div className="p-4 border border-dashed border-border rounded-lg space-y-4 bg-muted/50">
			<div>
				<Label htmlFor="expense-description">Descripción</Label>
				<Input
					id="expense-description"
					placeholder="Ej: Cena, Nafta, Alquiler"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div>
					<Label htmlFor="expense-amount">Monto</Label>
					<FormattedAmountInput
						key={amountInputKey}
						id="expense-amount"
						initialValue={amountInputSeed}
						onChange={setAmount}
					/>
				</div>
				<div>
					<Label>Pagó</Label>
					<Select value={paidBy} onValueChange={setPaidBy}>
						<SelectTrigger>
							<SelectValue placeholder="Quién pagó" />
						</SelectTrigger>
						<SelectContent>
							{members.map((m) => (
								<SelectItem key={m.id} value={m.id}>
									{m.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div>
				<Label className="mb-2 block">Se divide entre</Label>
				<div className="flex flex-wrap gap-x-4 gap-y-2">
					{members.map((m) => (
						<label key={m.id} className="flex items-center gap-2 text-sm">
							<Checkbox checked={participants.includes(m.id)} onCheckedChange={() => toggleParticipant(m.id)} />
							{m.name}
						</label>
					))}
				</div>
			</div>

			<div className="flex gap-2">
				<Button onClick={handleSubmit} className="flex-1">
					{editingExpense ? "Guardar cambios" : "Agregar gasto"}
				</Button>
				{editingExpense && (
					<Button variant="outline" onClick={onCancelEdit} className="flex-1 bg-transparent">
						Cancelar
					</Button>
				)}
			</div>
		</div>
	)
}
