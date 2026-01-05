"use client"

import type React from "react"
import { useState, useTransition, useActionState, useEffect } from "react"
import { register } from '@/lib/actions/user';
import { UserState, initialUserState } from '@/lib/schemas/user';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
			case 1:
				return "/step1.svg"
			case 2:
				return "/step2.svg"
			case 3:
				return "/step3.svg"
			case 4:
				return "/step4.svg"
			default:
				return "/step4.svg"
		}
	}

	/**
	 * Questions values and result, might be more large and complicated later, this just shows a simple message
	 */

	const [question1Value, setQuestion1Value] = useState<number | null>(null);
	const [question2Value, setQuestion2Value] = useState<number | null>(null);

	const handleQuestion1Change = (value: number) => setQuestion1Value(value);
	const handleQuestion2Change = (value: number) => setQuestion2Value(value);

	const totalScore = (question1Value ?? 0) + (question2Value ?? 0);

	const getPersonalizedMessage = () => {
		if (totalScore >= 1 && totalScore <= 3) {
			return "Estás dando tus primeros pasos. Te ayudaremos a empezar con bases sólidas 💪";
		}

		if (totalScore >= 4 && totalScore <= 7) {
			return "Vas por buen camino. Un poco de estructura te va a llevar lejos 🚀";
		}

		return "Tenés un perfil avanzado. Es momento de optimizar y escalar 📈";
	};

	/**
	 * ONBOARDING
	 */
	return (
		<div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">

			{/* IMAGE CARD Section */}
			<div
				className="
					w-full lg:w-1/2
					max-w-md lg:max-w-lg
					h-[420px]
					rounded-xl
					shadow-lg
					mt-8 lg:mt-0 lg:mr-8
					flex items-center justify-center
					bg-green-50
				"
			>
				<img
					src={getImageSrc()}
					alt="Onboarding Illustration"
					className="max-h-64 w-auto object-contain"
				/>
			</div>

			{/* FORM CARD Section */}
			<div className="w-full lg:w-1/2 max-w-md lg:max-w-lg space-y-8 bg-white p-8 md:p-10 rounded-xl shadow-lg mt-8 lg:mt-0 lg:ml-8">

				{/* 
					FORM CARD HEADER 
				*/}
				<div>
					<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Comienza tu camino</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						{currentStep === 1 && "Cuentanos sobre ti."}
						{currentStep === 2 && "Unas preguntas rápidas para guiarte mejor."}
						{currentStep === 3 && "Casi listos, última pregunta."}
						{currentStep === 4 && "El mapa"}
						{currentStep === 5 && "Crea tu cuenta."}
					</p>
				</div>

				{/* 
					FORM CARD Form Section, STEPS 
				*/}
				<form action={formAction} noValidate className="mt-8 space-y-6">

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
									<p className="text-red-500 text-sm">{localErrors.name}</p>
								)}
							</div>

							<Button
								type="button"
								onClick={handleNext}
								className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
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
												className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
											/>
											<Label htmlFor={option.id} className="ml-2 text-sm text-gray-900">
												{option.label}
											</Label>
										</div>
									))}

								</div>
							</div>

							<div className="flex justify-between gap-4">
								<Button type="button" onClick={handleBack} variant="outline" className="w-1/2">
									Atrás
								</Button>

								<Button
									type="button"
									onClick={handleNext}
									disabled={!question1Value}
									className="w-1/2 bg-green-600 text-white"
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
												className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
											/>
											<Label htmlFor={option.id} className="ml-2 text-sm text-gray-900">
												{option.label}
											</Label>
										</div>
									))}
								</div>
							</div>

							<div className="flex justify-between gap-4">
								<div className="flex justify-between gap-4">
									<Button type="button" onClick={handleBack} variant="outline" className="w-1/2">
										Atrás
									</Button>

									<Button
										type="button"
										onClick={handleNext}
										disabled={!question2Value}
										className="w-1/2 bg-green-600 text-white"
									>
										Siguiente
									</Button>
								</div>
							</div>
						</div>
					)}

					{/* Step 4: Personalized Message */}
					{currentStep === 4 && (
						<div className="space-y-6">
							<div className="bg-green-50 border border-green-200 rounded-lg p-6">
								<div className="flex items-start space-x-3">
									<div className="flex-shrink-0">
										<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
											<span className="text-green-600 text-lg">✨</span>
										</div>
									</div>
									<div className="flex-1">
										<h3 className="text-lg font-semibold text-green-800 mb-2">El mapa guiará tu camino</h3>
										<p className="text-green-700 leading-relaxed">{getPersonalizedMessage()}</p>
									</div>
								</div>
							</div>

							<div className="flex justify-between gap-4">

								<Button type="button" onClick={handleBack} variant="outline" className="w-1/2">
									Atrás
								</Button>

								<Button
									type="button"
									onClick={handleNext}
									disabled={!question2Value}
									className="w-1/2 bg-green-600 text-white"
								>
									Siguiente
								</Button>
							</div>
						</div>
					)}

					{/* Step 5: Email & Password */}
					{currentStep === 5 && (
						<div className="space-y-6">
							{/* Hidden input to carry forward name from Step 1 */}
							<input type="hidden" name="name" value={localFormData.name} />
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
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
											<p className="mt-2 text-sm text-red-500" key={error}>
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
											<p className="mt-2 text-sm text-red-500" key={error}>
												{error}
											</p>
										))}
								</div>

							</div>

							<div className="flex justify-between gap-4">
								<Button type="button" onClick={handleBack} variant="outline" className="w-1/2 bg-transparent">
									Atrás
								</Button>
								<Button
									type="submit"
									className="w-1/2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
									disabled={isPending}
								>
									{isPending ? "Finalizando..." : "Terminar Registro"}
								</Button>

								{/* client-side errors */}
								{localErrors && (
									<p className="text-red-500 text-sm">{localErrors.name}</p>
								)}
							</div>
						</div>
					)}

				</form>
				<div className="text-center text-sm text-gray-600">
					{currentStep < 4 && (
						<>
							Ya tenés una cuenta?{" "}
							<Link href="/login" className="font-medium text-green-600 hover:text-green-500">
								Ingresa aca!
							</Link>
						</>
					)}
				</div>
			</div>
		</div >
	)
}
