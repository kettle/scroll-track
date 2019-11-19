'use strict';

const debounce = require('debounce');
const {getContentHeight, getViewportHeight, scrollTop, useCapture} = require('../utilities');
const ScrollElement = require('../scroll-element');

/**
 * @class ScrollElementContainer
 * @classdesc Creates a container to manage ScrollElements
 */
class ScrollElementContainer {
	/**
	 * Instantiates object, attaches window-level event listeners
	 * @param {Element|Number} item - Item to track with a ScrollElement
	 * @param {ScrollElementContainer} parentScrollElement - Add ScrollItem to an existing ScrollElement
	 */
	constructor(item, parentScrollElement) {
		this.item = item;
		this.scrollElements = [];
		this.viewportTop = null;
		this.viewportBottom = null;
		this.scrollElementContainer = null;
		this.contentHeight = getContentHeight(item);
		this.viewportHeight = getViewportHeight(item);
		this.onWindowEvent = this.onWindowEvent.bind(this);
		this.debouncedOnWindowEvent = debounce(this.onWindowEvent, 200);

		if (parentScrollElement) {
			this.scrollElementContainer = parentScrollElement.create(item);
		}

		this.setStateFromDOM();
		this.attachDomListeners();
	}

	/**
	 * Attach event listeners to DOM to monitor state
	 */
	attachDomListeners() {
		if (this.item === document.body) {
			window.addEventListener('scroll', this.onWindowEvent, useCapture);
		} else {
			this.item.addEventListener('scroll', this.onWindowEvent, useCapture);
		}

		window.addEventListener('resize', this.debouncedOnWindowEvent, useCapture);
	}

	/**
	 * Destroys the container, all of its ScrollElements, and removes event listeners
	 */
	destroy() {
		if (this.item === document.body) {
			window.removeEventListener('scroll', this.onWindowEvent, useCapture);
		} else {
			this.item.removeEventListener('scroll', this.onWindowEvent, useCapture);
		}

		window.removeEventListener('resize', this.debouncedOnWindowEvent, useCapture);

		this.scrollElements.forEach(scrollElement => {
			scrollElement.destroy(true);
		});

		this.scrollElements.length = 0;

		if (this.scrollElementContainer) {
			this.scrollElementContainer.destroy();
		}
	}

	/**
	 * Window resize / scroll event listener
	 */
	onWindowEvent() {
		this.setStateFromDOM();
	}

	/**
	 * Set instance state based on ScrollItem dimensions, offsets
	 */
	setStateFromDOM() {
		const viewportTop = scrollTop(this.item);
		const viewportHeight = getViewportHeight(this.item);
		const contentHeight = getContentHeight(this.item);

		this.setState(viewportTop, viewportHeight, contentHeight);
	}

	/**
	 * Sets state for ScrollElement, triggers recalculate if necessary
	 * @param {Number} newViewportTop - Most recent scrollTop measurement of ScrollElement
	 * @param {Number} newViewportHeight - Most recent height measurement of viewport
	 * @param {Number} newContentHeight - Most recent height measurement of ScrollElement
	 */
	setState(newViewportTop, newViewportHeight, newContentHeight) {
		const needsRecalcuate = (newViewportHeight !== this.viewportHeight || newContentHeight !== this.contentHeight);

		this.viewportTop = newViewportTop;
		this.viewportHeight = newViewportHeight;
		this.viewportBottom = newViewportTop + newViewportHeight;
		this.contentHeight = newContentHeight;

		/* istanbul ignore else */
		if (needsRecalcuate) {
			this.scrollElements.forEach(scrollElement => scrollElement.recalculateLocation());
		}

		this.updateAndTriggerScrollElements();
	}

	/**
	 * Update all ScrollElements and fire any appropriate events
	 */
	updateAndTriggerScrollElements() {
		this.scrollElements.forEach(scrollElement => {
			scrollElement.update();
			scrollElement.triggerCallbacks();
		});
	}

	/**
	 * Create a new ScrollElementContainer
	 * @param  {Element} item - Element to monitor
	 * @return {ScrollElementContainer} - Container
	 */
	createContainer(item) {
		const passedItem = item;

		if (typeof item === 'string') {
			item = document.querySelector(item);
		} else if (item && item.length > 0) {
			item = item[0];
		}

		if (item === null) {
			throw new Error(`Invalid 'item' passed to ScrollElementContainer.createContainer: ${passedItem}`);
		}

		const container = new ScrollElementContainer(item, this);
		container.setStateFromDOM();
		container.attachDomListeners();
		return container;
	}

	/**
	 * Create a ScrollItem from an Element
	 * @param  {Element|String} item - Element or queryselector of element to create ScrollElement with
	 * @param  {Object} offsets - Scroll offsets
	 * @return {ScrollElement} - ScrollElement instance
	 */
	create(item, offsets) {
		const passedItem = item;
		// Update the DOM because some browsers (like Safari)
		// will report a pageYOffset of 0 even if page is initially
		// scrolled when loaded (if you refresh after scrolling).
		// This way we get measurements as close to instantiation of
		// ScrollElements as possible to fire appropriate initial events.
		this.setStateFromDOM();

		if (typeof item === 'string') {
			item = document.querySelector(item);
		} else if (item && item.length > 0) {
			item = item[0];
		}

		if (item === null) {
			throw new Error(`Invalid 'item' passed to ScrollElementContainer.create: ${passedItem}`);
		}

		const scrollElement = new ScrollElement(this, item, offsets);
		this.scrollElements.push(scrollElement);
		return scrollElement;
	}

	/**
	 * Recalculate viewport dimensions and ScrollElements
	 */
	update() {
		this.calculateViewport();
		this.updateAndTriggerScrollElements();
	}

	/**
	 * Invalidate current measurements, and recalculate
	 */
	recalculateLocations() {
		this.contentHeight = 0;
		this.update();
	}

	/**
	 * Measure viewport, recalculate location of each ScrollItem
	 */
	calculateViewport() {
		let previousContentHeight = this.contentHeight;
		this.viewportTop = scrollTop(this.item);
		this.viewportBottom = this.viewportTop + this.viewportHeight;
		this.contentHeight = getContentHeight(this.item);

		/* istanbul ignore else */
		if (this.contentHeight !== previousContentHeight) {
			this.scrollElements.forEach(scrollElement => scrollElement.recalculateLocation());
			previousContentHeight = this.contentHeight;
		}
	}
}

module.exports = ScrollElementContainer;
