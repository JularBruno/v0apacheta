import { useQuery } from '@tanstack/react-query';
import { getFinancialElementById } from '@/lib/actions/financialElements';

export function useFinancialElementById(id: string) {
	return useQuery({
		queryKey: ['financial-element', id],
		queryFn: () => getFinancialElementById(id),
		staleTime: 60 * 60 * 1000,
		enabled: !!id,
	});
}
