/**
 * Password rules shared by register and reset-password. They mirror the API
 * (neptuno RegisterUserDto / ResetPasswordDto), so the API never rejects a
 * password this lets through: that would surface as a generic error, or on
 * reset as "link inválido".
 */

/**
 * Length the way the API's class-validator @Length counts it: an emoji (a
 * surrogate pair) is one character, and emoji variation selectors don't count.
 */
export const passwordLength = (value: string) =>
	Array.from(value).filter((c) => c !== '\uFE0F' && c !== '\uFE0E').length;

/** bcrypt ignores everything past 72 bytes; ñ takes 2, an emoji 4. Measured in NFC like the API hashes it. */
export const PASSWORD_MAX_BYTES = 72;

export const passwordBytes = (value: string) => new TextEncoder().encode(value.normalize('NFC')).length;

export const PASSWORD_ERRORS = {
	tooShort: 'La contraseña al menos debe tener 6 caracteres',
	tooLong: 'La contraseña debe tener 50 caracteres o menos',
	tooManyBytes: 'La contraseña es demasiado larga: usá menos emojis, tildes o ñ',
} as const;

/** The first rule the password breaks, or null when it is valid. */
export function passwordProblem(password: string): string | null {
	if (passwordLength(password) < 6) return PASSWORD_ERRORS.tooShort;
	if (passwordLength(password) > 50) return PASSWORD_ERRORS.tooLong;
	if (passwordBytes(password) > PASSWORD_MAX_BYTES) return PASSWORD_ERRORS.tooManyBytes;
	return null;
}
