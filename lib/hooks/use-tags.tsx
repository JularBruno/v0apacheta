// lib/hooks/useProfile.ts
import { useQuery } from '@tanstack/react-query';
import { getTagsByUser } from '../actions/tags';

export function useTags() {
	return useQuery({
		queryKey: ['user-tags'],
		queryFn: () => getTagsByUser(),
		staleTime: 60 * 60 * 1000
	});
}