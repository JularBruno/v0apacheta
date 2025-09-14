"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AssetFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: { id?: string; name: string; type: "asset" | "liability"; currentValue: number }) => void
  initialData?: { id: string; name: string; type: "asset" | "liability"; currentValue: number } | null
}

export default function AssetFormModal({ isOpen, onClose, onSave, initialData }: AssetFormModalProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [type, setType] = useState<"asset" | "liability">(initialData?.type || "asset")
  const [currentValue, setCurrentValue] = useState<string>(initialData?.currentValue.toString() || "")

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setType(initialData.type)
      setCurrentValue(initialData.currentValue.toString())
    } else {
      setName("")
      setType("asset")
      setCurrentValue("")
    }
  }, [initialData, isOpen]) // Reset when modal opens or initialData changes

  const handleSubmit = () => {
    if (!name || !currentValue) {
      alert("Por favor, completa todos los campos.")
      return
    }
    onSave({
      id: initialData?.id,
      name,
      type,
      currentValue: Number.parseFloat(currentValue),
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Elemento Financiero" : "Agregar Elemento Financiero"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <Select value={type} onValueChange={(value: "asset" | "liability") => setType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Activo</SelectItem>
                <SelectItem value="liability">Pasivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
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
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
