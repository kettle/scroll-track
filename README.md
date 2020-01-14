![100% test coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

# ScrollTrack
> Associates an event emitter with an element to broadcast its position in the viewport with respect to the scroll position of a container.

[Demos](http://kettle-modules.s3.amazonaws.com/scroll-track/stress.html)

Borrowing heavily from the [scrollMonitor](https://npmjs.com/scrollmonitor) package, ScrollTrack implements the standard Node event emitter in 
place of the custom implementation used by ScrollMonitor. ScrollTrack also (subjectively) simplifies the code base, uses transpiled ES6 classes, 
has full test coverage, supports `vh`-based offsets, and addresses a few (subjective) bugs.

The module consists of a `ScrollElementContainer` class and a `ScrollElement` class. By default, when required, the module instantiates a singleton 
instance of `ScrollElementContainer` and exports it. Therefore, when creating a new `ScrollElement` (via `ScrollElementContainer.create()`), the 
`ScrollElement` is added to the singleton and available globally (assuming you have a reference to the module on a given module). This approach will 
avoid adding additional scroll and resize listeners to the window even if you require the module from multiple places in your project.

To create a new container, do not instantiate a new `ScrollElementContainer`. Instead, call the singleton's `createContainer` method. This will ensure
that your new container still uses the singleton for capturing `scroll` and `resize` events (rather than piling on more listeners unneccesarily). 

Capturing scroll and resize events on the window can quickly cause performance issues. The module is designed to avoid such issues by implementing the
architecture defined above, while also using [passive event listening](https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md) when available. Passive event listening provides performance-conscientious scroll and
resize event tracking on the window (or any `ScrollElementContainer` item).

This module's only dependencies are the [`events`](https://www.npmjs.com/package/events) module, which provides access to the native node `EventEmitter` in
a browser environment, and the [`debounce`](https://www.npmjs.com/package/debounce) module to debounce the resize event listener on the window.

## Installation
Install via npm:

```sh
$ npm i scroll-track
```

## Basic Usage
```javascript
// Exports the ScrollElementContainer singleton
const scrollTrack = require('scroll-track');

const el = document.querySelector('.some-selector');
// NOTE: the create method will throw an error if passed an invalid selector string
const tracker = scrollTrack.create(el);
// or, const tracker = scrollTrack.create('.some-selector');
// or, const tracker = scrollTrack.create(10);
// or, const tracker = scrollTrack.create({top: 10, bottom: 20});

tracker.once('enter-viewport', () => console.log('entered viewport'));
tracker.on('exit-viewport', () => console.log('exited viewport'));
````


## ScrollElement
Create watcher objects with `scrollMonitor.create(item)`. An optional second argument lets you receive events before or after this element 
enters the viewport. _See "[Offsets](#offsets)"_.

`item` can be one of the following:
* `Element` - the ScrollElement will watch the area contained by the DOM element.
* `Object` - `top` and `bottom` properties will be used to set the ScrollElement's `top` and `bottom` properties.
* `Number` - the ScrollElement will watch a 1px area this many pixels from the top. Negative numbers will watch from the bottom.
* `String` - it will use the string as a CSS selector and watch the first match.
* `NodeList / Array` - it will use the first DOM element.

ScrollElement are automatically recalculated on the first scroll event after the height of the document changes. 
They will also fire events immediately after an event listener is attached if appropriate.


### ScrollElement Properties
* `ScrollElement.isInViewport` - true if any part of the element is visible, false if not.
* `ScrollElement.isFullyInViewport` - true if the entire element is visible [^1].
* `ScrollElement.isAboveViewport` - true if any part of the element is above the viewport.
* `ScrollElement.isBelowViewport` - true if any part of the element is below the viewport.
* `ScrollElement.top` - distance from the top of the document to the top of this watcher.
* `ScrollElement.bottom` - distance from the top of the document to the bottom of this watcher.
* `ScrollElement.height` - top - bottom.
* `ScrollElement.watchItem` - the element, number, or object that this watcher is watching.

[^1]: If the element is larger than the viewport `isFullyInViewport` is true when the element spans the entire viewport.


### ScrollElement Methods
* `ScrollElement.recalculateLocation` - recalculates the location of the element in relation to the document.
* `ScrollElement.getOffsets` - returns an object that defines the top and bottom offsets of this watcher.
* `ScrollElement.destroy` - removes this ScrollElement and its event listeners.
* `ScrollElement.lock` - locks the ScrollElement at its current location.
* `ScrollElement.unlock` - unlocks the ScrollElement.

ScrollElement is an instance of `EventEmitter`, so it also has familiar methods such as `on`, `once`, `removeListener`, etc. 
Review all inherited methods from the [Node events documentation](https://nodejs.org/api/events.html).

These methods are automatically called by the `ScrollElementContainer`, but they can be called manually if necessary:
* `ScrollElement.update` - updates the boolean properties in relation to the viewport. Does not trigger events.
* `ScrollElement.triggerCallbacks` - triggers any callbacks that need to be called.


### ScrollElement Events
* `visibility-change` - when the element enters or exits the viewport.
* `state-change` - similar to `visibility-change` but is also called if the element goes from below the viewport to above it in one scroll event or when the element goes from partially to fully visible or vice versa.
* `enter-viewport` - when the element enters the viewport.
* `fully-enter-viewport` - when the element is completely in the viewport [^2].
* `exit-viewport` - when the element completely leaves the viewport.
* `partially-exit-viewport` - when the element goes from being fully in the viewport to only partially [^3].

[^2]: If the element is larger than the viewport `fully-enter-viewport` will be triggered when the element spans the entire viewport.
[^3]: If the element is larger than the viewport `partially-exit-viewport` will be triggered when the element no longer spans the entire viewport.


### ScrollElement Locking

Sometimes you want to change the element you're watching, but want to continue watching the original area. One common use case is setting 
`position: fixed` on an element when it exits the viewport, then removing positioning when it when it reenters.

```javascript
const scrollTrack = require('scroll-track');
const tracker = scrollTrack.create(element);

tracker.lock();

tracker.on('exit-viewport', () => {
  element.classList.add('fixed');
});

tracker.on('enter-viewport', () => {
  element.classList.remove('fixed');
});
```

Because the watcher was locked, the scroll monitor will not recalculate its location until unlocked.


### ScrollElement Offsets
If you want to trigger an event when the edge of an element is near the edge of the viewport, you can use offsets. The offset 
is the second argument to `ScrollElementContainer.create()`. You can also create viewport-height-relative offsets by passing a 
string suffixed with `vh`.

This will trigger events when an element gets within 200px of the viewport:

```javascript
const scrollTrack = require('scroll-track');

scrollTrack.create(element, 200);
```

This will trigger when the element is 200px inside the viewport:

```javascript
const scrollTrack = require('scroll-track');

scrollTrack.create(element, -200);
```

If you only want it to affect the top and bottom differently:
 
```javascript
const scrollTrack = require('scroll-track');

scrollTrack.create(element, {top: 200, bottom: 50});
```

 If you only want it to affect the top and not the bottom:

```javascript
const scrollTrack = require('scroll-track');

scrollTrack.create(element, {top: 200});
 ```

This will trigger when the element when it is 1 viewport height from entering the view:

```javascript
const scrollTrack = require('scroll-track');

scrollTrack.create(element, {top: '100vh'});
``` 


## ScrollElementContainer
### ScrollElementContainer Properties
* `ScrollElementContainer.viewportTop` - distance from the top of the document to the top of the viewport.
* `ScrollElementContainer.viewportBottom` - distance from the top of the document to the bottom of the viewport.
* `ScrollElementContainer.viewportHeight` - height of the viewport.
* `ScrollElementContainer.contentHeight` - height of the document.

### ScrollElementContainer Methods
* `ScrollElementContainer.createContainer(containerElement)` - returns a new ScrollElementContainer that can be used just like the scrollTrack module.
* `ScrollElementContainer.create(item, offsets)` - returns a new watcher. `item` is a DOM element, NodeList, CSS selector, an object with .top and .bottom properties, or a number.
* `ScrollElementContainer.update()` - update all ScrollElements within the ScrollElementContainer and trigger their events.
* `ScrollElementContainer.recalculateLocations()` - recalculate the location of all unlocked ScrollElements and trigger events if needed.


### Creating a ScrollElementContainer
By default, the `container` for any `ScrollElement` created via the `ScrollElementContainer.create()` method will be the window.
If you want to create a `ScrollElement` within a container element, first create a container, and then call that container's `create` method to create a `ScrollElement` within it.


```javascript
const containerEl = document.querySelector('.container');
const container = scrollMonitor.createContainer(containerEl);

const scrollEl = document.querySelector('.some-element');
const scrollElement = container.create(scrollEl);

scrollElement.on('enter-viewport', () => console.log('.some-element has entered the viewport'));
scrollElement.on('exit-viewport', () => console.log('.some-element has left the viewport'));
```


## Tests, Coverage, Docs, Demos and Building for Release

To run the tests:

```shell
$ npm test
```

To generate a coverage report:

```shell
$ npm run coverage
```

To generate documentation:

```shell
$ npm run docs
```

To generate the demos:

```shell
$ npm run demo
```

To generate a bundle for distribution:

```shell
$ npm run dist
```

To run a watch when authoring new examples:

```shell
$ npm run watch
```
