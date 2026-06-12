import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putCategory } from '@/lib/actions/categories';
import { UpdateCategoryData } from '@/lib/schemas/category';

export function useUpdateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
			putCategory(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-categories'] });
			queryClient.invalidateQueries({ queryKey: ['budgeted-categories'] });
		},
		onError: (error) => {
			console.error('Update category failed:', error);
		},
	});
}
