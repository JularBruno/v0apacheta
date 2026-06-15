import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postFinancialElement } from '@/lib/actions/financialElements';
import { FinancialElementType } from '@/lib/schemas/definitions';

export function useCreateFinancialElement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { name: string; type: FinancialElementType }) =>
			postFinancialElement(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['financial-elements-patrimony'] });
		},
		onError: (error) => {
			console.error('Create financial element failed:', error);
		},
	});
}
