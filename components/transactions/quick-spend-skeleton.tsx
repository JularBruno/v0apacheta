"use client"

import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export default function QuickSpendSkeleton() {
	return (
		<Card className="w-full max-w-none">
			<CardHeader>
				<div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse"></div>
			</CardHeader>
			<CardContent className="space-y-4 p-4">
				<div className="grid grid-cols-2 gap-2">
					<div className="h-12 bg-gray-300 rounded-lg animate-pulse"></div>
					<div className="h-12 bg-gray-300 rounded-lg animate-pulse"></div>
				</div>
				<div className="space-y-2">
					<div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="h-12 bg-gray-300 rounded-lg animate-pulse"></div>
						))}
					</div>
				</div>
				<div className="space-y-2">
					<div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
					<div className="h-10 bg-gray-300 rounded-lg animate-pulse"></div>
				</div>
				<div className="h-12 bg-gray-400 rounded-lg animate-pulse"></div>
			</CardContent>
		</Card>

	)
}
