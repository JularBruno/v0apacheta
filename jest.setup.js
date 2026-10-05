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

// jsdom has no PointerEvent. A MouseEvent subclass carries clientX/clientY (what drag handlers read)
// plus the pointer fields, so fireEvent.pointerDown/Move/Up behave like a real pointer.
if (typeof window !== 'undefined' && typeof window.PointerEvent === 'undefined') {
	class PointerEventPolyfill extends MouseEvent {
		constructor(type, init = {}) {
			super(type, init)
			this.pointerId = init.pointerId ?? 0
			this.pointerType = init.pointerType ?? 'mouse'
			this.isPrimary = init.isPrimary ?? true
			this.width = init.width ?? 1
			this.height = init.height ?? 1
			this.pressure = init.pressure ?? 0
		}
	}
	window.PointerEvent = PointerEventPolyfill
}
