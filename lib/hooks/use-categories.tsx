import { useQuery } from '@tanstack/react-query';
import { getCategoriesByUser } from '@/lib/actions/categories';

export function useCategories() {
	return useQuery({
		queryKey: ['user-categories'],
		queryFn: () => getCategoriesByUser(),
		staleTime: 60 * 60 * 1000,
	});
}
