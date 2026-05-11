// @jest-environment jsdom

import { render, screen } from "@testing-library/react";
import { useActionState } from "react";
import LoginPage from "@/app/login/page";
import userEvent from '@testing-library/user-event'

jest.mock("react", () => ({
	...jest.requireActual("react"),
	useActionState: jest.fn(),
}));

jest.mock("next/navigation", () => ({
	useSearchParams: () => ({ get: () => "/" }),
}));

const mockUseActionState = useActionState as jest.Mock;

describe("LoginForm", () => {

	it("shows error message when credentials are wrong", () => {
		mockUseActionState.mockReturnValue(["Contraseña incorrecta", jest.fn(), false]);

		render(<LoginPage />);

		expect(screen.getByText("Contraseña incorrecta")).toBeInTheDocument();
	});

	it("calls formAction when form is submitted", async () => {
		const mockFormAction = jest.fn();
		mockUseActionState.mockReturnValue([undefined, mockFormAction, false]);

		render(<LoginPage />);

		await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
		await userEvent.type(screen.getByLabelText(/contraseña/i), "password123");
		await userEvent.click(screen.getByRole("button", { name: /ingresar/i }));

		expect(mockFormAction).toHaveBeenCalled();
	});

	// it("returns error when credentials wrong", async () => {
	// 	mockSignIn.mockRejectedValue({ type: 'CredentialsSignin', instanceof: AuthError });
	// 	const result = await authenticate(undefined, makeFormData("u@u.com", "pass"));
	// 	expect(result).toBe("Credenciales incorrectas");
	// });

});