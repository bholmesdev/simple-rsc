import { createServer } from '@hattip/adapter-node';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
import chokidar from 'chokidar';
import { handler } from './index.js';
import { build } from './build.js';
import { src } from './utils.js';

const port = 3000;

process.env.NODE_ENV = 'development';

createServer(handler).listen(port, 'localhost', async () => {
	await build();
	console.log(`⚛️ Future of React started on http://localhost:${port}`);
});

// File watcher to trigger browser refreshes
// ------------

const refreshPort = 21717;

const wsServer = new WebSocketServer({
	port: refreshPort
});

/** @type {Set<import('ws').WebSocket>} */
const sockets = new Set();

wsServer.on('connection', (ws) => {
	sockets.add(ws);

	ws.on('close', () => {
		sockets.delete(ws);
	});

	ws.send('connected');
});

/**
 * Watch files in the `app/` directory
 * and trigger a build + refresh on change.
 */
(async function buildWatch() {
	chokidar.watch(fileURLToPath(src), { ignoreInitial: true }).on('all', async (event, path) => {
		console.log('[change]', relative(fileURLToPath(src), path));
		await build();

		for (const socket of sockets) {
			socket.send('refresh');
		}
	});
})();
