import { isUploadResource, proxyTemplate } from "@/lib/http/uploadProxy"

export async function GET(_request: Request, { params }: { params: Promise<{ resource: string }> }) {
	const { resource } = await params
	if (!isUploadResource(resource)) {
		return Response.json({ message: "Recurso inválido" }, { status: 400 })
	}
	return proxyTemplate(resource)
}
