"use client"

import type React from "react"
import { useState, useActionState, useEffect, useRef } from "react"
import { register } from '@/lib/actions/user';
import { initialUserState, type NotificationFrequency } from '@/lib/schemas/user';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import AuthShell from "@/components/auth/auth-shell"
import styles from "@/components/auth/auth-shell.module.css"

/**
 * @title required to follow form state
 * @notes sets FormData on input change tracking actual form data 
 */
type LocalFormData = {
	name: string;
	email: string;
	password: string;
};

type LocalErrors = {
	name?: string;
	email?: string;
	password?: string;
};

export default function OnboardingPage() {

	/** Current step in multi-step form (1-4) */
	const [currentStep, setCurrentStep] = useState(1);

	/** 
	 * Registration form state management
	 * @returns [state, formAction, isPending] - Form validation state, submit handler, loading status
	 */
	const [state, formAction, isPending] = useActionState(register, initialUserState);

	/** 
	 * Local errors to retrieve before form submiting. ONLY name required until now
	 * @returns [localErrors, setLocalErrors] - localErrors state for each input, setLocalErrors handler
	 */
	const [localErrors, setLocalErrors] = useState<LocalErrors>({
		name: undefined,
	});

	/**
	 * useState required to follow form state
	 * @notes sets FormData on input change tracking actual form data 
	 */
	const [localFormData, setLocalFormData] = useState<LocalFormData>({
		name: '',
		email: '',
		password: ''
	})

	/** 
	 * DISPLAY ERRORS since useActionState has no clearErrors or sth I need to track them in this useState for clearing on inputChange
	 */
	const [displayErrors, setDisplayErrors] = useState(state.errors);
	// Update displayErrors when state.errors changes (after submit)
	useEffect(() => {
		setDisplayErrors(state.errors);
	}, [state.errors]);

	const emailInputRef = useRef<HTMLInputElement>(null);

	// On each step change: focus the text input (opens keyboard on mobile) or scroll the
	// form card into view for steps that have no keyboard input.
	// 150ms delay ensures the incoming step is rendered before focus fires.
	useEffect(() => {
		if (currentStep === 1) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		if (currentStep === 5) {
			const t = setTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}, 50);
			return () => clearTimeout(t);
		}

		if (currentStep !== 6) return;

		const t = setTimeout(() => {
			emailInputRef.current?.focus();
		}, 150);

		return () => clearTimeout(t);
	}, [currentStep]);

	/** handles input values on change **/
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setLocalFormData(prev => ({ ...prev, [name]: value }));

		// Clear local errors
		setLocalErrors(prev => ({ ...prev, [name]: undefined }));

		// Clear error for this specific field. Server errors
		setDisplayErrors(prev => ({
			...prev,
			[name]: undefined
		}));
	};

	/**
	 * handles next on onboarding, reaching local errors before actually requiring to submit
	 * @notes sets FormData on input change tracking actual form data 
	 */
	const handleNext = () => {
		// Validate name on Step 1
		if (currentStep === 1) {
			if (!localFormData.name.trim()) {
				setLocalErrors({ name: 'Ingresa un nombre' });
				return;
			}
			// Clear any previous errors and proceed
			setLocalErrors({});
		}

		setCurrentStep(prev => prev + 1);
	};

	/** handle back button on onboarding **/
	const handleBack = () => {
		setCurrentStep((prev) => prev - 1)
	}

	/** get image to display on each step **/
	const getImageSrc = () => {
		switch (currentStep) {
			case 1: return "/step1.svg"
			case 2: return "/step2.svg"
			case 3: return "/step3.svg"
			case 4: return "/step4.svg"
			default: return "/step4.svg"
		}
	}

	/**
	 * Questions values and result, might be more large and complicated later, this just shows a simple message
	 */

	const [question1Value, setQuestion1Value] = useState<number | null>(null);
	const [question2Value, setQuestion2Value] = useState<number | null>(null);
	const [question3Value, setQuestion3Value] = useState<number | null>(null);

	const handleQuestion1Change = (value: number) => setQuestion1Value(value);
	const handleQuestion2Change = (value: number) => setQuestion2Value(value);
	const handleQuestion3Change = (value: number) => setQuestion3Value(value);

	const totalScore = (question1Value ?? 0) + (question2Value ?? 0) + (question3Value ?? 0);

	const getNotificationFrequency = (): NotificationFrequency => {
		if (totalScore <= 5) return 'daily';
		if (totalScore <= 9) return 'weekly';
		return 'monthly';
	};

	const getPersonalizedMessage = () => {
		if (totalScore >= 3 && totalScore <= 5) {
			return "Estás dando tus primeros pasos. Te ayudaremos a empezar con bases sólidas 💪";
		}
		if (totalScore >= 6 && totalScore <= 9) {
			return "Vas por buen camino. Un poco de estructura te va a llevar lejos 🚀";
		}
		return "Tenés un perfil avanzado. Es momento de optimizar y escalar 📈";
	};

	/**
	 * ONBOARDING
	 */
	const subtitle =
		currentStep === 1 ? "Cuentanos sobre ti." :
		currentStep === 2 ? "Unas preguntas rápidas para guiarte mejor." :
		currentStep === 3 ? "Seguimos conociendonos." :
		currentStep === 4 ? "Casi listos, última pregunta." :
		currentStep === 5 ? "El mapa" :
		"Crea tu cuenta."

	return (
		<AuthShell title="Comienza tu camino" subtitle={subtitle} illustrationSrc={getImageSrc()}>
				{/* STEPS */}
				<form action={formAction} noValidate className="space-y-6">

					{/* Step 1: Name */}
					{currentStep === 1 && (
						<div className="space-y-6">
							<div>
								<Label htmlFor="name">Tu Nombre</Label>
								<Input
									id="name"
									name="name"
									type="text"
									autoComplete="name"
									required
									placeholder="tu nombre"
									className="mt-1"
									value={state.formData?.name || localFormData.name}
									onChange={handleInputChange}
								/>
								{/* client-side errors */}
								{localErrors.name && (
									<p className="text-destructive text-sm">{localErrors.name}</p>
								)}
							</div>

							<Button
								type="button"
								onClick={handleNext}
								className="w-full"
							>
								Siguiente
							</Button>

						</div>
					)}

					{/* Step 2: Question 1 */}
					{currentStep === 2 && (
						<div className="space-y-6">
							<div>
								<Label className="text-base font-semibold mb-2 block">
									1. Cual sería tu logro ideal a corto plazo?
								</Label>

								<div className="space-y-2">

									{[
										{ id: 'q1-a1', score: 1, value: 'Save for an emergency fund', label: 'Tener un fondo de emergencia' },
										{ id: 'q1-a2', score: 2, value: 'Pay off credit card debt', label: 'Pagar deudas como tarjetas de crédito' },
										{ id: 'q1-a3', score: 3, value: 'Buy a significant asset (e.g., car, appliance)', label: 'Hacer una compra significativa' },
										{ id: 'q1-a4', score: 4, value: 'Start investing small amounts', label: 'Invertir montos pequeños' },
									].map(option => (
										<div key={option.id} className="flex items-center">
											<input
												type="radio"
												id={option.id}
												checked={question1Value === option.score}
												onChange={() => handleQuestion1Change(option.score)}
												disabled={isPending}
												className="h-4 w-4 accent-primary border-border focus:ring-primary"
											/>
											<Label htmlFor={option.id} className="ml-2 text-sm text-foreground">
												{option.label}
											</Label>
										</div>
									))}

								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-3">
								<Button type="button" onClick={handleBack} variant="outline" className="w-full sm:w-1/2">
									Atrás
								</Button>
								<Button
									type="button"
									onClick={handleNext}
									disabled={!question1Value}
									className="w-full sm:w-1/2"
								>
									Siguiente
								</Button>
							</div>
						</div>
					)}

					{/* Step 3: Question 2 */}
					{currentStep === 3 && (
						<div className="space-y-6">
							<div>
								<Label className="text-base font-semibold mb-2 block">
									2. ¿Cómo describirías tu nivel actual de conocimiento financiero?
								</Label>

								<div className="space-y-2">
									{[
										{ id: 'q2-a1', score: 1, value: 'Basic (almost none)', label: 'Básico (casi nulo)' },
										{ id: 'q2-a2', score: 2, value: 'Intermediate (I know some concepts)', label: 'Intermedio (conozco algunos conceptos)' },
										{ id: 'q2-a3', score: 3, value: 'Advanced (I manage investments and strategies)', label: 'Avanzado (gestiono inversiones y estrategias)' },
										{ id: 'q2-a4', score: 4, value: 'Expert (I am a professional in the sector)', label: 'Experto (soy un profesional del sector)' },
									].map(option => (
										<div key={option.id} className="flex items-center">
											<input
												type="radio"
												id={option.id}
												checked={question2Value === option.score}
												onChange={() => handleQuestion2Change(option.score)}
												disabled={isPending}
												className="h-4 w-4 accent-primary border-border focus:ring-primary"
											/>
											<Label htmlFor={option.id} className="ml-2 text-sm text-foreground">
												{option.label}
											</Label>
										</div>
									))}
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-3">
								<Button type="button" onClick={handleBack} variant="outline" className="w-full sm:w-1/2">
									Atrás
								</Button>
								<Button
									type="button"
									onClick={handleNext}
									disabled={!question2Value}
									className="w-full sm:w-1/2"
								>
									Siguiente
								</Button>
							</div>
						</div>
					)}

					{/* Step 4: Question 3 */}
					{currentStep === 4 && (
						<div className="space-y-6">
							<div>
								<Label className="text-base font-semibold mb-2 block">
									3. ¿Con qué frecuencia revisás tus finanzas personales?
								</Label>

								<div className="space-y-2">
									{[
										{ id: 'q3-a1', score: 1, label: 'Casi nunca o nunca' },
										{ id: 'q3-a2', score: 2, label: 'Una vez al mes' },
										{ id: 'q3-a3', score: 3, label: 'Semanalmente' },
										{ id: 'q3-a4', score: 4, label: 'Todos los días' },
									].map(option => (
										<div key={option.id} className="flex items-center">
											<input
												type="radio"
												id={option.id}
												checked={question3Value === option.score}
												onChange={() => handleQuestion3Change(option.score)}
												disabled={isPending}
												className="h-4 w-4 accent-primary border-border focus:ring-primary"
											/>
											<Label htmlFor={option.id} className="ml-2 text-sm text-foreground">
												{option.label}
											</Label>
										</div>
									))}
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-3">
								<Button type="button" onClick={handleBack} variant="outline" className="w-full sm:w-1/2">
									Atrás
								</Button>
								<Button
									type="button"
									onClick={handleNext}
									disabled={!question3Value}
									className="w-full sm:w-1/2"
								>
									Siguiente
								</Button>
							</div>
						</div>
					)}

					{/* Step 5: Personalized Message */}
					{currentStep === 5 && (
						<div className="space-y-6">
							<div className={styles.mapNote}>
								<div className="flex items-start space-x-3">
									<div className="flex-shrink-0">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
											<span className="text-lg text-primary">✨</span>
										</div>
									</div>
									<div className="flex-1">
										<h3 className="text-lg font-semibold text-foreground mb-2">El mapa guiará tu camino</h3>
										<p className="text-muted-foreground leading-relaxed">{getPersonalizedMessage()}</p>
									</div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-3">
								<Button type="button" onClick={handleBack} variant="outline" className="w-full sm:w-1/2">
									Atrás
								</Button>
								<Button
									type="button"
									onClick={handleNext}
									className="w-full sm:w-1/2"
								>
									Siguiente
								</Button>
							</div>
						</div>
					)}

					{/* Step 6: Email & Password */}
					{currentStep === 6 && (
						<div className="space-y-6">
							{/* Hidden inputs to carry forward data from previous steps */}
							<input type="hidden" name="name" value={localFormData.name} />
							<input type="hidden" name="notificationFrequency" value={getNotificationFrequency()} />
							<input type="hidden" name="mapLevel" value="1.0" />
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									ref={emailInputRef}
									id="email"
									name="email"
									type="email"
									placeholder="your@email.com"
									className="mt-1"
									required
									autoComplete="email"
									onChange={handleInputChange}
									defaultValue={state.formData?.email || localFormData.email}
								/>
								<div id="email-error" aria-live="polite" aria-atomic="true">
									{displayErrors?.email &&
										displayErrors.email.map((error: string) => (
											<p className="mt-2 text-sm text-destructive" key={error}>
												{error}
											</p>
										))}
								</div>
							</div>
							<div>
								<Label htmlFor="password">Contraseña</Label>
								<Input
									id="password"
									name="password"
									type="password"
									required
									placeholder="••••••••"
									className="mt-1"
									onChange={handleInputChange}
									autoComplete="new-password"
									defaultValue={state.formData?.password || localFormData.password}  // This preserves the value

								/>
								<div id="password-error" aria-live="polite" aria-atomic="true">
									{displayErrors?.password &&
										displayErrors.password.map((error: string) => (
											<p className="mt-2 text-sm text-destructive" key={error}>
												{error}
											</p>
										))}
								</div>

							</div>

							<div className="flex flex-col sm:flex-row gap-3">
								<Button type="button" onClick={handleBack} variant="outline" className="w-full sm:w-1/2 bg-transparent">
									Atrás
								</Button>
								<Button
									type="submit"
									className="w-full sm:w-1/2"
									disabled={isPending}
								>
									{isPending ? "Finalizando..." : "Terminar Registro"}
								</Button>

								{/* client-side errors */}
								{localErrors && (
									<p className="text-destructive text-sm">{localErrors.name}</p>
								)}
							</div>
						</div>
					)}

				</form>
			<div className="mt-6 text-center text-sm text-muted-foreground">
				{currentStep < 5 && (
					<>
						Ya tenés una cuenta?{" "}
						<Link href="/login" className="font-medium text-primary hover:text-primary-600">
							Ingresa aca!
						</Link>
					</>
				)}
			</div>
		</AuthShell>
	)
}
