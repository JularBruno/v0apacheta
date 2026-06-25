import { useMutation, useQueryClient } from '@tanstack/react-query'
import { putUser } from '@/lib/actions/user'
import { User } from '@/lib/schemas/user'

export const DEFAULT_MAP_LEVEL = "1.0"

/** Returns mapLevel, defaulting null/undefined to the first step */
export function resolveMapLevel(mapLevel: string | null | undefined): string {
	return mapLevel ?? DEFAULT_MAP_LEVEL
}

export function useUpdateMapLevel() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (mapLevel: string) => {
			const resolved = resolveMapLevel(mapLevel)
			console.log("[useUpdateMapLevel] PUT mapLevel:", resolved)
			return putUser({ mapLevel: resolved })
		},
		onSuccess: (updatedUser) => {
			console.log("[useUpdateMapLevel] success, new mapLevel:", updatedUser.mapLevel)
			queryClient.setQueryData(['user-profile'], (old: User) =>
				old ? { ...old, mapLevel: updatedUser.mapLevel } : updatedUser
			)
		},
		onError: (err) => {
			console.error("[useUpdateMapLevel] error:", err)
		},
	})
}
