"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
	Search,
	Filter,
	X,
	Trash
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react";
import { Movements } from "@/lib/schemas/movement";
import { TxType } from "@/lib/schemas/definitions";
import { CategoryBudget } from "@/lib/schemas/category";
import { quickFilters, formatToBalance } from "@/lib/quick-spend-constants";
import { formatDate, formatDateNoYear, getDateStringsForFilter, getLastNDays, getLastNMonths, getMonthRange } from "@/lib/dateUtils";
import { PeriodSelector } from "@/components/movements/period-selector"
import { toast } from "@/hooks/use-toast"

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import IconComponent from "@/components/movements/icon-component"
import { useDashboard } from "../dashboardContext"
import CategoryBudgetList from "@/components/history/category-budget-list"
import CategoryDonutChart from "@/components/dashboard/category-donut-chart"

import {
	DonutChartSkeleton,
	CategoryBudgetListSkeleton,
	ChartCardSkeleton
} from "@/components/history/skeletons"

import { useMovements } from "@/lib/hooks/use-movements"
import { useBudget } from "@/lib/hooks/use-budget"
import { useDeleteMovement } from "@/lib/hooks/use-delete-movement"

const allFilteredId = "all"; // this the id for when selecting all on a picker as a constant

export default function HistorialPage() {
	const { mutateAsync: deleteMutation } = useDeleteMovement();

	const [searchTerm, setSearchTerm] = useState("")
	const [selectedCategory, setSelectedCategory] = useState("all")
	const [selectedType, setSelectedType] = useState("all")

	const [showFilters, setShowFilters] = useState(false)

	const now = new Date();
	const [selectedDateFilter, setSelectedDateFilter] = useState(`month-${now.getMonth()}-${now.getFullYear()}`)

	/**
	 * FILTERS
	 */

	const getFiltersForDateSelection = () => {
		let filters: any = {};
		console.log();

		// Bring based on filter, since is the best option for pagination
		switch (selectedDateFilter) { // default one month

			case quickFilters[0].id: { // last 24 hours (yesterday to now)

				// For last 24 hours
				const { start, end } = getLastNDays(1);
				const result = getDateStringsForFilter(start, end);
				filters.startDate = result.startDate;
				filters.endDate = result.endDate;
				break;
			}

			case quickFilters[1].id: { // last week (7 days ago to now)
				const { start, end } = getLastNDays(7);
				const result = getDateStringsForFilter(start, end);
				filters.startDate = result.startDate;
				filters.endDate = result.endDate;
				break;
			}

			case quickFilters[2].id: {// last month (30 days ago to now)
				const { start, end } = getLastNMonths(1);
				const result = getDateStringsForFilter(start, end);
				filters.startDate = result.startDate;
				filters.endDate = result.endDate;

				break;
			}

			case quickFilters[3].id: {// last 3 months (90 days ago to now)

				const { start, end } = getLastNMonths(3);
				const result = getDateStringsForFilter(start, end);
				filters.startDate = result.startDate;
				filters.endDate = result.endDate;

				break;
			}

			case quickFilters[4].id: {// last 6 months TEST

				const { start, end } = getLastNMonths(6);
				const result = getDateStringsForFilter(start, end);
				filters.startDate = result.startDate;
				filters.endDate = result.endDate;

				break;
			}

			// TODO REMOVE THIS
			case quickFilters[5].id: // TEST: EVERY DATES
				filters.startDate = null;
				filters.endDate = null;

				break;

			default:
				// Handle specific month selection: "month-9-2024"
				if (selectedDateFilter.startsWith("month-")) {
					const [_, monthStr, yearStr] = selectedDateFilter.split("-");

					const month = parseInt(monthStr, 10); // 9 = October (0-indexed)
					const year = parseInt(yearStr, 10);

					const { start, end } = getMonthRange(month, year);
					const result = getDateStringsForFilter(start, end);
					filters.startDate = result.startDate;
					filters.endDate = result.endDate;
				}
				break;

		}
		console.log(filters);

		return filters;
	}

	/**
	 * 
	 * CATEGORY 
	 * 
	 */

	const { cats } = useDashboard();

	// const [budgetedCats, setBudgetedCats] = useState<CategoryBudget[]>([])

	const { startDate, endDate } = useMemo(() => getFiltersForDateSelection(), [selectedDateFilter]);
	const { data: budgetedCats = [], isLoading: budgetLoading } = useBudget(startDate, endDate);

	const isSpecificMonth = selectedDateFilter.startsWith("month-");

	const periodLabel = useMemo(() => {
		if (isSpecificMonth) {
			const [, monthStr, yearStr] = selectedDateFilter.split("-");
			return new Date(parseInt(yearStr), parseInt(monthStr), 1)
				.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
		}
		return quickFilters.find(f => f.id === selectedDateFilter)?.label ?? "";
	}, [selectedDateFilter, isSpecificMonth]);

	const budgetMultiplier = useMemo(() => {
		switch (selectedDateFilter) {
			case "today": return 1 / 30;
			case "week": return 1 / 4;
			case "3months": return 3;
			case "6months": return 6;
			default: return 1; // "month" rolling 30d or specific month-X-YYYY
		}
	}, [selectedDateFilter]);

	const scaledBudgetCats = useMemo(() =>
		budgetedCats.map(cat => ({ ...cat, budget: cat.budget * budgetMultiplier })),
		[budgetedCats, budgetMultiplier]
	);

	// const getBudget = async () => {
	// 	let filters = getFiltersForDateSelection();
	// 	let budgetedCats = await getBudgetByUserAndPeriod(filters.startDate, filters.endDate);
	// 	setBudgetedCats(budgetedCats);
	// }

	// useEffect(() => {

	// 	getBudget();
	// }, [selectedDateFilter]);

	/**
	 * 
	 * MOVEMENT
	 * 
	 */

	// clear filters but date
	const clearFilters = () => {
		setSearchTerm("")
		setSelectedCategory("all")
		setSelectedType("all")
		setSelectedDateFilter("month")
	}

	// counting active filters for badge
	const activeFiltersCount = [
		searchTerm,
		selectedCategory !== "all" ? selectedCategory : "",
		selectedType !== "all" ? selectedType : "",
	].filter(Boolean).length

	const { data: rawMovements = [], isLoading: loadingMovements } = useMovements({ startDate, endDate });

	const movements = useMemo(() =>
		[...rawMovements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
		[rawMovements]
	);

	const filteredMovements = useMemo(() => {
		let filtered = movements;
		if (selectedCategory !== allFilteredId) {
			filtered = filtered.filter((m) => m.categoryId === selectedCategory);
		} else if (selectedType !== allFilteredId) {
			filtered = filtered.filter((m) => m.type === selectedType);
		}
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter((m) =>
				(m.tag?.name ?? m.description ?? '').toLowerCase().includes(term)
			);
		}
		return filtered;
	}, [movements, selectedCategory, selectedType, searchTerm]);

	useEffect(() => {
		if (!loadingMovements && filteredMovements.length === 0) {
			setShowFilters(true);
		}
	}, [filteredMovements.length, loadingMovements]);

	const movementsTotal = useMemo(() => filteredMovements.reduce((sum, item) => item.type === TxType.EXPENSE ? sum + item.amount : sum, 0), [filteredMovements]);
	const movementsTotalIncome = useMemo(() => filteredMovements.reduce((sum, item) => item.type === TxType.INCOME ? sum + item.amount : sum, 0), [filteredMovements]);
	const movementsAverage = useMemo(() => movementsTotal / (filteredMovements.length || 1), [movementsTotal, filteredMovements.length]);

	const deleteSelectedMovement = async (movement: Movements) => {
		const ok = confirm(`¿Seguro que querés borrar el movimiento "${movement.tag?.name ?? movement.description}"?`);
		if (!ok) return;

		await deleteMutation({ id: movement.id, type: movement.type, amount: movement.amount });
		toast({
			variant: "success",
			title: "Movimiento borrado!",
			description: `Se eliminó el movimiento ${movement.tag?.name ?? movement.description} y se actualizó tu balance`,
		});
	};

	// selectedCategory selectedType Reset the opposite filter when one is changed for common sense usage, attempted to do in if but required useeffect
	useEffect(() => {
		if (selectedCategory !== allFilteredId) setSelectedType(allFilteredId);
	}, [selectedCategory]);

	useEffect(() => {
		if (selectedType !== allFilteredId) setSelectedCategory(allFilteredId);
	}, [selectedType]);


	// if (loadingMovements) return (
	// 	<LoadingHistory />
	// );

	return (
		<div className="space-y-6">
			{/* 
			* Donut Chart and categories presupuestos
			*/}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

				{/* Category Budget Breakdown - only for specific month selection */}
				{isSpecificMonth && (
					budgetLoading ? (
						<CategoryBudgetListSkeleton itemCount={5} />
					) : (
						<CategoryBudgetList budgetedCategories={scaledBudgetCats} label={periodLabel} />
					)
				)}

				{/* Donut Chart - full width when budget list is hidden */}
				<div className={!isSpecificMonth ? "lg:col-span-2" : ""}>
					{budgetLoading ? (
						<ChartCardSkeleton titleWidth="max-w-48">
							<DonutChartSkeleton legendItems={4} />
						</ChartCardSkeleton>
					) : (
						<CategoryDonutChart budgetedCategories={scaledBudgetCats} label={periodLabel} />
					)}
				</div>

				{/* 
				* Movements List 
				* with integrated search and filters 
				*/}
				<Card
					className="lg:col-span-2"
				// className="lg:col-span-1"
				>

					{/*
					* Card header includes not only basic filters
					* but also the Period selector
					*/}
					<CardHeader className="pb-4">
						<div className="flex flex-col space-y-4">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">Transacciones ({movements.length})</CardTitle>

							</div>

							{/* Search and Filter Controls - Mobile optimized */}
							<div className="flex flex-col sm:flex-row gap-3">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Buscar transacciones..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>

								<div className="flex gap-2 ">
									<Button
										variant="outline"
										onClick={() => setShowFilters(!showFilters)}
										className="flex items-center gap-2"
									>
										<Filter className="w-4 h-4" />
										<span className="hidden sm:inline">Filtros</span>
										{activeFiltersCount > 0 && (
											<Badge variant="secondary" className="ml-1">
												{activeFiltersCount}
											</Badge>
										)}
									</Button>

								</div>
							</div>
						</div>

						{/* 
					* Rest of the filters section remains the same 
					* If tilters not hidden on mobile, this will show
					*/}
						{showFilters && (
							<div className="mt-4 pt-4 border-t space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
									{/* Category Filter */}
									<div>
										<Label>Categoría</Label>
										<Select value={selectedCategory} onValueChange={setSelectedCategory}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem key={allFilteredId} value={allFilteredId}>
													<div className="flex items-center gap-2">
														<div className="w-3 h-3 rounded-full bg-gray-500" />
														Todas
													</div>
												</SelectItem>
												{cats.map((category) => (

													<SelectItem key={category.id} value={category.id}>
														<div className="flex items-center gap-2">
															<div className={cn("w-3 h-3 rounded-full", category.color)} />
															{category.name}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{/* Type Filter */}
									<div>
										<Label>Tipo</Label>
										<Select value={selectedType} onValueChange={setSelectedType}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={allFilteredId}>Todos</SelectItem>
												<SelectItem value={TxType.EXPENSE}>Gastos</SelectItem>
												<SelectItem value={TxType.INCOME}>Ingresos</SelectItem>
											</SelectContent>
										</Select>
									</div>

								</div>

								{/* Clear Filters */}
								{activeFiltersCount > 0 && (
									<div className="flex justify-end">
										<Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1">
											<X className="w-4 h-4" />
											Limpiar filtros
										</Button>
									</div>
								)}
								{/* Period selector */}
								<div className="border-t pt-4">
									<Label className="mb-3 block">Período</Label>
									<PeriodSelector selected={selectedDateFilter} onSelect={setSelectedDateFilter} />
								</div>
							</div>

						)}
					</CardHeader>

					{/*
					* Card content with list of movements
					* also the total and average
					*/}
					<CardContent>

						{filteredMovements.length > 0 && (
							<div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

									<div className="flex items-center gap-6">
										{/* <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] items-center gap-6"> */}
										<div>
											<p className="text-xs text-gray-500 mb-1">Total gastos</p>
											<p className="text-lg font-semibold text-gray-900">{formatToBalance(movementsTotal)}</p>
										</div>
										{/* <div className="h-8 w-px bg-gray-300" /> */}

										{/* <div>
											<p className="text-xs text-gray-500 mb-1">Total Ingresos</p>
											<p className="text-lg font-semibold text-gray-900">{formatToBalance(movementsTotalIncome)}</p>
										</div> */}
										{/* <div className="h-8 w-px bg-gray-300" /> */}
										{(selectedCategory != "all" || selectedType != "all" || searchTerm) && (
											<div>
												<p className="text-xs text-gray-500 mb-1">Promedio</p>
												<p className="text-lg font-semibold text-gray-900">{formatToBalance(movementsAverage)}</p>
											</div>
										)}
									</div>

									<div className="text-xs text-gray-500">
										{filteredMovements.length} {filteredMovements.length === 1 ? "movimiento" : "movimientos"}
									</div>
								</div>
							</div>
						)}

						{
							loadingMovements ? (
								<Loading></Loading>
							)
								: (
									<div className="space-y-2">

										{
											filteredMovements.length === 0 ?
												<div className="text-center py-8 text-gray-500">
													<p>No se encontraron transacciones con los filtros aplicados</p>
												</div>
												:
												filteredMovements.map((movement) => {

													return (
														<Card key={movement.id} className="p-3 hover:shadow-sm transition-all md:p-4">
															<div className="flex flex-col space-y-3">
																{/* Top row: Badge (left) + Dropdown Menu (right) */}
																<div className="flex items-center justify-between">
																	<span className="bg-gray-100 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700">
																		{movement.category?.name} {movement.category?.deletedAt ? ' (Categoría borrada en ' + formatDateNoYear(movement.category?.deletedAt) + ')' : ''}
																	</span>
																	{/* Menu on top */}
																	<DropdownMenu>
																		<DropdownMenuTrigger asChild>
																			<button className="p-1 hover:bg-gray-100 rounded">
																				<MoreHorizontal className="w-4 h-4 text-gray-500" />
																			</button>
																		</DropdownMenuTrigger>
																		<DropdownMenuContent align="end">
																			<DropdownMenuItem className="text-red-600" onClick={() => deleteSelectedMovement(movement)}>
																				<Trash className="w-4 h-4 mr-2" />
																				Borrar
																			</DropdownMenuItem>
																		</DropdownMenuContent>
																	</DropdownMenu>
																</div>

																{/* Middle: Icon + Title */}
																<div className="flex items-center space-x-3">
																	<div
																		className={cn(
																			"w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0",
																			movement.category?.color ?? (movement.type === TxType.INCOME ? "bg-emerald-500" : "bg-gray-400"),
																		)}
																	>
																		<IconComponent icon={movement.category?.icon} className="w-5 h-5 text-white" />
																	</div>
																	<p className="font-semibold text-sm text-gray-900 line-clamp-2 flex-1">{movement.tag?.name ?? movement.description}</p>
																</div>

																{/* Bottom row: Date (left) + Amount (right) */}
																<div className="flex items-center justify-between">
																	<span className="text-xs text-gray-500">
																		{/* {formatDateNoYear(movement.createdAt)} */}

																		{formatDate(movement.createdAt)}
																	</span>
																	<span
																		className={
																			movement.type === TxType.INCOME ? "font-bold text-lg text-green-600" : "font-bold text-lg text-gray-900"
																		}
																	>
																		{movement.type === TxType.INCOME ? "+" : "-"}
																		{formatToBalance(movement.amount)}
																	</span>
																</div>
															</div>
														</Card>
													)
												})}
									</div>
								)}
					</CardContent>
				</Card>
			</div>
		</div>

	)
}
