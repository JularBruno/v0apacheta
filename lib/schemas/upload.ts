/**
 * Shapes for the xlsx bulk-upload endpoints (movement + financial-element).
 * Client-safe — no server-only imports here (see lib/http/uploadProxy.ts for
 * the route-handler side, which proxies these).
 */

export type UploadResource = "movement" | "financial-element"

export function isUploadResource(value: string): value is UploadResource {
	return value === "movement" || value === "financial-element"
}

/** One problem the backend reports about a row (and, for patrimonio, which sheet). */
export type ImportError = {
	sheet?: string
	row: number
	column?: string
	message: string
}

export type MovementImportResult = {
	message: string
	dryRun: boolean
	summary: { dataRows: number; successful: number; failed: number }
	balance: { previous: number; current: number }
	created: { categories: string[]; tags: string[] }
	errors: ImportError[]
}

export type PatrimonyImportResult = {
	message: string
	dryRun: boolean
	summary: { dataRows: number; created: number; failed: number }
	affectedElementIds: string[]
	errors: ImportError[]
}

export type ImportResult = MovementImportResult | PatrimonyImportResult

/**
 * How many rows would actually import (or did import).
 *
 * Deliberately NOT `summary.successful`/`summary.created`/`summary.failed` —
 * observed backend responses return dataRows > 0 with a populated
 * balance/created/affectedElementIds and an empty errors[], but successful
 * and failed both 0 (should sum to dataRows). Until that's fixed server-side,
 * derive the count from dataRows minus the (reliable) per-row errors list.
 */
export function importableRowCount(result: ImportResult): number {
	return Math.max(result.summary.dataRows - result.errors.length, 0)
}
