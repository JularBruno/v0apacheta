require('@testing-library/jest-dom')

// jsdom has no IntersectionObserver. Minimal mock: records instances + observed
// elements and exposes a helper to fire the callback from tests.
class MockIntersectionObserver {
	constructor(callback, options) {
		this.callback = callback
		this.options = options
		this.elements = new Set()
		MockIntersectionObserver.instances.push(this)
	}
	observe(el) { this.elements.add(el) }
	unobserve(el) { this.elements.delete(el) }
	disconnect() { this.elements.clear() }
	takeRecords() { return [] }
	/** test helper */
	fire(entries) { this.callback(entries, this) }
}
MockIntersectionObserver.instances = []

beforeEach(() => {
	MockIntersectionObserver.instances = []
})

global.IntersectionObserver = MockIntersectionObserver
global.MockIntersectionObserver = MockIntersectionObserver
