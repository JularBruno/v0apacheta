import { checkApiHealth } from "@/lib/http/health"

export const dynamic = "force-dynamic"

// GET /api/health — { online } for the "Servidor:" line on /dashboard/ayuda.
export async function GET() {
	const online = await checkApiHealth(process.env.API_URL)
	return Response.json({ online })
}
