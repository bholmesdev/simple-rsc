import { createServer } from '@hattip/adapter-node';
import { handler } from './handler.js';
import { compose } from '@hattip/compose';
import { clientAssetsMiddleware } from './client-assets.js';
import chokidar from 'chokidar';
import { build } from './utils/build.js';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'node:url';
import { src } from './utils/index.js';
import { relative } from 'node:path';

const port = 3000;

process.env.NODE_ENV = 'development';

createServer(compose(clientAssetsMiddleware, handler)).listen(port, 'localhost', async () => {
	await build();
	console.log(`⚛️ Future of React started on http://localhost:${port}`);
});

const refreshPort = 21717;

const wsServer = new WebSocketServer({
	port: refreshPort
});

/** @type {Set<import('ws').WebSocket>} */
const sockets = new Set();

wsServer.on('connection', (ws) => {
	ws.on('message', (message) => {
		console.log(`Received message => ${message}`);
	});

	sockets.add(ws);

	ws.on('close', () => {
		sockets.delete(ws);
	});

	ws.send('connected');
});

/**
 * Watch files from src directory
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
