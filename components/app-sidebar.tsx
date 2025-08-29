"use client"

import type * as React from "react"
import { Home, Settings, HelpCircle, Map, History, Package, Wallet, LogOut } from "lucide-react" // Added Map, History, Package
import { usePathname, useRouter } from "next/navigation"
import { logOut } from '@/lib/actions/auth';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Menu items for the sidebar
const mainMenuItems = [
  {
    title: "Mapa",
    url: "/dashboard/mapa",
    icon: Map,
  },
  {
    title: "Inicio",
    url: "/dashboard/inicio",
    icon: Home,
  },
  {
    title: "Presupuesto", // New menu item
    url: "/dashboard/presupuesto",
    icon: Wallet, // Using Wallet icon for budget
  },
  {
    title: "Historial",
    url: "/dashboard/historial",
    icon: History,
  },
  {
    title: "Patrimonio",
    url: "/dashboard/patrimonio",
    icon: Package,
  },
]

const secondaryMenuItems = [
  {
    title: "Configuración",
    url: "/dashboard/config",
    icon: Settings,
  },
  {
    title: "Ayuda",
    url: "/dashboard/help",
    icon: HelpCircle,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname() // Get current pathname
  const router = useRouter()

  const handleLogout = async () => {
    // await signOut({ redirectTo: '/' });
    await logOut();
    // await logOut({ 
    //   redirectTo: '/',  // Use callbackUrl instead of redirectTo for client-side
    //   redirect: true 
    // });
  }

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    {/* Added isActive prop */}
                    <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel>Soporte</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    {/* Added isActive prop */}
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>

                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  <span>Cerrar Sesión</span>
                </SidebarMenuButton>
                
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail /> {/* Allows resizing/toggling the sidebar */}
    </Sidebar>
  )
}
