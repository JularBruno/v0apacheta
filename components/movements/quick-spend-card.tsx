"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
	X,
	ArrowLeftRight,
	ArrowRight,
	ChevronLeft,
	ChevronRight,
	Lock,
	Wallet,
	PiggyBank,
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
import { formatDateInputLocal, getCurrentDateTimeInfo } from "@/lib/dateUtils";
import QuickSpendSkeleton from "./quick-spend-skeleton";
import { Loading } from "@/components/ui/loading"
import { BalanceInput } from "../balance-input/balance-input-form";
import { useDashboard } from "@/app/dashboard/dashboardContext";
import { useToast } from '@/hooks/use-toast';

import { useDeleteCategory } from "@/lib/hooks/use-delete-category";
import { useTags } from "@/lib/hooks/use-tags";
import { useCreateMovement } from "@/lib/hooks/use-create-movements";
import { useFinancialElements } from "@/lib/hooks/use-financial-elements";
import { useCurrencies } from "@/lib/hooks/use-currencies";
import { useCreateTransfer } from "@/lib/hooks/use-create-transfer";
import { TransferSideType, type TransferSide } from "@/lib/schemas/transfer";
import { useProfile } from "@/lib/hooks/use-profile";

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
	initialValues,
}: {
	onAdd: (data: Movement) => void
	initialType?: TxType
	financialElementId?: string,
	onCancel?: () => void
	/**
	 * Prefills the form — used by bulk-load to seed a movement parsed from AI JSON.
	 * Only applied once, at mount (useState initializers / react-hook-form defaultValues
	 * aren't reactive), so the caller must remount via a changing `key` prop to move to
	 * the next item. Category is intentionally not prefillable here: a bank's own
	 * category tag doesn't map reliably onto the user's categories, so it stays a manual pick.
	 */
	initialValues?: {
		type?: TxType
		amount?: number
		tagName?: string
		/** ISO datetime for the movement's real date — enables "elegir fecha" and seeds it. */
		date?: string
	}
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
	const [type, setType] = useState<TxType>(initialValues?.type || initialType || TxType.EXPENSE)

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

		deleteCategory({ id: catId, type: cat.type }, {
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
	 * When initialValues.date is given (e.g. bulk-load), start with that date already
	 * chosen and visible — these are historical movements, "now" would be wrong.
	 */
	const initialDate = initialValues?.date ? new Date(initialValues.date) : undefined
	const [showDateTime, setShowDateTime] = useState(!!initialDate);

	const [customDate, setCustomDate] = useState(initialDate ? formatDateInputLocal(initialDate) : getCurrentDateTimeInfo().dateInput);
	const [customTime, setCustomTime] = useState(initialDate ? initialDate.toTimeString().slice(0, 5) : getCurrentDateTimeInfo().timeInput)

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
			tagName: initialValues?.tagName || '',
			amount: initialValues?.amount,
			description: ''
		}
	});

	// FOLLOWING STEPS of the form for user experience
	const watchedAmount = watch('amount');
	const [descriptionDone, setDescriptionDone] = useState(!!initialValues?.tagName);
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
	const selectTag = (id?: string) => { // whevn removing the optional id, TS yells at calling without param, IT SHOULD be okey since makes sense when creating new tag after submit
		const t = allTags.find((tg) => tg.id === id)
		if (!t) return

		setTagId(t.id)
		setDescriptionDone(true);
		// A tag's own amount is just a convenient guess for manual entry (e.g. "Café" -> $500).
		// When we already know the real amount (bulk-load from a bank movement), keep it —
		// the tag is only being used here to categorize/describe, not to reprice the movement.
		if (initialValues?.amount === undefined) {
			setValue('amount', t.amount || 0);
		}
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
	 * TRANSFER (visual placeholder only — no backend endpoint yet)
	 * Third option alongside Gasto/Ingreso: move money between the current
	 * context (this asset, or the main balance) and another asset.
	 *
	 */
	const [isTransferMode, setIsTransferMode] = useState(false)
	const [transferDestId, setTransferDestId] = useState<string>("")
	const [transferAmount, setTransferAmount] = useState("")
	// amountTo: linked to transferAmount (same numeric value, 1:1) until the user edits it
	// directly — once touched, it holds whatever the real converted amount actually was.
	const [transferAmountTo, setTransferAmountTo] = useState("")
	const [transferAmountToTouched, setTransferAmountToTouched] = useState(false)
	const transferScrollRef = useRef<HTMLDivElement>(null)

	const { data: financialElementsData } = useFinancialElements();
	const { data: currencies } = useCurrencies();
	const { data: profile } = useProfile();
	const createTransfer = useCreateTransfer();

	// Transferencia only makes sense once there's at least one asset to move
	// money to/from — hide the tab entirely until then (tutorial-friendly).
	const hasAssets = (financialElementsData?.elements.length ?? 0) > 0;

	const symbolFor = (code?: string) =>
		currencies?.find((c) => c.currency === code)?.symbol ?? code ?? '';

	// The "balance" side isn't a financial element — it's the user's own balance,
	// which lives on the profile and is already denominated in preferredCurrency
	// (so its rate against itself is always 1).
	const balanceAccount = useMemo(() => ({
		id: 'balance',
		name: 'Balance principal',
		currency: profile?.preferredCurrency || 'ARS',
		conversionRate: 1,
	}), [profile?.preferredCurrency]);

	// The origin is whatever context this card was opened from: a specific asset
	// (financialElementId) or the main balance when there isn't one.
	const transferOrigin = useMemo(() => {
		const asset = financialElementsData?.elements.find((a) => a.id === financialElementId);
		return asset
			? { id: asset.id, name: asset.name, currency: asset.currency, conversionRate: asset.conversionRate }
			: balanceAccount;
	}, [financialElementsData, financialElementId, balanceAccount]);

	// Destinations: every other asset, plus "back to balance" when the origin is an asset
	const transferDestinations = useMemo(() => {
		const assetOptions = (financialElementsData?.elements ?? [])
			.filter((a) => a.id !== transferOrigin.id)
			.map((a) => ({ id: a.id, name: a.name, currency: a.currency, conversionRate: a.conversionRate }));
		return transferOrigin.id === balanceAccount.id
			? assetOptions
			: [balanceAccount, ...assetOptions];
	}, [financialElementsData, transferOrigin, balanceAccount]);

	useEffect(() => {
		if (!transferDestId && transferDestinations.length > 0) {
			setTransferDestId(transferDestinations[0].id);
		}
	}, [transferDestinations, transferDestId]);

	const transferDest = transferDestinations.find((d) => d.id === transferDestId);
	const isCrossCurrency = !!transferDest && transferDest.currency !== transferOrigin.currency;

	// Derives "to" from "from" using each side's conversionRate (both rates convert to
	// the user's preferredCurrency, so bridging through it gives the destination-currency
	// amount). Recomputes live on every relevant change, but only while untouched — once
	// the user edits amountTo directly, this stops auto-syncing so their real converted
	// amount isn't clobbered.
	useEffect(() => {
		if (transferAmountToTouched || !transferAmount || !transferDest) return;

		const amountFrom = Number.parseFloat(transferAmount);
		if (!amountFrom) return;

		const originRate = transferOrigin.conversionRate ?? 1;
		const destRate = transferDest.conversionRate ?? 1;
		const amountInPreferredCurrency = amountFrom * originRate;
		const amountTo = amountInPreferredCurrency / destRate;

		setTransferAmountTo(amountTo.toFixed(2));
	}, [transferAmount, transferOrigin, transferDest, transferAmountToTouched]);

	const scrollTransferBy = (dir: number) => {
		transferScrollRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' });
	}

	// Translates the UI's { id, name, currency } account shape (id: 'balance' is our
	// own sentinel, not a backend concept) into the TransferSideDto the API expects.
	const toTransferSide = (account: { id: string }): TransferSide =>
		account.id === balanceAccount.id
			? { type: TransferSideType.BALANCE }
			: { type: TransferSideType.ASSET, financialElementId: account.id };

	const handleTransferSubmit = async () => {
		const amountFrom = Number.parseFloat(transferAmount);
		const amountTo = Number.parseFloat(transferAmountTo);
		if (!transferDest || !amountFrom || amountFrom <= 0) return;
		if (isCrossCurrency && (!amountTo || amountTo <= 0)) return;

		try {
			await createTransfer.mutateAsync({
				from: toTransferSide(transferOrigin),
				to: toTransferSide(transferDest),
				amountFrom,
				amountTo: isCrossCurrency ? amountTo : undefined,
			});

			toast({ title: 'Transferencia realizada', variant: 'success' });
			setTransferAmount("");
			setTransferAmountTo("");
			setTransferAmountToTouched(false);
		} catch (error: any) {
			console.error('Transfer submit error:', error);
			toast({
				title: 'Error',
				description: error?.response?.message || error?.message || 'No se pudo realizar la transferencia',
				variant: 'destructive',
			});
		}
	}

	// If assets disappear while the tab is active (e.g. the last one gets deleted), fall back
	useEffect(() => {
		if (isTransferMode && !hasAssets) setIsTransferMode(false);
	}, [isTransferMode, hasAssets]);

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
					<div className={cn("grid gap-2", hasAssets ? "grid-cols-3" : "grid-cols-2")} role="tablist" aria-label="Tipo de transacción">
						<button
							role="tab"
							data-testid="quickspendcard-expense"
							type="button"
							aria-selected={!isTransferMode && type === TxType.EXPENSE}
							onClick={() => { setIsTransferMode(false); switchType(TxType.EXPENSE); }}
							className={cn(
								"py-3 px-2 rounded-lg text-sm font-semibold transition-all border-2 md:py-4 md:px-6 md:text-lg",
								!isTransferMode && type === TxType.EXPENSE
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
							aria-selected={!isTransferMode && type === TxType.INCOME}
							onClick={() => { setIsTransferMode(false); switchType(TxType.INCOME); }}
							className={cn(
								"py-3 px-2 rounded-lg text-sm font-semibold transition-all border-2 md:py-4 md:px-6 md:text-lg",
								!isTransferMode && type === TxType.INCOME
									? "bg-primary-100 border-primary-400 text-coffee-bean-800 shadow-md ring-2 ring-primary-200"
									: "bg-secondary border-border text-muted-foreground hover:bg-muted",
							)}
						>
							<span className="block sm:inline">💰</span> Ingreso
						</button>
						{hasAssets && (
							<button
								role="tab"
								type="button"
								data-testid="quickspendcard-transfer"
								aria-selected={isTransferMode}
								onClick={() => setIsTransferMode(true)}
								className={cn(
									"flex items-center justify-center gap-1.5 py-3 px-2 rounded-lg text-sm font-semibold transition-all border-2 md:py-4 md:px-6 md:text-lg",
									isTransferMode
										? "bg-blue-50 border-blue-400 text-blue-900 shadow-md ring-2 ring-blue-200"
										: "bg-secondary border-border text-muted-foreground hover:bg-muted",
								)}
							>
								<ArrowLeftRight className="h-4 w-4" />
								<span className="hidden sm:inline">Transferencia</span>
							</button>
						)}
					</div>

					{isTransferMode && hasAssets ? (
						/**
						 * Transfer — visual placeholder. Origin is whatever context this card
						 * was opened from (this asset, or the main balance); only the
						 * destination and amount are selectable. Not wired to a backend yet.
						 */
						<div className="space-y-5 mt-4">
							{/* Origin (fixed) -> Destination flow */}
							<div className="flex items-stretch gap-2">
								<div className="flex-1">
									<Label className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground">
										<Lock className="h-3 w-3" /> Desde
									</Label>
									<div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
										<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-500">
											<Wallet className="h-4 w-4 text-white" />
										</span>
										<div className="min-w-0">
											<p className="truncate text-sm font-medium">{transferOrigin.name}</p>
											<p className="text-xs text-gray-500">{transferOrigin.currency}</p>
										</div>
									</div>
								</div>

								<div className="flex items-end pb-3">
									<ArrowRight className="h-5 w-5 text-gray-400" />
								</div>

								<div className="flex-1">
									<Label className="mb-1.5 block text-xs text-muted-foreground">Hacia</Label>
									{transferDest ? (
										<div className="flex items-center gap-2 rounded-lg border-2 border-blue-500 bg-blue-50 p-3">
											<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-violet-500">
												<PiggyBank className="h-4 w-4 text-white" />
											</span>
											<div className="min-w-0">
												<p className="truncate text-sm font-medium text-blue-900">{transferDest.name}</p>
												<p className="text-xs text-blue-700/70">{transferDest.currency}</p>
											</div>
										</div>
									) : (
										<div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-xs text-muted-foreground">
											No hay destinos disponibles todavía
										</div>
									)}
								</div>
							</div>

							{/* Destination selector */}
							{transferDestinations.length > 0 && (
								<div className="space-y-2">
									<Label className="text-sm text-muted-foreground">Elegí el destino</Label>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => scrollTransferBy(-1)}
											className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
											aria-label="Anterior"
										>
											<ChevronLeft className="h-4 w-4" />
										</button>
										<div
											ref={transferScrollRef}
											className="flex flex-1 snap-x gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
										>
											{transferDestinations.map((a) => {
												const active = a.id === transferDestId
												return (
													<button
														key={a.id}
														type="button"
														onClick={() => setTransferDestId(a.id)}
														className={cn(
															"flex min-w-[130px] snap-start items-center gap-2 rounded-lg border p-3 text-left transition-all",
															active
																? "border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200"
																: "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
														)}
													>
														<span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", a.id === "balance" ? "bg-blue-500" : "bg-violet-500")}>
															{a.id === "balance" ? <Wallet className="h-4 w-4 text-white" /> : <PiggyBank className="h-4 w-4 text-white" />}
														</span>
														<div className="min-w-0">
															<p className={cn("truncate text-sm font-medium", active ? "text-blue-900" : "text-gray-700")}>
																{a.name}
															</p>
															<p className="text-xs text-gray-500">{a.currency}</p>
														</div>
													</button>
												)
											})}
										</div>
										<button
											type="button"
											onClick={() => scrollTransferBy(1)}
											className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
											aria-label="Siguiente"
										>
											<ChevronRight className="h-4 w-4" />
										</button>
									</div>
								</div>
							)}

							{/* Amount */}
							<div className="space-y-2">
								<Label htmlFor="transfer-amount" className="text-sm text-muted-foreground">
									{isCrossCurrency ? "Envías" : "Monto"}
								</Label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 whitespace-nowrap pointer-events-none">
										{symbolFor(transferOrigin.currency)}
									</span>
									<Input
										id="transfer-amount"
										type="number"
										inputMode="decimal"
										placeholder="0"
										value={transferAmount}
										onChange={(e) => setTransferAmount(e.target.value)}
										disabled={createTransfer.isPending}
										className="pl-16 text-lg font-semibold"
									/>
								</div>
							</div>

							{/* Cross-currency: amountTo is required by the API, auto-derived from
							    amountFrom via each side's conversionRate, editable to override */}
							{isCrossCurrency && (
								<div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
									<div className="flex items-center gap-2 text-sm font-medium text-amber-800">
										<ArrowLeftRight className="h-4 w-4" />
										Cambio de moneda ({transferOrigin.currency} → {transferDest?.currency})
									</div>

									<div className="space-y-2">
										<Label htmlFor="transfer-amount-to" className="text-xs text-amber-800">
											Monto recibido en {transferDest?.currency}
										</Label>
										<div className="relative">
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-amber-700 whitespace-nowrap pointer-events-none">
												{symbolFor(transferDest?.currency)}
											</span>
											<Input
												id="transfer-amount-to"
												type="number"
												inputMode="decimal"
												placeholder="0"
												value={transferAmountTo}
												onChange={(e) => {
													setTransferAmountToTouched(true);
													setTransferAmountTo(e.target.value);
												}}
												disabled={createTransfer.isPending}
												className="pl-16 border-amber-300 bg-white"
											/>
										</div>
									</div>
								</div>
							)}

							{/* Summary line */}
							<div className="rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-600">
								{transferAmount && transferDest ? (
									<>
										Transferís{" "}
										<span className="font-semibold text-gray-900">
											{symbolFor(transferOrigin.currency)} {Number(transferAmount).toLocaleString("es-AR")}
										</span>{" "}
										de <span className="font-medium">{transferOrigin.name}</span> a{" "}
										<span className="font-medium">{transferDest.name}</span>
									</>
								) : (
									"Ingresá un monto para ver el resumen"
								)}
							</div>

							<Button
								type="button"
								onClick={handleTransferSubmit}
								disabled={
									!transferAmount
									|| !transferDest
									|| (isCrossCurrency && !transferAmountTo)
									|| createTransfer.isPending
								}
								className="w-full h-12 text-base font-semibold gap-1.5"
							>
								{createTransfer.isPending
									? <Loading />
									: (
										<>
											<ArrowLeftRight className="h-4 w-4" />
											Confirmar transferencia
										</>
									)}
							</Button>
						</div>
					) : (
						<>
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
						</>
					)}

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
