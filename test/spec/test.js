#!/usr/bin/env node

const tape = require('tape');
const scrollTrack = require('../..');

const {ScrollElement} = scrollTrack;
const fixture = document.createElement('div');
fixture.setAttribute('id', 'fixture');

const scrollContainer = document.createElement('div');
scrollContainer.setAttribute('id', 'scroll-container');
scrollContainer.classList.add('scroll-container');
scrollContainer.style.position = 'absolute';
scrollContainer.style.top = '0px';
scrollContainer.style.left = '0px';
scrollContainer.style.width = '100px';
scrollContainer.style.height = '200px';
scrollContainer.style.overflow = 'auto';

const box = document.createElement('div');
box.style.position = 'relative';
box.style.float = 'left';
box.style.marginRight = '10px';
box.style.width = '50px';
box.style.height = '50px';

const div = document.createElement('div');
div.style.position = 'absolute';
div.style.top = '0px';
div.style.left = '0px';
div.style.width = '10px';
div.style.backgroundColor = 'purple';
div.style.height = String(window.innerHeight * 2) + 'px';

document.body.style.height = '30000px';
document.body.append(scrollContainer);
document.body.append(fixture);
fixture.append(div);

tape.onFinish(() => {
	setTimeout(() => window.close(), 500);
});

const scroll = y => {
	return new Promise(resolve => {
		requestAnimationFrame(() => {
			window.scrollTo(0, y);
			requestAnimationFrame(() => {
				resolve();
			});
		});
	});
};

const wait = () => {
	return new Promise(resolve => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				resolve();
			});
		});
	});
};

const setHeight = h => {
	return new Promise(resolve => {
		requestAnimationFrame(() => {
			window.innerHeight = h;
			requestAnimationFrame(resolve);
		});
	});
};

tape('ScrollElementContainer should have correct API', async t => {
	const events = [
		'partially-exit-viewport',
		'fully-enter-viewport',
		'visibility-change',
		'location-change',
		'enter-viewport',
		'exit-viewport',
		'state-change',
		'destroyed'
	];

	t.equals(typeof scrollTrack.create, 'function', 'create method exists');
	t.equals(typeof scrollTrack.update, 'function', 'update method exists');
	t.equals(typeof scrollTrack.recalculateLocations, 'function', 'recalculateLocations method exists');
	t.equals(typeof scrollTrack.viewportTop, 'number', 'viewportTop property is numeric');
	t.equals(typeof scrollTrack.viewportBottom, 'number', 'viewportBottom property is numeric');
	t.equals(typeof scrollTrack.viewportHeight, 'number', 'viewportHeight property is numeric');
	t.equals(typeof scrollTrack.contentHeight, 'number', 'documentHeight property is numeric');
	t.deepEqual(Object.values(ScrollElement.EVENTS).sort(), events.sort(), 'events properly defined');
	t.end();
});

tape('ScrollElement should have correct API', async t => {
	const watcher = scrollTrack.create(10);
	t.equals(typeof watcher.on, 'function', 'on method exists');
	t.equals(typeof watcher.once, 'function', 'once method exists');
	t.equals(typeof watcher.removeAllListeners, 'function', 'removeAllListeners method exists');
	t.equals(typeof watcher.lock, 'function', 'lock method exists');
	t.equals(typeof watcher.getOffsets, 'function', 'getOffsets method exists');
	t.equals(typeof watcher.unlock, 'function', 'unlock method exists');
	t.equals(typeof watcher.destroy, 'function', 'destroy method exists');
	t.equals(typeof watcher.update, 'function', 'update method exists');
	t.equals(typeof watcher.recalculateLocation, 'function', 'recalculateLocation method exists');
	t.equals(typeof watcher.triggerCallbacks, 'function', 'triggerCallbacks method exists');
	t.equals(typeof watcher.isInViewport, 'boolean', 'isInViewport is a boolean');
	t.equals(typeof watcher.isFullyInViewport, 'boolean', 'isFullyInViewport is a boolean');
	t.equals(typeof watcher.isAboveViewport, 'boolean', 'isAboveViewport is a boolean');
	t.equals(typeof watcher.isBelowViewport, 'boolean', 'isBelowViewport is a boolean');
	t.equals(typeof watcher.top, 'number', 'top is numberic');
	t.equals(typeof watcher.bottom, 'number', 'bottom is numberic');
	t.equals(typeof watcher.height, 'number', 'height is numberic');
	t.equals(typeof watcher.element, 'number', 'element is numberic');
	t.equals(typeof watcher._offsets, 'object', '_offsets is numberic');
	watcher.destroy();
	t.end();
});

tape('ScrollElement should instantiate properly', async t => {
	const watcher10 = scrollTrack.create(10);
	const watcher15 = scrollTrack.create(15);
	const watcherRelativeTop = scrollTrack.create(15, {top: '100vh'});
	const watcherRelativeBottom = scrollTrack.create(15, {bottom: '50vh'});
	const watcherRelativeTopBottom = scrollTrack.create(15, '100vh');
	const watcherInvalid = scrollTrack.create(15, '100vw');
	const watcherInvalidTop = scrollTrack.create(15, {top: '100vw'});
	const watcherInvalidBottom = scrollTrack.create(15, {bottom: '100vw'});
	t.equals(watcher10.top, 10, 'top is properly set to 10');
	t.equals(watcher15.top, 15, 'top is properly set to 15');
	t.equals(watcher10.bottom, 10, 'bottom is properly set to 10');
	t.equals(watcher15.bottom, 15, 'bottom is properly set to 15');
	t.equals(watcher10.height, 0, 'height is properly set to 0');
	t.equals(watcher15.height, 0, 'height is properly set to 0');
	t.deepEqual(watcher10.getOffsets(), {top: 0, bottom: 0}, 'offsets are properly set to 0');
	t.deepEqual(watcher15.getOffsets(), {top: 0, bottom: 0}, 'offsets are properly set to 0');
	t.deepEqual(watcherRelativeTop.getOffsets(), {top: window.innerHeight, bottom: 0}, 'top offset is properly set to window.innerHeight');
	t.deepEqual(watcherRelativeBottom.getOffsets(), {top: 0, bottom: window.innerHeight / 2}, 'bottom offset is properly set to half of window.innerHeight');
	t.deepEqual(watcherRelativeTopBottom.getOffsets(), {top: window.innerHeight, bottom: window.innerHeight}, 'offsets are properly set to window.innerHeight');
	t.deepEqual(watcherInvalid.getOffsets(), {top: 0, bottom: 0}, 'invalid offsets are properly set to 0');
	t.deepEqual(watcherInvalidTop.getOffsets(), {top: 0, bottom: 0}, 'invalid top offset is properly set to 0');
	t.deepEqual(watcherInvalidBottom.getOffsets(), {top: 0, bottom: 0}, 'invalid bottom offset is properly set to 0');
	watcher10.destroy();
	watcher15.destroy();
	watcherRelativeTop.destroy();
	watcherRelativeBottom.destroy();
	watcherRelativeTopBottom.destroy();
	watcherInvalid.destroy();
	watcherInvalidTop.destroy();
	watcherInvalidBottom.destroy();
	t.end();
});

tape('create methods', test => {
	test.test('should create ScrollItem by passing querySelector string for valid element', async t => {
		const scrollElement = scrollTrack.create('#fixture');
		t.equal(scrollElement.element, fixture, 'ScrollElement element is #figure element');
		scrollElement.destroy();
		t.end();
	});

	test.test('should create ScrollItem by passing object', async t => {
		const scrollElement = scrollTrack.create({
			otherProperty: 'hello',
			bottom: 10,
			top: 10
		});

		t.equal(scrollElement.element.otherProperty, 'hello', 'ScrollElement element instantiating object');
		scrollElement.destroy();
		t.end();
	});

	test.test('should create ScrollItem by passing number', async t => {
		const scrollElement = scrollTrack.create(0);
		scrollElement.recalculateLocation();
		t.equal(typeof scrollElement, 'object', 'ScrollElement created from number');
		scrollElement.destroy();
		t.end();
	});
});

tape('container methods', test => {
	test.test('should recalculate all ScrollItem instances when recalculateLocations is called', async t => {
		const scrollElement = scrollTrack.create(10);
		const initialHeight = window.innerHeight;
		const startBottom = scrollElement.bottom;

		await setHeight(100);
		scrollElement.container.recalculateLocations();
		await scroll(1);

		requestAnimationFrame(async () => {
			t.notEqual(scrollElement.element.bottom, startBottom, 'ScrollElement bottom was updated');
			await setHeight(initialHeight);
			scrollElement.destroy();
			t.end();
		});
	});

	test.test('should create container from selector', async t => {
		const container = scrollTrack.createContainer('#scroll-container');
		t.equal(container.item.nodeName, 'DIV', 'container created from string selector');
		container.destroy();
		t.end();
	});

	test.test('should create container from first item of result set', async t => {
		const elems = document.querySelectorAll('.scroll-container');
		const container = scrollTrack.createContainer(elems);
		t.equal(container.item.nodeName, 'DIV', 'container created from string selector');
		container.destroy();
		t.end();
	});

	test.test('should create nested containers from element', async t => {
		const container = scrollTrack.createContainer(scrollContainer);
		const boxes = new Array(10).fill(0).map((_, i) => {
			const b = box.cloneNode(true);
			b.setAttribute('id', `box-${i}`);
			b.classList.add('box');
			scrollContainer.append(b);
			return b;
		});

		boxes.forEach(box => container.create(box));
		t.equal(container.scrollElements.length, 10, 'container has 10 ScrollElements');
		container.destroy();
		t.end();
	});

	test.test('should create nested containers from selectors', async t => {
		const container = scrollTrack.createContainer(scrollContainer);
		const boxes = Array.prototype.slice.call(scrollContainer.querySelectorAll('.box'));
		boxes.forEach(box => container.create(`#${box.id}`));
		t.equal(container.scrollElements.length, 10, 'container has 10 ScrollElements');
		container.destroy();

		while (scrollContainer.firstChild) {
			scrollContainer.removeChild(scrollContainer.firstChild);
		}

		t.end();
	});
});

tape('should throw error for invalid item argument', async t => {
	const errorString = 'Error: Invalid \'item\' passed to ScrollElementContainer.create: .i-dont-exist';
	t.throws(() => scrollTrack.create('.i-dont-exist'), errorString, 'throws an error for invalid item string selector');
	t.end();
});

tape('should throw when creating container from an invalid selector', async t => {
	const errorString = 'Error: Invalid \'item\' passed to ScrollElementContainer.createContainer: .i-dont-exist';
	t.throws(() => scrollTrack.createContainer('.i-dont-exist'), errorString, 'throws an error for invalid container item string selector');
	t.end();
});

tape('should calculate objects correctly', async t => {
	const watcher = scrollTrack.create({top: 100, bottom: 102});
	t.equals(watcher.top, 100, 'top is properly set to 100');
	t.equals(watcher.bottom, 102, 'bottom is properly set to 102');
	t.equals(watcher.height, 2, 'bottom is properly set to 2');
	watcher.destroy();
	t.end();
});

tape('should calculate 0 properties correctly', async t => {
	const watcher = scrollTrack.create([10]);
	t.equals(watcher.top, 10, 'top is properly set to 10');
	t.equals(watcher.bottom, 10, 'bottom is properly set to 10');
	t.equals(watcher.height, 0, 'height is properly set to 0');
	watcher.destroy();
	t.end();
});

tape('should calculate DOM elements correctly', async t => {
	const div = document.createElement('div');
	div.style.position = 'relative';
	div.style.top = '10px';
	div.style.width = '100px';
	div.style.height = '15px';
	div.style.backgroundColor = 'gray';
	fixture.append(div);
	const watcher = scrollTrack.create(div);
	const offset = fixture.offsetTop;
	t.equals(watcher.top, offset + 10, 'top is properly set');
	t.equals(watcher.bottom, offset + 25, 'bottom is properly set');
	t.equals(watcher.height, 15, 'height is properly set to 15');
	watcher.destroy();
	fixture.removeChild(div);
	t.end();
});

tape('location booleans', test => {
	test.test('should calculate fully in viewport correctly', async t => {
		await scroll(0);
		const watcher = scrollTrack.create(10);
		t.equals(watcher.isInViewport, true, 'isInViewport is true');
		t.equals(watcher.isFullyInViewport, true, 'isFullyInViewport is true');
		t.equals(watcher.isAboveViewport, false, 'isAboveViewport is false');
		t.equals(watcher.isBelowViewport, false, 'isBelowViewport is false');
		watcher.destroy();
		t.end();
	});

	test.test('should calculate partially below viewport correctly', async t => {
		await scroll(0);
		const windowHeight = window.innerHeight;
		const watcher = scrollTrack.create({top: 10, bottom: windowHeight + 10});
		t.equals(watcher.isInViewport, true, 'isInViewport is true');
		t.equals(watcher.isFullyInViewport, false, 'isFullyInViewport is false');
		t.equals(watcher.isAboveViewport, false, 'isAboveViewport is false');
		t.equals(watcher.isBelowViewport, true, 'isBelowViewport is true');
		watcher.destroy();
		t.end();
	});

	test.test('should calculate partially above viewport correctly', async t => {
		await scroll(100);
		requestAnimationFrame(() => {
			const watcher = scrollTrack.create({top: 0, bottom: 200});
			t.equals(watcher.isInViewport, true, 'isInViewport is true');
			t.equals(watcher.isFullyInViewport, false, 'isFullyInViewport is false');
			t.equals(watcher.isAboveViewport, true, 'isAboveViewport is true');
			t.equals(watcher.isBelowViewport, false, 'isBelowViewport is false');
			watcher.destroy();
			t.end();
		});
	});

	test.test('should calculate below the viewport correctly', async t => {
		await scroll(0);
		requestAnimationFrame(() => {
			const windowHeight = window.innerHeight;
			const watcher = scrollTrack.create({top: windowHeight + 10, bottom: windowHeight + 20});
			t.equals(scrollTrack.viewportTop, 0, 'viewportTop is 0');
			t.equals(watcher.isInViewport, false, 'isInViewport is false');
			t.equals(watcher.isFullyInViewport, false, 'isFullyInViewport is false');
			t.equals(watcher.isAboveViewport, false, 'isAboveViewport is false');
			t.equals(watcher.isBelowViewport, true, 'isBelowViewport is true');
			watcher.destroy();
			t.end();
		});
	});

	test.test('should calculate above the viewport correctly', async t => {
		await scroll(100);
		requestAnimationFrame(() => {
			const watcher = scrollTrack.create({top: 0, bottom: 20});
			t.equals(watcher.isInViewport, false, 'isInViewport is false');
			t.equals(watcher.isFullyInViewport, false, 'isFullyInViewport is false');
			t.equals(watcher.isAboveViewport, true, 'isAboveViewport is true');
			t.equals(watcher.isBelowViewport, false, 'isBelowViewport is false');
			watcher.destroy();
			t.end();
		});
	});

	test.test('should calculate larger than and fully in viewport correctly', async t => {
		await scroll(100);
		requestAnimationFrame(() => {
			const windowHeight = window.innerHeight;
			const watcher = scrollTrack.create({top: 0, bottom: windowHeight + 200});
			t.equals(watcher.isInViewport, true, 'isInViewport is true');
			t.equals(watcher.isFullyInViewport, true, 'isFullyInViewport is true');
			t.equals(watcher.isAboveViewport, true, 'isAboveViewport is true');
			t.equals(watcher.isBelowViewport, true, 'isBelowViewport is true');
			watcher.destroy();
			t.end();
		});
	});
});

tape('setting offsets', test => {
	test.test('should not have offsets by default', async t => {
		await scroll(0);
		const watcher = scrollTrack.create(10);
		t.deepEqual(watcher.getOffsets(), {top: 0, bottom: 0}, 'offsets are zero');
		watcher.destroy();
		t.end();
	});

	test.test('should add offsets as a number', async t => {
		const watcher = scrollTrack.create(10, 10);
		t.deepEqual(watcher.getOffsets(), {top: 10, bottom: 10}, 'offsets are 10');
		watcher.destroy();
		t.end();
	});

	test.test('should add offsets as a with just the top in an object', async t => {
		const watcher = scrollTrack.create(10, {top: 10});
		t.deepEqual(watcher.getOffsets(), {top: 10, bottom: 0}, 'offsets are 10 and 0');
		watcher.destroy();
		t.end();
	});

	test.test('should add offsets as a with just the bottom in an object', async t => {
		const watcher = scrollTrack.create(10, {bottom: 10});
		t.deepEqual(watcher.getOffsets(), {top: 0, bottom: 10}, 'offsets are 0 and 10');
		watcher.destroy();
		t.end();
	});

	test.test('should add offsets as a with both properties in an object', async t => {
		const watcher = scrollTrack.create(10, {top: 5, bottom: 10});
		t.deepEqual(watcher.getOffsets(), {top: 5, bottom: 10}, 'offsets are 5 and 10');
		watcher.destroy();
		t.end();
	});
});

tape('events', test => {
	test.test('should automatically call listeners when they are already in the viewport', async t => {
		const watcher = scrollTrack.create(10);

		t.plan(2);

		watcher.on('enter-viewport', () => {
			t.pass('enter-viewport event captured');
		});

		watcher.on('fully-enter-viewport', () => {
			t.pass('fully-enter-viewport event captured');
			watcher.destroy();
		});
	});

	test.test('should call enter-viewport immediately if the element is already in the viewport.', async t => {
		const watcher = scrollTrack.create(div);

		watcher.on('enter-viewport', () => {
			t.pass('enter-viewport event captured');
			watcher.destroy();
			t.end();
		});
	});

	test.test('should call enter-viewport and fully-enter-viewport callbacks immediately if the element is fully in the viewport', async t => {
		await scroll(0);
		div.style.top = '0px';
		t.plan(2);

		const watcher = scrollTrack.create(10);

		watcher.on('enter-viewport', () => {
			t.pass('enter-viewport event captured');
		});

		watcher.on('fully-enter-viewport', () => {
			t.pass('fully-enter-viewport event captured');
			watcher.destroy();
		});
	});

	test.test('should call exit-viewport immediately if the element is already above the viewport.', async t => {
		await scroll(100);

		requestAnimationFrame(() => {
			const watcher = scrollTrack.create(10);

			watcher.on('exit-viewport', () => {
				t.pass('exit-viewport event captured');
				watcher.destroy();
				t.end();
			});
		});
	});

	test.test('should not call partially-exit-viewport immediately if the element is already above the viewport.', async t => {
		const watcher = scrollTrack.create(10);

		watcher.on('partially-exit-viewport', () => {
			t.fail('partially-exit-viewport event captured');
			watcher.destroy();
			t.end();
		});

		setTimeout(() => {
			t.pass('partially-exit-viewport event was not captured');
			watcher.destroy();
			t.end();
		}, 200);
	});

	test.test('should call visibility-change immediately if the element is already above the viewport.', async t => {
		await scroll(100);
		requestAnimationFrame(() => {
			const watcher = scrollTrack.create(5);

			watcher.on('visibility-change', () => {
				t.pass('visibility-change event captured');
				watcher.destroy();
				t.end();
			});
		});
	});

	test.test('should call exit-viewport and partially-exit-viewport when the element exits the viewport.', async t => {
		await scroll(0);
		const watcher = scrollTrack.create(10);

		watcher.on('exit-viewport', () => {
			t.pass('exit-viewport event captured');
			watcher.destroy();
			t.end();
		});

		watcher.on('partially-exit-viewport', () => {
			t.pass('partially-exit-viewport event captured');
		});

		await scroll(100);
	});

	test.test('should call enter-viewport and fully-enter-viewport when the element enters the viewport.', async t => {
		await wait();
		await scroll(0);
		const watcher = scrollTrack.create(10);

		watcher.on('enter-viewport', () => {
			t.pass('enter-viewport event captured');
			watcher.destroy();
			t.end();
		});

		watcher.on('fully-enter-viewport', () => {
			t.pass('fully-enter-viewport event captured');
		});

		await scroll(100);
	});

	test.test('should only call partially-exit-viewport when the element partially exits the viewport.', async t => {
		await wait();
		await scroll(0);
		const watcher = scrollTrack.create({top: 10, bottom: 200});

		watcher.on('exit-viewport', () => {
			t.fail('exit-viewport event captured');
		});

		watcher.on('partially-exit-viewport', () => {
			t.pass('partially-exit-viewport event captured');
			watcher.destroy();
			t.end();
		});

		await scroll(100);
	});

	test.test('should only call enter-viewport when the element halfway enters the viewport.', async t => {
		await wait();
		await scroll(window.innerHeight + 20);

		const watcher = scrollTrack.create({
			top: (window.innerHeight * 2),
			bottom: (window.innerHeight * 2) + 100
		});

		watcher.on('fully-enter-viewport', () => {
			t.fail('fully-enter-viewport event captured');
		});

		watcher.on('enter-viewport', () => {
			t.pass('enter-viewport event captured');
			watcher.destroy();
			t.end();
		});

		await scroll(0);
	});

	test.test('should call visibility-change when the element scrolls out of the viewport.', async t => {
		await wait();
		await scroll(2000);

		div.style.height = '20px';
		div.style.position = 'absolute';
		div.style.top = 0;

		const watcher = scrollTrack.create(div);
		div.style.height = '2000px';
		watcher.recalculateLocation();
		watcher.triggerCallbacks();

		watcher.on('visibility-change', () => {
			watcher.destroy();
			t.pass('visibility-change event captured');
			t.end();
		});

		await scroll(0);
	});

	test.test('should call enter-viewport when the element enters the viewport.', async t => {
		await wait();
		await scroll(0);

		div.style.height = '20px';
		div.style.position = 'absolute';
		div.style.top = '600px';

		const watcher = scrollTrack.create(div);

		watcher.on('enter-viewport', () => {
			watcher.destroy();
			t.pass('enter-viewport event captured');
			t.end();
		});

		await scroll(580);
	});

	test.test('should call visibility-change when the element scrolls out of the viewport.', async t => {
		await wait();
		await scroll(10);

		div.style.height = '20px';
		div.style.position = 'absolute';
		div.style.top = '20px';

		const watcher = scrollTrack.create(div);
		div.style.height = '2000px';
		div.style.top = '0px';

		watcher.recalculateLocation();
		watcher.update();
		watcher.on('visibility-change', () => {
			watcher.destroy();
			t.pass('visibility-change event captured');
			t.end();
		});
		watcher.triggerCallbacks();
	});

	test.test('should call fully-enter-viewport, enter-viewport, partially-exit-viewport, and exit-viewport when you scroll immediately past the element.', async t => {
		await wait();
		await scroll(0);
		t.plan(4);

		div.style.height = '10px';
		div.style.position = 'absolute';
		div.style.top = '600px';

		const watcher = scrollTrack.create(div);

		watcher.on('fully-enter-viewport', () => {
			t.pass('fully-enter-viewport event captured');
		});

		watcher.on('partially-exit-viewport', () => {
			t.pass('partially-exit-viewport event captured');
		});

		watcher.on('enter-viewport', () => {
			t.pass('enter-viewport event captured');
		});

		watcher.on('exit-viewport', () => {
			watcher.destroy();
			t.pass('exit-viewport event captured');
			t.end();
		});

		await scroll(1000);
	});
});

tape('context', test => {
	test.test('should use the scrollElement as the context.', async t => {
		await wait();
		await scroll(0);

		const scrollElement = scrollTrack.create(10);

		scrollElement.on('enter-viewport', function () {
			t.equal(this, scrollElement, 'context is scrollElement instance');
			scrollElement.destroy();
			t.end();
		});
	});
});

tape('locking and unlocking', test => {
	test.test('should block recalculateLocation method when locked when using an element.', async t => {
		div.style.top = '200px';

		requestAnimationFrame(() => {
			const scrollElement = scrollTrack.create(div);
			const startTop = scrollElement.top;

			scrollElement.lock();
			scrollElement.recalculateLocation();
			div.style.top = '300px';
			t.equal(startTop, scrollElement.top, 'location not updated while locked');
			scrollElement.unlock();

			requestAnimationFrame(() => {
				t.notEqual(startTop, scrollElement.top, 'location updated once lock is removed');
				scrollElement.destroy();
				t.end();
			});
		});
	});

	test.test('should recalculate size when recalculateSize is called.', async t => {
		div.style.height = '100px';
		const scrollElement = scrollTrack.create(div);
		const startHeight = scrollElement.height;

		requestAnimationFrame(() => {
			div.style.height = '50px';
			scrollElement.recalculateSize();

			t.notEqual(startHeight, scrollElement.height, 'location not updated while locked');
			t.equal(50, scrollElement.height, 'location not updated while locked');
			scrollElement.destroy();
			t.end();
		});
	});

	test.test('should respect inline display style of ScrollElement.', async t => {
		div.style.display = 'none';

		requestAnimationFrame(() => {
			const scrollElement = scrollTrack.create(div);
			const startTop = scrollElement.top;

			scrollElement.recalculateLocation();
			div.style.top = '300px';

			requestAnimationFrame(() => {
				t.equal(startTop, scrollElement.top, 'location not updated while locked');
				scrollElement.destroy();
				t.end();
			});
		});
	});
});

tape('destruction', test => {
	test.test('should destroy the ScrollElement when called.', async t => {
		const scrollElement = scrollTrack.create(10);
		let destroyedEventCount = 0;
		let enterEventCount = 0;

		scrollElement.on('enter-viewport', () => {
			enterEventCount += 1;
		});

		scrollElement.on('destroyed', () => {
			destroyedEventCount += 1;
		});

		scrollElement.destroy();
		await scroll(0);

		t.equal(enterEventCount, 1, 'instance destroyed after firing one event');
		t.equal(destroyedEventCount, 1, 'destroyed event captured');
		t.end();
	});

	test.test('should destroy all ScrollElements when container is destroyed.', async t => {
		const scrollElement = scrollTrack.create(10);
		const scrollElement2 = scrollTrack.create(1);
		let destroyedEventCount = 0;
		let enterEventCount = 0;

		scrollElement.on('enter-viewport', () => {
			enterEventCount += 1;
		});

		scrollElement.on('destroyed', () => {
			destroyedEventCount += 1;
		});

		scrollElement2.on('destroyed', () => {
			destroyedEventCount += 1;
		});

		await scroll(100);
		scrollTrack.destroy();
		await scroll(0);

		t.equal(enterEventCount, 1, 'instance destroyed after firing one event');
		t.equal(destroyedEventCount, 2, 'destroyed event captured for all container ScrollElements');
		t.end();
	});
});
