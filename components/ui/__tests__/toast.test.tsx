import { readFileSync } from "node:fs"
import path from "node:path"
import { render, screen } from "@testing-library/react"
import { Toast, ToastClose, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

const SOURCE = readFileSync(path.join(__dirname, "..", "toast.tsx"), "utf8")

function renderToast(variant?: "default" | "success" | "destructive" | "warning") {
	render(
		<ToastProvider>
			<Toast open variant={variant} data-testid="toast">
				<ToastTitle>Hola</ToastTitle>
				<ToastClose />
			</Toast>
			<ToastViewport />
		</ToastProvider>,
	)
	return screen.getByTestId("toast")
}

describe("toast colors", () => {
	it("uses only brand or global colors, no plain Tailwind reds or greens", () => {
		expect(SOURCE).not.toMatch(/\b(red|green|emerald|rose|lime)-\d{2,3}\b/)
	})

	it.each([
		["default", /\bbg-card\b/, /\btext-card-foreground\b/],
		["success", /\bbg-primary-100\b/, /\btext-coffee-bean-800\b/],
		["destructive", /\bbg-destructive\b/, /\btext-destructive-foreground\b/],
		["warning", /\bbg-burnt-peach-50\b/, /\btext-coffee-bean-800\b/],
	] as const)("%s toast uses the brand surface and text", (variant, bg, text) => {
		const el = renderToast(variant)
		expect(el.className).toMatch(bg)
		expect(el.className).toMatch(text)
	})

	it.each(["success", "warning"] as const)("%s toast has its own dark-mode colors", (variant) => {
		expect(renderToast(variant).className).toMatch(/\bdark:bg-/)
	})
})
