"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PiggyBank, Clock, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface NotBoughtItem {
	id: string
	name: string
	price: number
	hoursEquivalent: number
	date: Date
}

export default function SeguidorAhorroPage() {
	const [monthlyHours, setMonthlyHours] = useState("160")
	const [totalEarnings, setTotalEarnings] = useState("3200")
	const [hourlyRate, setHourlyRate] = useState("20")
	const [itemName, setItemName] = useState("")
	const [itemPrice, setItemPrice] = useState("")
	const [notBoughtItems, setNotBoughtItems] = useState<NotBoughtItem[]>([])
	const { toast } = useToast()

	const handleMonthlyHoursChange = (value: string) => {
		setMonthlyHours(value)
		if (value && totalEarnings) {
			const rate = (Number.parseFloat(totalEarnings) / Number.parseFloat(value)).toFixed(2)
			setHourlyRate(rate)
		}
	}

	const handleTotalEarningsChange = (value: string) => {
		setTotalEarnings(value)
		if (value && monthlyHours) {
			const rate = (Number.parseFloat(value) / Number.parseFloat(monthlyHours)).toFixed(2)
			setHourlyRate(rate)
		}
	}

	const handleHourlyRateChange = (value: string) => {
		setHourlyRate(value)
		if (value && monthlyHours) {
			const earnings = (Number.parseFloat(value) * Number.parseFloat(monthlyHours)).toFixed(2)
			setTotalEarnings(earnings)
		}
	}

	const calculateHoursSaved = () => {
		if (!itemPrice || !hourlyRate || Number.parseFloat(hourlyRate) === 0) return 0
		return Number.parseFloat(itemPrice) / Number.parseFloat(hourlyRate)
	}

	const calculateInvestmentValue = () => {
		if (!itemPrice) return 0
		const principal = Number.parseFloat(itemPrice)
		const rate = 0.15
		const years = 5
		return principal * Math.pow(1 + rate, years)
	}

	const getMotivationalPhrase = () => {
		const hours = calculateHoursSaved()
		if (hours === 0) return ""

		if (hours < 2) return "¡Menos de 2 horas de trabajo!"
		if (hours < 4) return "¡Algunas horas bien ahorradas!"
		if (hours < 8) return "¡Casi un día de trabajo!"
		if (hours < 12) return `¡Medio día de trabajo!? ${itemName ? `¿Para ${itemName}?` : ""}`
		if (hours < 24) return `¡Más de medio día trabajando! ${itemName ? `¿Vale la pena ${itemName}?` : ""}`
		if (hours < 40) return `¡Un día completo de trabajo! ${itemName ? `¿Realmente necesitas ${itemName}?` : ""}`
		if (hours < 80) return `¡Una semana entera trabajando! ${itemName ? `¿${itemName} vale tanto?` : ""}`
		return `¡Más de una semana de trabajo! ${itemName ? `¿Seguro que necesitas ${itemName}?` : ""}`
	}

	const handleAddNotBoughtItem = () => {
		if (!itemName.trim() || !itemPrice || Number.parseFloat(itemPrice) <= 0) {
			toast({
				title: "Error",
				description: "Por favor ingresa un nombre y precio válido",
				variant: "destructive",
			})
			return
		}

		const newItem: NotBoughtItem = {
			id: Date.now().toString(),
			name: itemName,
			price: Number.parseFloat(itemPrice),
			hoursEquivalent: calculateHoursSaved(),
			date: new Date(),
		}

		setNotBoughtItems([newItem, ...notBoughtItems])
		setItemName("")
		setItemPrice("")
		toast({
			title: "Ahorro registrado",
			description: `Has ahorrado ${newItem.hoursEquivalent.toFixed(2)} horas de trabajo`,
		})
	}

	const handleDeleteItem = (id: string) => {
		setNotBoughtItems(notBoughtItems.filter((item) => item.id !== id))
		toast({
			title: "Eliminado",
			description: "El artículo ha sido eliminado del historial",
		})
	}

	const totalHoursSaved = notBoughtItems.reduce((sum, item) => sum + item.hoursEquivalent, 0)
	const totalMoneySaved = notBoughtItems.reduce((sum, item) => sum + item.price, 0)

	return (
		<div className="container mx-auto max-w-5xl px-4 md:px-6 py-6 space-y-6">
			{/* Header */}
			<div className="flex items-start gap-3">
				<PiggyBank className="w-8 h-8 text-primary-600 flex-shrink-0" />
				<div>
					<h1 className="text-2xl font-bold">Seguidor de Ahorro</h1>
					<p className="text-sm text-gray-600">Visualiza cuántas horas trabajas por cada compra</p>
				</div>
			</div>

			{/* Earnings Configuration */}
			<Card>
				<CardHeader>
					<CardTitle>Configura tus Ingresos</CardTitle>
					<CardDescription>Los tres campos se calculan automáticamente entre sí</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="monthly-hours">Horas Mensuales</Label>
							<Input
								id="monthly-hours"
								type="number"
								step="0.1"
								value={monthlyHours}
								onChange={(e) => handleMonthlyHoursChange(e.target.value)}
								placeholder="160"
							/>
							<p className="text-xs text-gray-500">Horas que trabajas al mes</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="total-earnings">Ingresos Mensuales</Label>
							<Input
								id="total-earnings"
								type="number"
								step="0.01"
								value={totalEarnings}
								onChange={(e) => handleTotalEarningsChange(e.target.value)}
								placeholder="3200"
							/>
							<p className="text-xs text-gray-500">Total que ganas al mes</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="hourly-rate">Ganancia por Hora</Label>
							<Input
								id="hourly-rate"
								type="number"
								step="0.01"
								value={hourlyRate}
								onChange={(e) => handleHourlyRateChange(e.target.value)}
								placeholder="20"
							/>
							<p className="text-xs text-gray-500">Cuánto ganas por hora</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Price Calculator */}
			<Card className="border-primary-200 bg-primary-50">
				<CardHeader>
					<CardTitle className="text-primary-900">Calculadora de Ahorro</CardTitle>
					<CardDescription className="text-primary-700">
						¿Cuántas horas de trabajo te ahorras al no comprar algo?
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="item-name">Nombre del artículo</Label>
							<Input
								id="item-name"
								value={itemName}
								onChange={(e) => setItemName(e.target.value)}
								placeholder="Ej: iPhone nuevo"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="item-price">Precio</Label>
							<Input
								id="item-price"
								type="number"
								step="0.01"
								value={itemPrice}
								onChange={(e) => setItemPrice(e.target.value)}
								placeholder="999.99"
							/>
						</div>
					</div>

					{/* Result Display */}
					<div className="grid md:grid-cols-3 gap-4">
						{/* Left: Investment Value */}
						<div className="p-4 bg-white rounded-lg border border-primary-300 text-center">
							<p className="text-sm text-gray-600 mb-2">Si lo invirtieras 5 años</p>
							<p className="text-2xl font-bold text-green-600">${calculateInvestmentValue().toFixed(2)}</p>
							<p className="text-xs text-gray-500 mt-1">15% anual</p>
						</div>

						{/* Middle: Hours Saved (Most Important) */}
						<div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border-2 border-primary-400 text-center shadow-md">
							<div className="flex items-center justify-center gap-2 mb-2">
								<Clock className="w-7 h-7 text-primary-600" />
								<p className="text-4xl font-bold text-primary-700">{calculateHoursSaved().toFixed(2)}</p>
							</div>
							<p className="text-sm font-semibold text-primary-900">Horas de trabajo ahorradas</p>
						</div>

						{/* Right: Motivational Phrase */}
						<div className="p-4 bg-white rounded-lg border border-primary-300 flex items-center justify-center">
							<p className="text-sm text-gray-700 text-center font-medium italic">
								{getMotivationalPhrase() || "Ingresa un precio para ver el impacto"}
							</p>
						</div>
					</div>

					<Button onClick={handleAddNotBoughtItem} className="w-full flex items-center justify-center gap-2">
						<Plus className="w-4 h-4" />
						Agregar al Historial de No Compras
					</Button>
				</CardContent>
			</Card>

			{/* Savings Summary */}
			{notBoughtItems.length > 0 && (
				<div className="grid md:grid-cols-2 gap-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Total Ahorrado</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold text-green-600">${totalMoneySaved.toFixed(2)}</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Horas de Trabajo Ahorradas</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold text-blue-600">{totalHoursSaved.toFixed(2)}h</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* History of Not Bought Items */}
			<Card>
				<CardHeader>
					<CardTitle>Historial de No Compras</CardTitle>
					<CardDescription>Cosas que decidiste no comprar y el ahorro que representan</CardDescription>
				</CardHeader>
				<CardContent>
					{notBoughtItems.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							<PiggyBank className="w-12 h-12 mx-auto mb-3 text-gray-400" />
							<p>Aún no has registrado ningún ahorro</p>
							<p className="text-sm">Usa la calculadora arriba para empezar</p>
						</div>
					) : (
						<div className="space-y-3">
							{notBoughtItems.map((item) => (
								<div
									key={item.id}
									className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
								>
									<div className="flex-1">
										<h4 className="font-semibold text-gray-900">{item.name}</h4>
										<div className="flex items-center gap-4 mt-1">
											<p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
											<p className="text-sm text-primary-600 font-medium flex items-center gap-1">
												<Clock className="w-3 h-3" />
												{item.hoursEquivalent.toFixed(2)}h ahorradas
											</p>
										</div>
										<p className="text-xs text-gray-500 mt-1">{item.date.toLocaleDateString()}</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDeleteItem(item.id)}
										className="text-red-500 hover:text-red-700 hover:bg-red-50"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
