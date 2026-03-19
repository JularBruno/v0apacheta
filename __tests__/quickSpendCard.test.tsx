// @jest-environment jsdom
import { render, screen } from "@testing-library/react";
import InicioPage from "@/app/dashboard/inicio/page";
import { DashboardUserContext } from "@/app/dashboard/dashboardContext";
import { TxType } from "@/lib/schemas/definitions";
import userEvent from "@testing-library/user-event";

// ── mock context value ──
const mockContextValue = {
	// user: { id: "1", email: "test@test.com", name: "Test" },
	user: {
		id: 'string',
		name: 'string',
		email: 'string',
		password: 'string',
		balance: 0,
		totalBudget: 0
	},
	userBalance: 15000,
	loadingUser: false,
	error: null,
	setUserBalance: jest.fn(),
	cats: [
		{
			"id": "ea96ee95-c0fa-44b9-b059-6de0c25fb95e",
			"name": "Trabajo",
			"userId": "47a8f807-f9cc-4595-8bea-ce7c1ca06ff7",
			"icon": "Briefcase",
			"color": "bg-gray-500",
			"budget": 1000000,
			"type": TxType.INCOME,
			"createdAt": "2025-10-08T12:40:15.188Z",
			"updatedAt": "2026-03-19T18:40:34.941Z",
		},
		{
			id: "227b6ca9-58e0-4451-ada9-f412e2765e5c",
			name: "Hogar",
			userId: "47a8f807-f9cc-4595-8bea-ce7c1ca06ff7",
			icon: "Home",
			color: "bg-purple-500",
			budget: 1111400.8,
			type: TxType.EXPENSE,
			createdAt: "2025-10-08T12:40:15.188Z",
			updatedAt: "2026-03-10T19:00:22.293Z",
		}
	],
	setCats: jest.fn(),
	loadingCats: false,
	allTags: [],
	setAllTags: jest.fn(),
	loadingTags: false,
	budgetedCats: [],
	setBudgetedCats: jest.fn(),
	loadingBudgetedCats: false,
};

// ── helper: wraps component with mocked context ──
function renderWithContext(contextValue = mockContextValue) {
	return render(
		<DashboardUserContext.Provider value={contextValue}>
			<InicioPage />
		</DashboardUserContext.Provider>
	);
}

describe("InicioPage", () => {
	it("renders user balance", () => {
		renderWithContext();
		expect(screen.getByText(/15\.000/)).toBeInTheDocument(); // adjust to your formatToBalance output
	});

	// it("shows loading when user is loading", () => {
	// 	renderWithContext({ ...mockContextValue, loadingUser: true });
	// 	expect(screen.getByText(/loading/i)).toBeInTheDocument();
	// });

	it("shows $0 when balance is zero", () => {
		renderWithContext({ ...mockContextValue, userBalance: 0 });
		expect(screen.getByText("$0")).toBeInTheDocument();
	});

	it("renders categories as buttons", async () => {
		const user = userEvent.setup(); // ← always setup first

		renderWithContext({
			...mockContextValue
		});

		expect(screen.getByRole("button", { name: "Hogar" })).toBeInTheDocument();

		await user.click(screen.getByRole("tab", { name: "💰 Ingreso" }));

		// expect(screen.getByRole("tab", { name: "💰 Ingreso" })).toHaveAttribute("aria-selected", "true");

		expect(screen.getByRole("button", { name: "Trabajo" })).toBeInTheDocument();

	});

});