"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, FileSpreadsheet, Info, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ImportarPage() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const { toast } = useToast()

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			if (
				file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
				file.name.endsWith(".xlsx")
			) {
				setSelectedFile(file)
				toast({
					title: "Archivo seleccionado",
					description: `${file.name} - Listo para importar`,
				})
			} else {
				toast({
					title: "Archivo no válido",
					description: "Por favor selecciona un archivo Excel (.xlsx)",
					variant: "destructive",
				})
			}
		}
	}

	const handleImport = () => {
		// Placeholder for import logic
		toast({
			title: "Importación iniciada",
			description: "Procesando tu archivo Excel... (función en desarrollo)",
		})
	}

	const handleDownloadTemplate = () => {
		toast({
			title: "Descargando plantilla",
			description: "La plantilla de ejemplo se descargará pronto (función en desarrollo)",
		})
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<FileSpreadsheet className="w-8 h-8 text-green-600" />
				<div>
					<h1 className="text-2xl font-bold">Importar desde Excel</h1>
					<p className="text-gray-600">Carga tus movimientos financieros desde un archivo Excel</p>
				</div>
			</div>

			{/* File Upload Card */}
			<Card>
				<CardHeader>
					<CardTitle>Subir archivo Excel</CardTitle>
					<CardDescription>Selecciona un archivo .xlsx con tus movimientos financieros</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
						<input type="file" id="excel-upload" accept=".xlsx" onChange={handleFileChange} className="hidden" />
						<label htmlFor="excel-upload" className="cursor-pointer">
							<Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<p className="text-lg font-medium text-gray-900 mb-2">
								{selectedFile ? selectedFile.name : "Haz clic para seleccionar archivo"}
							</p>
							<p className="text-sm text-gray-600">o arrastra y suelta tu archivo Excel aquí</p>
							<p className="text-xs text-gray-500 mt-2">Solo archivos .xlsx</p>
						</label>
					</div>

					{selectedFile && (
						<div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
							<CheckCircle2 className="w-5 h-5 text-green-600" />
							<div className="flex-1">
								<p className="font-medium text-green-900">{selectedFile.name}</p>
								<p className="text-sm text-green-700">{(selectedFile.size / 1024).toFixed(2)} KB</p>
							</div>
						</div>
					)}

					<Button onClick={handleImport} disabled={!selectedFile} className="w-full">
						<Upload className="w-4 h-4 mr-2" />
						Importar Movimientos
					</Button>
				</CardContent>
			</Card>

			{/* Download Template Card */}
			<Card className="border-blue-200 bg-blue-50">
				<CardContent className="p-6">
					<div className="flex items-start gap-4">
						<Download className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
						<div className="flex-1">
							<h3 className="font-semibold text-blue-900 mb-2">Descarga la plantilla de ejemplo</h3>
							<p className="text-blue-800 mb-4">
								Usa nuestra plantilla para asegurarte de que tu archivo tiene el formato correcto
							</p>
							<Button
								onClick={handleDownloadTemplate}
								variant="outline"
								className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent"
							>
								<Download className="w-4 h-4 mr-2" />
								Descargar Plantilla Excel
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Column Instructions Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="w-5 h-5 text-gray-600" />
						Formato del archivo Excel
					</CardTitle>
					<CardDescription>Tu archivo debe contener las siguientes columnas en este orden</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* Column Instructions */}
						<div className="grid gap-3">
							<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
								<div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
									1
								</div>
								<div>
									<p className="font-medium text-gray-900">Fecha</p>
									<p className="text-sm text-gray-600">Formato: DD/MM/AAAA (Ejemplo: 15/01/2025)</p>
								</div>
							</div>

							<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
								<div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
									2
								</div>
								<div>
									<p className="font-medium text-gray-900">Descripción</p>
									<p className="text-sm text-gray-600">
										Nombre o descripción del movimiento (Ejemplo: Compra supermercado)
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
								<div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
									3
								</div>
								<div>
									<p className="font-medium text-gray-900">Categoría</p>
									<p className="text-sm text-gray-600">
										Categoría del gasto (Ejemplo: Alimentación, Transporte, Entretenimiento)
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
								<div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
									4
								</div>
								<div>
									<p className="font-medium text-gray-900">Monto</p>
									<p className="text-sm text-gray-600">Cantidad en números (Ejemplo: 45.50 o -45.50 para gastos)</p>
								</div>
							</div>

							<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
								<div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
									5
								</div>
								<div>
									<p className="font-medium text-gray-900">Tipo (Opcional)</p>
									<p className="text-sm text-gray-600">
										Ingreso o Gasto (si no se especifica, se detecta automáticamente por el signo)
									</p>
								</div>
							</div>
						</div>

						{/* Tips Section */}
						<div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
							<h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
								<Info className="w-4 h-4" />
								Consejos importantes
							</h4>
							<ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
								<li>La primera fila debe contener los nombres de las columnas</li>
								<li>No dejes celdas vacías en las columnas obligatorias</li>
								<li>Los montos negativos se interpretarán como gastos</li>
								<li>Las categorías que no existan se crearán automáticamente</li>
								<li>Asegúrate de que las fechas estén en formato correcto</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
