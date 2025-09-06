"use client"

import type React from "react"
import { useState, useTransition, useActionState } from "react"
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
   * Local errors to retrieve before form submiting
   * @returns [localErrors, setLocalErrors] - localErrors state for each input, setLocalErrors handler
   */
  const [localErrors, setLocalErrors] = useState<LocalErrors>({});

  /**
   * useState required to follow form state
   * @notes sets FormData on input change tracking actual form data 
   */
  const [localFormData, setLocalFormData] = useState<LocalFormData>({
    name: '',
    email: '',
    password: ''
    // question1: "", // should add question response to User?
    // question2: "",
  })

  /** handles input values on change **/
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (localErrors[name as keyof LocalErrors]) {  // Better typing
      setLocalErrors(prev => ({ ...prev, [name]: undefined }));
    }
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
        return "/placeholder.svg?height=400&width=600&text=Your Name"
      case 2:
        return "/placeholder.svg?height=400&width=600&text=Credentials"
      case 3:
        return "/placeholder.svg?height=400&width=600&text=Financial Goal"
      case 4:
        return "/placeholder.svg?height=400&width=600&text=Knowledge Level"
      default:
        return "/placeholder.svg?height=400&width=600"
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Image Section (Full-screen on mobile, half on desktop) */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-4 lg:p-8">
        <img
          src={getImageSrc() || "/placeholder.svg"}
          alt="Onboarding Illustration"
          className="w-full max-w-lg lg:max-w-full h-auto rounded-xl shadow-xl object-cover"
        />
      </div>

      {/* FORM CARD Section */}
      <div className="w-full lg:w-1/2 max-w-md lg:max-w-lg space-y-8 bg-white p-8 md:p-10 rounded-xl shadow-lg mt-8 lg:mt-0 lg:ml-8">
      {/* FORM CARD HEADER */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Comienza tu camino</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {currentStep === 1 && "Cuentanos sobre ti."}
            {currentStep === 2 && "Create your access credentials."}
            {currentStep === 3 && "A few quick questions to get to know you better."}
            {currentStep === 4 && "Almost done, one last question."}
          </p>
        </div>

        {/* FORM CARD Form Section, STEPS */}
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

          {/* Step 2: Email & Password */}
          {currentStep === 2 && (
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
                  {state.errors?.email &&
                    state.errors.email.map((error: string) => (
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
                  {state.errors?.password &&
                    state.errors.password.map((error: string) => (
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

          {/* Step 3: Question 1 */}
          {/* {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="question1" className="text-base font-semibold mb-2 block">
                  1. Cual sería tu logro ideal a corto plazo?
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Input
                      id="q1-a1"
                      name="question1"
                      type="radio"
                      value="Save for an emergency fund"
                      checked={formData.question1 === "Save for an emergency fund"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      disabled={isPending}
                    />
                    <Label htmlFor="q1-a1" className="ml-2 block text-sm text-gray-900">
                      Tener un fondo de emergencia
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Input
                      id="q1-a2"
                      name="question1"
                      type="radio"
                      value="Pay off credit card debt"
                      checked={formData.question1 === "Pay off credit card debt"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      disabled={isPending}
                    />
                    <Label htmlFor="q1-a2" className="ml-2 block text-sm text-gray-900">
                      Pagar deudas como tarjetas de crédito
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Input
                      id="q1-a3"
                      name="question1"
                      type="radio"
                      value="Buy a significant asset (e.g., car, appliance)"
                      checked={formData.question1 === "Buy a significant asset (e.g., car, appliance)"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      disabled={isPending}
                    />
                    <Label htmlFor="q1-a3" className="ml-2 block text-sm text-gray-900">
                      Hacer una compra significativa (auto, emprendimiento, construcción, etc.)
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Input
                      id="q1-a4"
                      name="question1"
                      type="radio"
                      value="Start investing small amounts"
                      checked={formData.question1 === "Start investing small amounts"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      disabled={isPending}
                    />
                    <Label htmlFor="q1-a4" className="ml-2 block text-sm text-gray-900">
                      Invertir montos pequeños
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <Button type="button" onClick={handleBack} variant="outline" className="w-1/2 bg-transparent">
                  Atrás
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-1/2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )} */}

          {/* Step 4: Question 2 */}
          {/* {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="question2" className="text-base font-semibold mb-2 block">
                  2. ¿Cómo describirías tu nivel actual de conocimiento financiero?
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Input
                      id="q2-a1"
                      name="question2"
                      type="radio"
                      value="Basic (almost none)"
                      checked={formData.question2 === "Basic (almost none)"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      disabled={isPending}
                    />
                    <Label htmlFor="q2-a1" className="ml-2 block text-sm text-gray-900">
                      Básico (casi nulo)
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Input
                      id="q2-a2"
                      name="question2"
                      type="radio"
                      value="Intermediate (I know some concepts)"
                      checked={formData.question2 === "Intermediate (I know some concepts)"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      disabled={isPending}
                    />
                    <Label htmlFor="q2-a2" className="ml-2 block text-sm text-gray-900">
                      Intermedio (conozco algunos conceptos)
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Input
                      id="q2-a3"
                      name="question2"
                      type="radio"
                      value="Advanced (I manage investments and strategies)"
                      checked={formData.question2 === "Advanced (I manage investments and strategies)"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      disabled={isPending}
                    />
                    <Label htmlFor="q2-a3" className="ml-2 block text-sm text-gray-900">
                      Avanzado (gestiono inversiones y estrategias)
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Input
                      id="q2-a4"
                      name="question2"
                      type="radio"
                      value="Expert (I am a professional in the sector)"
                      checked={formData.question2 === "Expert (I am a professional in the sector)"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                      disabled={isPending}
                    />
                    <Label htmlFor="q2-a4" className="ml-2 block text-sm text-gray-900">
                      Experto (soy un profesional del sector)
                    </Label>
                  </div>
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
                  {isPending ? "Finalizing..." : "Terminar Registro"}
                </Button>
              </div>
            </div>
          )} */}

          {/* {state?.message && (
            <p className={`text-sm text-center ${state.success ? "text-green-600" : "text-red-600"}`}>
              {state.message}
            </p>
          )} */}

          {/* should have an ending response. also all questions could be outside form */}
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
    </div>
  )
}
