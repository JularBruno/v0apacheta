/**
 * Local-only (no backend) data model for Dividir Cuenta — a quick, single-user
 * "who owes whom" calculator, Tricount-style: expenses have a description, an
 * amount, who paid, and who it's split between. Balances and settlements are
 * always derived from the expense list, never typed in directly.
 */

export interface Member {
	id: string
	name: string
}

export interface Expense {
	id: string
	description: string
	amount: number
	/** member id */
	paidBy: string
	/** member ids this expense is split between — defaults to everyone at add-time */
	participants: string[]
	createdAt: number
}

export interface Settlement {
	from: string
	to: string
	amount: number
}

export interface Balance {
	memberId: string
	name: string
	/** positive = is owed money, negative = owes money */
	balance: number
}

/**
 * Each member's balance = what they paid across every expense, minus their
 * share of every expense they participated in (amount split evenly among
 * that expense's participants).
 */
export function calculateBalances(members: Member[], expenses: Expense[]): Balance[] {
	const paid = new Map<string, number>()
	const owed = new Map<string, number>()

	for (const member of members) {
		paid.set(member.id, 0)
		owed.set(member.id, 0)
	}

	for (const expense of expenses) {
		paid.set(expense.paidBy, (paid.get(expense.paidBy) ?? 0) + expense.amount)

		const share = expense.participants.length > 0 ? expense.amount / expense.participants.length : 0
		for (const participantId of expense.participants) {
			owed.set(participantId, (owed.get(participantId) ?? 0) + share)
		}
	}

	return members.map((member) => ({
		memberId: member.id,
		name: member.name,
		balance: (paid.get(member.id) ?? 0) - (owed.get(member.id) ?? 0),
	}))
}

/** Greedy debtor/creditor matching — same minimal-transfer approach as before,
 *  just fed real derived balances instead of a manually-typed amount. */
export function calculateSettlements(balances: Balance[]): Settlement[] {
	const EPSILON = 0.01 // ignore rounding dust under a cent

	const debtors = balances
		.filter((b) => b.balance < -EPSILON)
		.map((b) => ({ name: b.name, amount: Math.abs(b.balance) }))
	const creditors = balances
		.filter((b) => b.balance > EPSILON)
		.map((b) => ({ name: b.name, amount: b.balance }))

	const settlements: Settlement[] = []
	let i = 0
	let j = 0

	while (i < debtors.length && j < creditors.length) {
		const settleAmount = Math.min(debtors[i].amount, creditors[j].amount)

		settlements.push({ from: debtors[i].name, to: creditors[j].name, amount: settleAmount })

		debtors[i].amount -= settleAmount
		creditors[j].amount -= settleAmount

		if (debtors[i].amount <= EPSILON) i++
		if (creditors[j].amount <= EPSILON) j++
	}

	return settlements
}
