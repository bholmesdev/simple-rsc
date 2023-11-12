import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { build as esbuild } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { serveStatic } from '@hono/node-server/serve-static';
import * as ReactServerDom from 'react-server-dom-webpack/server.browser';
import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'es-module-lexer';
import { relative } from 'node:path';

const app = new Hono();
const clientComponentMap = {};

app.get('/', async (c) => {
	return c.html(`
	<!DOCTYPE html>
	<html>
	<head>
		<title>React Server Components from Scratch</title>
		<script src="https://cdn.tailwindcss.com"></script>
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="/build/_client.js"></script>
	</body>
	</html>
	`);
});

app.get('/rsc', async (c) => {
	const Page = await import('./build/page.js');
	const Comp = createElement(Page.default);
	const stream = ReactServerDom.renderToReadableStream(Comp, clientComponentMap);
	return new Response(stream);
});

app.use('/build/*', serveStatic());

async function build() {
	const clientEntryPoints = new Set();

	await esbuild({
		bundle: true,
		format: 'esm',
		logLevel: 'error',
		entryPoints: [resolveApp('page.jsx')],
		outdir: resolveBuild(),
		// avoid bundling npm packages
		packages: 'external',
		plugins: [
			{
				name: 'resolve-client-imports',
				setup(build) {
					// Intercept component imports to find client entry points
					build.onResolve({ filter: /\.jsx$/ }, async ({ path: relativePath }) => {
						const path = resolveApp(relativePath);
						const contents = await readFile(path, 'utf-8');

						if (contents.startsWith("'use client'")) {
							clientEntryPoints.add(path);
							return {
								path: relativePath.replace(/\.jsx$/, '.js'),
								external: true
							};
						}
					});
				}
			}
		]
	});

	const { outputFiles } = await esbuild({
		bundle: true,
		format: 'esm',
		logLevel: 'error',
		entryPoints: [resolveApp('_client.jsx'), ...clientEntryPoints],
		outdir: resolveBuild(),
		splitting: true,
		plugins: [],
		write: false
	});

	outputFiles.forEach(async (file) => {
		const [, exports] = parse(file.text);
		let newContents = file.text;

		for (const exp of exports) {
			const key = file.path + exp.n;

			clientComponentMap[key] = {
				id: `/build/${relative(resolveBuild(), file.path)}`,
				name: exp.n,
				chunks: [],
				async: true
			};

			newContents += `
${exp.ln}.$$id = ${JSON.stringify(key)};
${exp.ln}.$$typeof = Symbol.for("react.client.reference");
			`;
		}
		await writeFile(file.path, newContents);
	});
}

serve(app, async (info) => {
	await build();
	console.log(`Listening on http://localhost:${info.port}`);
});

const appDir = new URL('./app/', import.meta.url);
const buildDir = new URL('./build/', import.meta.url);

function resolveApp(path = '') {
	return fileURLToPath(new URL(path, appDir));
}

function resolveBuild(path = '') {
	return fileURLToPath(new URL(path, buildDir));
}
