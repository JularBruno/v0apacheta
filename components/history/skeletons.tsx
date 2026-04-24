"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * Donut Chart Skeleton
 * Use when loading pie/donut chart data
 */
export function DonutChartSkeleton({ legendItems = 4 }: { legendItems?: number }) {
	return (
		<div className="flex flex-col sm:flex-row items-center gap-6 animate-pulse">
			<div className="w-40 h-40 rounded-full bg-gray-200 border-8 border-gray-300 shrink-0" />
			<div className="flex-1 space-y-3 w-full">
				{[...Array(legendItems)].map((_, i) => (
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
	)
}

/**
 * Large Donut Chart Skeleton (centered, with category pills)
 * Use for category breakdown charts
 */
export function LargeDonutChartSkeleton({ categoryCount = 6 }: { categoryCount?: number }) {
	return (
		<div className="flex flex-col items-center gap-4 animate-pulse">
			<div className="w-48 h-48 rounded-full bg-gray-200 border-[16px] border-gray-300" />
			<div className="flex flex-wrap justify-center gap-2">
				{[...Array(categoryCount)].map((_, i) => (
					<div key={i} className="h-6 bg-gray-300 rounded-full w-16" />
				))}
			</div>
		</div>
	)
}

/**
 * Category Budget Item Skeleton
 * Use for individual budget category rows
 */
export function CategoryBudgetItemSkeleton() {
	return (
		<div className="space-y-2 animate-pulse">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-gray-300" />
					<div className="h-4 bg-gray-300 rounded w-24" />
				</div>
				<div className="h-4 bg-gray-300 rounded w-20" />
			</div>
			<div className="h-2 bg-gray-200 rounded-full w-full">
				<div className="h-2 bg-gray-300 rounded-full w-1/2" />
			</div>
		</div>
	)
}

/**
 * Category Budget List Skeleton
 * Use when loading the full budget breakdown
 */
export function CategoryBudgetListSkeleton({ itemCount = 5 }: { itemCount?: number }) {
	return (
		<div className="space-y-4 animate-pulse">
			{[...Array(itemCount)].map((_, i) => (
				<div key={i} className="space-y-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-gray-300" />
							<div className="h-4 bg-gray-300 rounded w-24" />
						</div>
						<div className="h-4 bg-gray-300 rounded w-20" />
					</div>
					<div className="h-2 bg-gray-200 rounded-full w-full">
						<div className="h-2 bg-gray-300 rounded-full" style={{ width: `${30 + i * 12}%` }} />
					</div>
				</div>
			))}
		</div>
	)
}

/**
 * Transaction Item Skeleton
 * Use for individual transaction rows
 */
export function TransactionItemSkeleton() {
	return (
		<Card className="p-3 md:p-4 animate-pulse">
			<div className="flex flex-col space-y-3">
				<div className="flex items-center justify-between">
					<div className="h-6 bg-gray-300 rounded-full w-20" />
					<div className="w-6 h-6 bg-gray-300 rounded" />
				</div>
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 rounded-lg bg-gray-300 shrink-0" />
					<div className="h-4 bg-gray-300 rounded max-w-48 flex-1" />
				</div>
				<div className="flex items-center justify-between">
					<div className="h-3 bg-gray-300 rounded w-28" />
					<div className="h-5 bg-gray-300 rounded w-16" />
				</div>
			</div>
		</Card>
	)
}

/**
 * Transaction List Skeleton
 * Use when loading multiple transactions
 */
export function TransactionListSkeleton({ itemCount = 5 }: { itemCount?: number }) {
	return (
		<div className="space-y-2">
			{[...Array(itemCount)].map((_, i) => (
				<TransactionItemSkeleton key={i} />
			))}
		</div>
	)
}

/**
 * Compact Transaction Row Skeleton
 * Use for simpler transaction lists (like in asset detail)
 */
export function CompactTransactionSkeleton() {
	return (
		<div className="flex items-center gap-3 p-3 rounded-lg bg-gray-200 animate-pulse">
			<div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-gray-300" />
			<div className="min-w-0 flex-1">
				<div className="h-4 bg-gray-300 rounded max-w-32 mb-2" />
				<div className="h-3 bg-gray-300 rounded max-w-24" />
			</div>
			<div className="flex items-center gap-2 shrink-0">
				<div className="h-5 bg-gray-300 rounded w-16 sm:w-20" />
				<div className="hidden sm:flex gap-1">
					<div className="w-8 h-8 bg-gray-300 rounded" />
					<div className="w-8 h-8 bg-gray-300 rounded" />
				</div>
			</div>
		</div>
	)
}

/**
 * Bar Chart Skeleton
 * Use for spending/income bar charts
 */
export function BarChartSkeleton({ barCount = 7 }: { barCount?: number }) {
	return (
		<div className="flex items-end justify-between gap-2 h-32 animate-pulse">
			{[...Array(barCount)].map((_, i) => (
				<div key={i} className="flex-1 flex flex-col items-center gap-1">
					<div
						className="w-full bg-gray-300 rounded-t"
						style={{ height: `${20 + Math.random() * 60}%` }}
					/>
					<div className="h-3 bg-gray-200 rounded w-6" />
				</div>
			))}
		</div>
	)
}

/**
 * Summary Stats Skeleton
 * Use for income/expense summary bars
 */
export function SummaryStatsSkeleton() {
	return (
		<div className="p-4 bg-gray-100 rounded-lg animate-pulse">
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
	)
}

/**
 * Period Filter Skeleton
 * Use for month/period selector pills
 */
export function PeriodFilterSkeleton({ pillCount = 6 }: { pillCount?: number }) {
	return (
		<div className="flex gap-2 overflow-x-auto pb-2 animate-pulse">
			{[...Array(pillCount)].map((_, i) => (
				<div key={i} className="h-8 bg-gray-300 rounded-full w-20 shrink-0" />
			))}
		</div>
	)
}

/**
 * Card with Header Skeleton
 * Wrapper for chart skeletons inside a card
 */
export function ChartCardSkeleton({
	children,
	titleWidth = "max-w-40",
}: {
	children: React.ReactNode
	titleWidth?: string
}) {
	return (
		<Card>
			<CardHeader>
				<div className={`h-6 bg-gray-300 rounded ${titleWidth} animate-pulse`} />
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	)
}

/**
 * Asset Value Skeleton
 * Use for the main asset value display
 */
export function AssetValueSkeleton() {
	return (
		<div className="text-center animate-pulse">
			<div className="h-4 bg-gray-300 rounded w-24 mx-auto mb-3" />
			<div className="h-10 bg-gray-300 rounded w-40 mx-auto" />
		</div>
	)
}