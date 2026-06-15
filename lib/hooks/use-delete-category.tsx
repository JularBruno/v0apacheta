import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategoryById } from '@/lib/actions/categories';

export function useDeleteCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (catId: string) => deleteCategoryById(catId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-categories'] });
			queryClient.invalidateQueries({ queryKey: ['user-tags'] });
			queryClient.invalidateQueries({ queryKey: ['budgeted-categories'] });
		},
		onError: (error) => {
			console.error('Delete category failed:', error);
		},
	});
}
