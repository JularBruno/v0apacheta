"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function RecoverPasswordPage() {
  const recoverPassword = () => { // formData: FormData
    console.log('recoverPassword called');
    return;
  }
    
  const [state, formAction, isPending] = useActionState(recoverPassword, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Recover Your Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address below and we'll send you a link to reset your password.
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
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
              disabled={isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            disabled={isPending}
          >
            {isPending ? "Sending..." : "Send Reset Link"}
          </Button>

          {/* {state?.message && (
            <p className={`mt-4 text-center text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>
              {state.message}
            </p>
          )} */}
        </form>
        <div className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
