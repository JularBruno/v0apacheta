import { act, fireEvent, render, screen } from "@testing-library/react"
import { InstallAppButton } from "@/components/pwa/install-app-button"
import { resetInstallStateForTests, startInstallListening } from "@/lib/pwa/install-state"

const ANDROID_CHROME = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36"
const IPHONE_SAFARI = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
const IPHONE_CHROME = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1"

function setUserAgent(ua: string) {
	Object.defineProperty(window.navigator, "userAgent", { value: ua, configurable: true })
}

function setStandalone(matches: boolean) {
	window.matchMedia = jest.fn().mockImplementation((query: string) => ({
		matches: query === "(display-mode: standalone)" ? matches : false,
		media: query,
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
	})) as unknown as typeof window.matchMedia
}

/** What Chrome dispatches when the page is installable. */
function fireBeforeInstallPrompt(outcome: "accepted" | "dismissed" = "accepted") {
	const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
		prompt: jest.Mock
		userChoice: Promise<{ outcome: string }>
	}
	event.prompt = jest.fn(async () => undefined)
	event.userChoice = Promise.resolve({ outcome })
	act(() => {
		window.dispatchEvent(event)
	})
	return event
}

describe("InstallAppButton", () => {
	beforeEach(() => {
		resetInstallStateForTests()
		setUserAgent(ANDROID_CHROME)
		setStandalone(false)
		startInstallListening()
	})

	it("can install: shows the button once the browser offers it, and tapping opens the browser's dialog", async () => {
		render(<InstallAppButton />)
		const event = fireBeforeInstallPrompt()
		expect(event.defaultPrevented).toBe(true)

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Instalar la app" }))
		})
		expect(event.prompt).toHaveBeenCalledTimes(1)
		expect(await screen.findByText("Ya tenés la app instalada ✓")).toBeInTheDocument()
	})

	it("keeps the button when the person dismisses the dialog", async () => {
		render(<InstallAppButton />)
		fireBeforeInstallPrompt("dismissed")
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Instalar la app" }))
		})
		// Chrome won't reuse a prompt; the button goes away until it offers a new one
		expect(screen.queryByText("Ya tenés la app instalada ✓")).not.toBeInTheDocument()
	})

	it("drops the button when the browser's dialog fails to open", async () => {
		render(<InstallAppButton />)
		const event = fireBeforeInstallPrompt()
		event.prompt.mockRejectedValueOnce(new Error("not allowed"))
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Instalar la app" }))
		})
		expect(screen.queryByRole("button", { name: "Instalar la app" })).not.toBeInTheDocument()
	})

	it("catches an offer made before the button mounted", () => {
		fireBeforeInstallPrompt()
		render(<InstallAppButton />)
		expect(screen.getByRole("button", { name: "Instalar la app" })).toBeInTheDocument()
	})

	it("installed: opened as an app shows the confirmation and no button", () => {
		setStandalone(true)
		render(<InstallAppButton />)
		expect(screen.getByText("Ya tenés la app instalada ✓")).toBeInTheDocument()
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	it("installed: the appinstalled event switches to the confirmation", () => {
		render(<InstallAppButton />)
		fireBeforeInstallPrompt()
		act(() => {
			window.dispatchEvent(new Event("appinstalled"))
		})
		expect(screen.getByText("Ya tenés la app instalada ✓")).toBeInTheDocument()
	})

	it("iPhone Safari: shows the Compartir → Agregar a inicio hint and no button", () => {
		setUserAgent(IPHONE_SAFARI)
		render(<InstallAppButton />)
		expect(screen.getByText(/Compartir/).closest("p")).toHaveTextContent(/Compartir ↑.*Agregar a inicio/)
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	it("iPhone with another browser: says to open it in Safari", () => {
		setUserAgent(IPHONE_CHROME)
		render(<InstallAppButton />)
		expect(screen.getByText(/Safari/).closest("p")).toHaveTextContent(/Safari.*Agregar a inicio/)
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	it("unsupported: no offer from the browser shows the manual line and no dead button", () => {
		render(<InstallAppButton />)
		expect(screen.getByText(/menú del navegador/)).toBeInTheDocument()
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})
})
