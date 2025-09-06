
import type * as React from "react"
import { Home, Settings, HelpCircle, Map, History, Package, Wallet, LogOut } from "lucide-react" // Added Map, History, Package
import { usePathname } from "next/navigation"
import { logOut } from '@/lib/actions/auth';
import { useTransition } from 'react';

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
  const pathname = usePathname(); // Get current pathname

  const [isPending, startTransition] = useTransition();

  /**
   * @title Handles logout with proper error handling
   * @returns Logs out user and redirects
   */
  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logOut();
      } catch (error) {
        console.error('Logout failed:', error);
        // Handle error if needed
      }
    });
  };

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

                <SidebarMenuButton 
                    disabled={isPending}
                    onClick={handleLogout}>
                  <LogOut />
                  {/* <span></span> */}
                  <span>{isPending ? 'Cerrando Sesión...' : 'Cerrar Sesión'}</span>
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
