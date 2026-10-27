/**
 * Spanish names for the currencies the API supports (GET /v1/currency only
 * sends the code). Unknown codes fall back to the code itself.
 */
const NAMES: Record<string, string> = {
	ARS: "Peso argentino",
	USD: "Dólar estadounidense",
	NOK: "Corona noruega",
	BRL: "Real brasileño",
	CLP: "Peso chileno",
}

export function currencyName(code: string): string {
	return NAMES[code] ?? code
}
