import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putFinancialElement } from '@/lib/actions/financialElements';
import { FinancialElement } from '@/lib/schemas/financialElement';

export function useUpdateFinancialElement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: FinancialElement }) => {
			return putFinancialElement(id, data);
		},
		onSuccess: (updated, { id }) => {
			queryClient.invalidateQueries({ queryKey: ['financial-elements-patrimony'] });
			queryClient.invalidateQueries({ queryKey: ['financial-element', id] });
		},
		onError: (error) => {
			console.error('Update financial element failed:', error);
		},
	});
}
