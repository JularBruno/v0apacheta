"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { useActionState } from "react"
import { signUp } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    question1: "",
    question2: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (currentStep === 1 && !formData.name) {
      alert("Please enter your name.")
      return
    }
    if (currentStep === 2 && (!formData.email || !formData.password)) {
      alert("Please enter your email and password.")
      return
    }
    if (currentStep === 3 && !formData.question1) {
      alert("Please answer the question.")
      return
    }
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.question2) {
      alert("Please answer the question.")
      return
    }

    // Use startTransition to properly handle the async action
    startTransition(async () => {
      try {
        // Simulate your signup process
        console.log("Submitting form data:", formData)
        
        // For placeholder: just wait a bit and navigate to dashboard
        await new Promise(resolve => setTimeout(resolve, 150))
        
        // Navigate to dashboard after successful submission
        router.push("/dashboard/mapa")
      } catch (error) {
        console.error("Signup failed:", error)
        alert("Signup failed. Please try again.")
      }
    })
  }

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

      {/* Form Section */}
      <div className="w-full lg:w-1/2 max-w-md lg:max-w-lg space-y-8 bg-white p-8 md:p-10 rounded-xl shadow-lg mt-8 lg:mt-0 lg:ml-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Start Your Journey</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {currentStep === 1 && "Tell us a bit about yourself."}
            {currentStep === 2 && "Create your access credentials."}
            {currentStep === 3 && "A few quick questions to get to know you better."}
            {currentStep === 4 && "Almost done, one last question."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Step 1: Name */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Your full name"
                  className="mt-1"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </div>
              <Button
                type="button"
                onClick={handleNext}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Next
              </Button>
            </div>
          )}

          {/* Step 2: Email & Password */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.com"
                  className="mt-1"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="mt-1"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isPending}
                />
              </div>
              <div className="flex justify-between gap-4">
                <Button type="button" onClick={handleBack} variant="outline" className="w-1/2 bg-transparent">
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-1/2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Question 1 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="question1" className="text-base font-semibold mb-2 block">
                  1. What is your main short-term financial goal?
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
                      Save for an emergency fund
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
                      Pay off credit card debt
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
                      Buy a significant asset (e.g., car, appliance)
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
                      Start investing small amounts
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <Button type="button" onClick={handleBack} variant="outline" className="w-1/2 bg-transparent">
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-1/2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Question 2 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="question2" className="text-base font-semibold mb-2 block">
                  2. How would you describe your current level of financial knowledge?
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
                      Basic (almost none)
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
                      Intermediate (I know some concepts)
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
                      Advanced (I manage investments and strategies)
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
                      Expert (I am a professional in the sector)
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <Button type="button" onClick={handleBack} variant="outline" className="w-1/2 bg-transparent">
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-1/2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  disabled={isPending}
                >
                  {isPending ? "Finalizing..." : "Finish Registration"}
                </Button>
              </div>
            </div>
          )}

          {/* {state?.message && (
            <p className={`text-sm text-center ${state.success ? "text-green-600" : "text-red-600"}`}>
              {state.message}
            </p>
          )} */}
        </form>
        <div className="text-center text-sm text-gray-600">
          {currentStep < 4 && (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
