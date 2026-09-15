"use client"

import type React from "react"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Upload,
	Download,
	FileSpreadsheet,
	Info,
	CheckCircle2,
	ArrowLeftRight,
	Landmark,
	Plus,
	ChevronLeft,
	RotateCcw,
	AlertTriangle,
	Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { FinancialElementType } from "@/lib/schemas/definitions"
import type { FinancialElements } from "@/lib/schemas/financialElement"
import { useFinancialElements } from "@/lib/hooks/use-financial-elements"
import { formatToBalance } from "@/lib/quick-spend-constants"
import AssetFormModal from "@/components/assets/asset-form-modal"
import {
	type ImportError,
	type ImportResult,
	type MovementImportResult,
	type PatrimonyImportResult,
	type UploadResource,
	importableRowCount,
} from "@/lib/schemas/upload"

/**
 * Max rows accepted per file — matches the backend's cap, shared by the page
 * copy and the 413 status message.
 */
const MAX_ROWS = 1000

/**
 * Column reference for the "Formato del archivo Excel" card.
 * Verified against a real dry-run of docs/ejemplo-movimientos.xlsx: blank
 * Tipo, Categoría, and Etiqueta all import cleanly (Tipo inferred from the
 * sign of Monto, Categoría defaults to "Otros", Etiqueta falls back to
 * Descripción). Patrimonio's exact columns aren't confirmed yet — point
 * people at the live template instead of guessing (see the card below).
 */
type ColumnSpec = { label: string; required: boolean; hint: string }

const MOVEMENT_SHEET_NAME = "Movimientos"
const PATRIMONY_SHEET_NAME = "Movimientos Patrimonio"

const MOVEMENT_COLUMNS: ColumnSpec[] = [
	{ label: "Fecha", required: true, hint: "Formato dd/mm/aaaa (ej. 15/01/2025)." },
	{
		label: "Descripción",
		required: false,
		hint: "Texto libre para identificar el movimiento (ej. Compra supermercado). Podés dejarlo vacío.",
	},
	{
		label: "Categoría",
		required: false,
		hint: 'Si el nombre coincide con una categoría que ya tenés, se reutiliza; si no, se crea. Vacía → se usa "Otros".',
	},
	{ label: "Etiqueta", required: false, hint: "Vacía → se usa el texto de Descripción." },
	{
		label: "Monto",
		required: true,
		hint: "Solo números (ej. 45200,50 o -45200,50). Negativo lo marca como gasto sin necesidad de la columna Tipo.",
	},
	{
		label: "Tipo",
		required: false,
		hint: "Opcional: Ingreso o Gasto. Vacío → se detecta automáticamente por el signo del Monto.",
	},
]

type ImportMode = "movimientos" | "patrimonio"
type Step = "mode-select" | "element-select" | "upload"
type UploadPhase = "idle" | "validating" | "preview" | "importing" | "done"

/** Whole-file problem (non-2xx response) shown as a single banner. */
type FormatError = { message: string; status: number }

/** Row-level errors returned about the sheet. */
function ImportErrorList({ errors }: { errors: ImportError[] }) {
	return (
		<Card className="border-destructive">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-destructive">
					<AlertTriangle className="w-5 h-5" />
					{errors.length} fila{errors.length === 1 ? "" : "s"} con problemas
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="max-h-72 space-y-2 overflow-y-auto text-sm">
					{errors.map((err, i) => (
						<li key={i} className="flex items-start gap-2">
							<Badge variant="outline" className="shrink-0">
								{err.sheet ? `${err.sheet} · Fila ${err.row}` : `Fila ${err.row}`}
							</Badge>
							<span className="text-gray-700">
								{err.column ? <span className="font-medium">{err.column} — </span> : null}
								{err.message}
							</span>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	)
}

/** Dry-run preview or final result — same shape, different tense. */
function ImportResultPanel({
	result,
	mode,
	isPreview,
}: {
	result: ImportResult
	mode: ImportMode
	isPreview: boolean
}) {
	const isMovement = mode === "movimientos"
	const successful = importableRowCount(result)
	const failed = result.errors.length
	const summaryLine = isPreview
		? `${successful} se importarán${failed ? `, ${failed} con errores (no se importarán)` : ""}`
		: `${successful} importados${failed ? `, ${failed} con errores` : ""}`

	const created = isMovement ? (result as MovementImportResult).created : null

	return (
		<Card className={failed > 0 ? "border-amber-300 bg-amber-50" : "border-green-200 bg-green-50"}>
			<CardContent className="p-5 space-y-3">
				<div className="flex items-center gap-2">
					<CheckCircle2 className={cn("w-5 h-5", failed > 0 ? "text-amber-600" : "text-green-600")} />
					<p className="font-semibold">{summaryLine}</p>
				</div>

				{isMovement && (
					<p className="text-sm text-gray-700">
						Saldo{isPreview ? " (simulado)" : ""}: {formatToBalance((result as MovementImportResult).balance.previous)}{" "}
						→ {formatToBalance((result as MovementImportResult).balance.current)}
					</p>
				)}

				{!isMovement && (
					<p className="text-sm text-gray-700">
						{(result as PatrimonyImportResult).affectedElementIds.length} elemento(s){" "}
						{isPreview ? "se verían afectados" : "afectado(s)"}
					</p>
				)}

				{created && (created.categories.length > 0 || created.tags.length > 0) && (
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="text-xs text-gray-500">{isPreview ? "Se crearán:" : "Se crearon:"}</span>
						{created.categories.map((c) => (
							<Badge key={`cat-${c}`} variant="secondary" className="capitalize">
								{c}
							</Badge>
						))}
						{created.tags.map((t) => (
							<Badge key={`tag-${t}`} variant="outline" className="capitalize">
								{t}
							</Badge>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

function mapUploadError(status: number, data: any): FormatError {
	if (typeof data?.message === "string" && data.message.length > 0) {
		return { message: data.message, status }
	}
	const byStatus: Record<number, string> = {
		422: "El archivo no es un .xlsx válido.",
		400: "Falta una hoja o una columna requerida en el archivo.",
		413: `El archivo supera el máximo de ${MAX_ROWS} filas.`,
		409: "Todavía no tenés ningún activo ni pasivo para asociar este historial.",
		404: "No pudimos encontrar tu usuario. Volvé a iniciar sesión.",
		500: "No se pudo guardar. No se escribió nada — probá de nuevo.",
	}
	return { message: byStatus[status] ?? "No pudimos procesar el archivo.", status }
}

async function uploadSheet(
	resource: UploadResource,
	file: File,
	dryRun: boolean,
	financialElementId?: string,
) {
	const formData = new FormData()
	formData.set("file", file)

	const params = new URLSearchParams()
	if (dryRun) params.set("dryRun", "true")
	// Pre-selected asset/liability: rows without an Elemento column fall back to
	// this id (a row can still name a different element explicitly).
	if (financialElementId) params.set("financialElementId", financialElementId)
	const qs = params.toString()

	const response = await fetch(`/api/upload/${resource}${qs ? `?${qs}` : ""}`, {
		method: "POST",
		body: formData,
	})
	const data = await response.json().catch(() => ({ message: "Respuesta inválida del servidor" }))
	return { ok: response.ok, status: response.status, data }
}

export default function ImportarPage() {
	const { toast } = useToast()
	const queryClient = useQueryClient()

	const [step, setStep] = useState<Step>("mode-select")
	const [mode, setMode] = useState<ImportMode | null>(null)
	const [selectedElement, setSelectedElement] = useState<FinancialElements | null>(null)
	const [elementModalOpen, setElementModalOpen] = useState(false)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)

	const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle")
	const [dryRunResult, setDryRunResult] = useState<ImportResult | null>(null)
	const [finalResult, setFinalResult] = useState<ImportResult | null>(null)
	const [formatError, setFormatError] = useState<FormatError | null>(null)

	const {
		data: elementsData,
		isLoading: elementsLoading,
		isError: elementsError,
		refetch: refetchElements,
	} = useFinancialElements()
	const elements = elementsData?.elements ?? []

	const resource: UploadResource = mode === "patrimonio" ? "financial-element" : "movement"

	const clearUploadState = () => {
		setUploadPhase("idle")
		setDryRunResult(null)
		setFinalResult(null)
		setFormatError(null)
	}

	const selectMode = (m: ImportMode) => {
		setMode(m)
		setStep(m === "patrimonio" ? "element-select" : "upload")
	}

	const goBack = () => {
		if (step === "upload") {
			setStep(mode === "patrimonio" ? "element-select" : "mode-select")
		} else if (step === "element-select") {
			setSelectedElement(null)
			setStep("mode-select")
		}
	}

	const handleReset = () => {
		setStep("mode-select")
		setMode(null)
		setSelectedElement(null)
		setElementModalOpen(false)
		setSelectedFile(null)
		clearUploadState()
	}

	/** Same context (mode + element), fresh file — used after a completed import. */
	const handleImportAnotherFile = () => {
		setSelectedFile(null)
		clearUploadState()
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const isXlsx =
			file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.endsWith(".xlsx")

		if (!isXlsx) {
			toast({
				title: "Archivo no válido",
				description: "Por favor selecciona un archivo Excel (.xlsx)",
				variant: "destructive",
			})
			return
		}

		clearUploadState()
		setSelectedFile(file)
	}

	const runUpload = async (dryRun: boolean) => {
		if (!selectedFile) return
		setUploadPhase(dryRun ? "validating" : "importing")
		setFormatError(null)

		try {
			const { ok, status, data } = await uploadSheet(
				resource,
				selectedFile,
				dryRun,
				mode === "patrimonio" ? selectedElement?.id : undefined,
			)

			if (!ok) {
				setFormatError(mapUploadError(status, data))
				setUploadPhase(dryRun ? "idle" : "preview")
				return
			}

			if (dryRun) {
				setDryRunResult(data as ImportResult)
				setUploadPhase("preview")
				return
			}

			setFinalResult(data as ImportResult)
			setUploadPhase("done")

			if (mode === "patrimonio") {
				queryClient.invalidateQueries({ queryKey: ["financial-elements-patrimony"] })
				if (selectedElement) queryClient.invalidateQueries({ queryKey: ["financial-element", selectedElement.id] })
			} else {
				queryClient.invalidateQueries({ queryKey: ["user-movements"] })
				queryClient.invalidateQueries({ queryKey: ["user-profile"] })
			}
		} catch {
			setFormatError({ message: "No pudimos conectar con el servidor. Probá de nuevo.", status: 0 })
			setUploadPhase(dryRun ? "idle" : "preview")
		}
	}

	// The mode chooser isn't a numbered step (it shows in the summary bar once picked).
	const uploadStepNumber = mode === "patrimonio" ? 2 : 1
	const modeLabel = mode === "movimientos" ? "Movimientos" : "Patrimonio"
	const exampleFile = mode === "patrimonio" ? "ejemplo-movimientos-patrimonio.xlsx" : "ejemplo-movimientos.xlsx"

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<FileSpreadsheet className="w-8 h-8 text-green-600" />
				<div>
					<h1 className="text-2xl font-bold">Importar desde Excel</h1>
					<p className="text-gray-600">
						Cargá tus movimientos o el historial de valor de un elemento de tu patrimonio. Por ahora podés importar
						hasta {MAX_ROWS} movimientos por archivo.
					</p>
				</div>
			</div>

			{/* Selections summary bar */}
			{step !== "mode-select" && (
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="secondary">{modeLabel}</Badge>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setMode(null)
							setSelectedElement(null)
							setStep("mode-select")
						}}
					>
						Cambiar
					</Button>
					{selectedElement && (
						<>
							<span className="text-gray-300">·</span>
							<Badge variant="secondary" className="capitalize">
								{selectedElement.name}
							</Badge>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setSelectedElement(null)
									setStep("element-select")
								}}
							>
								Cambiar
							</Button>
						</>
					)}
				</div>
			)}

			{/* Step 1 — mode chooser */}
			{step === "mode-select" && (
				<Card>
					<CardHeader>
						<CardTitle>¿Qué querés importar?</CardTitle>
						<CardDescription>Elegí qué representa el archivo Excel que vas a subir.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 sm:grid-cols-2">
							<button
								type="button"
								onClick={() => selectMode("movimientos")}
								className="flex flex-col items-start gap-2 rounded-lg border-2 border-gray-200 p-6 text-left transition-colors hover:border-primary-400 hover:bg-primary-50/40"
							>
								<ArrowLeftRight className="w-8 h-8 text-primary-600" />
								<span className="text-lg font-semibold">Movimientos</span>
								<span className="text-sm text-gray-600">
									Un historial de ingresos y gastos. Hasta {MAX_ROWS} por archivo.
								</span>
							</button>
							<button
								type="button"
								onClick={() => selectMode("patrimonio")}
								className="flex flex-col items-start gap-2 rounded-lg border-2 border-gray-200 p-6 text-left transition-colors hover:border-primary-400 hover:bg-primary-50/40"
							>
								<Landmark className="w-8 h-8 text-primary-600" />
								<span className="text-lg font-semibold">Patrimonio</span>
								<span className="text-sm text-gray-600">
									El historial de valor de un activo o pasivo que ya existe. Primero elegís el elemento, después subís
									el archivo.
								</span>
							</button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 2 — element select-or-create (patrimonio only) */}
			{step === "element-select" && (
				<div className="space-y-4">
					<Button variant="ghost" size="sm" className="gap-1" onClick={goBack}>
						<ChevronLeft className="w-4 h-4" />
						Volver
					</Button>
					<Card>
						<CardHeader>
							<CardTitle>1. ¿De qué elemento es este historial?</CardTitle>
							<CardDescription>
								Elegí el activo o pasivo al que corresponde el archivo, o creá uno nuevo. Esta importación solo agrega
								historial — nunca crea un elemento por vos.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{elementsLoading ? (
								<Loading />
							) : elementsError ? (
								<div className="flex flex-col items-center gap-3 py-6 text-center">
									<p className="text-sm text-gray-600">No pudimos cargar tus elementos.</p>
									<Button variant="outline" onClick={() => refetchElements()}>
										Reintentar
									</Button>
								</div>
							) : elements.length === 0 ? (
								<div className="flex flex-col items-center gap-3 py-6 text-center">
									<p className="text-sm text-gray-600">Todavía no tenés ningún activo ni pasivo.</p>
									<Button onClick={() => setElementModalOpen(true)} className="gap-2">
										<Plus className="w-4 h-4" />
										Crear uno
									</Button>
								</div>
							) : (
								<div className="space-y-2">
									{elements.map((element) => {
										const isSelected = selectedElement?.id === element.id
										return (
											<button
												key={element.id}
												type="button"
												onClick={() => setSelectedElement(element)}
												className={cn(
													"flex w-full items-center gap-3 rounded-lg border-2 p-4 text-left transition-all",
													isSelected
														? "border-primary-600 bg-primary-50 shadow-sm ring-2 ring-primary-200"
														: "border-gray-200 hover:border-primary-300 hover:bg-primary-50/30",
												)}
											>
												<div
													className={cn(
														"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
														isSelected ? "border-primary-600 bg-primary-600" : "border-gray-300 bg-white",
													)}
												>
													{isSelected && <Check className="h-3.5 w-3.5 text-white" />}
												</div>
												<div className="min-w-0 flex-1">
													<p className="truncate font-medium capitalize">{element.name}</p>
													<div className="flex items-center text-sm text-gray-500">
														<Badge variant="outline" className="mr-2">
															{element.type === FinancialElementType.ASSET ? "Activo" : "Pasivo"}
														</Badge>
														{element.currency}
													</div>
												</div>
												<span className="shrink-0 font-semibold">{formatToBalance(element.currentAmount)}</span>
											</button>
										)
									})}
								</div>
							)}

							{!elementsLoading && !elementsError && elements.length > 0 && (
								<div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
									<Button
										variant="outline"
										className="gap-2 border-primary-300 text-primary-700 hover:bg-primary-50 hover:text-primary-800"
										onClick={() => setElementModalOpen(true)}
									>
										<Plus className="w-4 h-4" />
										Crear nuevo
									</Button>
									<div className="flex flex-col items-stretch gap-1 sm:items-end">
										<Button size="lg" disabled={!selectedElement} onClick={() => setStep("upload")}>
											Continuar
										</Button>
										{!selectedElement && (
											<p className="text-xs text-gray-500">Elegí un elemento de la lista para continuar</p>
										)}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			)}

			{/* Step 3 — upload */}
			{step === "upload" && (
				<div className="space-y-6">
					<Button variant="ghost" size="sm" className="gap-1" onClick={goBack}>
						<ChevronLeft className="w-4 h-4" />
						Volver
					</Button>

					{/* File Upload Card */}
					<Card>
						<CardHeader>
							<CardTitle>{uploadStepNumber}. Subir archivo Excel</CardTitle>
							<CardDescription>Selecciona un archivo .xlsx con tus movimientos financieros</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{uploadPhase === "idle" || uploadPhase === "validating" ? (
								<>
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
										<input
											type="file"
											id="excel-upload"
											accept=".xlsx"
											onChange={handleFileChange}
											className="hidden"
										/>
										<label htmlFor="excel-upload" className="cursor-pointer">
											<Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
											<p className="text-lg font-medium text-gray-900 mb-2">
												{selectedFile ? selectedFile.name : "Haz clic para seleccionar archivo"}
											</p>
											<p className="text-sm text-gray-600">o arrastra y suelta tu archivo Excel aquí</p>
											<p className="text-xs text-gray-500 mt-2">Solo archivos .xlsx, hasta 5 MB</p>
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

									<Button
										onClick={() => runUpload(true)}
										disabled={!selectedFile || uploadPhase === "validating"}
										className="w-full"
									>
										<Upload className="w-4 h-4 mr-2" />
										{uploadPhase === "validating" ? "Validando..." : "Validar archivo"}
									</Button>
								</>
							) : (
								<div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
									<FileSpreadsheet className="w-5 h-5 text-gray-500 shrink-0" />
									<p className="font-medium text-gray-900 truncate">{selectedFile?.name}</p>
								</div>
							)}

							{/* Dry-run preview */}
							{(uploadPhase === "preview" || uploadPhase === "importing") && dryRunResult && mode && (
								<div className="space-y-3">
									<ImportResultPanel result={dryRunResult} mode={mode} isPreview />
									{dryRunResult.errors.length > 0 && <ImportErrorList errors={dryRunResult.errors} />}
									<p className="text-xs text-gray-500">
										Si volvés a subir el mismo archivo se importa de nuevo — no se detectan duplicados.
									</p>
									<div className="flex gap-2">
										<Button
											variant="outline"
											className="bg-transparent"
											disabled={uploadPhase === "importing"}
											onClick={handleImportAnotherFile}
										>
											Elegir otro archivo
										</Button>
										<Button
											className="flex-1"
											disabled={uploadPhase === "importing" || importableRowCount(dryRunResult) === 0}
											onClick={() => runUpload(false)}
										>
											{uploadPhase === "importing" ? "Importando..." : "Confirmar importación"}
										</Button>
									</div>
								</div>
							)}

							{/* Final result */}
							{uploadPhase === "done" && finalResult && mode && (
								<div className="space-y-3">
									<ImportResultPanel result={finalResult} mode={mode} isPreview={false} />
									{finalResult.errors.length > 0 && <ImportErrorList errors={finalResult.errors} />}
									<Button variant="outline" className="gap-2 bg-transparent" onClick={handleImportAnotherFile}>
										<Upload className="w-4 h-4" />
										Importar otro archivo
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Whole-file error */}
					{formatError && (
						<Card className="border-destructive">
							<CardContent className="flex items-start gap-3 p-6">
								<AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
								<div className="flex-1">
									<p className="font-semibold text-destructive">No pudimos procesar el archivo</p>
									<p className="text-sm text-gray-700 mt-1">{formatError.message}</p>
									{formatError.status === 409 ? (
										<Button size="sm" variant="outline" className="mt-3" onClick={() => setStep("element-select")}>
											Elegir o crear un elemento
										</Button>
									) : (
										<p className="text-sm text-gray-500 mt-1">Corregí el archivo y volvé a subirlo.</p>
									)}
								</div>
							</CardContent>
						</Card>
					)}

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
										asChild
										variant="outline"
										className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent"
									>
										<a href={`/api/examples/${exampleFile}`} download={exampleFile}>
											<Download className="w-4 h-4 mr-2" />
											Descargar Plantilla Excel
										</a>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Column Instructions Card — mode-aware: verified for Movimientos, patrimonio columns TBD */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Info className="w-5 h-5 text-gray-600" />
								Formato del archivo Excel
							</CardTitle>
							<CardDescription>
								{mode === "movimientos" ? (
									<>
										Usá una hoja llamada <span className="font-medium">&quot;{MOVEMENT_SHEET_NAME}&quot;</span>. La primera
										fila tiene que tener estos nombres de columna exactos — el orden no importa — y después una fila por
										movimiento.
									</>
								) : (
									<>
										La plantilla usa una hoja llamada <span className="font-medium">&quot;{PATRIMONY_SHEET_NAME}&quot;</span>{" "}
										para este historial. Todavía no tenemos el detalle columna por columna confirmado acá — descargá la
										plantilla de arriba: trae una hoja &quot;Instrucciones&quot; con la explicación oficial de cada una.
									</>
								)}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{mode === "movimientos" && (
									<div className="grid gap-3">
										{MOVEMENT_COLUMNS.map((col) => (
											<div
												key={col.label}
												className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
											>
												<Badge
													variant={col.required ? "default" : "outline"}
													className="shrink-0 mt-0.5 whitespace-nowrap"
												>
													{col.required ? "Obligatoria" : "Opcional"}
												</Badge>
												<div>
													<p className="font-medium text-gray-900">{col.label}</p>
													<p className="text-sm text-gray-600">{col.hint}</p>
												</div>
											</div>
										))}
									</div>
								)}

								{/* Tips Section */}
								<div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
									<h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
										<Info className="w-4 h-4" />
										Consejos importantes
									</h4>
									<ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
										<li>
											La hoja tiene que llamarse exactamente{" "}
											<span className="font-medium">
												&quot;{mode === "movimientos" ? MOVEMENT_SHEET_NAME : PATRIMONY_SHEET_NAME}&quot;
											</span>
										</li>
										<li>La primera fila tiene que tener los nombres de las columnas, tal cual figuran arriba</li>
										<li>
											Hasta {MAX_ROWS} filas y 5 MB por archivo — &quot;Validar archivo&quot; te muestra qué se va a
											importar antes de confirmar, sin guardar nada todavía
										</li>
										{mode === "movimientos" ? (
											<>
												<li>Un monto negativo se interpreta como gasto aunque dejes Tipo vacío</li>
												<li>Las categorías que todavía no existan se crean automáticamente con esa fila</li>
											</>
										) : (
											<li>Esta importación nunca crea, edita ni borra elementos — solo agrega historial al que ya elegiste</li>
										)}
										<li>Volver a subir el mismo archivo lo importa de nuevo entero — no se detectan duplicados</li>
									</ul>
								</div>
							</div>
						</CardContent>
					</Card>

					<Button variant="ghost" className="gap-2" onClick={handleReset}>
						<RotateCcw className="w-4 h-4" />
						Empezar de nuevo
					</Button>
				</div>
			)}

			{/*
				Always mounted (not nested inside the element-select step) — Radix's Dialog
				needs to run its own close transition/portal cleanup. Nesting it inside a
				conditionally-rendered step meant `onSave`'s setStep("upload") could unmount
				it mid-close, which surfaced as an uncaught error (500 page) even though the
				asset was created successfully. See patrimonio/page.tsx for the same pattern.
			*/}
			<AssetFormModal
				isOpen={elementModalOpen}
				onClose={() => setElementModalOpen(false)}
				onSave={(created) => {
					const el = created as FinancialElements
					if (el?.id) {
						setSelectedElement(el)
						setStep("upload")
					} else {
						// Response didn't carry an id — refresh and let the user pick it from the list.
						refetchElements()
					}
				}}
			/>
		</div>
	)
}
