'use strict';

const scrollTrack = require('../../..');
require('./lib/fps')();

const myElement = document.querySelector('.content');
const status = document.querySelector('.status');
const destroy = document.querySelector('.destroy');
const elementWatcher = scrollTrack.create(myElement);

destroy.addEventListener('click', e => {
	e.preventDefault();
	scrollTrack.destroy();
	destroy.classList.add('gone');
});

elementWatcher.on('destroyed', () => {
	status.innerHTML = 'I have been destroyed.<br>' + status.innerHTML;
	status.scrollTo(0, 0);
});

elementWatcher.on('enter-viewport', () => {
	status.innerHTML = 'I have partially entered the viewport.<br>' + status.innerHTML;
	status.scrollTo(0, 0);
});

elementWatcher.on('fully-enter-viewport', () => {
	status.innerHTML = 'I have fully entered the viewport.<br>' + status.innerHTML;
	status.scrollTo(0, 0);
});

elementWatcher.on('partially-exit-viewport', () => {
	status.innerHTML = 'I have partially exited the viewport.<br>' + status.innerHTML;
	status.scrollTo(0, 0);
});

elementWatcher.on('exit-viewport', () => {
	status.innerHTML = 'I have fully exited the viewport.<br>' + status.innerHTML;
	status.scrollTo(0, 0);
});
