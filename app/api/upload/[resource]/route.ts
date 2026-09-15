import { isUploadResource, proxyUpload } from "@/lib/http/uploadProxy"

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
	const { resource } = await params
	if (!isUploadResource(resource)) {
		return Response.json({ message: "Recurso inválido" }, { status: 400 })
	}
	return proxyUpload(resource, request)
}
