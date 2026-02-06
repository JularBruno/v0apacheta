"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
	Search,
	Filter,
	X,
	ChevronDown,
	ChevronUp,
	Trash
} from "lucide-react"
import { cn } from "@/lib/utils"
import TransactionDonutChart from "@/components/dashboard/transaction-donut-chart"
import { useEffect, useState } from "react";
import { Movements } from "@/lib/schemas/movement";
import { TxType } from "@/lib/schemas/definitions";
import { Category } from "@/lib/schemas/category";
import { getCategoriesByUser } from "@/lib/actions/categories";
import { deleteMovement, getMovementsByUserAndFilter, postMovement } from "@/lib/actions/movements";
import { quickFilters, formatNumberToInput, formatToBalance } from "@/lib/quick-spend-constants";
import { formatDate, getDateStringsForFilter, formatDateNoYear, getLastNDays, getLastNMonths, getMonthRange, getMonthName } from "@/lib/dateUtils";
import { PeriodSelector } from "@/components/transactions/period-selector"
import { toast } from "@/hooks/use-toast"

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import IconComponent from "@/components/transactions/icon-component"
import { unstable_cache } from "next/cache"
import { getSession } from "@/lib/actions/utils"

export default function HistorialPage() {

	const allFilteredId = "all"; // this the id for when selecting all on a picker as a constant

	const [searchTerm, setSearchTerm] = useState("")
	const [selectedCategory, setSelectedCategory] = useState("all")
	const [selectedType, setSelectedType] = useState("all")
	const [selectedDateFilter, setSelectedDateFilter] = useState("month")

	const [showFilters, setShowFilters] = useState(false)
	// Hide or show category on mobile
	const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false)

	/**
	 * 
	 * DATE 
	 * 
	 */
	const monthName = getMonthName(); // Uses current date

	/**
	 * 
	 * CATEGORY 
	 * 
	 */

	const [cats, setCats] = useState<Category[]>([])
	const [catsEmpty, setEmptyCats] = useState<Category[]>([])
	const [loadingCats, setLoadingCats] = useState<boolean>(true)

	/**
	 * Fetch Categories
	 */
	useEffect(() => {
		const fetchData = async () => {
			try {
				const cats = await getCategoriesByUser();
				setCats(cats);
				setLoadingCats(false);
			} catch (error) {
				console.error('Failed to fetch categories:', error);
			}
		};

		fetchData();
	}, []);


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

	// ALl movements from api. Filtered by default one month ago 
	const [movements, setMovements] = useState<Movements[]>([]);
	// All movements filtered in UI for selectedCategory, selectedType, and searchTerm
	const [filteredMovements, setFilteredMovements] = useState<Movements[]>([])

	// random data thats cool set on MovementsFetch
	const [movementsTotal, setMovementsTotal] = useState<number>(0);
	const [movementsTotalIncome, setMovementsTotalIncome] = useState<number>(0);
	const [movementsAverage, setMovementsAverage] = useState<number>(0);

	// refresh trigger for fetching movements on deletion on when refresh required
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Loading movements for spinner
	const [loadingMovements, setLoadingMovements] = useState(true);

	const deleteSelectedMovement = async (movement: Movements) => {
		const ok = confirm(
			`¿Seguro que querés borrar el movimiento "${movement.tag.name}"?`
		);

		if (!ok) return;

		await deleteMovement(movement.id);

		toast({
			variant: "success",
			title: "Movimiento borrado!",
			description: `Se eliminó el movimiento ${movement.tag.name} y se actualizó tu balance`,
		});

		setRefreshTrigger(prev => prev + 1);
	};



	/**
	 * API Fetch and api filters
	 */

	const fetchData = async () => {
		try {
			// Make pagination based on time periods
			let filters: any = {
			};

			// Bring based on filter, since is the best option for pagination
			switch (selectedDateFilter) { // default one is "month"
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

					const { start, end } = getLastNMonths(6);
					const result = getDateStringsForFilter(start, end);
					filters.startDate = result.startDate;
					filters.endDate = result.endDate;

					break;
				}

				case quickFilters[3].id: {// last 6 months TEST

					const { start, end } = getLastNMonths(3);
					const result = getDateStringsForFilter(start, end);
					filters.startDate = result.startDate;
					filters.endDate = result.endDate;

					break;
				}

				case quickFilters[4].id: // TEST: EVERY DATES
					// filters.startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
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

			// get movement with filters for API
			const movements = await getMovementsByUserAndFilter(filters)
			// const session = await getSession();

			// const getMovementsCache = unstable_cache(async () => {
			// 	return await getMovementsByUserAndFilter(filters)
			// },
			// 	['movements-api'],
			// 	{ revalidate: 3600, tags: ['movements'] }
			// );

			// const movements = await getMovementsCache();

			// sort by date because these come unsorted from the backend
			let sortedMovements = movements.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);

			let calculateMovementsTotal = movements.reduce((sum, item) => {
				if (item.type === TxType.EXPENSE) {
					return sum + item.amount;
				}
				return sum;
			}, 0);

			let calculateMovementsTotalIncome = movements.reduce((sum, item) => {
				if (item.type === TxType.INCOME) {
					return sum + item.amount;
				}
				return sum;
			}, 0);

			// setMovements(sortedMovements);
			// setFilteredMovements(sortedMovements);
			setMovementsTotal(calculateMovementsTotal);
			setMovementsTotalIncome(calculateMovementsTotalIncome);
			setMovementsAverage(calculateMovementsTotal / movements.length);

			return sortedMovements;
		} catch (error) {
			console.error('Failed to fetch movements:', error);
		}
	};

	useEffect(() => {
		const load = async () => {
			const movements: any = await fetchData()
			setMovements(movements)
		}
		load();
	}, [selectedDateFilter, refreshTrigger])


	/**
	 * UI FILTERS for getting movements called by useeffect when filtering 
	 */
	useEffect(() => {
		// remmember this is called when movements update
		// setLoadingMovements(true);

		let filtered = movements;

		// Apply category filter
		if (selectedCategory !== allFilteredId) {
			filtered = movements.filter((m) => m.categoryId === selectedCategory);
		}
		// Apply type filter (only if no category is selected)
		else if (selectedType !== allFilteredId) {
			filtered = movements.filter((m) => m.type === selectedType);
		}

		// search term input
		if (searchTerm) {
			filtered = filtered.filter((transaction) => transaction.tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
		}

		let calculateMovementsTotal = filtered.reduce((sum, item) => {
			if (item.type === TxType.EXPENSE) {
				return sum + item.amount;
			}
			return sum;
		}, 0);

		let calculateMovementsTotalIncome = filtered.reduce((sum, item) => {
			if (item.type === TxType.INCOME) {
				return sum + item.amount;
			}
			return sum;
		}, 0);

		setMovementsTotal(calculateMovementsTotal);
		setMovementsTotalIncome(calculateMovementsTotalIncome);
		setMovementsAverage(calculateMovementsTotal / filtered.length);

		// console.log("setFilteredMovements ", filtered);
		// console.log("setFilteredMovements ", filtered.find(a => a.category === null));

		setFilteredMovements(filtered);

		setLoadingMovements(false);
	}, [movements, selectedCategory, selectedType, searchTerm]);

	// selectedCategory selectedType Reset the opposite filter when one is changed for common sense usage, attempted to do in if but required useeffect
	useEffect(() => {
		if (selectedCategory !== allFilteredId) setSelectedType(allFilteredId);
	}, [selectedCategory]);

	useEffect(() => {
		if (selectedType !== allFilteredId) setSelectedCategory(allFilteredId);
	}, [selectedType]);


	return (
		<div className="space-y-6">
			{/* 
			* Donut Chart and categories presupuestos
			*/}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Chart - always visible */}
				{/* <div className="lg:col-span-2 xl:col-span-1">
					<TransactionDonutChart movements={movements} categories={cats} />
				</div> */}

				{/* Category breakdown 
				* collapsible on mobile, always visible on desktop 
				*/}
				<div className="xl:col-span-1 hidden">

					{/* Mobile: Collapsible header */}
					<div className="lg:hidden">
						<Card>
							<CardHeader className="pb-3">
								<Button
									variant="ghost"
									onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
									className="flex items-center justify-between w-full p-0 h-auto"
								>
									<CardTitle className="text-lg">Gastos por categoría: {monthName}</CardTitle>
									{showCategoryBreakdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
								</Button>
							</CardHeader>
							{loadingCats ? (
								<Loading></Loading>
							) :
								showCategoryBreakdown && (
									<CardContent className="pt-0">
										<div className="grid gap-4">
											{/* {cats */}
											{catsEmpty
												.filter((cat) => cat.type == TxType.EXPENSE)
												.map((category) => {
													const amountUsedThisMonth = filteredMovements.filter(m => m.categoryId === category.id).reduce((sum, m) => sum + m.amount, 0);

													// const spent = filteredTransactions
													//   .filter((t) => t.type === "gasto" && t.category === category.id)
													//   .reduce((sum, t) => sum + t.amount, 0)
													// const remaining = category.budget - spent
													// const percentage = (spent / category.budget) * 100

													return (
														<Card key={category.id} className="p-4">
															<div className="flex items-center justify-between mb-3">
																<div className="flex items-center gap-3">
																	<div
																		className={cn(
																			"w-10 h-10 rounded-lg flex items-center justify-center",
																			category.color,
																		)}
																	>
																		<IconComponent icon={category?.icon} />
																	</div>
																	<div>
																		<p className="font-medium text-sm">{category.name}</p>
																		<p className="text-xs text-gray-500">
																			{/* ${spent.toFixed(0)} de ${category.budget} */}
																		</p>
																	</div>
																</div>
																<div className="text-right">
																	<p
																		className={cn(
																			// "font-semibold text-sm",
																			// spent > category.budget ? "text-red-600" : "text-gray-900",
																			"font-semibold text-sm text-red-600",
																		)}
																	>
																		{/* ${remaining.toFixed(0)} restante */}
																		${100} restante
																	</p>
																	<p className="text-xs text-gray-500">{0}% usado. Total gastado: ${amountUsedThisMonth}</p>
																</div>
															</div>
															<Progress
																// value={Math.min(100, percentage)}
																// className={cn(
																//   "h-2",
																//   spent > category.budget ? "[&>div]:bg-red-500" : "[&>div]:bg-primary-500",
																// )}
																value={400}
																className="h-2 bg-red-500"
															/>
														</Card>
													)
												})}
										</div>
									</CardContent>
								)}
						</Card>
					</div>

					{/* Desktop: Always visible */}
					<div className="hidden lg:col-span-1 xl:block">
						<Card>
							<CardHeader>
								<CardTitle >Desglose de gastos por categoría {monthName}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4">
									{loadingCats ? (
										<Loading></Loading>
									) :
										// cats
										catsEmpty
											// .filter((cat) => cat.budget > 0)
											.map((category) => {
												const amountUsedThisMonth = filteredMovements.filter(m => m.categoryId === category.id).reduce((sum, m) => sum + m.amount, 0);

												// const spent = filteredTransactions
												//   .filter((t) => t.type === "gasto" && t.category === category.id)
												//   .reduce((sum, t) => sum + t.amount, 0)
												// const remaining = category.budget - spent
												// const percentage = (spent / category.budget) * 100

												return (
													<Card key={category.id} className="p-4">
														<div className="flex items-center justify-between mb-2">
															<div className="flex items-center gap-3">
																<div
																	className={cn("w-8 h-8 rounded-lg flex items-center justify-center", category.color)}
																>
																	<IconComponent icon={category?.icon} className="w-4 h-4 text-white" />
																</div>
																<div>
																	<p className="font-medium text-sm">{category.name}</p>
																	<p className="text-xs text-gray-500">
																		{/* ${spent.toFixed(0)} de ${category.budget} */}
																	</p>
																</div>
															</div>
															<div className="text-right">
																<p
																	// className={cn(
																	//   "font-semibold text-sm",
																	//   spent > category.budget ? "text-red-600" : "text-gray-900",
																	// )}
																	className={"font-semibold text-sm text-gray-900"}
																>
																	{/* ${remaining.toFixed(0)} restante */}
																	${100} restante
																</p>
																{/* <p className="text-xs text-gray-500">{percentage.toFixed(0)}% usado</p> */}
																<p className="text-xs text-gray-500">{0}% usado. Total gastado: ${amountUsedThisMonth}</p>
															</div>
														</div>
														<Progress
															// value={Math.min(100, percentage)}
															// className={cn(
															// 	"h-2",
															// 	spent > category.budget ? "[&>div]:bg-red-500" : "[&>div]:bg-primary-500",
															// )
															value={50}
															className={
																"h-2 [&>div]:bg-primary-500"}
														/>
													</Card>
												)
											})}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* </div> */}

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
								// : filteredMovements.length === 0 ? (
								// 	<div className="text-center py-8 text-gray-500">
								// 		<p>No se encontraron transacciones con los filtros aplicados</p>
								// 	</div>
								// ) 
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
																			movement.category.color,
																		)}
																	>
																		<IconComponent icon={movement.category?.icon} className="w-5 h-5 text-white" />
																	</div>
																	<p className="font-semibold text-sm text-gray-900 line-clamp-2 flex-1">{movement.tag.name}</p>
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
