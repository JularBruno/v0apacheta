import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ExpenseChartSkeleton() {
	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">Resumen de Gastos</CardTitle>
					<div className="text-right space-y-1">
						<div className="h-6 w-20 bg-gray-300 rounded animate-pulse" />
						<div className="h-3 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Bar skeleton */}
				<div className="h-4 w-full bg-gray-300 rounded-full animate-pulse" />

				{/* Legend skeleton */}
				<div className="space-y-2">
					{[1, 2, 3].map(i => (
						<div key={i} className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse" />
								<div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
							</div>
							<div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}