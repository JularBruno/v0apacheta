"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
	Utensils,
	ShoppingCart,
	Car,
	Home,
	Gamepad2,
	Zap,
	Gift,
	Sparkles,
	Briefcase,
	Plane,
	DollarSign,
	Search,
	Filter,
	X,
	ChevronDown,
	ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import TransactionDonutChart from "@/components/dashboard/transaction-donut-chart"
import { useEffect } from "react";
import { Movement, movementSchema, MovementFormData, Movements } from "@/lib/schemas/movement";
import { TxType } from "@/lib/schemas/definitions";
import { Category } from "@/lib/schemas/category";
import { getCategoriesByUser, deleteCategoryById } from "@/lib/actions/categories";
import { getMovementsByUserAndFilter, postMovement } from "@/lib/actions/movements";
import { iconComponents, formatDate } from "@/lib/quick-spend-constants";
import { PeriodSelector } from "@/components/transactions/period-selector"

// Mock transaction data
const mockTransactions = [
	{
		id: "1",
		title: "Almuerzo en restaurante",
		amount: 45.5,
		type: "gasto" as const,
		category: "comida",
		date: "2024-07-09",
		time: "14:30",
	},
	{
		id: "2",
		title: "Supermercado Coto",
		amount: 89.2,
		type: "gasto" as const,
		category: "comestibles",
		date: "2024-07-08",
		time: "18:45",
	},
	{
		id: "3",
		title: "Uber al centro",
		amount: 12.75,
		type: "gasto" as const,
		category: "transporte",
		date: "2024-07-08",
		time: "16:20",
	},
	{
		id: "4",
		title: "Salario mensual",
		amount: 2500.0,
		type: "ingreso" as const,
		category: "trabajo",
		date: "2024-07-01",
		time: "09:00",
	},
	{
		id: "5",
		title: "Netflix suscripción",
		amount: 8.99,
		type: "gasto" as const,
		category: "entretenimiento",
		date: "2024-07-02",
		time: "10:00",
	},
	{
		id: "6",
		title: "Café con amigos",
		amount: 15.3,
		type: "gasto" as const,
		category: "comida",
		date: "2024-07-02",
		time: "16:15",
	},
	{
		id: "7",
		title: "Gasolina",
		amount: 35.0,
		type: "gasto" as const,
		category: "transporte",
		date: "2024-07-01",
		time: "08:30",
	},
	{
		id: "8",
		title: "Compras en farmacia",
		amount: 22.5,
		type: "gasto" as const,
		category: "belleza",
		date: "2024-06-30",
		time: "19:15",
	},
]

const dateFilters = [
	{ id: "today", label: "Hoy" },
	{ id: "week", label: "Esta semana" },
	{ id: "month", label: "Este mes" },
	{ id: "3months", label: "Últimos 3 meses" },
	{ id: "custom", label: "Personalizado" },
]

export default function HistorialPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedCategory, setSelectedCategory] = useState("all")
	const [selectedType, setSelectedType] = useState("all")
	const [selectedDateFilter, setSelectedDateFilter] = useState("month")
	const [minAmount, setMinAmount] = useState("")
	const [maxAmount, setMaxAmount] = useState("")
	const [showFilters, setShowFilters] = useState(false)

	// Hide or show category on mobile
	const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false)



	/**
	 * 
	 * DATE 
	 * 
	 */

	const now = new Date();

	const thisMonth = now.getMonth();
	const monthName = now.toLocaleString('es-ES', { month: 'long' });

	const thisYear = now.getFullYear();

	const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // first day of month
	const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // last day of month

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


	// Filter transactions based on current filters
	const filteredTransactions = mockTransactions.filter((transaction) => {
		const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory
		const matchesType = selectedType === "all" || transaction.type === selectedType
		const matchesMinAmount = !minAmount || transaction.amount >= Number.parseFloat(minAmount)
		const matchesMaxAmount = !maxAmount || transaction.amount <= Number.parseFloat(maxAmount)

		return matchesSearch && matchesCategory && matchesType && matchesMinAmount && matchesMaxAmount
	})

	const clearFilters = () => {
		setSearchTerm("")
		setSelectedCategory("all")
		setSelectedType("all")
		setSelectedDateFilter("month")
		setMinAmount("")
		setMaxAmount("")
	}

	const activeFiltersCount = [
		searchTerm,
		selectedCategory !== "all" ? selectedCategory : "",
		selectedType !== "all" ? selectedType : "",
		minAmount,
		maxAmount,
	].filter(Boolean).length

	// 
	const [movements, setMovements] = useState<Movements[]>([])
	const [filteredMovements, setFilteredMovements] = useState<Movements[]>([])

	/**
	 * Fetch Movements
	 */
	useEffect(() => {
		const fetchData = async () => {
			try {
				// const movements = await getMovementsByUserAndFilter({
				//   startDate: startDate.toString(), endDate: endDate.toString()
				// })

				// TODO MISSING PAGINATION ON API
				let filters: any = {
					startDate: startDate.toString(), endDate: endDate.toString()
				};

				// get movement with filters for API
				const movements = await getMovementsByUserAndFilter(filters)
				console.log(movements);


				// sort by date because these come unsorted from the backend
				let sortedMovements = movements.sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);

				console.log(sortedMovements);


				// search term input
				// if (!searchTerm) {
				// 	console.log("Applying search term filter:", searchTerm);

				// 	sortedMovements = sortedMovements.filter((transaction) => {
				// 		transaction.tagName.toLowerCase().includes(searchTerm.toLowerCase())
				// 	})
				// }

				// // category filter
				// if(!searchTerm){
				//   sortedMovements.filter((transaction) => {
				//     transaction.tagName.toLowerCase().includes(searchTerm.toLowerCase())
				//   })
				// }

				setMovements(sortedMovements);

				const filteredMovements = movements.filter(m => {
					const date = new Date(m.createdAt);
					return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
				});

				console.log(filteredMovements);

				setFilteredMovements(filteredMovements);

			} catch (error) {
				console.error('Failed to fetch movements:', error);
			}
		};

		fetchData();
	}, []);


	// // Filter client-side when searchTerm changes
	// useEffect(() => {
	// 	let filtered = allMovements;

	// 	// Apply search term filter
	// 	if (searchTerm) {
	// 		filtered = filtered.filter((m) =>
	// 		m.tagName.toLowerCase().includes(searchTerm.toLowerCase())
	// 		);
	// 	}

	// 	setFilteredMovements(filtered);

	// 	// Calculate this month
	// 	const thisMonthMovements = filtered.filter(m => {
	// 		const date = new Date(m.createdAt);
	// 		return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
	// 	});
	// 	setMovementsThisMonth(thisMonthMovements);

	// }, [movements, searchTerm]); // Runs when data or searchTerm changes

	return (
		<div className="space-y-6">
			{/* Donut Chart */}
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

			{/* Transactions List 
			* with integrated search and filters 
			*/}
			<Card>
				<CardHeader className="pb-4">
					<div className="flex flex-col space-y-4">
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Transacciones ({movements.length})</CardTitle>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => console.log("Undo Last Clicked")}
								className="hidden sm:flex"
							>
								Deshacer Último
							</Button>
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

							<div className="flex gap-2">
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

								<Button
									variant="destructive"
									size="sm"
									onClick={() => console.log("Undo Last Clicked")}
									className="sm:hidden"
								>
									Deshacer último
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
											<SelectItem key={'all'} value={'all'}>
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
											<SelectItem value="all">Todos</SelectItem>
											<SelectItem value="gasto">Gastos</SelectItem>
											<SelectItem value="ingreso">Ingresos</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Date Filter */}
								{/* <div>
									<Label>Período</Label>
									<Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{dateFilters.map((filter) => (
												<SelectItem key={filter.id} value={filter.id}>
													{filter.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div> */}

								{/* Amount Range */}
								{/* <div>
									<Label>Monto</Label>
									<div className="flex gap-2">
										<Input
											placeholder="Min"
											type="number"
											value={minAmount}
											onChange={(e) => setMinAmount(e.target.value)}
										/>
										<Input
											placeholder="Max"
											type="number"
											value={maxAmount}
											onChange={(e) => setMaxAmount(e.target.value)}
										/>
									</div>
								</div> */}
							</div>

							{/* Clear Filters */}
							{activeFiltersCount > 0 && ( //  TODO this fine just improve it
								<div className="flex justify-end">
									<Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1">
										<X className="w-4 h-4" />
										Limpiar filtros
									</Button>
								</div>
							)}
							<div className="border-t pt-4">
								<Label className="mb-3 block">Período</Label>
								<PeriodSelector selected={selectedDateFilter} onSelect={setSelectedDateFilter} />
							</div>
						</div>

					)}
				</CardHeader>

				<CardContent>
					{movements.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							<p>No se encontraron transacciones con los filtros aplicados</p>
						</div>
					) : (
						<div className="space-y-2">
							{movements.map((transaction) => {
								// const categoryInfo = getCategoryInfo(transaction.categoryId)
								const Icon = iconComponents[transaction.category.icon as keyof typeof iconComponents]

								return (
									<Card key={transaction.id} className="p-4 hover:shadow-sm transition-all">
										<div className="flex items-center justify-between">
											{/* Left side: Icon and details */}
											<div className="flex items-center space-x-3">
												<div
													className={cn(
														"w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
														transaction.category.color,
													)}
												>
													<Icon className="w-6 h-6 text-white" />
												</div>
												<div>
													<p className="font-semibold text-sm text-gray-900">{transaction.tagName}</p>
													<div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
														<span className="bg-gray-100 px-2 py-1 rounded-full">{transaction.category.name}</span>
														<span>•</span>
														<span>
															{formatDate(transaction.createdAt)}
														</span>
													</div>
												</div>
											</div>

											{/* Right side: Amount */}
											<div className="text-right">
												<span
													className={cn(
														"font-bold text-lg",
														transaction.type === TxType.INCOME ? "text-green-600" : "text-gray-900",
													)}
												>
													{transaction.type === TxType.INCOME ? "+" : "-"}${transaction.amount}
												</span>
												<p className="text-xs text-gray-500 capitalize mt-1">{transaction.type}</p>
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
