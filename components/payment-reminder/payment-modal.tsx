"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QuickSpendCard from "@/components/transactions/quick-spend-card"
import { TxType } from "@/lib/schemas/definitions"
import { useEffect, useState } from "react"
import { Category } from "@/lib/schemas/category"
import { getCategoriesByUser } from "@/lib/actions/categories"
import { Tags } from "@/lib/schemas/tag"
import { getTagsByUser } from "@/lib/actions/tags"

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
	const handleAdd = () => {
		onOpenChange(false)
	}


	/**
	 * 
	 * Categories
	 * 
	 */

	// Categories state (allows creation, setsnewone after created)
	const [cats, setCats] = useState<Category[]>([]);

	/**
	 * Fetch Categories
	 * TODO Validate if this should be on parent component
	 * This is the "lift state up" pattern. If it gets too deep (prop drilling), use Context.
	 */
	useEffect(() => {
		const fetchData = async () => {
			try {
				const cats = await getCategoriesByUser();
				setCats(cats);
			}
			catch (err: any) {
				// console.error('Failed to fetch categories:', err);
				return err;
				setCats([]);
			}
		};

		fetchData();
	}, []);

	/**
	 * 
	 * Tags
	 * 
	 */

	// Tags (global suggestions; not filtered by category initially)
	const [allTags, setAllTags] = useState<Tags[]>([])
	// Set this to false when tags loaded so skeleton of quickspendcard disappears
	const [loadingQuickSpendCard, setLoadingQuickSpendCard] = useState<boolean>(true);

	/**
	 * Fetch Tags
	 */
	const fetchTags = async () => {
		try {
			const allTags = await getTagsByUser();

			const sortedTags = allTags.sort(
				(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			);

			setAllTags(sortedTags);
			setLoadingQuickSpendCard(false);
		} catch (error) {
			// console.error('Failed to fetch tags:', error);
			return error;
		}
	};

	// Initial fetch of tags
	useEffect(() => {
		fetchTags();
	}, []);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Realizar Pago: {payment?.name}</DialogTitle>
				</DialogHeader>
				{payment && (
					<QuickSpendCard
						onAdd={handleAdd}
						onCancel={() => onOpenChange(false)}
						cats={cats}
						setCats={setCats}
						allTags={allTags}
						setAllTags={setAllTags}
						loading={false}
					/>
				)}
			</DialogContent>
		</Dialog>
	)
}
