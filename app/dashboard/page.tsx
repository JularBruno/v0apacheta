import { redirect } from "next/navigation"

export default function DashboardRootPage() {
  redirect("/dashboard/mapa")
  // redirect("/dashboard/inicio")
  return null // This page will immediately redirect
}
