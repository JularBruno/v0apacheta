import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
	return (
		<div className="space-y-6 max-w-full overflow-hidden animate-pulse">
			{/* Header Skeleton */}
			<div className="flex items-center gap-4 px-4 sm:px-0">
				<div className="w-10 h-10 rounded-lg bg-gray-300" />
				<div className="min-w-0 flex-1">
					<div className="h-6 bg-gray-300 rounded w-48 mb-2" />
					<div className="h-4 bg-gray-300 rounded w-24" />
				</div>
				<div className="flex gap-2">
					<div className="w-10 h-10 bg-gray-300 rounded" />
					<div className="w-10 h-10 bg-gray-300 rounded" />
				</div>
			</div>

			{/* Asset Summary Skeleton */}
			<Card>
				<CardContent className="p-6">
					<div className="text-center">
						<div className="h-4 bg-gray-300 rounded w-24 mx-auto mb-3" />
						<div className="h-10 bg-gray-300 rounded w-40 mx-auto" />
					</div>
				</CardContent>
			</Card>

			{/* Quick Add Button Skeleton */}
			<Card>
				<CardContent className="p-4">
					<div className="h-10 bg-gray-300 rounded w-full" />
				</CardContent>
			</Card>

			{/* Transaction History Skeleton */}
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="h-6 bg-gray-300 rounded w-48" />
						<div className="flex gap-2">
							<div className="h-6 bg-gray-300 rounded-full w-16" />
							<div className="h-6 bg-gray-300 rounded-full w-20" />
							<div className="h-6 bg-gray-300 rounded-full w-16" />
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-200">
								<div className="flex items-center space-x-3">
									<div className="w-12 h-12 rounded-xl bg-gray-300" />
									<div>
										<div className="h-4 bg-gray-300 rounded w-32 mb-2" />
										<div className="h-3 bg-gray-300 rounded w-24 mb-1" />
										<div className="h-5 bg-gray-300 rounded-full w-16" />
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="text-right">
										<div className="h-5 bg-gray-300 rounded w-20 mb-1" />
										<div className="h-3 bg-gray-300 rounded w-12" />
									</div>
									<div className="flex gap-1">
										<div className="w-8 h-8 bg-gray-300 rounded" />
										<div className="w-8 h-8 bg-gray-300 rounded" />
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Chart Skeleton */}
			<Card>
				<CardHeader>
					<div className="h-6 bg-gray-300 rounded w-40" />
				</CardHeader>
				<CardContent>
					<div className="h-48 bg-gray-200 rounded-lg" />
				</CardContent>
			</Card>
		</div>
	)
}