'use server'

import { getProfile } from './user'
import { getMovementsByUserAndFilter } from './movements'
import { getSubscriptionNotifications } from './notifications'
import { getBudgetByUserAndPeriod } from './categories'
import { TxType } from '../schemas/definitions'

// ─── Individual validators ────────────────────────────────────────────────────

/** 1.0 — pwa_or_acknowledged: at least 1 push subscription registered */
export async function validateStep_1_0(): Promise<boolean> {
	const subscriptions = await getSubscriptionNotifications()
	return subscriptions.length >= 1
}

/** 1.1.1 — api: user has set a non-zero starting balance */
// export async function validateStep_1_1_1(): Promise<boolean> {
// 	const user = await getProfile()
// 	return user.balance !== 0
// }

// /** 1.1.2 — api: at least 1 income movement recorded this calendar month */
// export async function validateStep_1_1_2(): Promise<boolean> {
// 	const now = new Date()
// 	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
// 	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()

// 	const movements = await getMovementsByUserAndFilter({ startDate: startOfMonth, endDate: endOfMonth })
// 	return movements.some(m => m.type === TxType.INCOME)
// }

/** 1.1.3 — api: at least 1 expense recorded (all time) */
export async function validateStep_1_1_2(): Promise<boolean> {
	const movements = await getMovementsByUserAndFilter()
	return movements.some(m => m.type === TxType.EXPENSE)
}

/** 1.1.4 — api: 5 or more expense movements recorded in total */
export async function validateStep_1_1_3(): Promise<boolean> {
	const movements = await getMovementsByUserAndFilter()
	return movements.filter(m => m.type === TxType.EXPENSE).length >= 5
}

/**
 * 1.1 — children_completed: all sub-steps 1.1.1 → 1.1.4 pass.
 * Runs the three data fetches in parallel to avoid sequential round-trips.
 */
// export async function validateStep_1_1(): Promise<boolean> {
// 	const now = new Date()
// 	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
// 	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()

// 	const [user, allMovements, monthMovements] = await Promise.all([
// 		getProfile(),
// 		getMovementsByUserAndFilter(),
// 		getMovementsByUserAndFilter({ startDate: startOfMonth, endDate: endOfMonth }),
// 	])

// 	const hasBalance = user.balance !== 0
// 	const hasIncomeThisMonth = monthMovements.some(m => m.type === TxType.INCOME)
// 	const expenses = allMovements.filter(m => m.type === TxType.EXPENSE)

// 	return hasBalance && hasIncomeThisMonth && expenses.length >= 1 && expenses.length >= 5
// }

/** 2.1 — api: at least 3 categories have a budget set */
export async function validateStep_2_1(): Promise<boolean> {
	const budgets = await getBudgetByUserAndPeriod()
	return budgets.filter(c => c.budget > 0).length >= 3
}

// ─── Aggregate ────────────────────────────────────────────────────────────────

export type Stage1Status = {
	'1.0': boolean
	'1.1': boolean
	'1.1.1': boolean
	'1.1.2': boolean
	'1.1.3': boolean
	'1.1.4': boolean
}

/**
 * Returns validation status for all API-checked steps in Stage 1.
 * Makes exactly 3 parallel fetches (user, subscriptions, movements).
 * Steps with `acknowledged` validation (1.2) are not included — those are
 * handled client-side via localStorage.
 */
export async function getStage1ValidationStatus(): Promise<Stage1Status> {
	const now = new Date()
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()

	const [user, subscriptions, allMovements, monthMovements] = await Promise.all([
		getProfile(),
		getSubscriptionNotifications(),
		getMovementsByUserAndFilter(),
		getMovementsByUserAndFilter({ startDate: startOfMonth, endDate: endOfMonth }),
	])

	const expenses = allMovements.filter(m => m.type === TxType.EXPENSE)
	const hasBalance = user.balance !== 0
	const hasIncomeThisMonth = monthMovements.some(m => m.type === TxType.INCOME)

	const v_1_1_1 = hasBalance
	const v_1_1_2 = hasIncomeThisMonth
	const v_1_1_3 = expenses.length >= 1
	const v_1_1_4 = expenses.length >= 5

	return {
		'1.0': subscriptions.length >= 1,
		'1.1.1': v_1_1_1,
		'1.1.2': v_1_1_2,
		'1.1.3': v_1_1_3,
		'1.1.4': v_1_1_4,
		'1.1': v_1_1_1 && v_1_1_2 && v_1_1_3 && v_1_1_4,
	}
}
