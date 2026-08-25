
"use client"

import type React from "react"
import { useState } from "react"
import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Category } from "@/lib/schemas/category";
import { Tag } from "@/lib/schemas/tag";

import {
	Settings,
	Plus,
	Calendar,
	Clock,
	ChevronUp,
	ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { formatToBalance } from "@/lib/quick-spend-constants"
import { formatDateInputForDisplay, getCurrentDateTimeInfo } from "@/lib/dateUtils"
import { MovementFormData } from "@/lib/schemas/movement";
import IconComponent from "./icon-component";
import { TxType } from "@/lib/schemas/definitions";
import { DayCalendar } from "@/components/ui/day-calendar";
import { TimePicker } from "@/components/ui/time-picker";


type CategoryHeaderProps = {
	setShowCreateCategory: (open: boolean) => void,
	setShowManageCategories: (open: boolean) => void,
}

export function CategoryHeaderDesktop({
	setShowManageCategories,
	setShowCreateCategory
}: CategoryHeaderProps) {
	return (
		<>
			<div className="hidden md:flex items-center justify-between py-4">
				<Label className="text-sm text-muted-foreground">Categorías</Label>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setShowCreateCategory(true)}
						className="flex items-center gap-1"
					>
						<Plus className="w-4 h-4" />
						Nueva categoría
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setShowManageCategories(true)}
						className="flex items-center gap-1"
					>
						<Settings className="w-4 h-4" />
						Gestionar
					</Button>
				</div>
			</div>
		</>
	)
}

export function CategoryHeaderMobile({
	setShowManageCategories,
	setShowCreateCategory
}: CategoryHeaderProps) {
	return (
		<>
			<div className="md:hidden flex items-center justify-between py-4">
				<Label className="text-sm text-muted-foreground">Categorías</Label>
				<div className="flex items-center gap-1">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setShowCreateCategory(true)}
						className="flex items-center gap-1 text-xs px-2 py-1"
					>
						<Plus className="w-3 h-3" />
						Nueva categoría
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setShowManageCategories(true)}
						className="flex items-center gap-1 text-xs px-2 py-1"
					>
						<Settings className="w-3 h-3" />
						Gestionar
					</Button>
				</div>
			</div>
		</>
	)
}

type CategoryGridProps = {
	items: Category[],
	categoryId: string,
	setCategory: (id: string) => void,
	loading: boolean
}

export function CategoryGrid({
	items,
	categoryId,
	setCategory,
	loading
}: CategoryGridProps
) {
	return (
		<>
			<div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
				{items.map((category) => {
					const active = categoryId === category.id
					return (
						<button
							type="button"
							key={category.id}
							onClick={() => setCategory(category.id)}
							className={cn(
								"p-3 rounded-lg border flex items-center gap-2 transition-all text-left min-w-0",
								active
									? "border-primary-400 bg-primary-50 ring-2 ring-primary-200 shadow-md"
									: "border-border hover:bg-muted hover:border-ash-grey-400 hover:shadow-sm",
							)}
							disabled={loading}
						>
							<span className={cn("w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", category.color)}>
								<IconComponent icon={category.icon} className="w-4 h-4 text-white" />
							</span>
							<span className={cn("text-sm font-medium truncate", active ? "text-coffee-bean-800" : "text-foreground")}>
								{category.name}
							</span>
						</button>
					)
				})}
			</div>
		</>
	)
}

type TagRowProps = {
	tagInput: string,
	setTagInput: (name: string) => void,
	tagId: string | undefined,
	setTagId: (id: string) => void,
	categoryType: TxType, // this was just for hiding the tag amount on income pills
	matchingSuggestions: Tag[],
	matchingSuggestionsMobile: Tag[],
	selectTag: (id?: string) => void,
	tagNameError?: string,
	onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void,
	mobileTagsExpanded: boolean,
	setMobileTagsExpanded: (expanded: boolean) => void,
	register: UseFormRegister<MovementFormData>,
	loading: boolean
}

export function TagRow({
	setTagInput,
	tagId,
	setTagId,
	categoryType,
	matchingSuggestions,
	matchingSuggestionsMobile,
	selectTag,
	tagNameError,
	onInputKeyDown,
	mobileTagsExpanded,
	setMobileTagsExpanded,
	register,
	loading
}: TagRowProps
) {
	// const tagInputRef = useRef<HTMLInputElement>(null)

	const listId = "tag-suggestions"
	return (
		<>
			<div className="space-y-2 py-4">
				<Label htmlFor="descripcion" className="text-sm text-muted-foreground">Descripción</Label>
				<p id="tag-hint" className="sr-only">
					Escribe una descripción, o selecciona un movimiento previo
				</p>
				<div className=" gap-2">
					<Input
						role="combobox"
						id="descripcion"
						// aria-autocomplete="list"
						data-testid="description-input"
						aria-controls={listId}
						aria-describedby="tag-hint"
						placeholder="Escribe una descripción, o selecciona un movimiento previo"
						{...register('tagName', {
							onChange: (e) => {
								setTagInput(e.target.value);
								setTagId("");
							}
						})}
						onKeyDown={(e) => onInputKeyDown(e)}
						autoCapitalize="sentences"
						autoCorrect="off"
						autoComplete="off"
						spellCheck={false}
						enterKeyHint="next"
						className="flex-1"

					/>
					{tagNameError && (
						<p data-testid="tag-name-error" className="text-red-500 text-sm mt-1">{tagNameError}</p>
					)}
				</div>

				{/* Desktop suggestions with "Nuevo" pill */}
				<div id={listId} role="listbox" className="hidden md:flex md:flex-wrap gap-2">
					<button
						type="button"
						className="px-3 py-1.5 rounded-full border text-sm border-primary-400 bg-primary-50 text-coffee-bean-800 hover:bg-primary-100 transition-colors"
						aria-label="Crear nuevo tag"
						role="option"
						aria-selected={tagId === ""}
						disabled={loading}
					>
						Nuevo
					</button>
					{matchingSuggestions.map((t) => (
						<button
							key={t.id}
							role="option"
							type="button"
							aria-selected={t.id === tagId}
							onClick={() => selectTag(t.id)}
							className={cn(
								"px-3 py-1.5 rounded-full border text-sm transition-all",
								t.id === tagId
									? "border-primary-400 bg-primary-50 text-coffee-bean-800 ring-2 ring-primary-200 shadow-md"
									: "border-border hover:bg-muted hover:border-ash-grey-400 hover:shadow-sm text-foreground",
							)}
							disabled={loading}
						>
							{t.name}
							<span className="text-xs text-muted-foreground ml-1" hidden={categoryType == TxType.INCOME}>{formatToBalance(t.amount)}</span>
							{/* {t.category.type === "whatever" && (
							<span className="text-xs text-gray-500 ml-1">
								{formatToBalance(t.amount)}
							</span>
							)} */}
						</button>
					))}
				</div>

				{/* Mobile suggestions with "Nuevo" pill */}
				<div role="listbox" className="md:hidden">
					<div className="flex flex-col sm:flex-row gap-2 pb-2">
						<button
							type="button"
							className={cn(
								"shrink-0 px-3 py-1.5 rounded-full border text-sm transition-all whitespace-nowrap",
								tagId === ""
									? "border-primary-400 bg-primary-50 text-coffee-bean-800 ring-2 ring-primary-200 shadow-md"
									: "border-border hover:bg-muted hover:border-ash-grey-400 hover:shadow-sm text-foreground",
							)}
							aria-label="Crear nuevo tag"
							role="option"
							aria-selected={tagId === ""}
						>
							Nuevo +
						</button>
						{
							matchingSuggestionsMobile.map((t) => (
								<button
									key={t.id}
									role="option"
									type="button"
									aria-selected={t.id === tagId}
									onClick={() => selectTag(t.id)}
									className={cn(
										"shrink-0 px-3 py-1.5 rounded-full border text-sm transition-all whitespace-nowrap",
										t.id === tagId
											? "border-primary-400 bg-primary-50 text-coffee-bean-800 ring-2 ring-primary-200 shadow-md"
											: "border-border hover:bg-muted hover:border-ash-grey-400 hover:shadow-sm text-foreground",
									)}
								>
									{t.name} <span className="text-xs text-muted-foreground ml-1" hidden={categoryType == TxType.INCOME}>{formatToBalance(t.amount)}</span>
								</button>
							))}

						{matchingSuggestions.length > 4 && (
							<button
								type="button"
								onClick={() => setMobileTagsExpanded(!mobileTagsExpanded)}
								className="shrink-0 px-3 py-1.5 rounded-full border border-border bg-muted text-sm transition-all whitespace-nowrap flex items-center gap-1 text-muted-foreground hover:bg-secondary"
								aria-expanded={mobileTagsExpanded}
								aria-label={mobileTagsExpanded ? "Ver menos tags" : "Ver más tags"}
							>
								{mobileTagsExpanded ? (
									<>
										Menos <ChevronUp className="w-3 h-3" />
									</>
								) : (
									<>
										Más <ChevronDown className="w-3 h-3" />
									</>
								)}
							</button>
						)}
					</div>
				</div>
			</div>
		</>
	)
}


type DateTimeRowProps = {
	showDateTime: boolean,
	setShowDateTime: (showDateTime: boolean) => void,
	customDate: string,
	customTime: string
	setCustomDate: (customDate: string) => void,
	setCustomTime: (customTime: string) => void,
}

/* 
* Date time row for choosing specific createdAt time on movement
*/
export function DateTimeRow({
	showDateTime,
	setShowDateTime,
	customDate,
	customTime,
	setCustomDate,
	setCustomTime
}: DateTimeRowProps
) {
	// Each picker opens independently, from its own input's icon — closed by default
	// so opening "Fecha y hora" doesn't dump both a day grid and a time grid at once.
	const [showDatePicker, setShowDatePicker] = useState(false)
	const [showTimePicker, setShowTimePicker] = useState(false)

	return (
		<div className="space-y-2 pb-4" >
			<button
				type="button"
				onClick={() => {
					const next = !showDateTime
					setShowDateTime(next)
					setCustomDate(customDate)
					setCustomTime(customTime)
					// Opening "Fecha y hora" surfaces both pickers right away — the per-input icons
					// still let you collapse just one afterwards.
					if (next) {
						setShowDatePicker(true)
						setShowTimePicker(true)
					}
				}}
				className={cn(
					"flex items-center gap-2 text-sm rounded-md border px-3 py-2 transition-colors",
					showDateTime
						? "border-primary-300 bg-primary-50 text-coffee-bean-800"
						: "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
				)}
			>
				<Calendar className="w-4 h-4" />
				<span>Fecha y hora</span>
				{showDateTime ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}

				{(customDate !== getCurrentDateTimeInfo().dateInput || customTime !== getCurrentDateTimeInfo().timeInput) && (
					<span className="text-xs text-primary ml-1">

						({new Date(`${customDate}T${customTime}`).toLocaleDateString("es-AR")})

					</span>
				)}
			</button>
			{showDateTime && (
				<div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
					<div className="flex gap-2">
						{/* Not a native <input type="date"> on purpose: its displayed text is drawn by the
						    browser using the OS/browser locale, which we can't override (Chrome/Safari
						    ignore the page's lang here) — it was showing mm/dd/yyyy. This button fully
						    controls its own text via formatDateInputForDisplay, so it's always dd/mm/yyyy. */}
						<button
							type="button"
							onClick={() => setShowDatePicker((v) => !v)}
							className="flex h-10 flex-1 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
						>
							<span className={cn(!customDate && "text-muted-foreground")}>
								{customDate ? formatDateInputForDisplay(customDate) : "Elegir fecha"}
							</span>
							<Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
						</button>
						<div className="relative w-28 shrink-0">
							<Input
								type="time"
								value={customTime}
								onChange={(e) => setCustomTime(e.target.value)}
								className="pr-8 [&::-webkit-calendar-picker-indicator]:opacity-0"
							/>
							<button
								type="button"
								onClick={() => setShowTimePicker((v) => !v)}
								className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								aria-label="Elegir hora"
							>
								<Clock className="w-4 h-4" />
							</button>
						</div>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => {
							setCustomDate(getCurrentDateTimeInfo().dateInput)
							setCustomTime(getCurrentDateTimeInfo().timeInput)
						}}
						className="text-xs"
					>
						Ahora
					</Button>

					{/* Mobile: single column, stacked (TimePicker above DayCalendar since it's listed first).
					    Desktop (sm:): a 12-col grid, TimePicker taking 4 and DayCalendar the remaining 8 —
					    side by side, each actually filling its share instead of splitting evenly. */}
					{(showTimePicker || showDatePicker) && (
						<div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
							{showTimePicker && <TimePicker value={customTime} onSelect={setCustomTime} className="sm:col-span-4" />}
							{showDatePicker && <DayCalendar value={customDate} onSelect={setCustomDate} className="sm:col-span-8" />}
						</div>
					)}
				</div>
			)}
		</div>
	)
}