
"use client"

import type React from "react"
import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Category } from "@/lib/schemas/category";
import { Tag } from "@/lib/schemas/tag";

import {
	Settings,
	Plus,
	X,
	Calendar,
	ChevronUp,
	ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { formatToBalance, iconComponents } from "@/lib/quick-spend-constants"
import { getCurrentDateTimeInfo } from "@/lib/dateUtils"
import { Movement, movementSchema, MovementFormData } from "@/lib/schemas/movement";


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
				<Label className="text-sm text-gray-600">Categorías</Label>
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
				<Label className="text-sm text-gray-600">Categorías</Label>
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
	setCategory: (id: string) => void
}

export function CategoryGrid({
	items,
	categoryId,
	setCategory
}: CategoryGridProps
) {
	return (
		<>
			<div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
				{items.map((c) => {
					const Icon = iconComponents[c.icon as keyof typeof iconComponents]
					const active = categoryId === c.id
					return (
						<button
							type="button"
							key={c.id}
							onClick={() => setCategory(c.id)}
							className={cn(
								"p-3 rounded-lg border flex items-center gap-2 transition-all text-left min-w-0",
								active
									? "border-blue-600 bg-blue-50 ring-2 ring-blue-200 shadow-md"
									: "border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm",
							)}
						>
							<span className={cn("w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", c.color)}>
								<Icon className="w-4 h-4 text-white" />
							</span>
							<span className={cn("text-sm font-medium truncate", active ? "text-blue-900" : "text-gray-700")}>
								{c.name}
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
	matchingSuggestions: Tag[],
	matchingSuggestionsMobile: Tag[],
	selectTag: (id?: string) => void,
	tagNameError?: string,
	onInputKeyDown?: () => void,
	register: UseFormRegister<MovementFormData>
}

export function TagRow({
	setTagInput,
	tagId,
	setTagId,
	matchingSuggestions,
	matchingSuggestionsMobile,
	selectTag,
	tagNameError,
	onInputKeyDown,
	register
}: TagRowProps
) {
	// const tagInputRef = useRef<HTMLInputElement>(null)

	const listId = "tag-suggestions"
	return (
		<>
			<div className="space-y-2 py-4">
				<Label className="text-sm text-gray-600 ">Descripción</Label>
				<p id="tag-hint" className="sr-only">
					Escribe una descripción, o selecciona un movimiento previo
				</p>
				<div className=" gap-2">
					<Input
						role="combobox"
						aria-autocomplete="list"
						aria-controls={listId}
						aria-describedby="tag-hint"
						placeholder="Escribe una descripción, o selecciona un movimiento previo"
						{...register('tagName', {
							onChange: (e) => {
								setTagInput(e.target.value);
								setTagId("");
							}
						})}
						onKeyDown={onInputKeyDown}
						autoCapitalize="none"
						autoCorrect="off"
						autoComplete="off"
						enterKeyHint="done"
						className="flex-1"
					/>
					{tagNameError && (
						<p className="text-red-500 text-sm mt-1">{tagNameError}</p>
					)}
				</div>

				{/* Desktop suggestions with "Nuevo" pill */}
				<div id={listId} role="listbox" className="hidden md:flex md:flex-wrap gap-2">
					<button
						type="button"
						// onClick={clearToNew}
						className="px-3 py-1.5 rounded-full border text-sm border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
						aria-label="Crear nuevo tag"
						role="option"
						aria-selected={tagId === ""}
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
									? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200 shadow-md"
									: "border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm",
							)}
						>
							{t.name}
							<span className="text-xs text-gray-500 ml-1">{formatToBalance(t.amount)}</span>
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
									? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200 shadow-md"
									: "border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm",
							)}
							aria-label="Crear nuevo tag"
							role="option"
							aria-selected={tagId === ""}
						>
							Nuevo +
						</button>
						{matchingSuggestionsMobile.map((t) => (
							<button
								key={t.id}
								role="option"
								type="button"
								aria-selected={t.id === tagId}
								onClick={() => selectTag(t.id)}
								className={cn(
									"shrink-0 px-3 py-1.5 rounded-full border text-sm transition-all whitespace-nowrap",
									t.id === tagId
										? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200 shadow-md"
										: "border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm",
								)}
							>
								{t.name} <span className="text-xs text-gray-500 ml-1">${t.amount}</span>
							</button>
						))}
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
	return (
		<div className="space-y-2 pb-4" >
			<button
				type="button"
				onClick={() => { setShowDateTime(!showDateTime); setCustomDate(customDate); setCustomTime(customTime); }}
				className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
			>
				<Calendar className="w-4 h-4" />
				<span>Fecha y hora</span>
				{showDateTime ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}

				{(customDate !== getCurrentDateTimeInfo().dateInput || customTime !== getCurrentDateTimeInfo().timeInput) && (
					<span className="text-xs text-blue-600 ml-1">

						({new Date(`${customDate}T${customTime}`).toLocaleDateString("es-AR")})

					</span>
				)}
			</button>
			{showDateTime && (
				<div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
					<Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="flex-1" />
					<Input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} className="w-28" />
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
				</div>
			)}
		</div>
	)
}