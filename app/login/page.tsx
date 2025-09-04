"use client"

import React from "react"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { authenticate } from '@/lib/actions/auth';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {

  const searchParams = useSearchParams();
  // const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/mapa';
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // const [isPending, startTransition] = useTransition()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // const [errorMessage, formAction ] = useActionState(
  //   authenticate,
  //   undefined,
  // );

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/mapa';
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Ingresa a Apacheta</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bienvenido de vuelta! Ingresa tus credenciales para continuar.
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
              // required
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
              // required
              placeholder="••••••••"
              className="mt-1"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link href="/recover-password" className="font-medium text-green-600 hover:text-green-500">
                Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <input type="hidden" name="redirectTo" value={callbackUrl} />
            <Button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              disabled={isPending}
            >
              {isPending ? "Ingresando..." : "Log In"}
            </Button>
          </div>

            {errorMessage && (
              <div className="pt-2 text-center " >
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
        </form>
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/onboarding" className="font-medium text-green-600 hover:text-green-500">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
