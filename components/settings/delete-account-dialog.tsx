"use client"

import { useState, useTransition } from "react"
import { AlertTriangle } from "lucide-react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteAccount } from "@/lib/actions/user"

/**
 * Confirmation dialog for permanently deleting the account. Collects the
 * current password (the API re-checks it with bcrypt) and, on success, the
 * server action signs the user out and redirects — this component never sees
 * the happy path return.
 */
export default function DeleteAccountDialog({
	open,
	onOpenChange,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const handleOpenChange = (next: boolean) => {
		if (isPending) return
		if (!next) {
			setPassword("")
			setError(null)
		}
		onOpenChange(next)
	}

	const handleConfirm = () => {
		setError(null)
		startTransition(async () => {
			try {
				const result = await deleteAccount(password)
				// a successful delete throws the redirect; only failures return
				if (result?.error) setError(result.error)
			} catch (err: any) {
				// the sign-out redirect propagates as an error — let it navigate
				if (err?.digest?.startsWith?.("NEXT_REDIRECT")) throw err
				console.error("Delete account failed:", err)
				setError("No se pudo eliminar la cuenta. Volvé a intentarlo.")
			}
		})
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="w-[90vw] sm:max-w-[420px]">
				<DialogHeader>
					<div className="flex items-start gap-3">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
							<AlertTriangle className="h-5 w-5 text-red-600" />
						</div>
						<div className="min-w-0">
							<DialogTitle>Eliminar cuenta</DialogTitle>
							<DialogDescription className="mt-1">
								Se borran tu perfil y todos tus datos (movimientos, categorías,
								presupuestos, patrimonio). Esta acción no se puede deshacer.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault()
						handleConfirm()
					}}
				>
					<div>
						<Label htmlFor="delete-password">Confirmá con tu contraseña</Label>
						<Input
							id="delete-password"
							name="password"
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={isPending}
							className="mt-1"
						/>
						{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
					</div>

					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isPending}
							className="flex-1 bg-transparent"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="destructive"
							disabled={isPending || password.length === 0}
							className="flex-1"
						>
							{isPending ? "Eliminando..." : "Eliminar cuenta"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
