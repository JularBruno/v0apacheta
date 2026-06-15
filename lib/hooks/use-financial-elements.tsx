import { useQuery } from '@tanstack/react-query';
import { getFinancialElementsByUser } from '@/lib/actions/financialElements';

export function useFinancialElements() {
	return useQuery({
		queryKey: ['financial-elements-patrimony'],
		queryFn: () => getFinancialElementsByUser(),
		staleTime: 60 * 60 * 1000,
	});
}
