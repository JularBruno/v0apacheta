"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getProfile } from "@/lib/actions/user"
import { Loading } from "@/components/ui/loading"
import { formatToBalance } from "@/lib/quick-spend-constants"
import { TxType } from "@/lib/schemas/definitions"

export default function AcomodarBalancePage() {
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

	const [newBalance, setNewBalance] = useState(userBalance.toString())
	const { toast } = useToast()

	const handleSave = () => {
		setLoadingUser(true)

		console.log('newBalance ', newBalance);
		const parsedBalance = Number.parseFloat(newBalance);

		console.log('parsedBalance ', parsedBalance);
		console.log('userBalance ', userBalance);

		// if (parsedBalance < userBalance) {
		// } else {

		// }

		if (isNaN(parsedBalance)) {
			toast({
				title: "Error",
				description: "Por favor ingresa un número válido",
				variant: "destructive",
			})
			return
		}

		// const movementData: Movement = {
		// 	userId: undefined, // will be set in post method
		// 	categoryId: categoryId, Actualizar Balance
		// 	type: TxType.INCOME,
		// 	tagId: tagId ? tagId : undefined,
		// 	description: data.tagName,
		// 	createdAt: showDateTime ? isoString : undefined, // Only include if custom date selected
		// };

		// const movement = await postMovement(movementData);

		setUserBalance(parsedBalance)
		setLoadingUser(false)
		toast({
			title: "Balance actualizado",
			description: `Tu balance ahora es $${formatToBalance(userBalance)}`,
		})
	}

	const handleEdit = () => {
		setNewBalance(userBalance.toString())
	}

	const handleCancel = () => {
		setNewBalance(userBalance.toString())
	}

	return (
		<div className="container mx-auto max-w-3xl px-4 md:px-6 py-6 space-y-6">
			{/* Header */}
			<div className="flex items-start gap-3">
				<Wallet className="w-8 h-8 text-primary-600 flex-shrink-0" />
				<div>
					<h1 className="text-2xl font-bold">Acomodar Balance</h1>
					<p className="text-sm text-gray-600">Actualiza tu balance actual manualmente</p>
				</div>
			</div>

			{/* Current Balance Display */}
			<Card className="border-primary-200 bg-primary-50">
				<CardHeader>
					<CardTitle className="text-primary-900">Balance Actual</CardTitle>
					<CardDescription className="text-primary-700">Este es tu balance registrado en el sistema</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<div className="text-center">
							{/* <p className="text-5xl font-bold text-primary-600">${currentBalance.toFixed(2)}</p> */}
							{loadingUser ? (
								<Loading></Loading>
							) : userBalance ? (
								<div className="text-5xl font-bold text-primary-600">{formatToBalance(userBalance)}</div>
							) : (
								<div className="text-5xl font-bold text-primary-600">$0 ARS</div>
							)}

							<p className="text-sm text-gray-600 mt-2">ARS Saldo disponible </p>


						</div>
					</div>
				</CardContent>
			</Card>

			{/* Update Balance Section */}
			<Card>
				<CardHeader>
					<CardTitle>Actualizar Balance</CardTitle>
					<CardDescription>Ajusta tu balance actual si necesitas corregirlo o actualizarlo manualmente</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{!loadingUser ? (
						<div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border border-gray-200">
							<div>
								<p className="text-sm text-gray-600 mb-1">Balance registrado</p>
								<p className="text-2xl font-bold text-gray-900">{formatToBalance(userBalance)}</p>
							</div>
							<Button onClick={handleEdit} className="flex items-center gap-2">
								<Edit2 className="w-4 h-4" />
								Editar
							</Button>
						</div>
					) : (
						<div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
							<div>
								<label htmlFor="new-balance" className="text-sm font-medium text-gray-700 mb-2 block">
									Nuevo Balance
								</label>
								<Input
									id="new-balance"
									type="number"
									step="0.01"
									value={userBalance}
									onChange={(e) => setNewBalance(e.target.value)}
									placeholder="Ingresa el nuevo balance"
									className="text-lg"
								/>
							</div>
							<div className="flex gap-3">
								<Button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2">
									<Check className="w-4 h-4" />
									Guardar
								</Button>
								<Button
									onClick={handleCancel}
									variant="outline"
									className="flex-1 flex items-center justify-center gap-2 bg-transparent"
								>
									<X className="w-4 h-4" />
									Cancelar
								</Button>
							</div>
						</div>
					)}

					{/* Warning Message */}
					<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
						<h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
							<Wallet className="w-4 h-4" />
							Importante
						</h4>
						<ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
							<li>Este cambio afectará tu balance total del sistema</li>
							<li>Usa esta función solo si necesitas corregir un error o actualizar manualmente</li>
							<li>Los movimientos futuros se sumarán o restarán a este balance</li>
							<li>Se recomienda hacer respaldo antes de grandes cambios</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			{/* Balance History Placeholder */}
			<Card>
				<CardHeader>
					<CardTitle>Historial de Ajustes</CardTitle>
					<CardDescription>Ver cambios manuales realizados al balance</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-gray-600 text-center py-8">
						Aquí se mostrarán los ajustes manuales que hagas a tu balance
						<br />
						(Funcionalidad en desarrollo)
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
