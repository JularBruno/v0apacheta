"use client"

import type * as React from "react"
import { Home, Settings, HelpCircle, Map, History, Package } from "lucide-react" // Added Map, History, Package
import { usePathname } from "next/navigation" // Import usePathname

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
    title: "Historial",
    url: "/dashboard/historial",
    icon: History,
  },
  {
    title: "Assets",
    url: "/dashboard/assets",
    icon: Package,
  },
]

const secondaryMenuItems = [
  {
    title: "Configuración",
    url: "/dashboard/settings",
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail /> {/* Allows resizing/toggling the sidebar */}
    </Sidebar>
  )
}
