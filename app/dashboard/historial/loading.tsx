import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LoadingHistory() {
	return (

		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full overflow-hidden animate-pulse">

			{/* Category Budget List Skeleton */}
			<Card>
				<CardHeader>
					<div className="h-6 bg-gray-300 rounded max-w-48" />
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="w-8 h-8 rounded-lg bg-gray-300" />
										<div className="h-4 bg-gray-300 rounded w-24" />
									</div>
									<div className="h-4 bg-gray-300 rounded w-20" />
								</div>
								{/* Progress bar */}
								<div className="h-2 bg-gray-200 rounded-full w-full">
									<div className="h-2 bg-gray-300 rounded-full" style={{ width: `${30 + i * 15}%` }} />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Transaction Donut Chart Skeleton */}
			<Card>
				<CardHeader>
					<div className="h-6 bg-gray-300 rounded max-w-40" />
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row items-center gap-6">
						{/* Donut chart placeholder */}
						<div className="w-40 h-40 rounded-full bg-gray-200 border-8 border-gray-300 shrink-0" />
						{/* Legend */}
						<div className="flex-1 space-y-3 w-full">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-gray-300" />
										<div className="h-4 bg-gray-300 rounded w-20" />
									</div>
									<div className="h-4 bg-gray-300 rounded w-16" />
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>


			{/* Category Donut Chart Skeleton */}
			<Card>
				<CardHeader>
					<div className="h-6 bg-gray-300 rounded max-w-36" />
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center gap-4">
						{/* Large donut */}
						<div className="w-48 h-48 rounded-full bg-gray-200 border-[16px] border-gray-300" />
						{/* Category pills */}
						<div className="flex flex-wrap justify-center gap-2">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="h-6 bg-gray-300 rounded-full w-16" />
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Transactions List Skeleton */}
			<Card>
				<CardHeader className="pb-4">
					<div className="flex flex-col space-y-4">
						<div className="flex items-center justify-between">
							<div className="h-6 bg-gray-300 rounded w-40" />
							<div className="hidden sm:block h-9 bg-gray-300 rounded w-32" />
						</div>

						{/* Search and filters */}
						<div className="flex flex-col sm:flex-row gap-3">
							<div className="h-10 bg-gray-200 rounded flex-1" />
							<div className="flex gap-2">
								<div className="h-10 bg-gray-300 rounded w-24" />
								<div className="sm:hidden h-10 bg-gray-300 rounded w-20" />
							</div>
						</div>
					</div>

					{/* Period selector */}
					<div className="border-t pt-4 mt-4">
						<div className="h-4 bg-gray-300 rounded w-16 mb-3" />
						<div className="flex gap-2 overflow-x-auto pb-2">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="h-8 bg-gray-300 rounded-full w-20 shrink-0" />
							))}
						</div>
					</div>
				</CardHeader>

				<CardContent>
					{/* Summary bar */}
					<div className="mb-4 p-4 bg-gray-100 rounded-lg">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div className="flex items-center gap-6">
								<div>
									<div className="h-3 bg-gray-300 rounded w-10 mb-2" />
									<div className="h-6 bg-gray-300 rounded w-20" />
								</div>
								<div className="h-8 w-px bg-gray-300" />
								<div>
									<div className="h-3 bg-gray-300 rounded w-14 mb-2" />
									<div className="h-6 bg-gray-300 rounded w-16" />
								</div>
							</div>
							<div className="h-3 bg-gray-300 rounded w-24" />
						</div>
					</div>

					{/* Transaction items */}
					<div className="space-y-2">
						{[...Array(5)].map((_, i) => (
							<Card key={i} className="p-3 md:p-4">
								<div className="flex flex-col space-y-3">
									{/* Top row */}
									<div className="flex items-center justify-between">
										<div className="h-6 bg-gray-300 rounded-full w-20" />
										<div className="w-6 h-6 bg-gray-300 rounded" />
									</div>
									{/* Middle */}
									<div className="flex items-center space-x-3">
										<div className="w-10 h-10 rounded-lg bg-gray-300 shrink-0" />
										<div className="h-4 bg-gray-300 rounded max-w-48 flex-1" />
									</div>
									{/* Bottom row */}
									<div className="flex items-center justify-between">
										<div className="h-3 bg-gray-300 rounded w-28" />
										<div className="h-5 bg-gray-300 rounded w-16" />
									</div>
								</div>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}