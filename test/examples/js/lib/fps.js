'use strict';

module.exports = () => {
	const fpsDiv = document.createElement('div');
	const times = [];
	let lastFps = null;
	let fps;
	let hasInitialized = false;

	fpsDiv.setAttribute('id', 'fps');
	fpsDiv.textContent = '⌛︎';
	document.documentElement.append(fpsDiv);

	const refreshLoop = () => {
		requestAnimationFrame(() => {
			const now = performance.now();

			while (times.length > 0 && times[0] <= now - 1000) {
				times.shift();
			}

			times.push(now);

			if (!hasInitialized) {
				if (times.length < 50) {
					return refreshLoop();
				}

				hasInitialized = true;
			}

			fps = times.length > 60 ? 60 : times.length;

			if (fps !== lastFps) {
				lastFps = fps;
				fpsDiv.textContent = `${fps} fps`;
			}

			refreshLoop();
		});
	};

	if (typeof requestIdleCallback !== 'undefined') {
		requestIdleCallback(() => {
			refreshLoop();
		});
	} else {
		setTimeout(() => {
			refreshLoop();
		}, 500);
	}
};
