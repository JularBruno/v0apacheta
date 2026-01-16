'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getProfile } from '@/lib/actions/user';
import { User } from '@/lib/schemas/user';

export interface DashboardUserContextType {
	user: User | null;
	userBalance: number;
	loadingUser: boolean;
	error: string | null;
	// refetchUser: () => Promise<void>;
}

const DashboardUserContext = createContext<DashboardUserContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {

	const [user, setUser] = useState<User | null>(null);

	const [userBalance, setUserBalance] = useState<number>(0);
	const [loadingUser, setLoadingUser] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { toast } = useToast();

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoadingUser(true);
				setError(null); /// ??????	

				const profile = await getProfile();
				setUser(profile);
				setUserBalance(profile.balance);
			}
			catch (error: any) {

				// Guess this should be the first get that will catch 401
				// I guess any error would be related to api call, and instead of just catching redirect, I will show toast
				setError(error);
				return;
			} finally {
				setLoadingUser(false);

				// if (error) {
				// 	toast({
				// 		title: "Se venció tu sesión",
				// 		description: "Por favor ingresa nuevamente",
				// 		variant: "destructive",
				// 	})
				// }
			}
		}

		fetchProfile();
	}, []);

	const value: DashboardUserContextType = {
		user,
		userBalance,
		loadingUser,
		error,
		// refetchUser: fetchUserData,
	};

	return (
		<DashboardUserContext.Provider value={value}>
			{children}
		</DashboardUserContext.Provider>
	);
}

/**
 * Custom hook to use dashboard data anywhere
 * @usage const { user, userBalance, loading } = useDashboard();
 */
export function useDashboard() {
	const context = useContext(DashboardUserContext);
	if (context === undefined) {
		throw new Error('useDashboard must be used within DashboardProvider');
	}
	return context;
}