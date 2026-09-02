"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthShell from "@/components/auth/auth-shell"

export default function RecoverPasswordPage() {
	const recoverPassword = () => {
		console.log("recoverPassword called")
	}

	const [, formAction, isPending] = useActionState(recoverPassword, null)

	return (
		<AuthShell
			title="Recuperá tu contraseña"
			subtitle="Ingresá tu email y te mandamos un link para restablecerla."
		>
			<form action={formAction} className="space-y-6">
				<div>
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						placeholder="tu@email.com"
						className="mt-1"
						disabled={isPending}
					/>
				</div>

				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? "Enviando..." : "Enviar link"}
				</Button>
			</form>

			<div className="mt-6 text-center text-sm text-muted-foreground">
				¿Te acordaste?{" "}
				<Link href="/login" className="font-medium text-primary hover:text-primary-600">
					Ingresá
				</Link>
			</div>
		</AuthShell>
	)
}
