"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { usePathname } from "next/navigation" // Import usePathname for dynamic title

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const getTitle = (path: string) => {
    switch (path) {
      case "/dashboard/mapa":
        return "Mapa"
      case "/dashboard/inicio":
        return "Inicio"
      case "/dashboard/historial":
        return "Historial"
      case "/dashboard/assets":
        return "Assets"
      case "/dashboard/settings":
        return "Configuración"
      case "/dashboard/help":
        return "Ayuda"
      default:
        return "Dashboard"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-xl font-semibold text-gray-900">{getTitle(pathname)}</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

