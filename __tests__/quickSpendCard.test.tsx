// @jest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import InicioPage from "@/app/dashboard/inicio/page";
import { DashboardUserContext } from "@/app/dashboard/dashboardContext";
import { TxType } from "@/lib/schemas/definitions";
import userEvent from "@testing-library/user-event";
import { revalidateTag } from "next/cache";

global.fetch = jest.fn().mockResolvedValue({
	ok: true,
	json: async () => ({ success: true }),
});

jest.mock("@/lib/actions/movements", () => ({
	postMovement: jest.fn().mockImplementation((data) =>
		Promise.resolve(data) // ← return exactly what was passed in
	),
}));

jest.mock("@/lib/actions/tags", () => ({  // 👈 adjust path
	getTagsByUser: jest.fn().mockResolvedValue([]),
}));

jest.mock("next/cache", () => ({
	revalidateTag: jest.fn(),
}));
const mockRevalidateTag = revalidateTag as jest.Mock;

// ── mock context value ──
const mockContextValue = {
	user: {
		id: 'string',
		name: 'string',
		email: 'string',
		password: 'string',
		balance: 0,
		totalBudget: 0
	},
	userBalance: 0,
	// userBalance: 15000,
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

async function fillQuickSpendFormAndSubmit(user: ReturnType<typeof userEvent.setup>, {
	transactionType = TxType.EXPENSE,
	category = "Hogar",
	amount = "500",
	description = "test",
} = {}) {
	if (transactionType === TxType.EXPENSE) {
		await user.click(screen.getByRole("tab", { name: "💸 Gasto" }));
		// await user.click(screen.getByTestId("quickspendcard-expense"));
	} else {
		await user.click(screen.getByRole("tab", { name: "💰 Ingreso" }));
		// await user.click(screen.getByTestId("quickspendcard-income"));
	}

	await user.click(screen.getByRole("button", { name: category }));
	await user.type(screen.getByTestId("description-input"), description);
	await user.type(screen.getByTestId("amount-input"), amount);

	const submitBtn = screen.getByTestId("submit-button");

	await user.click(submitBtn);
}

describe("InicioPage", () => {

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

		expect(screen.getByRole("button", { name: "Trabajo" })).toBeInTheDocument();
	});

	it("basic balance update and decrease", async () => {

		// ARRANGE
		const user = userEvent.setup();

		renderWithContext({
			...mockContextValue,
			userBalance: 0
		});

		// ── INCOME ──

		// ACT
		await fillQuickSpendFormAndSubmit(user, {
			transactionType: TxType.INCOME,
			category: 'Trabajo',
			amount: "10000",
			description: 'trabajotest',
		})

		await waitFor(() => {
			expect(mockContextValue.setUserBalance).toHaveBeenCalledWith(10000);
		});

		// ── EXPENSE ──
		cleanup();
		jest.clearAllMocks();

		renderWithContext({ ...mockContextValue, userBalance: 10000 });

		// ACT
		await fillQuickSpendFormAndSubmit(user, {
			transactionType: TxType.EXPENSE,
			category: 'Hogar',
			amount: "3000",
			description: 'Hogartest',
		})

		// ASSERT
		await waitFor(() => {
			expect(mockContextValue.setUserBalance).toHaveBeenCalledWith(7000);
		});

		await waitFor(() => {
			expect(mockRevalidateTag).toHaveBeenCalledWith('user');
		});

	});

	// screen.debug(undefined, 30000); // ← increase character limit

});