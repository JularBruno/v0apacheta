import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SubscriptionButtonNotification from "@/components/notifications/subscription-notification-button"
import { toast } from "@/hooks/use-toast"

jest.mock("@/hooks/use-toast", () => ({ toast: jest.fn() }))
// the install hint has its own tests (T-003); here we only check it's shown
jest.mock("@/components/pwa/install-app-button", () => ({ InstallAppButton: () => <p>install-hint</p> }))

const subscribeMutate = jest.fn()
const unsubscribeMutate = jest.fn()
const refetch = jest.fn()
let query: { data?: { endpoint: string }[]; isLoading: boolean; isError: boolean; isFetching?: boolean; refetch: jest.Mock }

jest.mock("@/lib/hooks/use-subscription-notification", () => ({
	useSubscriptionNotifications: () => query,
	useSubscribe: () => ({ mutateAsync: subscribeMutate, isPending: false }),
	useUnsubscribe: () => ({ mutateAsync: unsubscribeMutate, isPending: false }),
}))

const DESKTOP = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"

function browserSub(endpoint: string) {
	return {
		endpoint,
		unsubscribe: jest.fn(async () => true),
		toJSON: () => ({ endpoint, keys: { p256dh: "p", auth: "a" } }),
	}
}

let pushManager: { getSubscription: jest.Mock; subscribe: jest.Mock }

function setBrowser({ ua = DESKTOP, push = true, permission = "granted", standalone = false, existing = null as ReturnType<typeof browserSub> | null } = {}) {
	Object.defineProperty(window.navigator, "userAgent", { value: ua, configurable: true })
	Object.defineProperty(window.navigator, "standalone", { value: standalone, configurable: true })
	window.matchMedia = jest.fn().mockImplementation((q: string) => ({ matches: q === "(display-mode: standalone)" && standalone, media: q, addEventListener: jest.fn(), removeEventListener: jest.fn() })) as never
	pushManager = { getSubscription: jest.fn(async () => existing), subscribe: jest.fn() }
	const registration = { pushManager }
	if (push) {
		Object.defineProperty(window.navigator, "serviceWorker", {
			value: { register: jest.fn(async () => registration), ready: Promise.resolve(registration) },
			configurable: true,
		})
		;(window as any).PushManager = function PushManager() {}
	} else {
		delete (window.navigator as any).serviceWorker
		delete (window as any).PushManager
	}
	;(window as any).Notification = { permission, requestPermission: jest.fn(async () => "granted") }
}

beforeEach(() => {
	jest.clearAllMocks()
	query = { data: [], isLoading: false, isError: false, refetch }
	subscribeMutate.mockResolvedValue({})
	unsubscribeMutate.mockResolvedValue({})
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "BElmAQ"
})

const activate = () => screen.findByRole("button", { name: /Activar notificaciones/ })

describe("SubscriptionButtonNotification", () => {
	it("a browser subscription the API doesn't have shows Activar, and activating sends it again", async () => {
		const sub = browserSub("https://push.example/1")
		setBrowser({ existing: sub })
		pushManager.subscribe.mockResolvedValue(sub)
		render(<SubscriptionButtonNotification />)
		await userEvent.setup().click(await activate())
		await waitFor(() => expect(subscribeMutate).toHaveBeenCalledWith({ endpoint: "https://push.example/1", p256dh: "p", auth: "a" }))
		expect(await screen.findByRole("button", { name: /Desactivar notificaciones/ })).toBeInTheDocument()
	})

	it("a subscription already in the API shows Desactivar", async () => {
		setBrowser({ existing: browserSub("https://push.example/1") })
		query.data = [{ endpoint: "https://push.example/1" }]
		render(<SubscriptionButtonNotification />)
		expect(await screen.findByRole("button", { name: /Desactivar notificaciones/ })).toBeInTheDocument()
	})

	it("an old subscription made with another key is replaced, not a dead end", async () => {
		const old = browserSub("https://push.example/old")
		const fresh = browserSub("https://push.example/new")
		setBrowser()
		pushManager.subscribe
			.mockRejectedValueOnce(Object.assign(new Error("key mismatch"), { name: "InvalidStateError" }))
			.mockResolvedValueOnce(fresh)
		render(<SubscriptionButtonNotification />)
		const button = await activate()
		pushManager.getSubscription.mockResolvedValue(old)
		await userEvent.setup().click(button)
		await waitFor(() => expect(subscribeMutate).toHaveBeenCalledWith(expect.objectContaining({ endpoint: "https://push.example/new" })))
		expect(old.unsubscribe).toHaveBeenCalled()
		expect(unsubscribeMutate).toHaveBeenCalledWith("https://push.example/old")
		expect(pushManager.subscribe).toHaveBeenCalledTimes(2)
	})

	it("if the API can't remove it, the browser stays subscribed and the person is told", async () => {
		const sub = browserSub("https://push.example/1")
		setBrowser({ existing: sub })
		query.data = [{ endpoint: "https://push.example/1" }]
		unsubscribeMutate.mockRejectedValue(new Error("500"))
		render(<SubscriptionButtonNotification />)
		await userEvent.setup().click(await screen.findByRole("button", { name: /Desactivar notificaciones/ }))
		await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" })))
		expect(sub.unsubscribe).not.toHaveBeenCalled()
		expect(screen.getByRole("button", { name: /Desactivar notificaciones/ })).toBeInTheDocument()
	})

	it("iPhone not installed: says it needs the installed app, shows the install hint, no button", async () => {
		setBrowser({ ua: IPHONE, push: false })
		render(<SubscriptionButtonNotification />)
		expect(await screen.findByText(/En iPhone, las notificaciones funcionan solo con la app instalada/)).toBeInTheDocument()
		expect(screen.getByText("install-hint")).toBeInTheDocument()
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	it("iPhone with the app installed: the normal button", async () => {
		setBrowser({ ua: IPHONE, standalone: true })
		render(<SubscriptionButtonNotification />)
		expect(await activate()).toBeInTheDocument()
		expect(screen.queryByText(/solo con la app instalada/)).not.toBeInTheDocument()
	})

	it("a browser without push says so on the card", async () => {
		setBrowser({ push: false })
		render(<SubscriptionButtonNotification />)
		expect(await screen.findByText(/Tu navegador no permite notificaciones/)).toBeInTheDocument()
	})

	it("blocked permission says how to unblock, on the card", async () => {
		setBrowser({ permission: "denied" })
		render(<SubscriptionButtonNotification />)
		expect(await screen.findByText(/Las bloqueaste/)).toBeInTheDocument()
	})

	it("if the status can't be loaded, it offers a retry instead of staying stuck", async () => {
		setBrowser()
		query = { data: undefined, isLoading: false, isError: true, refetch }
		render(<SubscriptionButtonNotification />)
		await userEvent.setup().click(await screen.findByRole("button", { name: /Reintentar/ }))
		expect(refetch).toHaveBeenCalled()
	})
})
