'use client';
import { useQueryClient } from '@tanstack/react-query';
import { logOut } from '@/lib/actions/auth';

export function useLogout() {
	const queryClient = useQueryClient();

	return async () => {
		queryClient.invalidateQueries({ queryKey: ['user-profile'] });
		await logOut(); // your server action
	};
}