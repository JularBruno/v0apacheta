import { auth } from "@/auth"
import { isUploadResource, type UploadResource } from "@/lib/schemas/upload"

/**
 * Proxies for the backend's xlsx upload endpoints.
 *
 * Route handlers (not server actions) on purpose — Next 15 caps server-action
 * bodies at 1MB, well under the 5MB file limit these endpoints allow.
 */

const API_URL = process.env.API_URL

export { isUploadResource }
export type { UploadResource }

// Query params passed straight through to the backend upload endpoint.
const FORWARDED_UPLOAD_PARAMS = ["dryRun", "financialElementId"] as const

/**
 * POST .../upload — forwards the incoming multipart "file" field + whitelisted
 * query params (dryRun, financialElementId — the pre-selected asset/liability
 * whose id rows without an Elemento column fall back to).
 */
export async function proxyUpload(resource: UploadResource, request: Request): Promise<Response> {
	const session = await auth()
	if (!session?.accessToken) {
		return Response.json({ message: "No autenticado" }, { status: 401 })
	}

	const incomingForm = await request.formData()
	const file = incomingForm.get("file")
	if (!file || typeof file === "string") {
		return Response.json({ message: "Falta el archivo" }, { status: 400 })
	}

	// Don't set Content-Type manually — fetch derives the multipart boundary from the FormData.
	const outgoingForm = new FormData()
	outgoingForm.set("file", file, file.name)

	const incomingParams = new URL(request.url).searchParams
	const outgoingParams = new URLSearchParams()
	for (const key of FORWARDED_UPLOAD_PARAMS) {
		const value = incomingParams.get(key)
		if (value) outgoingParams.set(key, value)
	}
	const qs = outgoingParams.toString()

	const response = await fetch(`${API_URL}/${resource}/upload${qs ? `?${qs}` : ""}`, {
		method: "POST",
		headers: { Authorization: `Bearer ${session.accessToken}` },
		body: outgoingForm,
	})

	const data = await response.json().catch(() => ({ message: "Respuesta inválida del servidor" }))
	return Response.json(data, { status: response.status })
}

/** GET .../upload/template — streams the xlsx workbook back. */
export async function proxyTemplate(resource: UploadResource): Promise<Response> {
	const session = await auth()
	if (!session?.accessToken) {
		return Response.json({ message: "No autenticado" }, { status: 401 })
	}

	const response = await fetch(`${API_URL}/${resource}/upload/template`, {
		headers: { Authorization: `Bearer ${session.accessToken}` },
	})

	if (!response.ok) {
		const data = await response.json().catch(() => ({ message: "No se pudo descargar la plantilla" }))
		return Response.json(data, { status: response.status })
	}

	const blob = await response.blob()
	return new Response(blob, {
		status: 200,
		headers: {
			"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"Content-Disposition": 'attachment; filename="plantilla-apacheta.xlsx"',
		},
	})
}
