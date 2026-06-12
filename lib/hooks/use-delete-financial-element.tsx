import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteFinancialElementById } from '@/lib/actions/financialElements';

export function useDeleteFinancialElement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteFinancialElementById(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['financial-elements'] });
			queryClient.removeQueries({ queryKey: ['financial-element', id] });
		},
		onError: (error) => {
			console.error('Delete financial element failed:', error);
		},
	});
}
