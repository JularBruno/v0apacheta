const nextJest = require('next/jest')

const createJestConfig = nextJest({
	dir: './',
})

const customJestConfig = {
	testEnvironment: 'jest-environment-jsdom',
	setupFiles: ['<rootDir>/jest.polyfills.js'],      // runs first, no jest globals needed
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],  // runs after, jest globals available
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
	testMatch: [
		'**/__tests__/**/*.(ts|tsx|js)',
		'**/*.(test|spec).(ts|tsx|js)',
	],
}

const jestConfigWithNext = createJestConfig(customJestConfig)

module.exports = async () => {
	const config = await jestConfigWithNext()

	config.transformIgnorePatterns = [
		// next/jest sets this — we replace it to allow ESM packages through
		'/node_modules/(?!(next-auth|@auth/core|oauth4webapi|@panva\/hkdf|preact-render-to-string|preact|jose)/)',

	]

	return config
}