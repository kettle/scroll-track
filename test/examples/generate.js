#!/usr/bin/env node
/* eslint camelcase: ["error", {properties: "never"}] */
'use strict';

const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const mkdirp = require('mkdirp');
const beautify = require('js-beautify').html;

const SRC = path.join(__dirname, 'html');

function HtmlGenerator() {
	this.includesDir = path.join(__dirname, 'html/includes/');
	this.files = fs.readdirSync(SRC)
		.filter(f => path.parse(f).ext === '.html')
		.map(f => {
			return {name: path.parse(f).name};
		});
}

module.exports = HtmlGenerator;

HtmlGenerator.prototype._getRenderer = function (includeFile) {
	const include = path.join(this.includesDir, includeFile);
	const includeData = fs.readFileSync(include).toString();
	return ejs.compile(includeData);
};

/**
 * Iterates through pages collection of configuration object and generates
 * a page for each entry
 * @return {Promise} Resolves on success with paths to generated files, rejects on error
 */
HtmlGenerator.prototype.createPages = function () {
	return new Promise((resolve, reject) => {
		const baseRenderer = this._getRenderer('base.html');

		const promises = this.files.map(page => {
			return new Promise((resolve, reject) => {
				const filename = path.join(SRC, `${page.name}.html`);
				const output = path.join(__dirname, '..', '..', 'tmp', `${page.name}.html`);

				mkdirp.sync(path.parse(output).dir);

				fs.readFile(filename, (error, data) => {
					if (error) {
						return reject(error);
					}

					const pageRenderer = ejs.compile(data.toString(), {filename});

					page.pages = [];

					this.files.forEach(p => {
						if (p.name !== 'index') {
							page.pages.push(p.name);
						}
					});

					page.content = pageRenderer(page);

					const markup = beautify(baseRenderer(page), {
						indent_char: '\t',
						'preserve-newlines': false,
						extra_liners: []
					}).replace(/&nbsp;/g, ' ');

					fs.writeFile(output, markup, error => {
						if (error) {
							return reject(error);
						}

						return resolve(output);
					});
				});
			});
		});

		Promise
			.all(promises)
			.then(results => resolve(results))
			.catch(error => reject(error));
	});
};
