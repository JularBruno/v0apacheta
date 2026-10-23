/**
 * Onboarding (/onboarding) walks 6 steps and submits the register server action.
 * The action is mocked: these tests cover the client flow, what gets submitted,
 * and how server errors come back to the user.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingPage from "@/app/onboarding/page";
import { register } from "@/lib/actions/user";

jest.mock("@/lib/actions/user", () => ({
	register: jest.fn(),
}));

jest.mock("@/components/auth/auth-shell", () => ({
	__esModule: true,
	default: ({ children, subtitle }: { children: React.ReactNode; subtitle: string }) => (
		<div>
			<p data-testid="subtitle">{subtitle}</p>
			{children}
		</div>
	),
}));

const mockRegister = register as jest.Mock;

beforeAll(() => {
	window.scrollTo = jest.fn();
});

beforeEach(() => {
	mockRegister.mockReset();
	mockRegister.mockResolvedValue({ errors: {}, message: null });
});

const next = () => userEvent.click(screen.getByRole("button", { name: "Siguiente" }));

/** Walks steps 1-5 and leaves the user on the email/password step. */
async function reachAccountStep(name = "Bruno", answers: [string, string, string] = ["Tener un fondo de emergencia", "Básico (casi nulo)", "Casi nunca o nunca"]) {
	await userEvent.type(screen.getByLabelText("Tu Nombre"), name);
	await next();
	for (const answer of answers) {
		await userEvent.click(screen.getByLabelText(answer));
		await next();
	}
	await next(); // step 5, the map message
	expect(screen.getByTestId("subtitle")).toHaveTextContent("Crea tu cuenta.");
	// step 6 focuses the email field after 150ms; typing before that would be split across fields
	await waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus());
}

async function fillAndSubmit(email: string, password: string) {
	if (email) await userEvent.type(screen.getByLabelText("Email"), email);
	if (password) await userEvent.type(screen.getByLabelText("Contraseña"), password);
	await userEvent.click(screen.getByRole("button", { name: "Terminar Registro" }));
}

function submitted(): Record<string, string> {
	expect(mockRegister).toHaveBeenCalled();
	const formData: FormData = mockRegister.mock.calls.at(-1)[1];
	return Object.fromEntries(formData.entries()) as Record<string, string>;
}

describe("Onboarding: step 1 (name)", () => {
	it("blocks an empty or whitespace-only name", async () => {
		render(<OnboardingPage />);
		await next();
		expect(screen.getByText("Ingresa un nombre")).toBeInTheDocument();

		await userEvent.type(screen.getByLabelText("Tu Nombre"), "   ");
		await next();
		expect(screen.getByText("Ingresa un nombre")).toBeInTheDocument();
		expect(screen.getByLabelText("Tu Nombre")).toBeInTheDocument();
	});

	it("blocks a name longer than the API's 30 characters", async () => {
		render(<OnboardingPage />);
		await userEvent.type(screen.getByLabelText("Tu Nombre"), "a".repeat(31));
		await next();
		expect(screen.getByText(/30 caracteres/)).toBeInTheDocument();
		expect(screen.getByLabelText("Tu Nombre")).toBeInTheDocument();
	});

	it("pressing Enter in the name field advances instead of submitting the form", async () => {
		render(<OnboardingPage />);
		await userEvent.type(screen.getByLabelText("Tu Nombre"), "Bruno{enter}");
		expect(mockRegister).not.toHaveBeenCalled();
		expect(screen.getByText(/logro ideal/)).toBeInTheDocument();
	});
});

describe("Onboarding: questions", () => {
	it("needs an answer before moving on, and Atrás keeps the answers", async () => {
		render(<OnboardingPage />);
		await userEvent.type(screen.getByLabelText("Tu Nombre"), "Bruno");
		await next();
		expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();

		await userEvent.click(screen.getByLabelText("Invertir montos pequeños"));
		await next();
		await userEvent.click(screen.getByRole("button", { name: "Atrás" }));
		expect(screen.getByLabelText("Invertir montos pequeños")).toBeChecked();

		await userEvent.click(screen.getByRole("button", { name: "Atrás" }));
		expect(screen.getByLabelText("Tu Nombre")).toHaveValue("Bruno");
	});

	it.each([
		[["Tener un fondo de emergencia", "Básico (casi nulo)", "Casi nunca o nunca"], "daily"], // 3
		[["Pagar deudas como tarjetas de crédito", "Intermedio (conozco algunos conceptos)", "Una vez al mes"], "weekly"], // 6
		[["Invertir montos pequeños", "Experto (soy un profesional del sector)", "Todos los días"], "monthly"], // 12
	] as const)("answers %j submit notificationFrequency=%s", async (answers, frequency) => {
		render(<OnboardingPage />);
		await reachAccountStep("Bruno", [...answers]);
		await fillAndSubmit("bruno@gmail.com", "secreta123");

		expect(submitted()).toEqual({
			name: "Bruno",
			email: "bruno@gmail.com",
			password: "secreta123",
			notificationFrequency: frequency,
			mapLevel: "1.0",
		});
	});
});

describe("Onboarding: step 6 (email + password)", () => {
	it("submits names, emails and passwords with special characters untouched", async () => {
		render(<OnboardingPage />);
		await reachAccountStep("Íñigo Muñoz");
		await fillAndSubmit("o'brien+apacheta@gmail.com", "contraseña ñandú 😀 <>&\"'");

		expect(submitted()).toMatchObject({
			name: "Íñigo Muñoz",
			email: "o'brien+apacheta@gmail.com",
			password: "contraseña ñandú 😀 <>&\"'",
		});
	});

	it("shows server field errors and clears each one when that field is edited", async () => {
		mockRegister.mockResolvedValue({
			errors: { email: ["Formato de email incorrecto"], password: ["La contraseña al menos debe tener 6 caracteres"] },
			message: "Missing fields.",
			formData: { name: "Bruno", email: "ñandu@gmail.com", password: "123" },
		});
		render(<OnboardingPage />);
		await reachAccountStep();
		await fillAndSubmit("ñandu@gmail.com", "123");

		expect(await screen.findByText("Formato de email incorrecto")).toBeInTheDocument();
		expect(screen.getByText(/al menos debe tener 6/)).toBeInTheDocument();

		await userEvent.type(screen.getByLabelText("Email"), "x");
		expect(screen.queryByText("Formato de email incorrecto")).not.toBeInTheDocument();
		expect(screen.getByText(/al menos debe tener 6/)).toBeInTheDocument();
	});

	it("after a server error the user can go back and still edit their name", async () => {
		mockRegister.mockResolvedValue({
			errors: { email: ["Este email está en uso"] },
			message: "Email already exists.",
			formData: { name: "Bruno", email: "bruno@gmail.com", password: "secreta123" },
		});
		render(<OnboardingPage />);
		await reachAccountStep();
		await fillAndSubmit("bruno@gmail.com", "secreta123");
		await screen.findByText("Este email está en uso");

		for (let i = 0; i < 5; i++) await userEvent.click(screen.getByRole("button", { name: "Atrás" }));
		const name = screen.getByLabelText("Tu Nombre");
		await userEvent.clear(name);
		await userEvent.type(name, "Ana");
		expect(name).toHaveValue("Ana");
	});

	it("keeps email and password in their fields after a server error (the server never echoes the password)", async () => {
		mockRegister.mockResolvedValue({ errors: { email: ["Este email está en uso"] }, formData: { name: "Bruno", email: "bruno@gmail.com" } });
		render(<OnboardingPage />);
		await reachAccountStep();
		await fillAndSubmit("bruno@gmail.com", "secreta123");
		await screen.findByText("Este email está en uso");

		expect(screen.getByLabelText("Email")).toHaveValue("bruno@gmail.com");
		expect(screen.getByLabelText("Contraseña")).toHaveValue("secreta123");
	});

	it("Atrás and back again keeps what was typed in email and password", async () => {
		render(<OnboardingPage />);
		await reachAccountStep();
		await userEvent.type(screen.getByLabelText("Email"), "bruno@gmail.com");
		await userEvent.type(screen.getByLabelText("Contraseña"), "secreta123");
		await userEvent.click(screen.getByRole("button", { name: "Atrás" }));
		await next();

		expect(screen.getByLabelText("Email")).toHaveValue("bruno@gmail.com");
		expect(screen.getByLabelText("Contraseña")).toHaveValue("secreta123");
	});

	it("Enter in the password field submits the registration", async () => {
		render(<OnboardingPage />);
		await reachAccountStep();
		await userEvent.type(screen.getByLabelText("Email"), "bruno@gmail.com");
		await userEvent.type(screen.getByLabelText("Contraseña"), "secreta123{enter}");
		expect(submitted()).toMatchObject({ email: "bruno@gmail.com", password: "secreta123" });
	});
});
