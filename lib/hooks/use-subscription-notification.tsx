import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getSubscriptionNotifications,
	postSubscriptionNotifications,
	deleteSubscriptionNotifications,
} from '@/lib/actions/notifications';

export function useSubscriptionNotifications() {
	return useQuery({
		queryKey: ['subscription-notifications'],
		queryFn: () => getSubscriptionNotifications(),
		staleTime: Infinity,
	});
}

export function useSubscribe() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { endpoint: string; p256dh: string; auth: string }) =>
			postSubscriptionNotifications(data),
		onSuccess: (newSub) => {
			queryClient.setQueryData(['subscription-notifications'], (old: any[]) =>
				old ? [...old, newSub] : [newSub],
			);
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
		},
		onError: (error) => {
			console.error('Unsubscribe failed:', error);
		},
	});
}
