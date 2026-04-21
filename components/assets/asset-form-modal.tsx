"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FinancialElement, FinancialElements, financialElementSchema } from "@/lib/schemas/financialElement"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FinancialElementType } from "@/lib/schemas/definitions"
import { postFinancialElement, putFinancialElement, revalidateFinancialElements } from "@/lib/actions/financialElements"
import { useToast } from '@/hooks/use-toast';
import { Controller } from "react-hook-form";

interface AssetFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (item: any) => void
	initialData?: FinancialElements | null
}

type FinancialElementFormData = z.infer<typeof financialElementSchema>;

export default function AssetFormModal({ isOpen, onClose, onSave, initialData }: AssetFormModalProps) {
	const { toast } = useToast();

	/** Form zod validator, values, handlers, errors and loading */
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		control
	} = useForm<FinancialElementFormData>({
		resolver: zodResolver(financialElementSchema)
		,
		defaultValues: {
			name: initialData?.name || '',
			type: initialData?.type || FinancialElementType.ASSET,
		}
	});

	const onSubmitHandler = async (data: FinancialElementFormData) => {
		if (initialData) {
			try {
				const financialElement = await putFinancialElement(initialData?.id, data);

				onClose();
				onSave(financialElement);

				await revalidateFinancialElements();

				toast({
					// title: `Categoría ${editingCategory?.id ? "editada" : "creada"}!`,
					title: `editado`,
					description: `se editó`,
					variant: "success",
				})

			} catch (error) {
				console.log('error ', error);
				toast({
					// title: `Categoría ${editingCategory?.id ? "editada" : "creada"}!`,
					title: `error`,
					description: `se creó`,
					variant: "destructive",
				})
				return error;
			}
		} else {
			try {
				const financialElement = await postFinancialElement(data);

				onClose();
				onSave(financialElement);

				await revalidateFinancialElements();

				toast({
					// title: `Categoría ${editingCategory?.id ? "editada" : "creada"}!`,
					title: `creoado`,
					description: `se creó`,
					variant: "success",
				})

			} catch (error) {
				console.log('error ', error);
				toast({
					// title: `Categoría ${editingCategory?.id ? "editada" : "creada"}!`,
					title: `error`,
					description: `se creó`,
					variant: "destructive",
				})
				return error;
			} finally {
				reset({
					name: '',
					type: FinancialElementType.ASSET,
				});
			}
		}
	}


	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{initialData ? "Editar Elemento Financiero" : "Agregar Elemento Financiero"}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmitHandler)}>

					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Nombre
							</Label>
							<Input
								{...register('name')}
								id="name"
								className="col-span-3" />
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="type" className="text-right">
								Tipo
							</Label>
							{/* <Select
							// value={defaultValues.type}
							>
								<SelectTrigger className="col-span-3">
									<SelectValue placeholder="Selecciona tipo" />
								</SelectTrigger>
								<SelectContent
									{...register('type')}
								>
									<SelectItem value={FinancialElementType.ASSET}>Activo</SelectItem>
									<SelectItem value={FinancialElementType.LIABILITY}>Pasivo</SelectItem>
								</SelectContent>
							</Select> */}
							<Controller
								name="type"
								control={control}
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger className="col-span-3">
											<SelectValue placeholder="Selecciona tipo" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={FinancialElementType.ASSET}>Activo</SelectItem>
											<SelectItem value={FinancialElementType.LIABILITY}>Pasivo</SelectItem>
										</SelectContent>
									</Select>
								)}
							/>
						</div>
						{/* <div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="value" className="text-right">
								Valor Actual
							</Label>
							<Input
								id="value"
								type="number"
								value={currentValue}
								onChange={(e) => setCurrentValue(e.target.value)}
								className="col-span-3"
							/>
						</div> */}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={onClose}>
							Cancelar
						</Button>
						{/* <Button onClick={handleSubmit}>Guardar</Button> */}
						<Button type="submit" >
							{/* {isSubmitting ? 'Guardando...' : editingCategory ? 'Actualizar' : 'Crear'} */}
							Guardar
						</Button>
					</DialogFooter>
				</form>

			</DialogContent>
		</Dialog>
	)
}
