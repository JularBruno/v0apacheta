/**
 * register() server action: validation of name/email/password (with the edge
 * cases people actually type: ñ, accents, emoji, spaces, very long values) and
 * how API answers are turned into form errors.
 *
 * The frontend rules mirror the API's RegisterUserDto (neptuno): name 1-30,
 * password 6-50 characters counted like class-validator's Length (an emoji is
 * one character), email valid. Anything the frontend lets through but the API
 * rejects ends up as a generic "Algo salió mal." under the email field, so the
 * two must agree.
 */
import { register, resetPassword } from '@/lib/actions/user';
import { postMethod } from '@/lib/actions/utils';
import { signIn } from '@/auth';
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({ redirect: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/auth', () => ({ signIn: jest.fn(), signOut: jest.fn() }));
jest.mock('@/lib/actions/utils', () => ({
	postMethod: jest.fn(),
	getSession: jest.fn(),
	getMethodWithoutSession: jest.fn(),
	putMethod: jest.fn(),
}));

const mockPost = postMethod as jest.Mock;
const mockSignIn = signIn as jest.Mock;
const mockRedirect = redirect as unknown as jest.Mock;

const initial = { errors: {}, message: null };

function form(fields: Record<string, string>) {
	const fd = new FormData();
	for (const [k, v] of Object.entries(fields)) fd.append(k, v);
	return fd;
}

const valid = { name: 'Bruno', email: 'bruno@gmail.com', password: 'secreta123', notificationFrequency: 'weekly', mapLevel: '1.0' };

const run = (overrides: Record<string, string> = {}) => register(initial, form({ ...valid, ...overrides }));

beforeEach(() => {
	jest.clearAllMocks();
	jest.spyOn(console, 'log').mockImplementation(() => {});
	mockPost.mockResolvedValue({ id: 'u1' });
	mockSignIn.mockResolvedValue(undefined);
});

describe('register: happy path', () => {
	it('creates the user, signs in with the same credentials and goes to the map', async () => {
		await run();

		expect(mockPost).toHaveBeenCalledWith(
			'user/register',
			{ name: 'Bruno', email: 'bruno@gmail.com', password: 'secreta123', notificationFrequency: 'weekly', mapLevel: '1.0' },
			false,
		);
		expect(mockSignIn).toHaveBeenCalledWith('credentials', { email: 'bruno@gmail.com', password: 'secreta123' });
		expect(mockRedirect).toHaveBeenCalledWith('/dashboard/mapa');
	});

	it('defaults notificationFrequency and mapLevel when the hidden inputs are missing', async () => {
		await register(initial, form({ name: 'Bruno', email: 'bruno@gmail.com', password: 'secreta123' }));
		expect(mockPost.mock.calls[0][1]).toMatchObject({ notificationFrequency: 'daily', mapLevel: '1.0' });
	});

	it('still lands on the map if the automatic sign-in fails (user was created)', async () => {
		mockSignIn.mockRejectedValue(new Error('CredentialsSignin'));
		await run();
		expect(mockRedirect).toHaveBeenCalledWith('/dashboard/mapa');
	});
});

describe('register: name', () => {
	it.each(['Íñigo Muñoz', 'José María', "D'Angelo", 'Zoë', '李雷', 'a'.repeat(30)])('accepts %j', async (name) => {
		const result = await run({ name });
		expect(result).toBeUndefined();
		expect(mockPost.mock.calls[0][1].name).toBe(name);
	});

	it('trims surrounding spaces', async () => {
		await run({ name: '  Bruno  ' });
		expect(mockPost.mock.calls[0][1].name).toBe('Bruno');
	});

	it.each([
		['missing', undefined],
		['empty', ''],
		['only spaces', '    '],
		['31 characters (API max is 30)', 'a'.repeat(31)],
	])('rejects a name that is %s, without calling the API', async (_, name) => {
		const fields: Record<string, string> = { ...valid };
		if (name === undefined) delete fields.name; else fields.name = name;

		const result = await register(initial, form(fields));

		expect(result?.errors).toHaveProperty('name');
		expect(result?.message).toBe('Missing fields.');
		expect(mockPost).not.toHaveBeenCalled();
	});
});

describe('register: email', () => {
	it.each([
		'bruno@gmail.com',
		'Bruno.Jular@Gmail.com',
		'bruno+apacheta@gmail.com',
		"o'brien@empresa.com.ar",
		'nombre_apellido-99@sub.dominio.gob.ar',
		'user@xn--espaa-rta.com', // españa.com in punycode
	])('accepts %j and sends it as typed', async (email) => {
		const result = await run({ email });
		expect(result).toBeUndefined();
		expect(mockPost.mock.calls[0][1].email).toBe(email);
	});

	it('trims spaces pasted around the email, and signs in with the trimmed one', async () => {
		await run({ email: '  bruno@gmail.com  ' });
		expect(mockPost.mock.calls[0][1].email).toBe('bruno@gmail.com');
		expect(mockSignIn.mock.calls[0][1].email).toBe('bruno@gmail.com');
	});

	it.each([
		['ñ in the local part', 'ñandu@gmail.com'],
		['accent in the local part', 'josé@gmail.com'],
		['ñ in the domain', 'user@españa.com'],
		['fullwidth letter', 'ａna@gmail.com'],
		['quoted local part', '"bruno"@gmail.com'],
		['space inside', 'bru no@gmail.com'],
		['html', '<script>@x.com'],
		['no domain dot', 'bruno@gmail'],
		['one-letter TLD', 'bruno@gmail.c'],
		['double dot', 'bru..no@gmail.com'],
		['trailing dot', 'bruno.@gmail.com'],
		['no @', 'bruno.gmail.com'],
		['two @', 'bru@no@gmail.com'],
		['empty', ''],
		['newline', 'bruno@gmail.com\nbcc@evil.com'],
		['local part over 64 chars', `${'a'.repeat(65)}@gmail.com`],
		['over 254 chars', `${'a'.repeat(60)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(63)}.com`],
		['domain label over 63 chars', `bruno@${'b'.repeat(64)}.com`],
	])('rejects %s (%j) with "Formato de email incorrecto"', async (_, email) => {
		const result = await run({ email });

		expect(result?.errors?.email).toEqual(['Formato de email incorrecto']);
		expect(mockPost).not.toHaveBeenCalled();
	});
});

describe('register: password', () => {
	it.each([
		['exactly 6', '123456'],
		['exactly 50', 'a'.repeat(50)],
		['ñ and accents', 'contraseña'],
		['spaces', 'mi clave larga'],
		['only spaces', '      '],
		['symbols and quotes', `<>&"'\\/%{}$\``],
		['6 emoji (6 characters for the API)', '😀😀😀😀😀😀'],
		['18 emoji (72 bytes)', '😀'.repeat(18)],
		['36 ñ (72 bytes)', 'ñ'.repeat(36)],
		['ñ typed decomposed (n + tilde, some keyboards)', 'contraseña'.normalize('NFD')],
	])('accepts %s and sends it unchanged', async (_, password) => {
		const result = await run({ password });

		expect(result).toBeUndefined();
		expect(mockPost.mock.calls[0][1].password).toBe(password);
		expect(mockSignIn.mock.calls[0][1].password).toBe(password);
	});

	it.each([
		['5 characters', '12345', /al menos/],
		['5 ñ', 'ñññññ', /al menos/],
		['3 emoji', '😀😀😀', /al menos/],
		['51 characters', 'a'.repeat(51), /50 caracteres o menos/],
		['51 emoji', '😀'.repeat(51), /50 caracteres o menos/],
		['19 emoji: under 50 chars but over the 72 bytes bcrypt reads', '😀'.repeat(19), /demasiado larga/],
		['37 ñ: 74 bytes', 'ñ'.repeat(37), /demasiado larga/],
		['empty', '', /al menos/],
	])('rejects %s', async (_, password, message) => {
		const result = await run({ password });

		expect(result?.errors?.password?.[0]).toMatch(message);
		expect(mockPost).not.toHaveBeenCalled();
	});

	it('never echoes the password back to the browser', async () => {
		const invalid = await run({ email: 'nope', password: 'secreta123' });
		expect(invalid?.formData).not.toHaveProperty('password');

		mockPost.mockRejectedValue(Object.assign(new Error('Email already in use'), { statusCode: 409 }));
		const conflict = await run();
		expect(conflict?.formData).not.toHaveProperty('password');
	});
});

describe('register: API answers', () => {
	it('409 -> "Este email está en uso", keeps name and email, does not sign in', async () => {
		mockPost.mockRejectedValue(Object.assign(new Error('Email already in use'), { statusCode: 409, status: 409 }));

		const result = await run();

		expect(result).toMatchObject({
			errors: { email: ['Este email está en uso'] },
			formData: { name: 'Bruno', email: 'bruno@gmail.com' },
		});
		expect(mockSignIn).not.toHaveBeenCalled();
		expect(mockRedirect).not.toHaveBeenCalled();
	});

	it.each([
		['400 validation', { statusCode: 400, status: 400 }],
		['500', { statusCode: 500, status: 500 }],
		['network down', {}],
	])('%s -> generic "Algo salió mal." and no redirect', async (_, extra) => {
		mockPost.mockRejectedValue(Object.assign(new Error('boom'), extra));

		const result = await run();

		expect(result?.errors?.email).toEqual(['Algo salió mal.']);
		expect(mockRedirect).not.toHaveBeenCalled();
	});
});

describe('resetPassword: same password rules, checked before calling the API', () => {
	it.each([
		['5 characters', '12345', /al menos/],
		['51 characters', 'a'.repeat(51), /50 caracteres o menos/],
		['37 ñ', 'ñ'.repeat(37), /demasiado larga/],
	])('%s -> that rule, not "link inválido"', async (_, password, message) => {
		const result = await resetPassword('token', password);
		expect(result?.error).toMatch(message);
		expect(mockPost).not.toHaveBeenCalled();
	});

	it('a valid password goes to the API and redirects to /login', async () => {
		mockPost.mockResolvedValue({ message: 'Password updated' });
		await resetPassword('token', 'contraseña nueva');
		expect(mockPost).toHaveBeenCalledWith('user/reset-password', { token: 'token', password: 'contraseña nueva' }, false);
		expect(mockRedirect).toHaveBeenCalledWith('/login');
	});

	it('an API 400 is still the expired-link message', async () => {
		mockPost.mockRejectedValue(Object.assign(new Error('Invalid or expired reset token'), { status: 400 }));
		expect(await resetPassword('token', 'contraseña nueva')).toEqual({ error: 'Este link es inválido o venció. Pedí uno nuevo.' });
	});
});
