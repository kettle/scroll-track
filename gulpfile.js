#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const glob = require('glob');
const es = require('event-stream');
const {pipeline} = require('readable-stream');
const autoprefixer = require('gulp-autoprefixer');
const HtmlGenerator = require('./test/examples/generate');

// Location of all built files
const DEST = path.resolve(__dirname, 'tmp');
const DIST = path.resolve(__dirname, 'dist');
const htmlGenerator = new HtmlGenerator();

if (!fs.existsSync(DEST)) {
	fs.mkdirSync(DEST);
}

// Cleans destination directory
gulp.task('clean:all', gulp.series(() => {
	return gulp
		.src(DEST, {read: false})
		.pipe(clean());
}));

// Uglify all demo JS
gulp.task('compress', gulp.series(() => {
	return pipeline(
		gulp.src([path.join(DEST, 'scripts/*.js')]),
		uglify(),
		gulp.dest(path.join(DEST, 'scripts'))
	);
}));

// Uglify dist JS
gulp.task('compress:dist', gulp.series(() => {
	return gulp.src('dist/scroll-track.js')
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(DIST));
}));

// Generates HTML from templates
gulp.task('html', gulp.series(async () => {
	try {
		await htmlGenerator.createPages();
	} catch (error) {
		console.error(error);
	}
}));

// Build example JS
gulp.task('js', gulp.series(done => {
	glob('./test/examples/js/*.js', (err, files) => {
		if (err) {
			console.error(err);
			this.emit('end');
		}

		const tasks = files.map(entry => {
			return browserify({entries: [entry]})
				.transform('babelify', {presets: ['@babel/preset-env']})
				.bundle()
				.on('error', function (err) {
					console.log(err.stack);
					this.emit('end');
				})
				.pipe(source(entry))
				.pipe(rename(p => {
					p.dirname = 'scripts/';
					p.extname = '.built.js';
				}))
				.pipe(gulp.dest(DEST));
		});

		es.merge(tasks).on('end', done);
	});
}));

// Build main JS for standalone distribution
gulp.task('js:dist', gulp.series(() => {
	return browserify('./index.js', {standalone: 'scrollTrack'})
		.transform('babelify', {presets: ['@babel/preset-env']})
		.bundle()
		.on('error', function (error) {
			console.error(error.toString());
			this.emit('end');
		})
		.pipe(source('scroll-track.js'))
		.pipe(gulp.dest(DIST));
}));

// Compile CSS from SCSS
gulp.task('css', gulp.series(() => {
	const sassGlob = ['./test/examples/scss/main.scss'];
	const sassOptions = {outputStyle: 'compressed'};

	return gulp
		.src(sassGlob)
		.pipe(sass(sassOptions).on('error', sass.logError))
		.pipe(rename(path => {
			path.extname = '.built.css';
		}))
		.pipe(autoprefixer())
		.pipe(gulp.dest(path.join(DEST, 'styles')));
}));

// JS watch task
gulp.task('watch:js', () => {
	gulp.watch(['./test/examples/**/*.js', './index.js', './src/*/index.js'], gulp.series('js'));
});

// CSS watch task
gulp.task('watch:css', () => {
	gulp.watch(['./test/examples/**/*.scss'], gulp.series('css'));
});

// HTML watch task
gulp.task('watch:html', () => {
	gulp.watch(['./test/examples/**/*.html'], gulp.series('html'));
});

// Default task; cleans then builds frontend
gulp.task('default', gulp.series('clean:all', 'js', 'css', 'html', 'compress'));

// Bundle for distribution
gulp.task('dist', gulp.series('js:dist', 'compress:dist'));

// Watch task for development use
gulp.task('watch', gulp.series('default', 'watch:js', 'watch:css', 'watch:html'));
