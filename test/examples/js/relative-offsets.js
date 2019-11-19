'use strict';

const scrollTrack = require('../../..');
require('./lib/fps')();

const myElement = document.querySelector('.content');
const status = document.querySelector('.status');
const elementWatcher = scrollTrack.create(myElement, '100vh');

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
