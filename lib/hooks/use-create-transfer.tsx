import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postTransfer } from '@/lib/actions/transfers';
import { Transfer, TransferSideType } from '@/lib/schemas/transfer';

export function useCreateTransfer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Transfer) => postTransfer(data),
		onSuccess: async (_result, variables) => {
			// A transfer can touch either side of the balance/asset split, so refetch
			// history and patrimony rather than trying to patch either cache locally.
			const invalidations = [
				queryClient.invalidateQueries({ queryKey: ['user-movements'] }),
				queryClient.invalidateQueries({ queryKey: ['financial-elements-patrimony'] }),
				queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
			];

			// useFinancialElementById caches each asset's own movement history under its
			// own id — not covered by the invalidations above, so it goes stale otherwise.
			for (const side of [variables.from, variables.to]) {
				if (side.type === TransferSideType.ASSET && side.financialElementId) {
					invalidations.push(
						queryClient.invalidateQueries({ queryKey: ['financial-element', side.financialElementId] })
					);
				}
			}

			await Promise.all(invalidations);
		},
		onError: (error) => {
			console.error('Create transfer failed:', error);
		},
	});
}
