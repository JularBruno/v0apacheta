import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postCategory } from '@/lib/actions/categories';
import { TxType } from '../schemas/definitions';

export function useCreateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			name: string;
			icon: string;
			color: string;
			type: TxType;
		}) => postCategory(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-categories'] });
		},
		onError: (error) => {
			console.error('Create category failed:', error);
		},
	});
}
