"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	CalendarDays,
} from "lucide-react"
import SpendingChart from "@/components/dashboard/spending-chart"
import RecentExpenses from "@/components/dashboard/recent-expenses"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress" // Import Progress component
import QuickSpendCard from "@/components/transactions/quick-spend-card"
import { formatToBalance } from "@/lib/quick-spend-constants"
//
import { getProfile } from "@/lib/actions/user";
import { useEffect, useState } from 'react';
import { User } from "@/lib/schemas/user"
import { Movement, Movements } from "@/lib/schemas/movement"
import { TxType } from "@/lib/schemas/definitions";
import { Category } from "@/lib/schemas/category";
import { getCategoriesByUser } from "@/lib/actions/categories";
import { getMovementsByUserAndFilter, deleteMovement } from "@/lib/actions/movements"
import { getTagsByUser } from "@/lib/actions/tags"
import { Tag, Tags } from "@/lib/schemas/tag"
import { Loading } from "@/components/ui/loading"
import { getDateStringsForFilter, getLastNMonths } from "@/lib/dateUtils"

interface PaymentItem {
	id: string
	name: string
	amount: number
	dueDate: string
}

export default function InicioPage() {

	const now = new Date();

	/**
	 * 
	 * Categories
	 * 
	 */

	// Categories state (allows creation, setsnewone after created)
	const [cats, setCats] = useState<Category[]>([]);

	/**
	 * Fetch Categories
	 * TODO Validate if this should be on parent component
	 * This is the "lift state up" pattern. If it gets too deep (prop drilling), use Context.
	 */
	useEffect(() => {
		const fetchData = async () => {
			try {
				const cats = await getCategoriesByUser();
				setCats(cats);
			}
			catch (err: any) {
				console.error('Failed to fetch categories:', err);
				setCats([]);
			}
		};

		fetchData();
	}, []);

	/**
	 * 
	 * Tags
	 * 
	 */

	// Tags (global suggestions; not filtered by category initially)
	const [allTags, setAllTags] = useState<Tags[]>([])
	// Set this to false when tags loaded so skeleton of quickspendcard disappears
	const [loadingQuickSpendCard, setLoadingQuickSpendCard] = useState<boolean>(true);

	/**
	 * Fetch Tags
	 */
	const fetchTags = async () => {
		try {
			const allTags = await getTagsByUser();

			const sortedTags = allTags.sort(
				(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			);

			setAllTags(sortedTags);
			setLoadingQuickSpendCard(false);
		} catch (error) {
			console.error('Failed to fetch tags:', error);
		}
	};

	// Initial fetch of tags
	useEffect(() => {
		fetchTags();
	}, []);

	/**
	 * 
	 * MOCKS for aplying to ui required to integrate still
	 * 
	 */

	// Mock data for budget summary and progress
	const monthlyBudget = 1000 // Example total budget
	const totalSpent = 200 // Example spent amount
	const monthlyBudgetRemaining = monthlyBudget - totalSpent
	const progressPercentage = (totalSpent / monthlyBudget) * 100


	// Mock data for upcoming payments
	const upcomingPayments: PaymentItem[] = [
		{ id: "1", name: "Alquiler", amount: 500, dueDate: "01/mes" },
		{ id: "2", name: "Internet", amount: 30, dueDate: "15/mes" },
		// { id: "3", name: {/* Mock data */}"Electricidad", amount: 70, dueDate: "20/mes" },
	]

	// Calculate daily spending suggestion (mock for now, assuming 4 days remaining)
	const daysRemaining = 4 // This would be dynamic in a real app
	const dailySpendSuggestion = monthlyBudgetRemaining > 0 ? monthlyBudgetRemaining / daysRemaining : 0

	/**
	 * 
	 * User
	 * 
	 */
	// const [userProfile, setUserProfile] = useState<User | null>(null);
	const [userBalance, setUserBalance] = useState<number>(0);
	const [loadingUser, setLoadingUser] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoadingUser(true);
				const profile = await getProfile();
				// setUserProfile(profile);
				setUserBalance(profile.balance);
			}
			catch (error: any) {
				if (error.digest?.includes('NEXT_REDIRECT')) {
					// Redirect is happening, ignore
					return;
				}
			} finally {
				setLoadingUser(false);
			}
		}

		fetchProfile();
	}, []);

	/**
	 * 
	 * Movements
	 * 
	 */

	// used in childs
	const [allMovements, setAllMovements] = useState<Movements[]>([]);

	// Five last movements and amount to use in quick history
	const [movements, setMovements] = useState<Movements[]>([]);
	const [lastFiveAmount, setlastFiveAmount] = useState<number>(0);
	const [loadingMovements, setLoadingMovements] = useState(true);

	/**
	 * Fetch Movements
	 */

	// Fetch movements function (extract it so you can reuse)
	const fetchMovements = async () => {

		try {
			const filters: any = {};

			// last month (30 days ago to now)
			const { start, end } = getLastNMonths(1);
			const result = getDateStringsForFilter(start, end);
			filters.startDate = result.startDate;
			filters.endDate = result.endDate;

			const movements = await getMovementsByUserAndFilter(filters);

			const sortedMovements = movements.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);

			setAllMovements(sortedMovements);

			const lastFive = sortedMovements.slice(0, 5); // First 5 (most recent)
			const lastFiveAmount = lastFive.reduce((sum, item) => {
				if (item.type === TxType.EXPENSE) {
					return sum + item.amount;
				}
				return sum;
			}, 0);

			setMovements(lastFive);
			setlastFiveAmount(lastFiveAmount);

			setLoadingMovements(false);
		} catch (error) {
			console.error('Failed to fetch movements:', error);
		}
	};

	// Initial fetch of movements
	useEffect(() => {
		fetchMovements();
	}, []);

	/**
	 * On balance update add or remove balance, to not call api again
	 */
	const onBalanceUpdate = async (data: Movement, isDelete: boolean) => {
		let newBalance = 0;

		// Update balance immediately 
		if (isDelete) { // If is updated on delete should change the values contrary as a normal movement
			newBalance = data.type === TxType.INCOME
				? userBalance - data.amount
				: userBalance + data.amount;
		} else {
			newBalance = data.type === TxType.INCOME
				? userBalance + data.amount
				: userBalance - data.amount;
		}

		setUserBalance(newBalance);
	}

	/**
	 * After adding movement
	 */
	const onAddMovement = async (data: Movement) => {
		// Update balance immediately
		onBalanceUpdate(data, false);

		// Refetch movements to get populated data
		await fetchMovements();
		await fetchTags();

		toast({
			variant: "success",
			title: "Movimiento realizado!",
			description: `Se realizó tu ${data.type === TxType.INCOME ? "Ingreso" : "Gasto"} de $${data.amount}`,
		});
	}

	/**
	 * Delete latest movement based on array last item id
	 */
	const deleteLatestMovement = async () => {
		const last = movements[0];
		if (last) {
			deleteMovement(last.id);
			onBalanceUpdate(last, true);
		}

		// Refetch movements to get populated data
		await fetchMovements();

		toast({
			variant: "success",
			title: "Movimiento borrado!",
			description: `Se eliminó tu último movimiento`,
		});
	};

	return (
		<div className="space-y-6">
			{/* Budget Overview*/}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Balance personal</CardTitle>
					</CardHeader>
					<CardContent>
						{loadingUser ? (
							<Loading></Loading>
						) : userBalance ? (
							<div className="text-2xl font-bold">{formatToBalance(userBalance)} ARS</div>
						) : (
							<div className="text-2xl font-bold">$0 ARS</div>
						)}
						{/* <div className="text-2xl font-bold">${userProfile: userProfile?.balance | 0 } ars</div> */}
						<p className="text-sm text-gray-500">{allMovements.length} transacciones en el último mes</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-gray-600">Presupuesto</CardTitle>
					</CardHeader>
					<CardContent>
						<div>
							<div className="text-2xl font-bold mb-2">
								${monthlyBudgetRemaining.toFixed(2)} restante de ${monthlyBudget.toFixed(2)}
							</div>
							<Progress value={progressPercentage} className="h-2 mb-4" />
							<div className="flex justify-between text-sm text-gray-500">
								<span>1 jul</span> {/* Mock start date */}
								<span>{progressPercentage.toFixed(0)}%</span>
								<span>31 jul</span> {/* Mock end date */}
							</div>
							<p className="text-sm text-gray-500 mt-2">
								Puede gastar ${dailySpendSuggestion.toFixed(2)}/día para {daysRemaining} más días.
							</p>
						</div>
					</CardContent>
				</Card>

			</div>


			<QuickSpendCard
				/**
				 * QuickSpendCard onAdd callback! useful for actions after movement
				 */
				cats={cats}
				setCats={setCats}
				onAdd={onAddMovement}
				allTags={allTags}
				setAllTags={setAllTags}
				loading={loadingQuickSpendCard}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* History of last expenses */}
				<RecentExpenses loading={loadingMovements} cats={cats} movements={movements} lastFiveAmount={lastFiveAmount} deleteLatestMovement={deleteLatestMovement} />

				{/* Upcoming Payments Card */}
				{/* <Card>
					<CardHeader>
						<CardTitle>Resumen Financiero</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">

						<Separator />
						{/* Upcoming Payments Section, could also be improved to hold 
						<div>
							<h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
								<CalendarDays className="w-5 h-5 text-blue-600" /> Próximos Pagos
							</h3>
							<div className="space-y-3">
								{upcomingPayments.length > 0 ? (
									upcomingPayments.map((payment) => (
										<div
											key={payment.id}
											className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
										>
											<div>
												<p className="font-medium text-gray-900">{payment.name}</p>
												<p className="text-sm text-gray-600">
													${payment.amount.toFixed(2)} • Vence: {payment.dueDate}
												</p>
											</div>
											{/* Action button for payment, e.g., "Mark as Paid" 
											{/* <Button variant="outline" size="sm">Pagar</Button> 
										</div>
									))
								) : (
									<div className="text-center py-4 text-gray-500">
										<p>¡Nada pendiente por pagar este mes!</p>
										<p className="text-sm mt-1">Relájate, tu presupuesto está bajo control.</p>
									</div>
								)}
							</div>
						</div>

					</CardContent>

				</Card> */}

				<SpendingChart movements={allMovements.filter(a => a.type === TxType.EXPENSE)} />

			</div>

		</div>
	)
}
