'use strict';

/**
 * Get the height of the passed element relative to the viewport
 * @param {Element} element - Element to measure
 * @return {Number} - Element's height
 */
module.exports.getViewportHeight = element => {
	if (element === document.body) {
		return window.innerHeight || document.documentElement.clientHeight;
	}

	return element.clientHeight;
};

/**
 * Get the height of the passed element, regardless of the viewport
 * @param {Element} element - Element to measure
 * @return {Number} - Element's height
 */
module.exports.getContentHeight = element => {
	if (element === document.body) {
		return Math.max(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.documentElement.clientHeight
		);
	}

	return element.scrollHeight;
};

/**
 * Retrieve scroll position from top of page for a given element
 * @param {Element} element - Element to measure
 * @return {Number} - Scroll top offset of element
 */
module.exports.scrollTop = element => {
	if (element === document.body) {
		return window.pageYOffset ||
			(document.documentElement && document.documentElement.scrollTop) ||
			document.body.scrollTop;
	}

	return element.scrollTop;
};

/**
 * Test for passive event listening support for more performant scroll events
 * @return {Boolean} - Whether or not the browser supports passive event listeners
 */
const browserSupportsPassiveTest = () => {
	let browserSupportsPassive = false;

	try {
		const options = {
			get passive() {
				browserSupportsPassive = true;
				return true;
			}
		};

		window.addEventListener('test', options, options);
		window.removeEventListener('test', options, options);
	} catch (error) {}

	return browserSupportsPassive;
};

module.exports.useCapture = browserSupportsPassiveTest() ? {capture: false, passive: true} : false;
