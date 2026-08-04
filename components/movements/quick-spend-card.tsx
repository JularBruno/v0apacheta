"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
	X,
} from "lucide-react"

import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from "@/lib/utils"

import { Tags } from "@/lib/schemas/tag";
import { Movement, movementSchema, MovementFormData } from "@/lib/schemas/movement";
import { TxType } from "@/lib/schemas/definitions";
import { Category } from "@/lib/schemas/category";
import { postMovement } from "@/lib/actions/movements";

import { QuickSpendCategoryDialogs } from "./quick-spend-category-dialogs"
import { CategoryHeaderDesktop, CategoryHeaderMobile, CategoryGrid, TagRow, DateTimeRow } from "./quick-spend-ui-pieces"
import { getCurrentDateTimeInfo } from "@/lib/dateUtils";
import QuickSpendSkeleton from "./quick-spend-skeleton";
import { Loading } from "@/components/ui/loading"
import { BalanceInput } from "../balance-input/balance-input-form";
import { useDashboard } from "@/app/dashboard/dashboardContext";
import { useToast } from '@/hooks/use-toast';

import { useDeleteCategory } from "@/lib/hooks/use-delete-category";
import { useTags } from "@/lib/hooks/use-tags";
import { useCreateMovement } from "@/lib/hooks/use-create-movements";

/**
 * @title Quick Spend Card used in home and asset
 * @param onAdd Callback with the data of MOVEMENT when added
 * @param initialType Initial type to use when opening asset (gasto/ingreso) TODO
 * @param onCancel Callback on cancel used on asset (TODO is this required? it could be good to clean anyform on asset)
 * @returns
 */
export default function QuickSpendCard({
	onAdd,
	initialType,
	financialElementId,
	onCancel,
}: {
	onAdd: (data: Movement) => void
	initialType?: TxType
	financialElementId?: string,
	onCancel?: () => void
}) {
	const { toast } = useToast();

	const { mutate: deleteCategory } = useDeleteCategory();
	const createMovement = useCreateMovement();

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

	const { error, cats, allTags, loadingTags } = useDashboard();

	/**
	 *
	 * TYPE
	 *
	 */
	// type selection and useful for when opening modal with an already selected option
	// const [type, setType] = useState<TxType>(initialType || TxType.EXPENSE)
	const [type, setType] = useState<TxType>(initialType || TxType.EXPENSE)

	// Switch between "gasto" (expense) and "ingreso" (income) types
	// and make sure a valid category is selected for the new type
	const switchType = (next: TxType) => {
		if (next === type) return
		setType(next)

		// Clear the incoming type's category so nothing appears pre-selected
		if (next === TxType.EXPENSE) {
			setSelectedExpenseCat(null)
		} else {
			setSelectedIncomeCat(null)
		}

		// Clear tag and reset form fields on type change
		setTagId("")
		setTagInput("")
		setDescriptionDone(false)
		reset({
			type: next,
			tagId: undefined,
			tagName: '',
			amount: undefined,
			description: '',
		})
	}


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

	const categoryId =
		type === TxType.EXPENSE
			? selectedExpenseCat || ''
			: selectedIncomeCat || '';

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

		// If there was a tag id and you selected a new category reset form, just for ux
		if (tagId) {
			setTagId(""); // Clear this FIRST
			setTagInput("");
			setDescriptionDone(false);

			reset({
				type: type,
				tagId: undefined,
				tagName: '',
				amount: 0,
				description: ''
			});
		}

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

	// Manage Categories dialog state and handlers
	const [showManageCategories, setShowManageCategories] = useState(false)


	/* deletion of a category */
	const deleteCategoryConfirmation = async (catId: string) => {
		const cat = cats.find((c) => c.id === catId)
		if (!cat) return

		// Check if there are tags using this category
		const relatedTags = allTags.filter((t) => t.categoryId === catId)
		if (relatedTags.length > 0) {
			const confirmDelete = confirm( // TODO this should be a nicer component
				`Esta categoría tiene ${relatedTags.length} tag(s) asociado(s). ¿Estás seguro de que quieres eliminarla? Esto también eliminará todos los tags asociados.`,
			)
			if (!confirmDelete) return;
		}

		deleteCategory(catId, {
			onSuccess: () => {
				// Handle UI updates only
				console.log('success ', catId);

				if (categoryId === catId) {
					const remaining = cats.filter((c) => c.id !== catId && c.type === type);
					if (remaining.length > 0) {
						setSelectedExpenseCat(remaining[0].id);
					}
				}

				announce(`Categoría ${cat.name} eliminada`);
				toast({ title: 'Categoría eliminada', variant: 'success' });
			},
		});

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

	const [mobileTagsExpanded, setMobileTagsExpanded] = useState(false)


	const tagsByType = useMemo(() =>
		allTags.filter(t => cats.find(c => c.id === t.categoryId)?.type === type),
		[allTags, cats, type]
	);

	const tagsByTypeLastUsed = useMemo(() =>
		[...tagsByType].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
		[tagsByType]
	);

	// Match the amount of tag pills to diplay and filter by category id when selected
	const matchingSuggestions = useMemo(() => {
		const base = categoryId
			? tagsByTypeLastUsed.filter(t => t.categoryId === categoryId)
			: tagsByTypeLastUsed;
		return base.slice(0, 12);
	}, [tagsByTypeLastUsed, categoryId]);

	const matchingSuggestionsMobile = useMemo(() => {
		const sliceAmount = mobileTagsExpanded ? 12 : 4;
		const base = categoryId
			? tagsByTypeLastUsed.filter(t => t.categoryId === categoryId)
			: tagsByTypeLastUsed;
		return base.slice(0, sliceAmount);
	}, [tagsByTypeLastUsed, categoryId, mobileTagsExpanded]);

	/**
	 *
	 * MOVEMENT
	 *
	 */

	/**
	 * showDateTime component variables required to chose specific time on movement
	 */
	const [showDateTime, setShowDateTime] = useState(false);

	const [customDate, setCustomDate] = useState(getCurrentDateTimeInfo().dateInput);
	const [customTime, setCustomTime] = useState(getCurrentDateTimeInfo().timeInput)

	/** Form zod validator, values, handlers, errors and loading */
	const {
		control,
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		setValue,
		clearErrors,
		watch,
	} = useForm<MovementFormData>({
		resolver: zodResolver(movementSchema)
		,
		defaultValues: {
			type: type,
			categoryId: '',
			// tagId: '',
			tagName: '',
			amount: undefined,
			description: ''
		}
	});

	// watch('amount') subscribes to the field reactively — unlike getValues() which reads once,
	// this returns a new value on every keystroke so currentStep re-derives correctly via useMemo.
	const watchedAmount = watch('amount');

	// True once the user explicitly presses Enter/Done on the description input or selects a tag pill.
	// Advancing step 3→4 on every keystroke would immediately scroll away while typing.
	const [descriptionDone, setDescriptionDone] = useState(false);

	// Tracks which step the user is currently on based on form state.
	// Step 1 (type) is always complete — there's always a default.
	const currentStep = useMemo(() => {
		if (!categoryId) return 2;
		if (!(tagId || descriptionDone)) return 3;
		if (!watchedAmount) return 4;
		return 5;
	}, [categoryId, tagId, descriptionDone, watchedAmount]);

	// Refs for each section so we can scroll the active one into view on mobile.
	const categoryRef = useRef<HTMLDivElement>(null);
	const descriptionRef = useRef<HTMLDivElement>(null);
	const amountRef = useRef<HTMLDivElement>(null);
	const submitRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (typeof window === 'undefined' || window.innerWidth >= 768) return;
		const refMap: Record<number, React.RefObject<HTMLElement | null>> = {
			2: categoryRef,
			3: descriptionRef,
			4: amountRef,
			5: submitRef,
		};
		refMap[currentStep]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}, [currentStep]);

	// Helps to clear specific error when typing again
	function handleTagKeyDown(e: any) {
		if (e.key === 'Enter') {
			e.preventDefault();
			setDescriptionDone(true);
			setTimeout(() => {
				inputAmountRef.current?.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
				inputAmountRef.current?.focus();
			}, 100);
		} else {
			clearErrors("tagName");
		}
	}

	// reference to amount input! to be focused when required
	const inputAmountRef = useRef<HTMLInputElement>(null)

	// Selecting tag and its actions
	const selectTag = (id?: string) => { // when removing the optional id, TS yells at calling without param, IT SHOULD be okey since makes sense when creating new tag after submit
		const t = allTags.find((tg) => tg.id === id)
		if (!t) return

		setTagId(t.id)
		setDescriptionDone(true);
		setValue('amount', t.amount || 0); // Update form amount too
		setValue('tagName', t.name); // Update form amount too

		// inputAmountRef.current?.focus()
		// Mobile-friendly focus with scroll
		setTimeout(() => {
			inputAmountRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
			inputAmountRef.current?.focus();
		}, 100);

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
	 * Movement submit on invalid, used for debugging eact-hook-form + zod dead submit.
	 */
	const onInvalid = (errors: any) => {
		console.log('FORM INVALID', errors);
	};

	/**
	 * Movement submit
	 * @param data movementform data from schema, to be submited
	 */
	const onSubmitHandler = async (data: MovementFormData) => {
		if (!categoryId) return alert("Seleccioná una categoría.");

		const dateObj = new Date(`${customDate}T${customTime}`);
		const isoString = dateObj.toISOString();

		const movementData: Movement = {
			...data,
			userId: undefined,
			categoryId: categoryId,
			type: type,
			tagId: tagId ? tagId : undefined,
			description: data.tagName,
			createdAt: showDateTime ? isoString : undefined,
		};

		if (financialElementId) {
			movementData.financialElementId = financialElementId;
		}

		// Reset immediately so the form feels instant on mobile
		reset({ type: type, tagId: undefined, tagName: '', amount: undefined, description: '' });
		setTagInput("");
		setTagId("");
		setDescriptionDone(false);

		try {
			const movement = await createMovement.mutateAsync(movementData);
			onAdd(movement);
		} catch (error) {
			console.error('Submit error:', error);
		}
	};


	/**
	 *
	 * ADD TRANSACTION
	 *
	 */
	if (loadingTags) {
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
				<form onSubmit={handleSubmit(onSubmitHandler, onInvalid)}>

					{/* A11y live region */}
					<div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true"></div>

					{/* Type selector - Big buttons */}
					<div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Tipo de transacción">
						<button
							role="tab"
							data-testid="quickspendcard-expense"
							type="button"
							aria-selected={type === TxType.EXPENSE}
							onClick={() => switchType(TxType.EXPENSE)}
							className={cn(
								"py-3 px-4 rounded-lg text-base font-semibold transition-all border-2 md:py-4 md:px-6 md:text-lg",
								type === TxType.EXPENSE
									? "bg-burnt-peach-100 border-burnt-peach-400 text-coffee-bean-800 shadow-md ring-2 ring-burnt-peach-200"
									: "bg-secondary border-border text-muted-foreground hover:bg-muted",
							)}
						>
							<span className="block sm:inline">💸</span> Gasto
						</button>
						<button
							role="tab"
							type="button"
							data-testid="quickspendcard-income"
							aria-selected={type === TxType.INCOME}
							onClick={() => switchType(TxType.INCOME)}
							className={cn(
								"py-3 px-4 rounded-lg text-base font-semibold transition-all border-2 md:py-4 md:px-6 md:text-lg",
								type === TxType.INCOME
									? "bg-primary-100 border-primary-400 text-coffee-bean-800 shadow-md ring-2 ring-primary-200"
									: "bg-secondary border-border text-muted-foreground hover:bg-muted",
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
					<div
						ref={categoryRef}
						className={cn("rounded-lg transition-colors", currentStep === 2 && "md:bg-transparent md:ring-0 ring-1 ring-primary/30 bg-primary/5 px-2 pt-2 pb-2")}
					>
						<CategoryGrid
							items={shownCategories}
							categoryId={categoryId}
							setCategory={setCategory}
							loading={isSubmitting}
						/>
					</div>

					{/* Tags */}
					<div
						ref={descriptionRef}
						className={cn("rounded-lg transition-colors mt-1", currentStep === 3 && "md:bg-transparent md:ring-0 ring-1 ring-primary/30 bg-primary/5 px-2")}
					>
						<TagRow
							tagInput={tagInput}
							setTagInput={setTagInput}

							categoryType={type}

							tagId={tagId}
							setTagId={setTagId}

							matchingSuggestions={matchingSuggestions}
							matchingSuggestionsMobile={matchingSuggestionsMobile}

							selectTag={selectTag}
							tagNameError={errors.tagName?.message}
							onInputKeyDown={handleTagKeyDown}
							mobileTagsExpanded={mobileTagsExpanded}
							setMobileTagsExpanded={setMobileTagsExpanded}

							register={register}

							loading={isSubmitting}
						/>
					</div>

					{/* Amount */}
					<div
						ref={amountRef}
						className={cn("space-y-2 pb-4 rounded-lg transition-colors", currentStep === 4 && "md:bg-transparent md:ring-0 ring-1 ring-primary/30 bg-primary/5 px-2 pt-2")}
					>
						<Label htmlFor="amount" className="text-sm text-muted-foreground">Monto</Label>
						<div className="relative gap-2 ">
							<BalanceInput
								errors={errors}
								clearErrors={clearErrors}
								inputAmountRef={inputAmountRef}
								control={control}
							/>
						</div>
					</div>

					{/* DateTimeRow */}
					<DateTimeRow
						showDateTime={showDateTime}
						setShowDateTime={setShowDateTime}
						customDate={customDate}
						customTime={customTime}
						setCustomDate={setCustomDate}
						setCustomTime={setCustomTime}
					/>

					{/* submit button */}
					<Button
						ref={submitRef}
						data-testid="submit-button"
						type="submit"
						className="w-full h-12 text-base font-semibold transition-opacity"
						disabled={isSubmitting || !categoryId}
					>
						{isSubmitting
							? <Loading />
							: type === TxType.EXPENSE
								? "Gastar"
								: "Agregar"}
					</Button>

				</form>

			</CardContent>

			{/* Category Dialogs */}
			<QuickSpendCategoryDialogs
				// objects
				allTags={allTags}
				// handlers for popup
				showCreateCategory={showCreateCategory}
				setShowCreateCategory={setShowCreateCategory}
				showManageCategories={showManageCategories}
				setShowManageCategories={setShowManageCategories}

				// new form
				setNewCatType={setNewCatType}
				newCatType={newCatType}

				deleteCategory={deleteCategoryConfirmation}
			// onSubmit={categorySubmit}
			/>
		</Card>
	)
}
