"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Movements } from "@/lib/schemas/movement";
import { Category } from "@/lib/schemas/category";
import { formatToBalance } from "@/lib/quick-spend-constants";
import { formatDateNoYear } from "@/lib/dateUtils";
import { Loading } from "../ui/loading";
import { TxType } from "@/lib/schemas/definitions";
import { Badge } from "@/components/ui/badge"
import { Utensils, ShoppingCart, Car, Gamepad2, TrendingUp } from "lucide-react"
import IconComponent from "../transactions/icon-component";

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

						{/* Button undo latest */}
						<Button
							variant="destructive"
							size="sm"
							onClick={deleteLatestMovement}
							className="min-w-[140px] !px-1 sm:!px-2"
							disabled={loading}
						>
							{loading
								? <Loading></Loading>
								: "Deshacer Último"
							}

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

								return (

									<div key={movement.id} className="flex flex-col gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
										{/* Top row: Badge and amount */}
										<div className="flex items-center justify-between">
											<Badge
												variant={movement.type === TxType.INCOME ? "default" : "destructive"}
												className={cn(
													"text-xs",
													movement.type === TxType.INCOME && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
												)}
											>
												{movement.type === TxType.INCOME ? "Ingreso" : "Gasto"}
											</Badge>
											<span
												className={cn(
													"font-semibold text-sm tabular-nums",
													movement.type === TxType.INCOME ? "text-emerald-600" : "text-red-600",
												)}
											>
												{movement.type === TxType.INCOME ? "+" : "-"}$
												{movement.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
											</span>
										</div>

										{/* Bottom row: Icon, title and date */}
										<div className="flex items-center gap-3">
											<div
												className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", movement.category.color)}
											>
												<IconComponent icon={movement.category?.icon} className="w-4 h-4 text-white" />
											</div>
											<div className="min-w-0 flex-1">
												<p className="font-medium text-gray-900 text-sm truncate">{movement.description}</p>
												<p className="text-xs text-gray-500">
													{/* {movement.category.name} • {formatDateNoYear(movement.createdAt)} */}
													{movement.category?.name} {movement.category?.deletedAt ? ' (Categoría eliminada)' : ''} • {formatDateNoYear(movement.createdAt)}
												</p>
											</div>
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
