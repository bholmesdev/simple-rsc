/**
 * The dev server opens a socket connection to tell
 * the browser when files have changed.
 * This listens to that socket to trigger a refresh.
 */
(function liveReload() {
	let socket, reconnectionTimerId;

	// Construct the WebSocket url from the current
	// page origin.
	const requestUrl = 'ws://localhost:21717/';
	connect(() => {
		console.log('Live reload connected on', requestUrl);
	});

	function log(message) {
		console.info('[refresh] ', message);
	}

	function refresh() {
		window.location.reload();
	}

	/**
	 * Create WebSocket, connect to the server and
	 * listen for refresh events.
	 */
	function connect(callback) {
		if (socket) {
			socket.close();
		}

		socket = new WebSocket(requestUrl);

		// When the connection opens, execute the callback.
		socket.addEventListener('open', callback);

		socket.addEventListener('message', (event) => {
			if (event.data === 'refresh') {
				log('refreshing...');
				refresh();
			}
		});

		// Handle when the WebSocket closes. We log
		// the loss of connection and set a timer to
		// start the connection again after a second.
		socket.addEventListener('close', () => {
			log('connection lost - reconnecting...');

			clearTimeout(reconnectionTimerId);

			reconnectionTimerId = setTimeout(() => {
				connect(refresh);
			}, 1000);
		});
	}
})();
