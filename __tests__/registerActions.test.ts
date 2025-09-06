/**
 * @jest-environment node
 */

// __tests__/register.test.ts
import { register } from '../lib/actions/user';

// Mock Next.js redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock your postMethod and signIn functions
jest.mock('../lib/utils', () => ({
  postMethod: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('Register action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate required fields', async () => {
    const formData = new FormData();
    // Don't add name - should fail validation
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    const result = await register(
      { errors: {}, message: null }, 
      formData
    );

    expect(result.errors?.name).toBeDefined();
    expect(result.message).toBe('Missing fields.');
  });
});