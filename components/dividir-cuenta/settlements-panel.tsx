"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calculator, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Expense, Member, Settlement } from "./types"

export default function SettlementsPanel({
	members,
	expenses,
	settlements,
	totalSpent,
}: {
	members: Member[]
	expenses: Expense[]
	settlements: Settlement[]
	totalSpent: number
}) {
	const { toast } = useToast()
	const [copied, setCopied] = useState(false)

	const handleCopy = () => {
		let message = "💰 DIVISIÓN DE CUENTA\n\n"
		message += `📊 Total gastado: $${totalSpent.toFixed(2)}\n`
		message += `👥 ${members.length} personas · ${expenses.length} gastos\n\n`

		if (settlements.length > 0) {
			message += "💸 QUIÉN LE DEBE A QUIÉN:\n\n"
			settlements.forEach((s, i) => {
				message += `${i + 1}. ${s.from} → ${s.to}: $${s.amount.toFixed(2)}\n`
			})
		} else {
			message += "✅ Todos están equilibrados.\n"
		}

		message += "\n✨ Hecho con Apacheta.ar"

		navigator.clipboard.writeText(message).then(() => {
			setCopied(true)
			toast({ title: "Copiado", description: "Resumen de liquidación copiado al portapapeles" })
			setTimeout(() => setCopied(false), 2000)
		})
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<Card className="md:col-span-1">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">Total de la cuenta</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
					<p className="text-sm text-muted-foreground">
						{members.length} personas · {expenses.length} gastos
					</p>
				</CardContent>
			</Card>

			<Card className="md:col-span-2">
				<CardHeader>
					<div className="flex items-center justify-between gap-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<Calculator className="w-4 h-4" />
							Quién le debe a quién
						</CardTitle>
						{settlements.length > 0 && (
							<Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 bg-transparent">
								{copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
								<span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{settlements.length > 0 ? (
						<div className="space-y-2">
							{settlements.map((s, i) => (
								<div
									key={i}
									className="flex items-center justify-between gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
								>
									<div className="flex items-center gap-2 text-sm font-medium text-foreground">
										<span>{s.from}</span>
										<ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
										<span>{s.to}</span>
									</div>
									<span className="font-bold text-foreground">${s.amount.toFixed(2)}</span>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground text-center py-6">
							{expenses.length === 0
								? "Agregá gastos en la otra pestaña para calcular quién le debe a quién."
								: "Todos están equilibrados."}
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
