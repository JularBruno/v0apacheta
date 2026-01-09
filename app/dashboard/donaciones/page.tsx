"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DonacionesPage() {
	return (
		<div className="container mx-auto max-w-5xl px-4 md:px-6 py-6 space-y-6">
			{/* Header */}
			<div className="flex items-start gap-3">
				<Heart className="w-8 h-8 text-red-600 flex-shrink-0" />
				<div>
					<h1 className="text-2xl font-bold">Donaciones</h1>
					<p className="text-sm text-gray-600">Apoya el desarrollo de Apacheta</p>
				</div>
			</div>

			{/* Support Message */}
			<Card className="border-red-200 bg-red-50">
				<CardHeader>
					<CardTitle className="text-red-900">Tu apoyo hace la diferencia</CardTitle>
					<CardDescription className="text-red-800">
						Apacheta es un proyecto desarrollado con dedicación para ayudarte a alcanzar tus metas financieras. Tu
						contribución nos permite seguir mejorando y agregando nuevas funcionalidades para ti.
					</CardDescription>
				</CardHeader>
			</Card>

			{/* QR Codes Section */}
			<Card>
				<CardHeader>
					<CardTitle>Dona mediante QR</CardTitle>
					<CardDescription>Escanea cualquiera de estos códigos para hacer tu donación</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* QR 1 - PayPal */}
						<div className="flex flex-col items-center space-y-3">
							<div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-300">
								<img src="/paypal-qr-code.jpg" alt="PayPal QR" className="w-full h-full object-contain" />
							</div>
							<p className="font-medium text-gray-900">PayPal</p>
						</div>

						{/* QR 2 - Crypto */}
						<div className="flex flex-col items-center space-y-3">
							<div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-300">
								<img
									src="/bitcoin-cryptocurrency-qr-code.jpg"
									alt="Crypto QR"
									className="w-full h-full object-contain"
								/>
							</div>
							<p className="font-medium text-gray-900">Crypto (BTC/ETH)</p>
						</div>

						{/* QR 3 - Bank Transfer */}
						<div className="flex flex-col items-center space-y-3">
							<div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-300">
								<img src="/bank-transfer-qr-code.jpg" alt="Bank Transfer QR" className="w-full h-full object-contain" />
							</div>
							<p className="font-medium text-gray-900">Transferencia Bancaria</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Links Section */}
			<Card>
				<CardHeader>
					<CardTitle>Otras formas de donar</CardTitle>
					<CardDescription>También puedes apoyarnos mediante estos enlaces</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Button variant="outline" className="w-full justify-between bg-transparent" asChild>
						<a href="https://paypal.me/apacheta" target="_blank" rel="noopener noreferrer">
							<span>Donar con PayPal</span>
							<ExternalLink className="w-4 h-4" />
						</a>
					</Button>

					<Button variant="outline" className="w-full justify-between bg-transparent" asChild>
						<a href="https://ko-fi.com/apacheta" target="_blank" rel="noopener noreferrer">
							<span>Donar con Ko-fi</span>
							<ExternalLink className="w-4 h-4" />
						</a>
					</Button>

					<Button variant="outline" className="w-full justify-between bg-transparent" asChild>
						<a href="https://patreon.com/apacheta" target="_blank" rel="noopener noreferrer">
							<span>Hazte Patreon</span>
							<ExternalLink className="w-4 h-4" />
						</a>
					</Button>

					<Button variant="outline" className="w-full justify-between bg-transparent" asChild>
						<a href="https://github.com/sponsors/apacheta" target="_blank" rel="noopener noreferrer">
							<span>GitHub Sponsors</span>
							<ExternalLink className="w-4 h-4" />
						</a>
					</Button>
				</CardContent>
			</Card>

			{/* Thank You Card */}
			<Card className="border-green-200 bg-green-50">
				<CardContent className="p-6">
					<div className="flex items-start gap-4">
						<Heart className="w-8 h-8 text-green-600 shrink-0 mt-1" />
						<div>
							<h3 className="font-semibold text-green-900 mb-2">Gracias por tu apoyo</h3>
							<p className="text-green-800">
								Cada contribución, sin importar el monto, nos ayuda a mantener Apacheta libre y accesible para todos. Tu
								generosidad hace posible que sigamos mejorando y expandiendo nuestras herramientas financieras.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
