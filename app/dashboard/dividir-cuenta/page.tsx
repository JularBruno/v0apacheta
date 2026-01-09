"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Trash2, Calculator, ArrowRight, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface Person {
	id: string
	name: string
	amount: number
}

interface Settlement {
	from: string
	to: string
	amount: number
}

export default function DividirCuentaPage() {
	const [people, setPeople] = useState<Person[]>([])
	const [newPersonName, setNewPersonName] = useState("")
	const [newPersonAmount, setNewPersonAmount] = useState("")
	const [showAddForm, setShowAddForm] = useState(false)

	// Calculate settlements (who owes whom)
	const calculateSettlements = (): Settlement[] => {
		if (people.length === 0) return []

		const totalAmount = people.reduce((sum, person) => sum + person.amount, 0)
		const averageAmount = totalAmount / people.length

		// Calculate balances (positive = owed, negative = owes)
		const balances = people.map((person) => ({
			name: person.name,
			balance: person.amount - averageAmount,
		}))

		// Separate debtors and creditors
		const debtors = balances.filter((b) => b.balance < 0).map((b) => ({ ...b, balance: Math.abs(b.balance) }))
		const creditors = balances.filter((b) => b.balance > 0)

		const settlements: Settlement[] = []

		// Match debtors with creditors
		let i = 0
		let j = 0
		while (i < debtors.length && j < creditors.length) {
			const debtAmount = debtors[i].balance
			const creditAmount = creditors[j].balance

			const settleAmount = Math.min(debtAmount, creditAmount)

			settlements.push({
				from: debtors[i].name,
				to: creditors[j].name,
				amount: settleAmount,
			})

			debtors[i].balance -= settleAmount
			creditors[j].balance -= settleAmount

			if (debtors[i].balance === 0) i++
			if (creditors[j].balance === 0) j++
		}

		return settlements
	}

	const handleAddPerson = () => {
		if (!newPersonName.trim() || !newPersonAmount || Number.parseFloat(newPersonAmount) <= 0) {
			alert("Por favor, ingresa un nombre y un monto válido.")
			return
		}

		const newPerson: Person = {
			id: `person-${Date.now()}`,
			name: newPersonName.trim(),
			amount: Number.parseFloat(newPersonAmount),
		}

		setPeople([...people, newPerson])
		setNewPersonName("")
		setNewPersonAmount("")
		setShowAddForm(false)
	}

	const handleRemovePerson = (id: string) => {
		setPeople(people.filter((p) => p.id !== id))
	}

	const totalBill = people.reduce((sum, person) => sum + person.amount, 0)
	const averagePerPerson = people.length > 0 ? totalBill / people.length : 0
	const settlements = calculateSettlements()

	return (
		<div className="container mx-auto p-4 md:p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
					<Calculator className="w-5 h-5 text-primary" />
				</div>
				<div>
					<h1 className="text-2xl font-bold">Dividir Cuenta</h1>
					<p className="text-sm text-gray-500">Divide gastos entre amigos fácilmente</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Total de la Cuenta</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${totalBill.toFixed(2)}</div>
						<p className="text-sm text-gray-500">{people.length} personas</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Promedio por Persona</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">${averagePerPerson.toFixed(2)}</div>
						<p className="text-sm text-gray-500">Debe pagar cada uno</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Liquidaciones</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{settlements.length}</div>
						<p className="text-sm text-gray-500">Transferencias necesarias</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Left Column: Add People */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Users className="w-5 h-5" />
								Personas ({people.length})
							</CardTitle>
							{!showAddForm && (
								<Button onClick={() => setShowAddForm(true)} size="sm" className="gap-1">
									<Plus className="w-4 h-4" />
									Agregar
								</Button>
							)}
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Add Person Form */}
						{showAddForm && (
							<div className="p-4 border border-dashed border-gray-300 rounded-lg space-y-4 bg-gray-50">
								<div>
									<Label htmlFor="personName">Nombre</Label>
									<Input
										id="personName"
										placeholder="Ej: Juan"
										value={newPersonName}
										onChange={(e) => setNewPersonName(e.target.value)}
									/>
								</div>
								<div>
									<Label htmlFor="personAmount">Monto Gastado</Label>
									<div className="relative">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
										<Input
											id="personAmount"
											type="number"
											placeholder="0.00"
											value={newPersonAmount}
											onChange={(e) => setNewPersonAmount(e.target.value)}
											className="pl-8"
										/>
									</div>
								</div>
								<div className="flex gap-2">
									<Button onClick={handleAddPerson} className="flex-1">
										Agregar Persona
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setShowAddForm(false)
											setNewPersonName("")
											setNewPersonAmount("")
										}}
										className="flex-1 bg-transparent"
									>
										Cancelar
									</Button>
								</div>
							</div>
						)}

						{/* People List */}
						{people.length > 0 ? (
							<div className="space-y-3">
								{people.map((person) => (
									<div
										key={person.id}
										className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
									>
										<div className="flex items-center gap-3 flex-1 min-w-0">
											<div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
												<span className="text-primary font-semibold text-sm">
													{person.name.charAt(0).toUpperCase()}
												</span>
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium text-gray-900 truncate">{person.name}</p>
												<p className="text-sm text-gray-500">Gastó: ${person.amount.toFixed(2)}</p>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<Badge
												variant="outline"
												className={cn(
													person.amount > averagePerPerson
														? "bg-green-50 text-green-700 border-green-200"
														: person.amount < averagePerPerson
															? "bg-red-50 text-red-700 border-red-200"
															: "bg-gray-50 text-gray-700 border-gray-200",
												)}
											>
												{person.amount > averagePerPerson
													? `+$${(person.amount - averagePerPerson).toFixed(2)}`
													: person.amount < averagePerPerson
														? `-$${(averagePerPerson - person.amount).toFixed(2)}`
														: "Equilibrado"}
											</Badge>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleRemovePerson(person.id)}
												className="text-red-500 hover:text-red-700 hover:bg-red-50"
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-gray-500">
								<Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
								<p className="font-medium">No hay personas agregadas</p>
								<p className="text-sm mt-1">Agrega personas para empezar a dividir la cuenta</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Right Column: Settlement Calculations */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="w-5 h-5" />
							Liquidación de Pagos
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{settlements.length > 0 ? (
							<>
								<div className="space-y-3">
									{settlements.map((settlement, index) => (
										<div
											key={index}
											className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200"
										>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<span className="font-semibold text-gray-900">{settlement.from}</span>
													<ArrowRight className="w-4 h-4 text-gray-400" />
													<span className="font-semibold text-gray-900">{settlement.to}</span>
												</div>
												<p className="text-sm text-gray-600 mt-1">
													{settlement.from} debe pagar a {settlement.to}
												</p>
											</div>
											<div className="text-right">
												<p className="text-2xl font-bold text-green-600">${settlement.amount.toFixed(2)}</p>
											</div>
										</div>
									))}
								</div>

								{/* Summary Footer */}
								<div className="border-t pt-4 space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Total a transferir:</span>
										<span className="font-semibold">
											${settlements.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Número de transferencias:</span>
										<span className="font-semibold">{settlements.length}</span>
									</div>
								</div>
							</>
						) : (
							<div className="text-center py-8 text-gray-500">
								<Calculator className="w-12 h-12 mx-auto mb-3 text-gray-300" />
								<p className="font-medium">No hay liquidaciones pendientes</p>
								<p className="text-sm mt-1">
									{people.length === 0
										? "Agrega personas para calcular"
										: "Todos están equilibrados o no hay suficientes datos"}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
