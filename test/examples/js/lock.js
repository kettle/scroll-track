'use strict';

const scrollTrack = require('../../..');
require('./lib/fps')();

const spans = Array.prototype.slice.call(document.querySelectorAll('span'));

spans.forEach(element => {
	const watcher = scrollTrack.create(element);

	watcher.lock();

	if (watcher.isAboveViewport) {
		element.classList.add('fixed');
	} else {
		element.classList.remove('fixed');
	}

	watcher.on('state-change', function () {
		if (this.isAboveViewport) {
			element.classList.add('fixed');
		} else {
			element.classList.remove('fixed');
		}
	});
});
