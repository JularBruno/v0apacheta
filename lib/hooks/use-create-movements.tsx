import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TxType } from '../schemas/definitions';
import { Movement } from '../schemas/movement';
import { postMovement } from '../actions/movements';
import { User } from '../schemas/user';
import { useDashboard } from '@/app/dashboard/dashboardContext';

export function useCreateMovement() {
	const { cats } = useDashboard();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Movement) => postMovement(data),
		onSuccess: async (newMovement) => {
			queryClient.setQueryData(['user-profile'], (old: User) => {
				if (!old) return old;
				const delta = newMovement.type === TxType.INCOME ? newMovement.amount : -newMovement.amount;
				return { ...old, balance: old.balance + delta };
			});

			const category = cats.find(c => c.id === newMovement.categoryId);
			queryClient.setQueriesData(
				{ queryKey: ['user-movements'] },
				(old: any) => {
					const populated = { ...newMovement, category };
					return old ? [populated, ...old] : [populated];
				}
			);

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['user-tags'] }),
				queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
			]);
		},
		onError: (error) => {
			console.error('Create movement failed:', error);
		},
	});
}