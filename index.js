'use strict';

const ScrollElementContainer = require('./src/scroll-element-container');
const ScrollElement = require('./src/scroll-element');

module.exports = new ScrollElementContainer(document.body);
module.exports.ScrollElement = ScrollElement;
