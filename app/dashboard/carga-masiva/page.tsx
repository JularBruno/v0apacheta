"use client"

import { useEffect, useMemo, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

import {
	Bot,
	ClipboardCopy,
	Check,
	ChevronLeft,
	ChevronRight,
	SkipForward,
	RotateCcw,
	Sparkles,
	History,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Movement } from "@/lib/schemas/movement"
import { TxType } from "@/lib/schemas/definitions"
import { formatDate, formatDateInputLocal, getCurrentDateTimeInfo, getLastNDays } from "@/lib/dateUtils"
import { formatToBalance } from "@/lib/quick-spend-constants"
import { useMovements } from "@/lib/hooks/use-movements"
import QuickSpendCard from "@/components/movements/quick-spend-card"

/**
 * Prompt shown to the user to paste into their bank's own AI assistant (several
 * Argentine banks have one built in). Two deliberate choices here, both aimed at
 * matching QuickSpendCard's fields as closely as possible so filling it in later is
 * fast:
 *  - filters to approved/settled movements up front, so "estado" doesn't need to
 *    round-trip through the JSON at all — pending/rejected/reversed items would
 *    never become a real movement in this app anyway.
 *  - asks for an explicit "tipo" (gasto/ingreso) instead of relying on the sign of
 *    "monto", since that maps 1:1 onto the card's Gasto/Ingreso toggle and doesn't
 *    depend on us correctly guessing the bank's currency-string format.
 */
const buildAiPrompt = (desde: string, hasta: string) => `Necesito mis movimientos entre el ${desde} y el ${hasta}, sólo los que estén aprobados o acreditados — no incluyas pendientes, rechazados, anulados ni reversados. Devolvémelos en formato JSON, sin texto adicional ni bloques de código markdown, con este formato exacto:

{
  "desde": "${desde}",
  "hasta": "${hasta}",
  "total": <cantidad de movimientos>,
  "movimientos": [
    {
      "fecha": "YYYY-MM-DDTHH:mm:ss.000Z",
      "tipo": "gasto" | "ingreso",
      "titulo": "nombre del comercio o del movimiento",
      "categoria": "categoría del movimiento",
      "monto": "$-1234 ARS",
      "descripcion": "detalle adicional (opcional)"
    }
  ]
}

Reglas:
- "tipo" es "gasto" para compras/débitos/pagos, o "ingreso" para depósitos/acreditaciones/transferencias recibidas.
- Un objeto por cada movimiento, sin agrupar ni resumir.
- Devolvé únicamente el JSON, nada más.`

type ParsedMovement = {
	fecha?: string
	titulo?: string
	detalle?: string
	monto?: number
	tipo?: TxType
	categoria?: string
	estado?: string
}

type ItemStatus = "pending" | "added" | "skipped"

/**
 * Bank apps here show amounts like "$-5.070 ARS" (Argentine format: "." thousands
 * separator, "," decimal separator). Pulls out the number and infers gasto/ingreso
 * from the sign.
 */
function parseMonto(raw: unknown): { amount: number; type: TxType } | undefined {
	if (typeof raw === "number" && !Number.isNaN(raw)) {
		return { amount: Math.abs(raw), type: raw < 0 ? TxType.EXPENSE : TxType.INCOME }
	}
	if (typeof raw !== "string") return undefined

	const isNegative = raw.includes("-")
	const digits = raw.replace(/[^\d,.]/g, "")
	if (!digits) return undefined

	const normalized = digits.includes(",")
		? digits.replace(/\./g, "").replace(",", ".") // "." thousands, "," decimal
		: digits.replace(/\./g, "") // no decimal comma: dots are thousands separators

	const amount = Math.abs(Number.parseFloat(normalized))
	if (Number.isNaN(amount)) return undefined

	return { amount, type: isNegative ? TxType.EXPENSE : TxType.INCOME }
}

function parseTipo(raw: unknown): TxType | undefined {
	const t = String(raw ?? "").toLowerCase().trim()
	if (["gasto", "expense", "debito", "débito", "compra", "retiro"].includes(t)) return TxType.EXPENSE
	if (["ingreso", "income", "credito", "crédito", "deposito", "depósito"].includes(t)) return TxType.INCOME
	return undefined
}

/** Best-effort read of a parsed JSON object's fields — matches the bank AI's shape, with a few common fallbacks. */
function readFields(item: any): ParsedMovement {
	const montoParsed = parseMonto(item?.monto ?? item?.amount ?? item?.importe ?? item?.valor)
	const titulo = item?.titulo ?? item?.descripcion ?? item?.description ?? item?.concepto ?? item?.detalle
	const detalle = item?.descripcion && item.descripcion !== titulo ? item.descripcion : undefined

	return {
		fecha: item?.fecha ?? item?.date,
		titulo,
		detalle,
		monto: montoParsed?.amount,
		tipo: parseTipo(item?.tipo ?? item?.type) ?? montoParsed?.type,
		categoria: item?.categoria ?? item?.category,
		estado: item?.estado ?? item?.status,
	}
}

/** Parses the pasted text into an array of raw movement objects, tolerating stray text around the JSON. */
function extractMovements(raw: string): any[] {
	const trimmed = raw.trim()
	if (!trimmed) throw new Error("Pegá el JSON que te devolvió la IA")

	let data: any
	try {
		data = JSON.parse(trimmed)
	} catch {
		const match = trimmed.match(/\[[\s\S]*\]/)
		if (!match) throw new Error("No pude leer eso como JSON. Revisá el formato.")
		data = JSON.parse(match[0])
	}

	const arr = Array.isArray(data)
		? data
		: Array.isArray(data?.movimientos)
			? data.movimientos
			: Array.isArray(data?.movements)
				? data.movements
				: null

	if (!arr) throw new Error("El JSON debe ser un array de movimientos.")
	if (arr.length === 0) throw new Error("El array de movimientos está vacío.")

	return arr
}

export default function CargaMasivaPage() {
	const { toast } = useToast()

	// "Hasta" is always today — the bank AI has nothing newer than that anyway.
	const hasta = useMemo(() => getCurrentDateTimeInfo().dateInput, [])

	// All-time movements (no date filter), just to read off the most recent one —
	// that's the sensible default for "desde": bring only what's missing since last time.
	const { data: allMovements } = useMovements()
	const lastMovementDate = useMemo(() => {
		if (!allMovements || allMovements.length === 0) return undefined
		const latestIso = allMovements.reduce((latest, m) => (m.createdAt > latest ? m.createdAt : latest), allMovements[0].createdAt)
		// Local calendar date, not latestIso's UTC date — same reasoning as formatDateInputLocal below.
		return formatDateInputLocal(new Date(latestIso))
	}, [allMovements])

	const [desde, setDesde] = useState(() => formatDateInputLocal(getLastNDays(30).start))
	// Only auto-apply the "last movement" default before the user has touched the field themselves.
	const [desdeTouched, setDesdeTouched] = useState(false)
	useEffect(() => {
		if (lastMovementDate && !desdeTouched) setDesde(lastMovementDate)
	}, [lastMovementDate, desdeTouched])

	const setDesdeManually = (value: string) => {
		setDesde(value)
		setDesdeTouched(true)
	}

	const quickRanges = useMemo(
		() => [
			{
				id: "ultima-carga",
				label: "Desde mi última carga",
				value: lastMovementDate,
				disabled: !lastMovementDate,
			},
			{ id: "semana", label: "Última semana", value: formatDateInputLocal(getLastNDays(7).start) },
			{ id: "mes", label: "Último mes", value: formatDateInputLocal(getLastNDays(30).start) },
			{ id: "trimestre", label: "Últimos 3 meses", value: formatDateInputLocal(getLastNDays(90).start) },
		],
		[lastMovementDate],
	)

	const aiPrompt = useMemo(() => buildAiPrompt(desde, hasta), [desde, hasta])

	const [promptCopied, setPromptCopied] = useState(false)
	const [jsonInput, setJsonInput] = useState("")

	const [movements, setMovements] = useState<ParsedMovement[] | null>(null)
	const [statuses, setStatuses] = useState<ItemStatus[]>([])
	const [currentIndex, setCurrentIndex] = useState(0)

	const pendingCount = useMemo(() => statuses.filter((s) => s === "pending").length, [statuses])
	const addedCount = useMemo(() => statuses.filter((s) => s === "added").length, [statuses])
	const skippedCount = useMemo(() => statuses.filter((s) => s === "skipped").length, [statuses])
	const allDone = movements !== null && pendingCount === 0

	const currentItem = movements?.[currentIndex]

	const handleCopyPrompt = async () => {
		try {
			await navigator.clipboard.writeText(aiPrompt)
			setPromptCopied(true)
			setTimeout(() => setPromptCopied(false), 1500)
		} catch {
			toast({
				title: "No se pudo copiar",
				description: "Copiá el texto manualmente",
				variant: "destructive",
			})
		}
	}

	const handleProcess = () => {
		try {
			const raw = extractMovements(jsonInput)
			const parsed = raw.map(readFields)
			setMovements(parsed)
			setStatuses(new Array(parsed.length).fill("pending"))
			setCurrentIndex(0)
			toast({
				title: "Movimientos procesados",
				description: `Se encontraron ${parsed.length} movimiento(s). Cargalos uno por uno abajo.`,
				variant: "success",
			})
		} catch (error: any) {
			toast({
				title: "No pude procesar el JSON",
				description: error?.message || "Revisá el formato e intentá de nuevo",
				variant: "destructive",
			})
		}
	}

	const handleReset = () => {
		setMovements(null)
		setStatuses([])
		setCurrentIndex(0)
		setJsonInput("")
	}

	const goToNextPending = (fromIndex: number, nextStatuses: ItemStatus[]) => {
		const next = nextStatuses.findIndex((s, i) => i > fromIndex && s === "pending")
		if (next !== -1) {
			setCurrentIndex(next)
			return
		}
		const anyPending = nextStatuses.findIndex((s) => s === "pending")
		if (anyPending !== -1) setCurrentIndex(anyPending)
	}

	const handleAdd = (_data: Movement) => {
		setStatuses((prev) => {
			const next = [...prev]
			next[currentIndex] = "added"
			goToNextPending(currentIndex, next)
			return next
		})
		toast({ title: "Movimiento agregado", variant: "success" })
	}

	const handleSkip = () => {
		setStatuses((prev) => {
			const next = [...prev]
			next[currentIndex] = "skipped"
			goToNextPending(currentIndex, next)
			return next
		})
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Bot className="w-8 h-8 text-primary-600" />
				<div>
					<h1 className="text-2xl font-bold">Carga masiva con IA</h1>
					<p className="text-gray-600">
						Pedile tus movimientos al asistente de IA de tu banco (varios ya tienen uno) y cargalos acá, uno por
						uno
					</p>
				</div>
			</div>

			{/* Step 1: Prompt to copy */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Sparkles className="w-5 h-5 text-primary-600" />
						1. Elegí el período y copiá el prompt
					</CardTitle>
					<CardDescription>
						Pegá este texto en el chat de IA de tu banco (o el que uses) para que te devuelva tus movimientos en
						JSON. Por defecto traemos desde tu último movimiento cargado, para no repetir viejos.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{/* Quick date-range picks */}
					<div className="flex flex-wrap gap-2">
						{quickRanges.map((range) => (
							<Button
								key={range.id}
								type="button"
								size="sm"
								variant={desde === range.value ? "default" : "outline"}
								disabled={range.disabled}
								onClick={() => range.value && setDesdeManually(range.value)}
								className={cn("gap-1.5", desde !== range.value && "bg-transparent")}
							>
								{range.id === "ultima-carga" && <History className="w-3.5 h-3.5" />}
								{range.label}
							</Button>
						))}
					</div>

					{/* Manual override */}
					<div className="flex items-center gap-2">
						<Label htmlFor="desde" className="text-sm text-muted-foreground whitespace-nowrap">
							O elegí una fecha
						</Label>
						<Input
							id="desde"
							type="date"
							value={desde}
							max={hasta}
							onChange={(e) => setDesdeManually(e.target.value)}
							className="w-auto"
						/>
						<span className="text-sm text-muted-foreground">hasta hoy ({hasta})</span>
					</div>

					<Textarea readOnly value={aiPrompt} className="min-h-[220px] font-mono text-xs bg-gray-50" />
					<Button onClick={handleCopyPrompt} variant="outline" className="gap-2 bg-transparent">
						{promptCopied ? <Check className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
						{promptCopied ? "Copiado" : "Copiar prompt"}
					</Button>
				</CardContent>
			</Card>

			{/* Step 2: Paste JSON response */}
			<Card>
				<CardHeader>
					<CardTitle>2. Pegá la respuesta de la IA</CardTitle>
					<CardDescription>Pegá acá el JSON que te devolvió el asistente de tu banco</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Textarea
						placeholder='{ "desde": "2026-07-15", "hasta": "2026-08-12", "movimientos": [{ "titulo": "Supermercado", "monto": "$-4500 ARS", ... }] }'
						value={jsonInput}
						onChange={(e) => setJsonInput(e.target.value)}
						className="min-h-[160px] font-mono text-xs"
					/>
					<div className="flex gap-2">
						<Button onClick={handleProcess} disabled={!jsonInput.trim()}>
							Procesar movimientos
						</Button>
						{movements && (
							<Button onClick={handleReset} variant="ghost" className="gap-2">
								<RotateCcw className="w-4 h-4" />
								Empezar de nuevo
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Step 3: Run through parsed movements */}
			{movements && movements.length > 0 && (
				<div className="space-y-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Badge variant="secondary">{addedCount} agregados</Badge>
									{skippedCount > 0 && <Badge variant="outline">{skippedCount} omitidos</Badge>}
									<Badge variant="outline">{pendingCount} pendientes</Badge>
								</div>
								{!allDone && (
									<div className="flex items-center gap-1">
										<Button
											size="icon"
											variant="ghost"
											disabled={currentIndex === 0}
											onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
										>
											<ChevronLeft className="w-4 h-4" />
										</Button>
										<span className="text-sm text-gray-500 px-1">
											{currentIndex + 1} de {movements.length}
										</span>
										<Button
											size="icon"
											variant="ghost"
											disabled={currentIndex === movements.length - 1}
											onClick={() => setCurrentIndex((i) => Math.min(movements.length - 1, i + 1))}
										>
											<ChevronRight className="w-4 h-4" />
										</Button>
									</div>
								)}
							</div>

							{/* Chips to jump between items — shows a check/skip icon once resolved, so the list itself doubles as progress at a glance */}
							<div className="flex flex-wrap gap-1.5 mt-3">
								{movements.map((m, i) => (
									<button
										key={i}
										onClick={() => setCurrentIndex(i)}
										title={m.titulo || `Movimiento ${i + 1}`}
										className={cn(
											"h-7 min-w-7 px-1.5 rounded-full text-xs font-medium border transition-colors",
											i === currentIndex
												? "border-primary-500 bg-primary-100 text-coffee-bean-800"
												: statuses[i] === "added"
													? "border-green-300 bg-green-50 text-green-700"
													: statuses[i] === "skipped"
														? "border-gray-200 bg-gray-100 text-gray-400"
														: "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
										)}
									>
										{statuses[i] === "added" ? (
											<Check className="w-3.5 h-3.5 inline" />
										) : statuses[i] === "skipped" ? (
											<SkipForward className="w-3.5 h-3.5 inline" />
										) : (
											i + 1
										)}
									</button>
								))}
							</div>
						</CardContent>
					</Card>

					{allDone ? (
						<Card className="border-green-200 bg-green-50">
							<CardContent className="p-6 text-center space-y-3">
								<Check className="w-10 h-10 text-green-600 mx-auto" />
								<p className="font-semibold text-green-900">
									Listo — {addedCount} movimiento(s) agregados
									{skippedCount > 0 && `, ${skippedCount} omitido(s)`}
								</p>
								<Button onClick={handleReset} variant="outline" className="gap-2 bg-transparent">
									<RotateCcw className="w-4 h-4" />
									Cargar otro lote
								</Button>
							</CardContent>
						</Card>
					) : (
						<>
							{/* Reference card: parsed fields for the movement currently being loaded — kept big and
							    legible on purpose, and the description is deliberately NOT prefilled below, so the
							    user reads this and picks a real tag instead of accepting raw bank text by default. */}
							{currentItem && (
								<Card className="border-2 border-dashed border-primary-300 bg-primary-50/40">
									<CardContent className="p-5 space-y-4">
										<div className="flex items-start justify-between gap-4">
											<div className="min-w-0">
												<p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
													Movimiento del banco
												</p>
												<p className="text-2xl font-bold leading-tight truncate">{currentItem.titulo || "—"}</p>
												{currentItem.detalle && (
													<p className="text-sm text-gray-500 truncate mt-0.5">{currentItem.detalle}</p>
												)}
											</div>
											<p
												className={cn(
													"text-2xl font-bold whitespace-nowrap",
													currentItem.tipo === TxType.EXPENSE ? "text-burnt-peach-700" : "text-primary-700",
												)}
											>
												{currentItem.monto !== undefined
													? `${currentItem.tipo === TxType.EXPENSE ? "-" : "+"}${formatToBalance(currentItem.monto)}`
													: "—"}
											</p>
										</div>

										<div className="flex flex-wrap items-center gap-2">
											{currentItem.categoria && (
												<Badge variant="secondary" className="text-sm px-3 py-1 capitalize">
													{currentItem.categoria}
												</Badge>
											)}
											<span className="text-sm text-gray-500">
												{currentItem.fecha ? formatDate(currentItem.fecha) : "—"}
											</span>
											{currentItem.estado && (
												<Badge variant="outline" className="capitalize">
													{currentItem.estado}
												</Badge>
											)}
										</div>

										<div className="flex items-center justify-between gap-3 pt-3 border-t border-dashed border-primary-200">
											<p className="text-xs text-gray-500">
												Elegí abajo el tag que mejor represente este movimiento
											</p>
											<Button onClick={handleSkip} variant="ghost" size="sm" className="gap-1.5 shrink-0">
												<SkipForward className="w-4 h-4" />
												Omitir
											</Button>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Prefilled from the parsed movement — description is left blank on purpose (see reference
							    card above), and category stays manual since a bank tag doesn't map onto ours. */}
							<QuickSpendCard
								key={currentIndex}
								onAdd={handleAdd}
								initialValues={{
									type: currentItem?.tipo,
									amount: currentItem?.monto,
									date: currentItem?.fecha,
								}}
							/>
						</>
					)}
				</div>
			)}
		</div>
	)
}
