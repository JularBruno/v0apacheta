"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Movements } from "@/lib/schemas/movement";
import { Category } from "@/lib/schemas/category";
import { formatToBalance } from "@/lib/quick-spend-constants";
import { formatDateNoYear, getDateStringsForFilter, getLastNMonths } from "@/lib/dateUtils";
import { Loading } from "../ui/loading";
import { TxType } from "@/lib/schemas/definitions";
import { Badge } from "@/components/ui/badge"
import { Utensils, ShoppingCart, Car, Gamepad2, TrendingUp } from "lucide-react"
import IconComponent from "../movements/icon-component";
import { useMovements } from '@/lib/hooks/use-movements';
import { useMemo } from "react";
import { useDeleteMovement } from "@/lib/hooks/use-delete-movement";

/**
 * 
 * Recent expenses card showing a resume of last expenses
 * 
 */
export default function RecentExpenses({
	onDeleteLatestMovement
}: {
	onDeleteLatestMovement: () => void
}) {
	const { mutateAsync: deleteMutation } = useDeleteMovement();

	const movementsFilters = useMemo(() => {
		const { start } = getLastNMonths(1);
		const end = new Date();
		end.setHours(23, 59, 59, 999); // end of today — prevents newly created movements from falling outside the filter
		return getDateStringsForFilter(start, end);
	}, []);

	const { data: rawMovements = [], isLoading, isFetching } = useMovements(movementsFilters);
	const loading = isLoading || isFetching;

	const allMovements = useMemo(() =>
		[...rawMovements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		, [rawMovements]);

	const movements = useMemo(() => allMovements.slice(0, 5), [allMovements]);

	const lastFiveAmount = useMemo(() => movements.reduce((sum, item) => item.type === TxType.EXPENSE ? sum + item.amount : sum, 0),
		[movements]
	);

	const deleteLatestMovement = async () => {
		const last = movements[0];
		if (!last) return;

		try {
			await deleteMutation({ id: last.id, type: last.type, amount: last.amount });
			onDeleteLatestMovement();
		} catch (error) {
			console.log('error ', error);
			// setLoadingMovements(false);
		}
	};


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
												{movement.type === TxType.INCOME ? "+" : "-"}
												{/* {movement.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })} */}
												{formatToBalance(movement.amount)}
											</span>
										</div>

										{/* Bottom row: Icon, title and date */}
										<div className="flex items-center gap-3">
											<div
												className={cn(
													"w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
													movement.category?.color ?? (movement.type === TxType.INCOME ? "bg-emerald-500" : "bg-gray-400"),
												)}
											>
												<IconComponent icon={movement.category?.icon} className="w-4 h-4 text-white" />
											</div>
											<div className="min-w-0 flex-1">
												<p className="font-medium text-gray-900 text-sm truncate">{movement.description}</p>
												<p className="text-xs text-gray-500">
													{/* {movement.category.name} • {formatDateNoYear(movement.createdAt)} */}
													{movement.category?.name ?? "Sin categoría"} {movement.category?.deletedAt ? ' (Categoría eliminada)' : ''} • {formatDateNoYear(movement.createdAt)}
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
