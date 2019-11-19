'use strict';

const scrollTrack = require('../../..');
require('./lib/fps')();

const boxHtml = (new Array(101)).join('<span class="box"></span>');
const smallBoxHtml = (new Array(5)).join('<span class="box"></span>');
const inserts = Array.prototype.slice.call(document.querySelectorAll('.insert-boxes-here'));
const scrollers = Array.prototype.slice.call(document.querySelectorAll('.scroller'));
const internal = document.querySelector('.internal .insert-boxes-here');

inserts.forEach(insert => {
	insert.innerHTML = boxHtml;
});

internal.innerHTML += smallBoxHtml;

const listener = watcher => {
	if (watcher.isInViewport) {
		if (watcher.isFullyInViewport) {
			watcher.element.style.backgroundColor = '#aaa';
		} else if (watcher.isAboveViewport) {
			watcher.element.style.backgroundColor = '#eee';
		} else if (watcher.isBelowViewport) {
			watcher.element.style.backgroundColor = '#666';
		}
	}
};

scrollers.forEach(element => {
	const boxes = Array.prototype.slice.call(element.querySelectorAll('.insert-boxes-here > .box'));
	const container = scrollTrack.createContainer(element);

	boxes.forEach(box => {
		const watcher = container.create(box);
		watcher.on('state-change', watcher => listener(watcher));
		listener(watcher);
	});
});
