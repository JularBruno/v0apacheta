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
import { useToast } from '@/hooks/use-toast';
import { Controller } from "react-hook-form";
import { useCreateFinancialElement } from "@/lib/hooks/use-create-financial-element"
import { useUpdateFinancialElement } from "@/lib/hooks/use-update-financial-element"

interface AssetFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (item: any) => void
	initialData?: FinancialElements | null
}

type FinancialElementFormData = z.infer<typeof financialElementSchema>;

export default function AssetFormModal({ isOpen, onClose, onSave, initialData }: AssetFormModalProps) {
	const { toast } = useToast();
	const createMutation = useCreateFinancialElement();
	const updateMutation = useUpdateFinancialElement();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		control
	} = useForm<FinancialElementFormData>({
		resolver: zodResolver(financialElementSchema),
		defaultValues: {
			name: initialData?.name || '',
			type: initialData?.type || FinancialElementType.ASSET,
		}
	});

	const isPending = createMutation.isPending || updateMutation.isPending;

	const onSubmitHandler = async (data: FinancialElementFormData) => {
		try {
			if (initialData) {
				const result = await updateMutation.mutateAsync({ id: initialData.id, data: data as FinancialElement });
				onClose();
				onSave(result);
				toast({ title: 'Elemento actualizado', variant: 'success' });
			} else {
				const result = await createMutation.mutateAsync(data);
				reset({ name: '', type: FinancialElementType.ASSET });
				onClose();
				onSave(result);
				toast({ title: 'Elemento creado', variant: 'success' });
			}
		} catch (error) {
			toast({ title: 'Error', description: 'No se pudo guardar el elemento', variant: 'destructive' });
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
						{errors.name && <p className="col-span-4 text-red-500 text-sm text-right">{errors.name.message}</p>}
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
						<Button type="submit" disabled={isPending}>
							{isPending ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
						</Button>
					</DialogFooter>
				</form>

			</DialogContent>
		</Dialog>
	)
}
