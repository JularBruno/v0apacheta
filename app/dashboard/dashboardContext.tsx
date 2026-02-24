'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { getProfile } from '@/lib/actions/user';
import { User } from '@/lib/schemas/user';
import { revalidateTag } from 'next/cache'
import { Category, CategoryBudget } from '@/lib/schemas/category';
import { Tag } from '@/lib/schemas/tag';
import { getCategoriesByUser } from '@/lib/actions/categories';
import { getTagsByUser } from '@/lib/actions/tags';

export interface DashboardUserContextType {
	user: User | undefined;
	userBalance: number;
	loadingUser: boolean;
	error: string | null;
	// refetchUser: () => Promise<void>;
	setUserBalance: Dispatch<SetStateAction<number>>;
	cats: Category[];
	setCats: Dispatch<SetStateAction<Category[]>>;
	loadingCats: boolean;
	tags: Tag[];
	setTags: Dispatch<SetStateAction<Tag[]>>;
	loadingTags: boolean;
	// tags: Tag[] | null;
	// setTags: Dispatch<SetStateAction<Tag[]>>;
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
	const [loading, setLoading] = useState(true);

	const [user, setUser] = useState<User>();
	const [userBalance, setUserBalance] = useState<number>(0);
	const [loadingUser, setLoadingUser] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [cats, setCats] = useState<Category[]>([]);
	const [loadingCats, setLoadingCats] = useState(true);

	const [tags, setTags] = useState<Tag[]>([]);
	const [loadingTags, setLoadingTags] = useState(true);

	const [budget, setBudget] = useState<CategoryBudget[]>([]);
	const [loadingBudget, setLoadingBudget] = useState(true);

	const fetchProfile = async () => {
		try {
			setLoadingUser(true);
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

	const fetchCategories = async () => {
		try {
			setLoadingCats(true);
			const categories = await getCategoriesByUser();
			setCats(categories);
		}
		catch (error: any) {
			setError(error);
			return;
		} finally {
			setLoadingCats(false);
		}
	}

	const fetchTags = async () => {
		try {
			setLoadingTags(true);
			const tags = await getTagsByUser();
			setTags(tags);
		}
		catch (error: any) {
			setError(error);
			return;
		} finally {
			setLoadingTags(false);
		}
	}

	// const fetchBudgetForThisMonth = async () => { // was about to join with cats but this has default filter for this month
	// 	try {
	// 		setLoadingBudget(true);
	// 		const budget = await getBudgetByUserAndPeriod();
	// 		setBudget(budget);
	// 	}
	// 	catch (error: any) {
	// 		setError(error);
	// 		return;
	// 	} finally {
	// 		setLoadingBudget(false);
	// 	}
	// }

	/**
	 * Just fetch profile, might want to do function outside useEffect to call it
	 */

	const fetchData = async () => {
		setLoading(true);
		setError(null); // clean errors

		try {
			// const [categories, user] = 
			await Promise.all([
				fetchCategories(),
				fetchProfile(),
				fetchTags()
			]);

		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const value: DashboardUserContextType = {
		user,
		userBalance,
		loadingUser,
		error,
		// refetchUser: fetchUserData,
		setUserBalance,
		cats,
		setCats,
		loadingCats,
		tags,
		setTags,
		loadingTags
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