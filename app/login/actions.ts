"use server"

import { redirect } from "next/navigation"

interface LoginData {
  email: string
  password: string
}

export async function login(prevState: any, data: LoginData) {
  const { email, password } = data

  // Simulate authentication
  // In a real application, you would query your database here
  // and verify credentials (e.g., using bcrypt for passwords).
  if (email === "test@example.com" && password === "password123") {
    // Simulate a successful login delay
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    redirect("/dashboard") // Redirect to the dashboard on successful login
  } else {
    // Simulate a failed login delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: false, message: "Invalid email or password." }
  }
}
