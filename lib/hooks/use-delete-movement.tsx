import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMovement } from '@/lib/actions/movements';
import { TxType } from '../schemas/definitions';
import { User } from '../schemas/user';

export function useDeleteMovement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string; type: TxType; amount: number }) =>
			deleteMovement(id),
		onSuccess: (_, { id, type, amount }) => {
			queryClient.setQueriesData(
				{ queryKey: ['user-movements'] },
				(old: any) => old ? old.filter((m: any) => m.id !== id) : old
			);

			queryClient.setQueryData(['user-profile'], (old: User) => {
				if (!old) return old;
				const delta = type === TxType.INCOME ? -amount : amount;
				return { ...old, balance: old.balance + delta };
			});

			queryClient.invalidateQueries({ queryKey: ['user-movements'] });
			queryClient.invalidateQueries({ queryKey: ['user-profile'] });
			queryClient.invalidateQueries({ queryKey: ['budgeted-categories'] });
		},
		onError: (error) => {
			console.error('Delete movement failed:', error);
		},
	});
}


