import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getLastMovementImport, undoMovementImport } from '@/lib/actions/movements';

const LAST_IMPORT_KEY = ['last-movement-import'];

export function useLastMovementImport() {
	return useQuery({
		queryKey: LAST_IMPORT_KEY,
		queryFn: () => getLastMovementImport(),
	});
}

export function useUndoMovementImport() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (importId: string) => undoMovementImport(importId),
		onSuccess: () => {
			// the undo touches movements, balance, budgets and possibly categories/tags;
			// the "last import" itself moves on to the previous one
			for (const key of ['user-movements', 'user-profile', 'budgeted-categories', 'user-categories', 'user-tags']) {
				queryClient.invalidateQueries({ queryKey: [key] });
			}
			queryClient.invalidateQueries({ queryKey: LAST_IMPORT_KEY });
		},
	});
}
