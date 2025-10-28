"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { usePathname } from "next/navigation" // Import usePathname for dynamic title
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const getTitle = (path: string) => {
    switch (path) {
      case "/dashboard/mapa":
        return "Mapa"
      case "/dashboard/inicio":
        return "Inicio"
      case "/dashboard/presupuesto": 
        return "Presupuesto"
      case "/dashboard/historial":
        return "Historial"
      case "/dashboard/patrimonio":
        return "Patrimonio"
      case "/dashboard/config":
        return "Configuración"
      case "/dashboard/help":
        return "Ayuda"
      default:
        return "Dashboard"
    }
  }

  return (
    <SidebarProvider>
      <Toaster />

      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <SidebarTrigger className="-ml-1 h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-xl font-semibold text-gray-900">{getTitle(pathname)}</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-50/50">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

