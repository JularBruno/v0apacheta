import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMovement } from '@/lib/actions/movements';
import { TxType } from '../schemas/definitions';
import { User } from '../schemas/user';

export function useDeleteMovement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string; type: TxType; amount: number; financialElementId?: string }) =>
			deleteMovement(id),
		onSuccess: (_, { id, type, amount, financialElementId }) => {
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

			// This movement may be tied to an asset (e.g. a transfer leg) — its patrimony
			// totals and own detail-page history are separate caches, not covered above.
			if (financialElementId) {
				queryClient.invalidateQueries({ queryKey: ['financial-elements-patrimony'] });
				queryClient.invalidateQueries({ queryKey: ['financial-element', financialElementId] });
			}
		},
		onError: (error) => {
			console.error('Delete movement failed:', error);
		},
	});
}


