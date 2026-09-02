"use client";

import React, { Suspense, useEffect } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { authenticate } from '@/lib/actions/auth';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loading } from "@/components/ui/loading"
import { useToast } from '@/hooks/use-toast';
import { Toaster } from "@/components/ui/toaster"
import AuthShell from "@/components/auth/auth-shell"

function LoginForm() {

	const { toast } = useToast();

	/**
	 * @description callbackUrl because form POST requires an input with name="redirectTo" value={callbackUrl}
	 * @notes goes to dashboard/mapa
	 */
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/mapa';

	/**
	 * Does user come to login from a 401? Just searchParams contains expired true display toast of sesion expired
	 */
	const isExpired = searchParams.get('expired') === 'true';
	useEffect(() => {
		if (isExpired) {
			toast({
				title: "Se venció tu sesión",
				description: "Por favor ingresa nuevamente",
				variant: "destructive",
			});
		}
	}, [isExpired, toast]);

	/**
	 * useState required to follow form state
	 * @notes sets FormData on input change tracking actual form data 
	 */
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	})

	// disabel input on pristyne
	const isFormEmpty = !formData.email || !formData.password;

	/** handles input values on change **/
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}


	/**
	 * @title Authentication form state management
	 * @param authenticate - Server action for authentication
	 * @param undefined - Initial state
	 * @returns [errorMessage, formAction, isPending] - Error state, form handler, and loading state
	 */
	const [errorMessage, formAction, isPending] = useActionState(
		authenticate,
		undefined,
	);

	return (
		<AuthShell
			title="Ingresá a Apacheta"
			subtitle="Bienvenido de vuelta. Ingresá tus credenciales para continuar."
		>
			<Toaster />

			<form noValidate action={formAction} className="space-y-6">

					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							placeholder="tu@email.com"
							className="mt-1"
							value={formData.email}
							onChange={handleInputChange}
							disabled={isPending}
						/>
					</div>
					<div>
						<Label htmlFor="password">Contraseña</Label>
						<Input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							placeholder="••••••••"
							className="mt-1"
							value={formData.password}
							onChange={handleInputChange}
							disabled={isPending}
						/>
					</div>

					<div className="flex items-center justify-end">
						<div className="text-sm">
							<Link href="/recover-password" className="font-medium text-primary hover:text-primary-600">
								Olvidaste tu contraseña?
							</Link>
						</div>
					</div>

					<div>
						<input type="hidden" name="redirectTo" value={callbackUrl} />

						<Button
							type="submit"
							className="w-full"
							disabled={isPending || isFormEmpty}
						>
							{isPending ? "Ingresando..." : "Ingresar"}
						</Button>
					</div>

					{errorMessage && (
						<div className="pt-2 text-center">
							<p className="text-sm text-destructive">{errorMessage}</p>
						</div>
					)}

				</form>

				<div className="mt-6 text-center text-sm text-muted-foreground">
					No tenés una cuenta?{" "}
					<Link href="/onboarding" className="font-medium text-primary hover:text-primary-600">
						Registrate
					</Link>
				</div>
		</AuthShell>
	)
}

export default function LoginPage() {
	return (
		<Suspense fallback={<Loading></Loading>}>
			<LoginForm />
		</Suspense>
	);
}