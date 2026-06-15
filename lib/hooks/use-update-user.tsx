import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putUser } from '@/lib/actions/user';
import { User, NotificationFrequency } from '@/lib/schemas/user';

type UpdateUserData = {
	name?: string;
	totalBudget?: number;
	balance?: number;
	notificationFrequency?: NotificationFrequency;
	mapLevel?: string;
};

export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateUserData) => putUser(data),
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(['user-profile'], (old: User) => {
				if (!old) return updatedUser;
				return { ...old, ...updatedUser };
			});
			queryClient.invalidateQueries({ queryKey: ['user-profile'] });
		},
		onError: (error) => {
			console.error('Update user failed:', error);
		},
	});
}
