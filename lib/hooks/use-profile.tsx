// lib/hooks/useProfile.ts
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/lib/actions/user';

export function useProfile() {
	return useQuery({
		queryKey: ['user-profile'],
		queryFn: () => getProfile(),
		staleTime: 3600000, // 1 hour
	});
}