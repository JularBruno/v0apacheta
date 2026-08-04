import { useQuery } from '@tanstack/react-query';
import { getAvailableCurrencies } from '@/lib/actions/currencies';

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export function useCurrencies() {
	return useQuery({
		queryKey: ['available-currencies'],
		queryFn: () => getAvailableCurrencies(),
		staleTime: ONE_WEEK,
		gcTime: ONE_WEEK,
	});
}
