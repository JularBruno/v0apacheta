'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { User } from '@/lib/schemas/user';
import { Category, CategoryBudget } from '@/lib/schemas/category';
import { Tags } from '@/lib/schemas/tag';

import { useProfile } from '@/lib/hooks/use-profile';
import { useCategories } from '@/lib/hooks/use-categories';
import { useTags } from '@/lib/hooks/use-tags';
import { useBudget } from '@/lib/hooks/use-budget';

export interface DashboardUserContextType {
	user: User | undefined;
	userBalance: number;
	loadingUser: boolean;
	error: string | null;
	cats: Category[];
	loadingCats: boolean;
	allTags: Tags[];
	loadingTags: boolean;
	budgetedCats: CategoryBudget[];
	setBudgetedCats: Dispatch<SetStateAction<CategoryBudget[]>>;
	loadingBudgetedCats: boolean;
	setLoadingBudgetedCats: (loading: boolean) => void;
}

export const DashboardUserContext = createContext<DashboardUserContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User>();

	const [cats, setCats] = useState<Category[]>([]);
	const [allTags, setAllTags] = useState<Tags[]>([]);
	const [budgetedCats, setBudgetedCats] = useState<CategoryBudget[]>([]);
	const [loadingBudgetedCats, setLoadingBudgetedCats] = useState(true);

	const { data: profile, isLoading: loadingProfile } = useProfile();
	const { data: categories = [], isLoading: loadingCats } = useCategories();
	const { data: tags = [], isLoading: loadingTags } = useTags();
	const { data: budgetData = [], isLoading: budgetLoading } = useBudget();

	useEffect(() => {
		if (profile) {
			setUser(profile);
		}
		setCats(categories);
		setAllTags(tags);
	}, [profile, categories, tags]);

	useEffect(() => {
		setBudgetedCats(budgetData);
		setLoadingBudgetedCats(budgetLoading);
	}, [budgetData, budgetLoading]);

	const value: DashboardUserContextType = {
		user,
		userBalance: user?.balance || 0,
		loadingUser: loadingProfile,
		error: null,
		cats,
		loadingCats,
		allTags,
		loadingTags,
		budgetedCats,
		setBudgetedCats,
		loadingBudgetedCats,
		setLoadingBudgetedCats,
	};

	return (
		<DashboardUserContext.Provider value={value}>
			{children}
		</DashboardUserContext.Provider>
	);
}

export function useDashboard() {
	const context = useContext(DashboardUserContext);
	if (context === undefined) {
		throw new Error('useDashboard must be used within DashboardProvider');
	}
	return context;
}
