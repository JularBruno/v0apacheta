"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { currencyName } from "@/lib/currency-names"

type CurrencyOption = { currency: string; label: string }

/**
 * The currency the patrimony totals are shown in (the profile's
 * preferredCurrency). Changing it saves right away; the page disables it and
 * shows the totals loading until the server-side recompute comes back.
 */
export default function MainCurrencyCard({
	currencies,
	value,
	saving,
	onChange,
}: {
	currencies: CurrencyOption[]
	value: string
	saving: boolean
	onChange: (currency: string) => void
}) {
	return (
		<Card data-testid="main-currency-card">
			<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-foreground">Moneda principal</p>
					<p className="text-xs text-muted-foreground">Los totales se muestran en esta moneda.</p>
				</div>
				<Select value={value} onValueChange={onChange} disabled={saving}>
					<SelectTrigger className="w-full sm:w-64" aria-label="Moneda principal">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{currencies.map((c) => (
							<SelectItem key={c.currency} value={c.currency}>
								{c.currency} · {currencyName(c.currency)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardContent>
		</Card>
	)
}
