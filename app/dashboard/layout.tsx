"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { usePathname } from "next/navigation" // Import usePathname for dynamic title
import { Toaster } from "@/components/ui/toaster" // this is used here and declared in component to be used everywhere by the hook

import { useToast } from "@/hooks/use-toast"
import { getProfile } from "@/lib/actions/user";
import { useEffect, useState } from "react";


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

	/**
	 * Toast as for only describing user loged out because session expired
	 */
	const { toast } = useToast()

	async function toastError401() {
		toast({
			title: "Sesión expirada",
			description: "Su sesión expiró, ingresá nuevamente!",
			variant: "destructive",
		})
	}

	/**
	 * 
	 * User
	 * 
	 */
	// const [userProfile, setUserProfile] = useState<User | null>(null);
	const [userBalance, setUserBalance] = useState<number>(0);
	const [loadingUser, setLoadingUser] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoadingUser(true);
				const profile = await getProfile();
				console.log('profile ', profile);

				// setUserProfile(profile);
				setUserBalance(profile.balance);
			}
			catch (error: any) {
				console.log('USER DASHBOARD ERROR ', error);

				if (error.digest?.includes('NEXT_REDIRECT')) {
					toastError401();
					// Redirect is happening, ignore
					return;
				}
			} finally {
				setLoadingUser(false);
			}
		}

		fetchProfile();
	}, []);


	return (
		<SidebarProvider>
			<Toaster /> {/* Hook useToast component*/}

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

