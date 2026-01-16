'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { getProfile } from '@/lib/actions/user';
import { User } from '@/lib/schemas/user';

export interface DashboardUserContextType {
	user: User | null;
	userBalance: number;
	loadingUser: boolean;
	error: string | null;
	// refetchUser: () => Promise<void>;
	setUserBalance: Dispatch<SetStateAction<number>>;
}
/**
 * Context to be called with the type returned by the provider
 */
const DashboardUserContext = createContext<DashboardUserContextType | undefined>(undefined);

/**
 * Actual information provider
 */
export function DashboardProvider({ children }: { children: ReactNode }) {

	/**
	 * User data that used to be in componennts
	 */
	const [user, setUser] = useState<User | null>(null);
	const [userBalance, setUserBalance] = useState<number>(0);
	const [loadingUser, setLoadingUser] = useState(true);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Just fetch profile, might want to do function outside useEffect to call it
	 */
	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoadingUser(true);
				setError(null); /// ??????	

				// Guess this should be the first get that will catch 401
				const profile = await getProfile();
				setUser(profile);
				setUserBalance(profile.balance);
			}
			catch (error: any) {

				// I guess any error would be related to api call, and instead of just catching redirect, I will show toast
				setError(error);
				return;
			} finally {
				setLoadingUser(false);

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
		setUserBalance
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