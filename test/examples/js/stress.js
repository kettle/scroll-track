'use strict';

const scrollTrack = require('../../..');
require('./lib/fps')();

const count = parseInt(window.location.search.substr(1), 10) || 10000;
const container = document.querySelector('#container');
const counter = document.querySelector('#progress_numbers');
const progress = document.querySelector('progress');
const status = document.querySelector('#status');
const frag = document.createDocumentFragment();

let i = 0;

function addElements() {
	const elements = Array.prototype.slice.apply(frag.childNodes);
	container.append(frag);
	elements.forEach(el => makeWatcher(el));
}

function draw() {
	let el;

	while (i < count) {
		el = document.createElement('span');
		i += 1;
		el.innerHTML = i;
		frag.append(el);

		if ((i % 1000) === 0) {
			addElements();
			counter.innerHTML = (i) + ' of ' + count;
			progress.value = i;
			break;
		}
	}

	if (i === count) {
		addElements();
		counter.parentNode.removeChild(counter);
		status.innerHTML = 'recalculating locations...';
		progress.removeAttribute('value');
		setImmediate(() => {
			scrollTrack.recalculateLocations();
			const c = document.querySelector('#counter');
			c.parentNode.removeChild(c);
		});
	} else {
		requestAnimationFrame(draw);
	}
}

function addClass() {
	if (this.isInViewport) {
		if (this.isFullyInViewport) {
			this.element.style.backgroundColor = '#aaa';
		} else if (this.isAboveViewport) {
			this.element.style.backgroundColor = '#ddd';
		} else if (this.isBelowViewport) {
			this.element.style.backgroundColor = '#777';
		}
	}
}

function makeWatcher(element) {
	const watcher = scrollTrack.create(element);
	watcher.on('state-change', addClass);
	addClass.call(watcher);
}

document.querySelector('.fill-with-count').innerHTML = count;
progress.max = count;
draw();
