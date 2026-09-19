"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Plus, X } from "lucide-react"
import type { Member } from "./types"

export default function MemberManager({
	members,
	onAdd,
	onRemove,
}: {
	members: Member[]
	onAdd: (name: string) => void
	onRemove: (id: string) => void
}) {
	const [name, setName] = useState("")

	const handleAdd = () => {
		const trimmed = name.trim()
		if (!trimmed) return
		onAdd(trimmed)
		setName("")
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-sm font-medium text-foreground">
				<Users className="w-4 h-4" />
				Personas ({members.length})
			</div>

			<div className="flex gap-2">
				<Input
					placeholder="Nombre"
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault()
							handleAdd()
						}
					}}
				/>
				<Button onClick={handleAdd} size="icon" disabled={!name.trim()} aria-label="Agregar persona">
					<Plus className="w-4 h-4" />
				</Button>
			</div>

			{members.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					{members.map((member) => (
						<span
							key={member.id}
							className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
						>
							{member.name}
							<button
								type="button"
								onClick={() => onRemove(member.id)}
								className="rounded-full p-0.5 hover:bg-black/10 transition-colors"
								aria-label={`Quitar a ${member.name}`}
							>
								<X className="w-3 h-3" />
							</button>
						</span>
					))}
				</div>
			) : (
				<p className="text-sm text-muted-foreground">Agregá a las personas que van a compartir gastos.</p>
			)}
		</div>
	)
}
