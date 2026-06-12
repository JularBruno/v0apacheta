import { useQuery } from '@tanstack/react-query';
import { getBudgetByUserAndPeriod } from '@/lib/actions/categories';

export function useBudget(startDate?: string, endDate?: string) {
	return useQuery({
		queryKey: ['budgeted-categories', startDate, endDate],
		queryFn: () => getBudgetByUserAndPeriod(startDate, endDate),
		staleTime: 60 * 60 * 1000,
	});
}
