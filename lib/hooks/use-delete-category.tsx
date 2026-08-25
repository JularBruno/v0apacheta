import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategoryById } from '@/lib/actions/categories';
import { putUser } from '@/lib/actions/user';
import { TxType } from '@/lib/schemas/definitions';
import { CategoryBudget } from '@/lib/schemas/category';
import { User } from '@/lib/schemas/user';

export function useDeleteCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string; type: TxType }) => deleteCategoryById(id),
		onSuccess: async (_, { id, type }) => {
			queryClient.invalidateQueries({ queryKey: ['user-categories'] });
			queryClient.invalidateQueries({ queryKey: ['user-tags'] });
			queryClient.invalidateQueries({ queryKey: ['budgeted-categories'] });

			// Deleting an income source changes what the user's total budget should be —
			// keep user.totalBudget in sync, same as editing an income category's budget does.
			if (type === TxType.INCOME) {
				const budgetedCats = queryClient.getQueryData<CategoryBudget[]>(['budgeted-categories']) ?? [];
				const newTotalBudget = budgetedCats
					.filter((c) => c.id !== id && c.type === TxType.INCOME)
					.reduce((sum, c) => sum + c.budget, 0);

				const updatedUser = await putUser({ totalBudget: newTotalBudget });
				queryClient.setQueryData(['user-profile'], (old: User) => old ? { ...old, ...updatedUser } : updatedUser);
			}
		},
		onError: (error) => {
			console.error('Delete category failed:', error);
		},
	});
}
