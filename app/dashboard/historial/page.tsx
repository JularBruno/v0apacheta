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
import { Movement, movementSchema, MovementFormData, Movements } from "@/lib/schemas/movement";
import { TxType } from "@/lib/schemas/definitions";
import { Category } from "@/lib/schemas/category";
import { getCategoriesByUser, deleteCategoryById } from "@/lib/actions/categories";
import { deleteMovement, getMovementsByUserAndFilter, postMovement } from "@/lib/actions/movements";
import { iconComponents, formatDate, quickFilters } from "@/lib/quick-spend-constants";
import { PeriodSelector } from "@/components/transactions/period-selector"
import { toast } from "@/hooks/use-toast"

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

	const now = new Date();
	const monthName = now.toLocaleString('es-ES', { month: 'long' });
	const oneMonthAgo = now; // One month ago used in basic fetch
	oneMonthAgo.setMonth(now.getMonth() - 1);

	/**
	 * 
	 * CATEGORY 
	 * 
	 */

	const [cats, setCats] = useState<Category[]>([])

	/**
	 * Fetch Categories
	 */
	useEffect(() => {
		const fetchData = async () => {
			try {
				const cats = await getCategoriesByUser();
				setCats(cats);

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
	const [movements, setMovements] = useState<Movements[]>([])
	// All movements filtered in UI for selectedCategory, selectedType, and searchTerm
	const [filteredMovements, setFilteredMovements] = useState<Movements[]>([])
	// refresh trigger for fetching movements on deletion on when refresh required
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Loading movements for spinner
	const [loadingMovements, setLoadingMovements] = useState(true);


	/**
	 * Delete latest movement based on array last item id
	 */
	const deleteSelectedMovement = async (movement: Movements) => {
		deleteMovement(movement.id);
		toast({
			variant: "success",
			title: "Movimiento borrado!",
			description: `Se eliminó el movimiento ${movement.tag.name} y se actualizó tu balance`,
		});
		setRefreshTrigger(prev => prev + 1); // ← Triggers useEffect
	};

	/**
	 * API Fetch and api filters
	 */
	useEffect(() => {
		setLoadingMovements(true);

		const fetchData = async () => {
			try {
				// Make pagination based on time periods
				let filters: any = {
					startDate: oneMonthAgo
				};

				// Bring based on filter, since is the best option for pagination

				switch (selectedDateFilter) {
					case quickFilters[0].id: // last 24 hours (yesterday to now)
						filters.startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
						filters.endDate = now;
						break;

					case quickFilters[1].id: // last week (7 days ago to now)
						filters.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
						filters.endDate = now;
						break;

					case quickFilters[2].id: // last month (30 days ago to now)
						filters.startDate = now.getMonth() - 1;
						// filters.endDate = now;
						break;

					case quickFilters[3].id: // last 3 months (90 days ago to now)
						filters.startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

						break;

					default:
						// Handle specific month selection: "month-9-2024"
						if (selectedDateFilter.startsWith("month-")) {
							const [_, monthStr, yearStr] = selectedDateFilter.split("-");
							const month = parseInt(monthStr, 10); // 9 = October (0-indexed)
							const year = parseInt(yearStr, 10);

							filters.startDate = new Date(year, month, 1, 0, 0, 0, 0); // First day of month
							filters.endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of month
						} else {
							// Default: this month
							filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
							filters.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
						}
						break;
				}

				// get movement with filters for API
				const movements = await getMovementsByUserAndFilter(filters)

				// sort by date because these come unsorted from the backend
				let sortedMovements = movements.sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);

				setMovements(sortedMovements);
				setFilteredMovements(sortedMovements);
			} catch (error) {
				console.error('Failed to fetch movements:', error);
			}
		};

		fetchData();
	}, [selectedDateFilter, refreshTrigger]);

	/**
	 * 
	 * UI FILTERS for getting movements called by useeffect when filtering 
	 * 
	 */
	useEffect(() => {
		// remmember this is called when movements update
		setLoadingMovements(true);

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
				<div className="lg:col-span-2 xl:col-span-1">
					{/* <TransactionDonutChart transactions={filteredTransactions} categories={categories} /> */}
				</div>

				{/* Category breakdown 
				* collapsible on mobile, always visible on desktop 
				*/}
				<div className="xl:col-span-1">

					{/* Mobile: Collapsible header */}
					<div className="lg:hidden">
						<Card>
							<CardHeader className="pb-3">
								<Button
									variant="ghost"
									onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
									className="flex items-center justify-between w-full p-0 h-auto"
								>
									<CardTitle className="text-lg">Desglose de gastos por categoría {monthName}</CardTitle>
									{showCategoryBreakdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
								</Button>
							</CardHeader>
							{showCategoryBreakdown && (
								<CardContent className="pt-0">
									<div className="grid gap-4">
										{cats
											.filter((cat) => cat.type == TxType.EXPENSE)
											.map((category) => {
												const Icon = iconComponents[category.icon as keyof typeof iconComponents]
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
																	<Icon className="w-5 h-5 text-white" />
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
																{/* <p className="text-xs text-gray-500">{percentage.toFixed(0)}% usado</p> */}
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
					<div className="hidden lg:col-span-2 xl:block">
						<Card>
							<CardHeader>
								<CardTitle >Desglose de gastos por categoría {monthName}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4">
									{cats
										// .filter((cat) => cat.budget > 0)
										.map((category) => {
											const Icon = iconComponents[category.icon as keyof typeof iconComponents]

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
																{/* <category.icon className="w-4 h-4 text-white" /> */}
																<Icon className="w-4 h-4 text-white" />
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
															<p className="text-xs text-gray-500">{0}% usado</p>
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
			</div>

			{/* 
			* Movements List 
			* with integrated search and filters 
			*/}
			<Card>

				{/*
				* Card header includes not only basic filters
				* but also the Period selector
				*/}
				<CardHeader className="pb-4">
					<div className="flex flex-col space-y-4">
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Transacciones ({movements.length})</CardTitle>
							{/* <Button
								variant="destructive"
								size="sm"
								onClick={() => console.log("Undo Last Clicked")}
								className="hidden sm:flex"
							>
								Deshacer Último
							</Button> */}
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

								{/* <Button
									variant="destructive"
									size="sm"
									onClick={() => console.log("Undo Last Clicked")}
									className="sm:hidden"
								>
									Deshacer último
								</Button> */}
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
				*/}
				<CardContent>
					{loadingMovements ? (
						<Loading></Loading>
					) : filteredMovements.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							<p>No se encontraron transacciones con los filtros aplicados</p>
						</div>
					) : (
						<div className="space-y-2">
							{filteredMovements.map((movement) => {
								// const categoryInfo = getCategoryInfo(movement.categoryId)
								const Icon = iconComponents[movement.category.icon as keyof typeof iconComponents]

								return (
									<Card key={movement.id} className="p-4 hover:shadow-sm transition-all">
										<div className="flex items-center justify-between">
											{/* Left side: Icon and details */}
											<div className="flex items-center space-x-3">
												<div
													className={cn(
														"w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
														movement.category.color,
													)}
												>
													<Icon className="w-6 h-6 text-white" />
												</div>
												<div>
													<p className="font-semibold text-sm text-gray-900">{movement.tag.name}</p>
													<div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
														<span className="bg-gray-100 px-2 py-1 rounded-full">{movement.category.name}</span>
														<span>•</span>
														<span>
															{formatDate(movement.createdAt)}
														</span>
													</div>
												</div>
											</div>

											{/* Right side: Amount */}
											<div className="flex items-center gap-3 text-right">
												<span
													className={cn(
														"font-bold text-lg",
														movement.type === TxType.INCOME ? "text-green-600" : "text-gray-900",
													)}
												>
													{movement.type === TxType.INCOME ? "+" : "-"}${movement.amount}
												</span>
												<p className="text-xs text-gray-500 capitalize mt-1">{movement.type === TxType.INCOME ? "Ingreso" : "Gasto"}</p>
												<Button
													variant="outline"
													size="sm"
													onClick={() => deleteSelectedMovement(movement)}
												>
													<Trash className="w-5 h-5" />
												</Button>
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
	)
}
