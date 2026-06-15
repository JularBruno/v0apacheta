'use client';

import React, { createContext, useContext, ReactNode } from 'react';
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
	budgetLoading: boolean;
}

export const DashboardUserContext = createContext<DashboardUserContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
	const { data: profile, isLoading: loadingProfile } = useProfile();
	const { data: categories = [], isLoading: loadingCats } = useCategories();
	const { data: tags = [], isLoading: loadingTags } = useTags();
	const { data: budgetData = [], isLoading: budgetLoading } = useBudget();

	const value: DashboardUserContextType = {
		user: profile,
		userBalance: profile?.balance || 0,
		loadingUser: loadingProfile,
		error: null,
		cats: categories,
		loadingCats,
		allTags: tags,
		loadingTags,
		budgetedCats: budgetData,
		budgetLoading
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
