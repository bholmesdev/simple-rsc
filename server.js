import { serve } from '@hono/node-server';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import { build as esbuild } from 'esbuild';
import * as ReactServerDom from 'react-server-dom-webpack/server.browser';
import { createElement } from 'react';

const clientComponentMap = {};
const app = new Hono();

app.get('/rsc', async (c) => {
	const { default: Page } = await import('./build/page.js');
	const Comp = createElement(Page, {});
	const stream = ReactServerDom.renderToReadableStream(Comp, clientComponentMap);
	return new Response(stream);
});

serve(app, async (info) => {
	await build();
	console.log(`Listening on http://localhost:${info.port}`);
});

async function build() {
	await esbuild({
		bundle: true,
		format: 'esm',
		logLevel: 'error',
		entryPoints: [resolveApp('page.jsx')],
		outdir: resolveBuild(),
		// avoid bundling npm packages
		packages: 'external'
	});
}

const appDir = new URL('./app/', import.meta.url);
const buildDir = new URL('./build/', import.meta.url);

function resolveApp(path = '') {
	return fileURLToPath(new URL(path, appDir));
}

function resolveBuild(path = '') {
	return fileURLToPath(new URL(path, buildDir));
}
