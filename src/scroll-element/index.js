'use strict';

const {EventEmitter} = require('events');

/**
 * @class ScrollElement
 * @extends {EventEmitter}
 * @classdesc Tracked element EventEmitter that fires events when its position relative to scroll is updated
 */
class ScrollElement extends EventEmitter {
	/**
	 * Instantiates instance, performs initial location query.
	 * @param {ScrollElementContainer} scrollElementContainer - Container managing ScrollElement
	 * @param {Element|Number} element - Element to track
	 * @param {Object} offsets - Scroll tracking offsets
	 */
	constructor(scrollElementContainer, element, offsets) {
		super();

		this.element = element;
		this.container = scrollElementContainer;
		this.locked = false;
		this.hasRelativeTopOffset = false;
		this.hasRelativeBottomOffset = false;
		this._offsets = this.setOffsets(offsets);

		this.recalculateLocation();
		this.update();

		this.wasInViewport = this.isInViewport;
		this.wasFullyInViewport = this.isFullyInViewport;
		this.wasAboveViewport = this.isAboveViewport;
		this.wasBelowViewport = this.isBelowViewport;

		// Immediately fire an added listener if certain criteria are met
		this.on('newListener', (event, listener) => {
			if ((event === ScrollElement.EVENTS.VISIBILITYCHANGE && !this.isInViewport && this.isAboveViewport) ||
				(event === ScrollElement.EVENTS.ENTERVIEWPORT && this.isInViewport) ||
				(event === ScrollElement.EVENTS.FULLYENTERVIEWPORT && this.isFullyInViewport) ||
				(event === ScrollElement.EVENTS.EXITVIEWPORT && this.isAboveViewport && !this.isInViewport) ||
				(event === ScrollElement.EVENTS.PARTIALLYEXITVIEWPORT && this.isInViewport && this.isAboveViewport && !this.isFullyInViewport)) {
				listener.call(this, this);
			}
		});
	}

	/**
	 * Sets offsets passed to constructor accounting for "vh" offsets
	 * @param {object|string|number|null} offsets - Offset value passed to constructor
	 * @return {object} - Offsets object with top and bottom numeric properties
	 */
	setOffsets(offsets) {
		// If offsets aren't passed, set top and bottom to zero
		if (!offsets) {
			return {
				top: 0,
				bottom: 0
			};
		}

		// If numeric, set top and bottom to value
		if (typeof offsets === 'number') {
			return {
				top: offsets,
				bottom: offsets
			};
		}

		// If a 'vh' string, deduce vh multiple and set top and bottom to match
		// Flag instance as having relative top and bottom offsets
		if (typeof offsets === 'string' && offsets.indexOf('vh') > -1) {
			const offset = this.getOffsetFromVhString(offsets);
			this.hasRelativeTopOffset = true;
			this.hasRelativeBottomOffset = true;

			return {
				top: offset,
				bottom: offset
			};
		}

		// If top is a 'vh' string, deduce vh multiple and set top to match
		// Flag instance as having relative top offset
		if (typeof offsets.top === 'string' && offsets.top.indexOf('vh') > -1) {
			offsets.top = this.getOffsetFromVhString(offsets.top);
			this.hasRelativeTopOffset = true;
		}

		// If bottom is a 'vh' string, deduce vh multiple and set bottom to match
		// Flag instance as having relative bottom offset
		if (typeof offsets.bottom === 'string' && offsets.bottom.indexOf('vh') > -1) {
			offsets.bottom = this.getOffsetFromVhString(offsets.bottom);
			this.hasRelativeBottomOffset = true;
		}

		// If top is set and isn't a number, inavlid offset should be set to 0
		if (typeof offsets.top !== 'undefined' && typeof offsets.top !== 'number') {
			offsets.top = 0;
		}

		// If bottom is set and isn't a number, inavlid offset should be set to 0
		if (typeof offsets.bottom !== 'undefined' && typeof offsets.bottom !== 'number') {
			offsets.bottom = 0;
		}

		// If offsets is a non-vh string, set offsets to 0
		if (typeof offsets === 'string') {
			offsets = {
				top: 0,
				bottom: 0
			};
		}

		return {
			top: offsets.top || 0,
			bottom: offsets.bottom || 0
		};
	}

	/**
	 * Retrieve offsets (accounting for viewport height if either offset is relative)
	 * @return {object} - Offsets object with top and bottom numeric properties
	 */
	getOffsets() {
		const offsets = {
			top: this._offsets.top,
			bottom: this._offsets.bottom
		};

		if (this.hasRelativeTopOffset) {
			offsets.top *= this.container.viewportHeight;
		}

		if (this.hasRelativeBottomOffset) {
			offsets.bottom *= this.container.viewportHeight;
		}

		return offsets;
	}

	/**
	 * Parse percentage of viewport height based on vh string value
	 * @param {string} offset - Offset including 'vh' suffix
	 * @return {number} - Viewport height multiple
	 */
	getOffsetFromVhString(offset) {
		return parseInt(offset.replace(/\D/g, ''), 10) / 100;
	}

	/**
	 * Recalculate ScrollElement's location relative to the viewport
	 */
	recalculateLocation() {
		if (this.locked) {
			return;
		}

		const previousTop = this.top;
		const previousBottom = this.bottom;

		if (this.element.nodeName) {
			const cachedDisplay = this.element.style.display;

			if (cachedDisplay === 'none') {
				this.element.style.display = '';
			}

			let containerOffset = 0;
			let {container} = this;

			while (container.scrollElementContainer) {
				containerOffset += container.scrollElementContainer.top - container.scrollElementContainer.container.viewportTop;
				container = container.scrollElementContainer.container;
			}

			const boundingRect = this.element.getBoundingClientRect();
			this.top = boundingRect.top + this.container.viewportTop - containerOffset;
			this.bottom = boundingRect.bottom + this.container.viewportTop - containerOffset;

			if (cachedDisplay === 'none') {
				this.element.style.display = cachedDisplay;
			}
		} else if (this.element === Number(this.element)) {
			if (this.element > 0) {
				this.top = this.element;
				this.bottom = this.element;
			} else {
				this.top = this.container.contentHeight - this.element;
				this.bottom = this.container.contentHeight - this.element;
			}
		} else {
			this.top = this.element.top;
			this.bottom = this.element.bottom;
		}

		const offsets = this.getOffsets();
		this.top -= offsets.top;
		this.bottom += offsets.bottom;
		this.height = this.bottom - this.top;

		if ((typeof previousTop !== 'undefined' || typeof previousBottom !== 'undefined') &&
			(this.top !== previousTop || this.bottom !== previousBottom)) {
			this.emit(ScrollElement.EVENTS.LOCATIONCHANGE, this);
		}
	}

	/**
	 * Fire all appropriate events based on current location
	 */
	triggerCallbacks() {
		if (this.isInViewport && !this.wasInViewport) {
			this.emit(ScrollElement.EVENTS.ENTERVIEWPORT, this);
		}

		if (this.isFullyInViewport && !this.wasFullyInViewport) {
			this.emit(ScrollElement.EVENTS.FULLYENTERVIEWPORT, this);
		}

		if (this.isAboveViewport !== this.wasAboveViewport &&
			this.isBelowViewport !== this.wasBelowViewport) {
			this.emit(ScrollElement.EVENTS.VISIBILITYCHANGE, this);

			if (!this.wasFullyInViewport && !this.isFullyInViewport) {
				this.emit(ScrollElement.EVENTS.FULLYENTERVIEWPORT, this);
				this.emit(ScrollElement.EVENTS.PARTIALLYEXITVIEWPORT, this);
			}

			if (!this.wasInViewport && !this.isInViewport) {
				this.emit(ScrollElement.EVENTS.ENTERVIEWPORT, this);
				this.emit(ScrollElement.EVENTS.EXITVIEWPORT, this);
			}
		}

		/* istanbul ignore if */
		if (!this.isFullyInViewport && this.wasFullyInViewport) {
			this.emit(ScrollElement.EVENTS.PARTIALLYEXITVIEWPORT, this);
		}

		/* istanbul ignore if */
		if (!this.isInViewport && this.wasInViewport) {
			this.emit(ScrollElement.EVENTS.EXITVIEWPORT, this);
		}

		if (this.isInViewport !== this.wasInViewport) {
			this.emit(ScrollElement.EVENTS.VISIBILITYCHANGE, this);
		}

		if (this.wasInViewport !== this.isInViewport ||
			this.wasFullyInViewport !== this.isFullyInViewport ||
			this.wasAboveViewport !== this.isAboveViewport ||
			this.wasBelowViewport !== this.isBelowViewport) {
			this.emit(ScrollElement.EVENTS.STATECHANGE, this);
		}

		this.wasInViewport = this.isInViewport;
		this.wasFullyInViewport = this.isFullyInViewport;
		this.wasAboveViewport = this.isAboveViewport;
		this.wasBelowViewport = this.isBelowViewport;
	}

	/**
	 * Recalculate ScrollElement dimensions
	 */
	recalculateSize() {
		const offsets = this.getOffsets();
		this.height = this.element.offsetHeight + offsets.top + offsets.bottom;
		this.bottom = this.top + this.height;
	}

	/**
	 * Update viewport properties
	 */
	update() {
		this.isAboveViewport = this.top < this.container.viewportTop;
		this.isBelowViewport = this.bottom > this.container.viewportBottom;
		this.isInViewport = (this.top < this.container.viewportBottom && this.bottom > this.container.viewportTop);
		this.isFullyInViewport = (this.top >= this.container.viewportTop && this.bottom <= this.container.viewportBottom) || (this.isAboveViewport && this.isBelowViewport);
	}

	/**
	 * Destroy the ScrollElement and remove all listeners
	 * @param {Boolean} calledFromContainer - If method was called from container's destroy method, don't splice ScrollElement collection
	 */
	destroy(calledFromContainer) {
		calledFromContainer = calledFromContainer || false;
		const index = this.container.scrollElements.indexOf(this);

		if (!calledFromContainer) {
			this.container.scrollElements.splice(index, 1);
		}

		this.emit(ScrollElement.EVENTS.DESTROYED, this);
		this.removeAllListeners();
	}

	/**
	 * Lock the ScrollElement from updating its location
	 */
	lock() {
		this.locked = true;
	}

	/**
	 * Unlock the ScrollElement from updating its location
	 */
	unlock() {
		this.locked = false;
		this.recalculateLocation();
	}
}

ScrollElement.EVENTS = {
	PARTIALLYEXITVIEWPORT: 'partially-exit-viewport',
	FULLYENTERVIEWPORT: 'fully-enter-viewport',
	VISIBILITYCHANGE: 'visibility-change',
	LOCATIONCHANGE: 'location-change',
	ENTERVIEWPORT: 'enter-viewport',
	EXITVIEWPORT: 'exit-viewport',
	STATECHANGE: 'state-change',
	DESTROYED: 'destroyed'
};

module.exports = ScrollElement;
