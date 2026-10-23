import { formatToBalance } from "@/lib/quick-spend-constants";

const norm = (s: string) => s.replace(/\s/g, " ");

describe("formatToBalance", () => {
	it("defaults to pesos with a single symbol", () => {
		expect(norm(formatToBalance(0))).toBe("$ 0");
		expect(norm(formatToBalance(1500))).toBe("$ 1.500");
	});

	it("formats other currencies with their own symbol, not an extra $", () => {
		const usd = norm(formatToBalance(1500, "USD"));
		expect(usd).toContain("1.500");
		expect(usd.match(/\$/g)).toHaveLength(1);
		expect(usd).not.toBe("$ 1.500");
	});

	it("falls back to pesos for an unknown currency code", () => {
		expect(norm(formatToBalance(10, "???"))).toBe("$ 10");
	});
});
