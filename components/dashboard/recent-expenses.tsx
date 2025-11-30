"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Movements } from "@/lib/schemas/movement";
import { Category } from "@/lib/schemas/category";
import { iconComponents, formatToBalance, formatDate, formatDateNoYear } from "@/lib/quick-spend-constants";
import { Loading } from "../ui/loading";
import { TxType } from "@/lib/schemas/definitions";

/**
 * 
 * Recent expenses card showing a resume of last expenses
 * 
 */
export default function RecentExpenses({
	cats,
	movements,
	lastFiveAmount,
	deleteLatestMovement,
	loading
}: {
	cats: Category[],
	movements: Movements[],
	lastFiveAmount: number,
	deleteLatestMovement: () => void
	loading: boolean
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">

					<div className="flex items-center space-x-3">
						<CardTitle>Últimos Gastos</CardTitle>
					</div>
					<div className="flex items-center">

						<a className="px-2 hidden lg:block"
							href={"/dashboard/historial"}
						>
							Ver todos
						</a>

						<Button
							variant="destructive"
							size="sm"
							onClick={deleteLatestMovement}
							className="!px-1 sm:!px-2"
						>
							Deshacer Último
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<Loading></Loading>
				) :
					movements.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							<p>No se encontraron transacciones en este último mes </p>
						</div>
					) : (
						<div className="space-y-4">

							{movements.map((movement) => {
								// const categoryInfo = getCategoryInfo(movement.categoryId)
								const Icon = iconComponents[movement.category.icon as keyof typeof iconComponents]

								return (
									<div
										key={movement.id}
										className="flex items-center justify-between p-1 lg:p-3 rounded-lg hover:bg-gray-50 transition-colors"
									>
										{/* Left side: Icon and details */}
										<div className="flex items-center space-x-3">
											<div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", movement.category.color)}>
												<Icon className="w-5 h-5 text-white" />
											</div>
											<div>
												<p className="font-medium text-gray-900 text-sm">{movement.tag.name}</p>
												<p className="text-xs text-gray-500">
													{movement.category.name} • {formatDateNoYear(movement.createdAt)}
												</p>
											</div>
										</div>

										{/* Right side: Amount */}
										<div className="flex items-center">
											<span className={cn(
												"font-semibold text-gray-900",
												movement.type === TxType.INCOME ? "text-green-600" : "text-gray-900")}
											>{movement.type === TxType.EXPENSE ? "-" : "+"} {formatToBalance(movement.tag.amount)}</span>
										</div>
									</div>
								)
							})
							}
						</div>
					)}

				{/* Summary at bottom */}
				<div className="border-t pt-4 mt-4">
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-600">Total últimos gastos</span>
						<span className="font-semibold text-gray-900">{formatToBalance(lastFiveAmount)}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
