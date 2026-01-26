"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from 'react-hook-form';

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
	Edit,
	Trash2,
} from "lucide-react"

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from "@/lib/utils"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Category, categorySchema } from "@/lib/schemas/category";
import { postCategory, putCategory } from "@/lib/actions/categories";
import { Tag } from "@/lib/schemas/tag";
import { TxType } from "@/lib/schemas/definitions";

import { availableColors, availableIcons } from "../../lib/quick-spend-constants"
import IconComponent from "./icon-component";

type CategoryFormData = z.infer<typeof categorySchema>;

type Props = {
	cats: Category[],
	allTags: Tag[],
	showCreateCategory: boolean,
	setShowCreateCategory: (open: boolean) => void,
	newCatType: TxType.EXPENSE | TxType.INCOME,
	setNewCatType: (kind: TxType.EXPENSE | TxType.INCOME) => void,
	showManageCategories: boolean,
	setShowManageCategories: (open: boolean) => void,
	deleteCategory: (id: string) => void,
	//
	onSubmit: (data: Category) => void,
}

/**
 * Dialogs for creating and managing categories (used in QuickSpendCard component)
 * @param cats Categories array
 * @param allTags All tags array
 * @param showCreateCategory Boolean to control the visibility of the create category dialog
 * @param setShowCreateCategory Function to set the visibility of the create category dialog
 * @param newCatType Type of the new category (TxType.EXPENSE or TxType.INCOME)
 * @param setNewCatType Function to set the kind of the new category
 * @param showManageCategories Boolean to control the visibility of the manage categories dialog
 * @param setShowManageCategories Function to set the visibility of the manage categories dialog
 * @param deleteCategory Function to delete a category
 * @param onSubmit Function to handle the submission of a new or edited category
 */
export function QuickSpendCategoryDialogs({
	cats,
	allTags,
	showCreateCategory,
	setShowCreateCategory,
	newCatType,
	setNewCatType,
	showManageCategories,
	setShowManageCategories,
	deleteCategory,
	onSubmit,
}: Props) {

	// values to use in selectors and in the form
	const [newCatIconId, setNewCatIconId] = useState(availableIcons[0].id)
	const [newCatColorId, setNewCatColorId] = useState(availableColors[0].id)
	// editing category to extract values
	const [editingCategory, setEditingCategory] = useState<Category | null>(null)

	/** Form zod validator, values, handlers, errors and loading */
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<CategoryFormData>({
		resolver: zodResolver(categorySchema)
		,
		defaultValues: {
			name: '',
			color: newCatColorId,
			icon: newCatIconId,
			type: newCatType,
		}
	});

	/**
	 * Set the category to edit and update values on form
	 * @param cat category to edit and extract data from
	 */
	const startEditCategory = (cat: Category) => {

		reset({
			name: cat.name,
			color: cat.color,
			icon: cat.icon,
			type: cat.type, // Assuming 'kind' maps to 'type'
		});

		setEditingCategory(cat);

		setNewCatType(cat.type);
		setNewCatColorId(cat.color);
		setNewCatIconId(cat.icon);

		setShowCreateCategory(true); // Open dialog
	}


	const onSubmitHandler = async (data: CategoryFormData) => {
		try {
			data.color = newCatColorId;
			data.icon = newCatIconId;
			data.type = newCatType;

			if (editingCategory?.id) {
				// Editing existing category
				const cat = await putCategory(editingCategory.id, data);
				onSubmit(cat); // Call parent's submit handler
				setShowManageCategories(false); // Close dialog

			} else {
				const cat = await postCategory(data);
				onSubmit(cat); // Call parent's submit handler
			}

			setShowCreateCategory(false);

			setNewCatColorId(availableColors[0]?.id);
			setNewCatIconId(availableIcons[0]?.id);
			// reset form values too
			reset({
				name: '',
				color: availableColors[0]?.id,
				icon: availableIcons[0]?.id,
				type: newCatType,
			});
		} catch (error) {
			console.error('Submit error:', error);
		}
	};

	return (
		<>
			<Dialog open={showCreateCategory} onOpenChange={setShowCreateCategory}>
				<DialogContent className="w-[95vw] max-w-md max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingCategory ? 'Editar categoría ' : 'Nueva categoría'}
						</DialogTitle>

					</DialogHeader>
					<form onSubmit={handleSubmit(onSubmitHandler)}>
						<div className="space-y-4 py-2">
							<div className="flex bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Tipo de categoría">
								<button
									role="tab"
									aria-selected={newCatType === TxType.EXPENSE}
									onClick={() => setNewCatType(TxType.EXPENSE)}
									className={cn(
										"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
										newCatType === TxType.EXPENSE
											? "bg-white text-gray-900 shadow-sm border border-gray-200 ring-2 ring-red-200"
											: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
									)}
									type="button"
								>
									💸 Gasto
								</button>
								<button
									role="tab"
									aria-selected={newCatType === TxType.INCOME}
									onClick={() => setNewCatType(TxType.INCOME)}
									className={cn(
										"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
										newCatType === TxType.INCOME
											? "bg-white text-gray-900 shadow-sm border border-gray-200 ring-2 ring-green-200"
											: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
									)}
									type="button"
								>
									💰 Ingreso
								</button>
							</div>
							<div>
								<Label htmlFor="name">Nombre</Label>
								<Input
									id="name"
									placeholder="Ej: Mascotas"
									{...register('name')}
								// value={newCatName}
								// onChange={(e) => setNewCatName(e.target.value)}
								/>
								{errors.name && ( // ← Show error message
									<p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
								)}
							</div>

							<div>
								<Label>Ícono</Label>
								<div className="grid grid-cols-5 gap-2 mt-2">
									{availableIcons.map((i) => {
										const Icon = i.icon
										const active = newCatIconId === i.id
										return (
											<button
												key={i.id}
												onClick={() => setNewCatIconId(i.id)}
												type="button"
												className={cn(
													"p-2 rounded-lg border flex items-center justify-center",
													active ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:bg-gray-50",
												)}
												title={i.name}
											>
												<Icon className="w-5 h-5" />
											</button>
										)
									})}
								</div>
							</div>

							<div>
								<Label>Color</Label>
								<div className="grid grid-cols-8 gap-2 mt-2">
									{availableColors.map((c) => {
										const active = newCatColorId === c.id
										return (
											<button
												key={c.id}
												onClick={() => setNewCatColorId(c.id)}
												type="button"
												className={cn(
													"w-8 h-8 rounded-full border-2",
													c.class,
													active ? "border-gray-900" : "border-white",
												)}
												title={c.name}
											/>
										)
									})}
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => {
								console.log('Cancel clicked');
								setShowCreateCategory(false);
								setEditingCategory(null);
								setNewCatColorId(availableColors[0]?.id);
								setNewCatIconId(availableIcons[0]?.id);
								// reset form values too
								reset({
									name: '',
									color: availableColors[0]?.id,
									icon: availableIcons[0]?.id,
									type: newCatType,
								});

							}}>
								Cancelar
							</Button>
							<Button type="submit" >
								{isSubmitting ? 'Guardando...' : editingCategory ? 'Actualizar' : 'Crear'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Manage Categories Dialog */}
			<Dialog open={showManageCategories} onOpenChange={() => setShowManageCategories(false)}>
				<DialogContent className="w-[95vw] max-w-2xl">
					<DialogHeader>
						<DialogTitle>Gestionar Categorías</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-2 max-h-96 overflow-y-auto">
						{cats.map((cat) => {
							const isEditing = editingCategory?.id === cat.id
							const relatedTagsCount = allTags.filter((t) => t.categoryId === cat.id).length

							return (
								<div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
									<div className="flex items-center gap-3 min-w-0 flex-1">
										<span
											className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", cat.color)}
										>
											<IconComponent icon={cat?.icon} className="w-4 h-4 text-white" />
										</span>
										<div className="min-w-0 flex-1">
											<p className="font-medium truncate">{cat.name}</p>
											<p className="text-sm text-gray-500">
												{cat.type === "expense" ? "Gasto" : "Ingreso"} • {relatedTagsCount} tag(s)
											</p>
										</div>
									</div>
									<div className="flex items-center gap-1 flex-shrink-0">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => startEditCategory(cat)}
											className="flex items-center gap-1 text-xs px-2 py-1"
										>
											<Edit className="w-3 h-3" />
											<span className="hidden sm:inline">Editar</span>
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => deleteCategory(cat.id)}
											className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs px-2 py-1"
										>
											<Trash2 className="w-3 h-3" />
											<span className="hidden sm:inline">Eliminar</span>
										</Button>
									</div>
								</div>
							)
						})}
					</div>
					<DialogFooter>
						<Button onClick={() => setShowManageCategories(false)}>Cerrar</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

		</>
	)
}