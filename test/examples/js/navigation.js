'use strict';

const scrollTrack = require('../../..');
require('./lib/fps')();

const account = document.querySelector('#top-bar-content-container');
const header = document.querySelector('#header-content-container');
const minisb = document.querySelector('#minisb');
const footer = document.querySelector('#footer');

const accountWatcher = scrollTrack.create(account);
const headerWatcher = scrollTrack.create(header);

// Watch an area above the footer as tall as the scoreboard and header
const footerWatcherTop = minisb.getBoundingClientRect().height + header.getBoundingClientRect().height;
const footerWatcher = scrollTrack.create(footer, {top: footerWatcherTop});

// The elements these two watch are going to have position: fixed.
// we need to be sure that it always watches their original location.
accountWatcher.lock();
headerWatcher.lock();

accountWatcher.on('visibility-change', () => {
	header.classList.toggle('fixed', !accountWatcher.isInViewport);
});

headerWatcher.on('visibility-change', () => {
	minisb.classList.toggle('fixed', !headerWatcher.isInViewport);
});

footerWatcher.on('fully-enter-viewport', () => {
	if (footerWatcher.isAboveViewport) {
		minisb.classList.remove('fixed');
		minisb.classList.add('hug-footer');
	}
});

footerWatcher.on('partially-exit-viewport', () => {
	if (!footerWatcher.isAboveViewport) {
		minisb.classList.add('fixed');
		minisb.classList.remove('hug-footer');
	}
});

if (footerWatcher.isAboveViewport) {
	minisb.classList.remove('fixed');
	minisb.classList.add('hug-footer');
}
