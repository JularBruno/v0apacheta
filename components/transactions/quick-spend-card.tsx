"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
	X,
} from "lucide-react"

import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from "@/lib/utils"

import { Tag, Tags } from "@/lib/schemas/tag";
import { Movement, movementSchema, MovementFormData, Movements } from "@/lib/schemas/movement";
import { TxType } from "@/lib/schemas/definitions";
import { Category } from "@/lib/schemas/category";
import { getCategoriesByUser, deleteCategoryById } from "@/lib/actions/categories";
import { getTagsByUser } from "@/lib/actions/tags";
import { postMovement } from "@/lib/actions/movements";

import { QuickSpendCategoryDialogs } from "./quick-spend-category-dialogs"
import { CategoryHeaderDesktop, CategoryHeaderMobile, CategoryGrid, TagRow } from "./quick-spend-ui-pieces"
import QuickSpendSkeleton from "./quick-spend-skeleton";
import { Loading } from "@/components/ui/loading"

/**
 * @title Quick Spend Card used in home and asset
 * @param onAdd Callback with the data of MOVEMENT when added
 * @param initialType Initial type to use when opening asset (gasto/ingreso)
 * @param onCancel Callback on cancel used on asset (TODO is this required? it could be good to clean anyform on asset)
 * @returns 
 */
export default function QuickSpendCard({
	onAdd,
	initialType,
	onCancel,
	cats,
	setCats,
	allTags,
	setAllTags,
	loading
}: {
	onAdd: (data: Movement) => void
	initialType?: TxType
	onCancel?: () => void
	cats: Category[]
	setCats: React.Dispatch<React.SetStateAction<Category[]>>
	allTags: Tags[],
	setAllTags: React.Dispatch<React.SetStateAction<Tags[]>>
	loading: boolean
}) {

	/** By using an ARIA live region, you make your app accessible (A11y = accessibility). */
	// A11y live region
	const liveRegionRef = useRef<HTMLDivElement>(null)
	// screen readers (used by blind/visually impaired users) will read that message out loud, even though it's invisible on screen.
	const announce = (msg: string) => {
		if (!liveRegionRef.current) return
		liveRegionRef.current.textContent = msg
		setTimeout(() => {
			if (liveRegionRef.current) liveRegionRef.current.textContent = ""
		}, 800)
	}

	/**
	 * 
	 * TYPE
	 * 
	 */
	// type selection and useful for when opening modal with an already selected option
	const [type, setType] = useState<TxType>(initialType || TxType.EXPENSE)

	// Switch between "gasto" (expense) and "ingreso" (income) types
	// and make sure a valid category is selected for the new type
	const switchType = (next: TxType) => { // next: the type we're switching TO
		setType(next)// Update the transaction type
		// Get the first available category for the new type (or undefined if none exist)
		const first = next === TxType.EXPENSE ? expenseCats[0]?.id : incomeCats[0]?.id
		if (next === TxType.EXPENSE) {
			// For expenses: keep current selection, OR use first available, OR fallback to "comida"
			setSelectedExpenseCat((prev) => prev || first || "comida")
		} else {
			setSelectedIncomeCat((prev) => prev || first || "trabajo")
		}
	}

	/**
	 * 
	 * CATEGORY cats and card handlers
	 * 
	 */


	// fitlered cats

	const expenseCats = useMemo(
		() => cats?.filter((c) => c.type === TxType.EXPENSE) || [],
		[cats]
	);
	const incomeCats = useMemo(
		() => cats?.filter((c) => c.type === TxType.INCOME) || [],
		[cats]
	);

	const [selectedExpenseCat, setSelectedExpenseCat] = useState<string | null>(null);
	const [selectedIncomeCat, setSelectedIncomeCat] = useState<string | null>(null);

	// Initialize selected categories when cats are fetched
	useEffect(() => {
		if (expenseCats.length && !selectedExpenseCat)
			setSelectedExpenseCat(expenseCats[0].id);
		if (incomeCats.length && !selectedIncomeCat)
			setSelectedIncomeCat(incomeCats[0].id);
	}, [expenseCats, incomeCats]);

	// Selected category
	const categoryId = type === TxType.EXPENSE
		? selectedExpenseCat || expenseCats[0]?.id || ''
		: selectedIncomeCat || incomeCats[0]?.id || '';

	/**
	 * Set selected Category
	 * @param id 
	 */
	const setCategory = (id: string) => {
		const c = cats.find((x) => x.id === id)
		if (!c) return
		if (c.type === TxType.EXPENSE) {
			setSelectedExpenseCat(id)
			if (type !== TxType.EXPENSE) setType(TxType.EXPENSE)
		} else {
			setSelectedIncomeCat(id)
			if (type !== TxType.INCOME) setType(TxType.INCOME)
		}
		setValue('categoryId', id); // Update form category id, just in case, but it should be verified before submit with zod i think

		announce(`Categoría ${c.name} seleccionada`)
	}

	// Categories to display based on selected type
	const shownCategories = type === TxType.EXPENSE ? expenseCats : incomeCats

	/**
	 * 
	 * CATEGORY dialog handlers and functions
	 * 
	 */

	// Create Category dialog state and handlers
	const [showCreateCategory, setShowCreateCategory] = useState(false)
	const [newCatType, setNewCatType] = useState<TxType>(type)

	// After submiting a category in dialog, add it to state
	const categorySubmit = (cat: Category) => {
		setCats((prev: Category[]) => {
			// Remove duplicates by ID
			const filtered = prev.filter(filteredCat => filteredCat.id !== cat.id);
			return [...filtered, cat];
		});
	}

	// Manage Categories dialog state and handlers
	const [showManageCategories, setShowManageCategories] = useState(false)

	/* deletion */
	const deleteCategory = async (catId: string) => {
		const cat = cats.find((c) => c.id === catId)
		if (!cat) return

		// Check if there are tags using this category
		const relatedTags = allTags.filter((t) => t.categoryId === catId)
		if (relatedTags.length > 0) {
			const confirmDelete = confirm( // TODO this should be a nicer component
				`Esta categoría tiene ${relatedTags.length} tag(s) asociado(s). ¿Estás seguro de que quieres eliminarla? Esto también eliminará todos los tags asociados.`,
			)
			if (!confirmDelete) return

			// Remove related tags
			setAllTags((prev) => prev.filter((t) => t.categoryId !== catId))
		}

		await deleteCategoryById(cat.id); // DELETION

		setCats((prev) => prev.filter((c) => c.id !== catId))

		// Reset selection if deleted category was selected
		if (categoryId === catId) {
			const remaining = cats.filter((c) => c.id !== catId && c.type === type)
			if (remaining.length > 0) {
				if (type === TxType.EXPENSE) setSelectedExpenseCat(remaining[0].id)
				else setSelectedIncomeCat(remaining[0].id)
			}
		}

		announce(`Categoría ${cat.name} eliminada`)
	}

	/**
	 * 
	 * Tags
	 * 
	 */

	// Selected tag to be used in form
	const [tagId, setTagId] = useState<string | undefined>("")
	// Selected tag name to be used as selected reference
	const [tagInput, setTagInput] = useState<string>("")

	// Match the amount of tag pills to diplay
	const matchingSuggestions = useMemo(() => {
		return allTags.slice(0, 12)
	}, [allTags])

	const matchingSuggestionsMobile = useMemo(() => {
		return allTags.slice(0, 4)
	}, [allTags])

	/**
	 * 
	 * MOVEMENT
	 * 
	 */

	/** Form zod validator, values, handlers, errors and loading */
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		setValue,
		clearErrors
	} = useForm<MovementFormData>({
		resolver: zodResolver(movementSchema)
		,
		defaultValues: {
			type: type,
			categoryId: '',
			tagId: '',
			tagName: '',
			amount: undefined,
			description: ''
		}
	});

	const [movementLoading, setMovementLoading] = useState<boolean>(false);

	function handleTagKeyDown() {
		// clear specific error when typing again
		clearErrors("tagName");
	}

	// Selecting tag and its actions
	const selectTag = (id?: string) => { // when removing the optional id, TS yells at calling without param, IT SHOULD be okey since makes sense when creating new tag after submit
		const t = allTags.find((tg) => tg.id === id)
		if (!t) return
		setTagId(t.id)
		setValue('amount', t.amount || 0); // Update form amount too
		setValue('tagName', t.name); // Update form amount too

		// match category and type to tag
		const cat = cats.find((c) => c.id === t.categoryId)
		if (cat) {
			if (cat.type === TxType.EXPENSE) setSelectedExpenseCat(cat.id)
			else setSelectedIncomeCat(cat.id)
			setType(cat.type)
		}
		announce(`Tag ${t.name} seleccionado`)
	}

	/**
	 * Movement submit
	 * @param data movementform data from schema, to be submited
	 */
	const onSubmitHandler = async (data: MovementFormData) => {
		setMovementLoading(true);

		try {
			if (!categoryId) return alert("Seleccioná una categoría.")

			const movementData: Movement = {
				...data,
				userId: undefined, // will be set in post method
				categoryId: categoryId,
				type: type,
				tagId: tagId ? tagId : undefined,
				description: data.tagName,
			};

			const movement = await postMovement(movementData);

			let currentTag = allTags.find((t) => t.id === tagId)

			// Always update tag default amount to last used
			if (currentTag) {
				const updated = { ...currentTag, amount: data.amount }
				setAllTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
			}

			// AFTER SUBMITING reset form and states
			// reset form values
			reset({
				type: TxType.EXPENSE,
				// categoryId: TxType.EXPENSE : selectedExpenseCat ? selectedIncomeCat,
				tagId: undefined,
				tagName: '',
				amount: 0,
				description: ''
			});

			// reset local states
			setTagInput("");
			setTagId("");

			onAdd(movement); // CALL PARENT
			setMovementLoading(false);
		} catch (error) {
			console.error('Submit error:', error);
		}
	};

	/**
	 * 
	 * ADD TRANSACTION
	 * 
	 */
	if (loading) {
		return <QuickSpendSkeleton />;
	}
	return (

		<Card className="w-full max-w-none">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">Agregar transacción</CardTitle>
					{onCancel && (
						<Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4 p-4">
				<form onSubmit={handleSubmit(onSubmitHandler)}>

					{/* A11y live region */}
					<div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true"></div>

					{/* Type selector - Big buttons */}
					<div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Tipo de transacción">
						<button
							role="tab"
							type="button"
							aria-selected={type === TxType.EXPENSE}
							onClick={() => switchType(TxType.EXPENSE)}
							className={cn(
								"py-3 px-4 rounded-lg text-base font-semibold transition-all border-2 md:py-4 md:px-6 md:text-lg",
								type === TxType.EXPENSE
									? "bg-red-50 border-red-500 text-red-700 shadow-md ring-2 ring-red-200"
									: "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100",
							)}
						>
							<span className="block sm:inline">💸</span> Gasto
						</button>
						<button
							role="tab"
							type="button"
							aria-selected={type === TxType.INCOME}
							onClick={() => switchType(TxType.INCOME)}
							className={cn(
								"py-3 px-4 rounded-lg text-base font-semibold transition-all border-2 md:py-4 md:px-6 md:text-lg",
								type === TxType.INCOME
									? "bg-green-50 border-green-500 text-green-700 shadow-md ring-2 ring-green-200"
									: "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100",
							)}
						>
							<span className="block sm:inline">💰</span> Ingreso
						</button>
					</div>

					{/* Category: mobile header */}
					<CategoryHeaderMobile
						setShowCreateCategory={setShowCreateCategory}
						setShowManageCategories={setShowManageCategories}
					/>

					{/* Category: desktop header*/}
					<CategoryHeaderDesktop
						setShowCreateCategory={setShowCreateCategory}
						setShowManageCategories={setShowManageCategories}
					/>

					{/* Category: grid */}
					<CategoryGrid
						items={shownCategories}
						categoryId={categoryId}
						setCategory={setCategory}
					/>

					{/* Tags */}
					<TagRow
						tagInput={tagInput}
						setTagInput={setTagInput}

						tagId={tagId}
						setTagId={setTagId}

						matchingSuggestions={matchingSuggestions}
						matchingSuggestionsMobile={matchingSuggestionsMobile}

						selectTag={selectTag}
						// clearToNew={ clearToNew}
						// onTagInputKeyDown={ onTagInputKeyDown }
						tagNameError={errors.tagName?.message}
						onInputKeyDown={handleTagKeyDown}

						register={register}
					/>

					{/* Amount */}
					<div className="space-y-2 pb-4">
						<Label className="text-sm text-gray-600">Monto</Label>
						<div className="relative gap-2 ">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
							<Input
								type="number"
								id="amount"
								aria-label="Monto"
								inputMode="decimal"
								pattern="[0-9]*"
								enterKeyHint="done"
								// {...register('amount')}
								{...register('amount', { valueAsNumber: true })}

								className="pl-8 h-12 text-xl font-semibold md:text-2xl"
								placeholder="1000.00"
								onKeyDown={() => clearErrors("amount")}
							/>
						</div>
						{errors?.amount && ( // ← Show error message
							<p className="text-red-500 text-sm mt-1">{errors?.amount.message}</p>
						)}
					</div>

					<Button type="submit" className="w-full h-12 text-base font-semibold"
						disabled={movementLoading}
					>
						{movementLoading
							? <Loading></Loading>
							: type === TxType.EXPENSE
								? "Gastar"
								: "Agregar"}

						{/* {type === TxType.EXPENSE ? "Gastar" : "Agregar"} */}
					</Button>

				</form>

			</CardContent>

			{/* Category Dialogs */}
			<QuickSpendCategoryDialogs
				// objects
				cats={cats}
				allTags={allTags}
				// handlers for popup
				showCreateCategory={showCreateCategory}
				setShowCreateCategory={setShowCreateCategory}
				showManageCategories={showManageCategories}
				setShowManageCategories={setShowManageCategories}

				// new form
				setNewCatType={setNewCatType}
				newCatType={newCatType}

				deleteCategory={deleteCategory}
				onSubmit={categorySubmit}
			/>
		</Card>
	)
}
