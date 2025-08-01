"use server"

export async function recoverPassword(prevState: any, formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { success: false, message: "Please enter your email address." }
  }

  // Simulate sending a recovery email
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // In a real application, you would send an actual email here
  console.log(`Password recovery email sent to: ${email}`)

  return {
    success: true,
    message: `If an account with ${email} exists, a password reset link has been sent to your inbox.`,
  }
}
