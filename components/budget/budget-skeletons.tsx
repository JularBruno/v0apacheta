import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

export function BudgetOverviewSkeleton() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Wallet className="w-5 h-5 text-primary-600" />
					Presupuesto Mensual
				</CardTitle>
			</CardHeader>

			<CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Budget Total */}
				<div className="text-center space-y-2">
					<p className="text-sm text-gray-500">Presupuesto Total</p>
					<div className="h-8 w-32 mx-auto bg-gray-300 rounded-lg animate-pulse" />

				</div>

				{/* Spent */}
				<div className="text-center space-y-2">
					<p className="text-sm text-gray-500">Gastado</p>
					<div className="h-8 w-32 mx-auto bg-gray-300 rounded-lg animate-pulse" />

				</div>

				{/* Remaining */}
				<div className="text-center space-y-2">
					<p className="text-sm text-gray-500">Restante</p>
					<div className="h-8 w-32 mx-auto bg-gray-300 rounded-lg animate-pulse" />

				</div>
			</CardContent>
		</Card>
	)
}