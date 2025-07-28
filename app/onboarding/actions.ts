"use server"

import { redirect } from "next/navigation"

// Define the expected shape of the data
interface SignUpData {
  name: string
  email: string
  password: string
  question1: string
  question2: string
}

// The Server Action now accepts a plain object
export async function signUp(prevState: any, data: SignUpData) {
  const { name, email, password, question1, question2 } = data // Destructure directly from the object

  if (!name || !email || !password || !question1 || !question2) {
    return { success: false, message: "Please complete all fields." }
  }

  await new Promise((resolve) => setTimeout(resolve, 1500))

  redirect("/dashboard")
}
