import { readFile } from "fs/promises"
import path from "path"

/**
 * Serves the worked-example .xlsx files from docs/import-examples/ so the
 * importar page can link them directly — reads from disk on each request
 * (not copied into public/) so edits to those files show up immediately.
 */
const ALLOWED_FILES = new Set([
	"ejemplo-movimientos.xlsx",
	"ejemplo-movimientos-con-errores.xlsx",
	"ejemplo-movimientos-patrimonio.xlsx",
	"ejemplo-patrimonio.xlsx",
	"ejemplo-patrimonio-sin-elemento.xlsx",
	"ejemplo-patrimonio-con-errores.xlsx",
])

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
	const { file } = await params
	if (!ALLOWED_FILES.has(file)) {
		return Response.json({ message: "Archivo no encontrado" }, { status: 404 })
	}

	try {
		const buffer = await readFile(path.join(process.cwd(), "docs", "import-examples", file))
		return new Response(buffer, {
			status: 200,
			headers: {
				"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"Content-Disposition": `attachment; filename="${file}"`,
			},
		})
	} catch {
		return Response.json({ message: "Archivo no encontrado" }, { status: 404 })
	}
}
