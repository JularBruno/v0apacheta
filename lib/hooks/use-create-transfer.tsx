import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postTransfer } from '@/lib/actions/transfers';
import { Transfer } from '@/lib/schemas/transfer';

export function useCreateTransfer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Transfer) => postTransfer(data),
		onSuccess: async () => {
			// A transfer can touch either side of the balance/asset split, so refetch
			// history and patrimony rather than trying to patch either cache locally.
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['user-movements'] }),
				queryClient.invalidateQueries({ queryKey: ['financial-elements-patrimony'] }),
				queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
			]);
		},
		onError: (error) => {
			console.error('Create transfer failed:', error);
		},
	});
}
