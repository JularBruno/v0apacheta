import { useQuery } from '@tanstack/react-query';
import { getMovementsByUserAndFilter, MovementFilters } from '@/lib/actions/movements';

export function useMovements(filters?: MovementFilters) {
	return useQuery({
		queryKey: ['user-movements', filters],
		// queryKey: ['user-movements'],
		queryFn: () => getMovementsByUserAndFilter(filters),
		staleTime: 0,
	});
}
