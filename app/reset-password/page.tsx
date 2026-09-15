"use client"

import { Suspense, useState, useTransition, type FormEvent } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loading } from "@/components/ui/loading"
import AuthShell from "@/components/auth/auth-shell"
import { resetPassword } from "@/lib/actions/user"

function ResetPasswordForm() {
	const searchParams = useSearchParams()
	const token = searchParams.get("token")

	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault()

		if (password !== confirmPassword) {
			setError("Las contraseñas no coinciden.")
			return
		}

		setError(null)
		startTransition(async () => {
			try {
				const result = await resetPassword(token ?? "", password)
				// a successful reset throws the redirect; only failures return
				if (result?.error) setError(result.error)
			} catch (err: any) {
				if (err?.digest?.startsWith?.("NEXT_REDIRECT")) throw err
				console.error("Reset password failed:", err)
				setError("No se pudo actualizar la contraseña. Volvé a intentarlo.")
			}
		})
	}

	if (!token) {
		return (
			<AuthShell title="Link inválido" subtitle="Este link de recuperación no es válido.">
				<div className="text-center">
					<Link href="/recover-password" className="font-medium text-primary hover:text-primary-600">
						Pedir un link nuevo
					</Link>
				</div>
			</AuthShell>
		)
	}

	return (
		<AuthShell title="Elegí tu nueva contraseña" subtitle="Repetila para confirmar que la escribiste bien.">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<Label htmlFor="password">Nueva contraseña</Label>
					<Input
						id="password"
						name="password"
						type="password"
						autoComplete="new-password"
						required
						minLength={6}
						maxLength={50}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={isPending}
						className="mt-1"
					/>
				</div>

				<div>
					<Label htmlFor="confirmPassword">Repetir contraseña</Label>
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						autoComplete="new-password"
						required
						minLength={6}
						maxLength={50}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						disabled={isPending}
						className="mt-1"
					/>
					{passwordsMismatch && <p className="mt-1 text-sm text-red-600">Las contraseñas no coinciden.</p>}
				</div>

				{error && (
					<div className="space-y-1">
						<p className="text-sm text-red-600">{error}</p>
						<Link href="/recover-password" className="text-sm font-medium text-primary hover:text-primary-600">
							Pedir un link nuevo
						</Link>
					</div>
				)}

				<Button
					type="submit"
					className="w-full"
					disabled={isPending || password.length === 0 || confirmPassword.length === 0}
				>
					{isPending ? "Actualizando..." : "Actualizar contraseña"}
				</Button>
			</form>
		</AuthShell>
	)
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<Loading></Loading>}>
			<ResetPasswordForm />
		</Suspense>
	)
}
