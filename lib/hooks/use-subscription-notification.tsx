import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getSubscriptionNotifications,
	postSubscriptionNotifications,
	deleteSubscriptionNotifications,
	deleteAllSubscriptionNotifications,
} from '@/lib/actions/notifications';

export function useSubscriptionNotifications() {
	return useQuery({
		queryKey: ['subscription-notifications'],
		queryFn: () => getSubscriptionNotifications(),
		// devices change elsewhere (the phone turns them on): refetch when the tab
		// regains focus instead of trusting the first answer forever
		staleTime: 30_000,
		refetchOnWindowFocus: true,
	});
}

export function useSubscribe() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { endpoint: string; p256dh: string; auth: string }) =>
			postSubscriptionNotifications(data),
		onSuccess: (newSub) => {
			// the API returns the existing row when this browser was already stored
			// (T-010), so replace by endpoint instead of appending a duplicate
			queryClient.setQueryData(['subscription-notifications'], (old: any[]) => [
				...(old ?? []).filter((s) => s.endpoint !== newSub?.endpoint),
				newSub,
			]);
			queryClient.invalidateQueries({ queryKey: ['subscription-notifications'] });
			queryClient.invalidateQueries({ queryKey: ['step-valid', '1.0'] });
		},
		onError: (error) => {
			console.error('Subscribe failed:', error);
		},
	});
}

export function useUnsubscribe() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (endpoint: string) => deleteSubscriptionNotifications(endpoint),
		onSuccess: (_, endpoint) => {
			queryClient.setQueryData(['subscription-notifications'], (old: any[]) =>
				old ? old.filter((s) => s.endpoint !== endpoint) : [],
			);
			queryClient.invalidateQueries({ queryKey: ['subscription-notifications'] });
		},
		onError: (error) => {
			console.error('Unsubscribe failed:', error);
		},
	});
}

/** Turn notifications off on every device of the user. */
export function useUnsubscribeAll() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deleteAllSubscriptionNotifications(),
		onSuccess: () => {
			queryClient.setQueryData(['subscription-notifications'], []);
			queryClient.invalidateQueries({ queryKey: ['subscription-notifications'] });
		},
		onError: (error) => {
			console.error('Unsubscribe all failed:', error);
		},
	});
}
