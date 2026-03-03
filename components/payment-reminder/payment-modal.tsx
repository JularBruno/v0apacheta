"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QuickSpendCard from "@/components/transactions/quick-spend-card"
import { TxType } from "@/lib/schemas/definitions"
import { useEffect, useState } from "react"
import { Category } from "@/lib/schemas/category"
import { getCategoriesByUser } from "@/lib/actions/categories"
import { Tags } from "@/lib/schemas/tag"
import { getTagsByUser } from "@/lib/actions/tags"
import { useDashboard } from "@/app/dashboard/dashboardContext"

interface PaymentModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	payment?: {
		id: string
		name: string
		amount: number
		categoryId?: string
	}

}

export function PaymentModal({ open, onOpenChange, payment }: PaymentModalProps) {

	const { cats, setCats, user, loadingUser, error, allTags } = useDashboard();

	const handleAdd = () => {
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange} aria-describedby={undefined}>
			<DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>Realizar Pago: {payment?.name}</DialogTitle>
				</DialogHeader>
				{/* {payment && ( */}
				<QuickSpendCard
					onAdd={handleAdd}
					onCancel={() => onOpenChange(false)}
				/>
				{/* )} */}
			</DialogContent>
		</Dialog>
	)
}
