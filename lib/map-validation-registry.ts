import {
	validateStep_1_0,
	validateStep_1_1_2,
	validateStep_1_1_3,
	validateStep_2_1,
} from "@/lib/actions/map-validation"

/**
 * Maps step IDs to their validation function.
 * Steps not listed here are always passable (acknowledged / no server check needed).
 */
export const STEP_VALIDATORS: Record<string, () => Promise<boolean>> = {
	"1.0":   validateStep_1_0,
	"1.1.2": validateStep_1_1_2,
	"1.1.3": validateStep_1_1_3,
	"2.1":   validateStep_2_1,
	"2.3":   () => Promise.resolve(false), // work in progress
}
