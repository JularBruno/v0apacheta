import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMovement } from '@/lib/actions/movements';
import { TxType } from '../schemas/definitions';
import { User } from '../schemas/user';

export function useDeleteMovement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string; type: TxType; amount: number }) =>
			deleteMovement(id),
		onSuccess: (_, { type, amount }) => {
			queryClient.setQueryData(['user-profile'], (old: User) => {
				if (!old) return old;
				// delete reverses the movement: income deletion decreases balance
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


