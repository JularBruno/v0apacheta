import { useQuery } from "@tanstack/react-query"
import { STEP_VALIDATORS } from "@/lib/map-validation-registry"

export function useStepValidation(stepId: string) {
	const validator = STEP_VALIDATORS[stepId]

	const { data, isLoading } = useQuery({
		queryKey: ["step-valid", stepId],
		queryFn: validator ?? (() => Promise.resolve(true)),
		staleTime: 30_000,
		enabled: true,
	})

	return {
		valid: data ?? !validator, // no validator = always valid; validator pending = false until resolved
		isLoading: isLoading && !!validator,
	}
}
