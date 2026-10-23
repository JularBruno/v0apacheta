"use client"

import { useState } from "react"
import { History, Undo2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/dateUtils"
import { formatToBalance } from "@/lib/quick-spend-constants"
import { useLastMovementImport, useUndoMovementImport } from "@/lib/hooks/use-last-movement-import"

/**
 * "Deshacer última migración" — shows the most recent movements import still
 * alive and deletes all of it in one go (the backend does it atomically, keyed
 * by importId). Renders nothing while loading, on error, or with no import.
 */
export default function UndoLastImport() {
	const { toast } = useToast()
	const { data: lastImport } = useLastMovementImport()
	const { mutateAsync: undo, isPending } = useUndoMovementImport()
	const [open, setOpen] = useState(false)

	if (!lastImport || lastImport.movements === 0) return null

	const count = `${lastImport.movements} movimiento${lastImport.movements === 1 ? "" : "s"}`

	const confirmUndo = async () => {
		try {
			const result = await undo(lastImport.importId)
			setOpen(false)
			toast({
				variant: "success",
				title: "Migración deshecha",
				description: `Se borraron ${result.deleted} movimientos. Saldo: ${formatToBalance(result.balance.previous)} → ${formatToBalance(result.balance.current)}`,
			})
		} catch (error) {
			toast({
				variant: "destructive",
				title: "No se pudo deshacer",
				description: error instanceof Error ? error.message : "Probá de nuevo en un rato.",
			})
		}
	}

	return (
		<Card className="border-amber-200 bg-amber-50/60">
			<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<History className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
					<div>
						<p className="font-medium text-gray-900">Última migración: {count}</p>
						<p className="text-sm text-gray-600">Importada el {formatDate(lastImport.importedAt)}</p>
					</div>
				</div>
				<Button variant="outline" className="gap-2 bg-transparent" onClick={() => setOpen(true)}>
					<Undo2 className="h-4 w-4" />
					Deshacer migración
				</Button>
			</CardContent>

			<AlertDialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Deshacer la última migración?</AlertDialogTitle>
						<AlertDialogDescription>
							Se van a borrar los {count} que importaste el {formatDate(lastImport.importedAt)} y tu saldo vuelve a
							como estaba antes. Las categorías y etiquetas que creó esa migración se borran si no las usa nada más.
							No se puede deshacer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							disabled={isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={(e) => {
								// keep the dialog open until the delete settles
								e.preventDefault()
								confirmUndo()
							}}
						>
							{isPending ? "Borrando..." : `Borrar ${count}`}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	)
}
