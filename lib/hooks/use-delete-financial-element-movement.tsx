import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMovement } from '@/lib/actions/movements';
import { TxType } from '../schemas/definitions';
import { User } from '../schemas/user';

export function useDeletePatrimonyMovement(financialElementId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string; type: TxType; amount: number }) =>
			deleteMovement(id),
		onSuccess: (_, { type, amount }) => {
			// queryClient.setQueryData(['user-profile'], (old: User) => {
			// 	if (!old) return old;
			// 	const delta = type === TxType.INCOME ? -amount : amount;
			// 	return { ...old, balance: old.balance + delta };
			// });
			queryClient.invalidateQueries({ queryKey: ['financial-element', financialElementId] });
			queryClient.invalidateQueries({ queryKey: ['financial-elements-patrimony'] });
		},
		onError: (error) => {
			console.error('Delete patrimony movement failed:', error);
		},
	});
}
