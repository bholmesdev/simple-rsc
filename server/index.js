import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { build as esbuild, transform } from 'esbuild';
import { resolveApp, resolveDist } from './utils.js';
import * as ReactServerDom from 'react-server-dom-webpack/server.browser';
import { createElement } from 'react';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFile, writeFile } from 'node:fs/promises';
import { init, parse } from 'es-module-lexer';
import { relative } from 'node:path';

const clientComponentMap = {};
const app = new Hono();

await init;

app.get('/', async (c) => {
	const html = `
<!DOCTYPE html>
<html>
<head>
	<title>React Server Components from Scratch</title>
</head>
<body>
	<div id="root"></div>
	<script type="module" src="/dist/_client.js"></script>
</body>
</html>`;

	return c.html(html);
});

app.get('/rsc', async (c) => {
	const { default: Page } = await import('../dist/page.js');
	const Comp = createElement(Page, {});
	const stream = ReactServerDom.renderToReadableStream(Comp, clientComponentMap);
	return new Response(stream);
});

app.get('/dist/*', serveStatic({ root: './' }));

serve(app, async (info) => {
	await build();
	console.log(`Listening on http://localhost:${info.port}`);
});

async function build() {
	const clientEntryPoints = new Set();

	await esbuild({
		bundle: true,
		format: 'esm',
		logLevel: 'error',
		entryPoints: [resolveApp('page.jsx')],
		outdir: resolveDist(),
		// avoid bundling npm packages
		packages: 'external',
		plugins: [
			{
				name: 'resolve-client-imports',
				setup(build) {
					// Intercept component imports to find client entry points
					build.onResolve({ filter: /\.jsx$/ }, async ({ path }) => {
						const contents = await readFile(resolveApp(path), 'utf-8');
						if (!contents.startsWith("'use client'")) return;

						const distPath = resolveDist(path.replace(/\.jsx$/, '.js'));
						clientEntryPoints.add(resolveApp(path));

						return { path: distPath, external: true };
					});
				}
			}
		]
	});

	const results = await esbuild({
		bundle: true,
		format: 'esm',
		logLevel: 'error',
		entryPoints: [resolveApp('_client.jsx'), ...clientEntryPoints],
		outdir: resolveDist(),
		splitting: true,
		write: false
	});

	results.outputFiles?.forEach(async (file) => {
		const [, exports] = parse(file.text);
		let newContents = file.text;

		for (const exp of exports) {
			const key = file.path + exp.n;

			clientComponentMap[key] = {
				id: `/dist/${relative(resolveDist(), file.path)}`,
				name: exp.n,
				chunks: [],
				async: true
			};

			newContents += `
${exp.ln}.$$typeof = Symbol.for("react.client.reference");
${exp.ln}.$$id = ${JSON.stringify(key)};
			`;
		}

		await writeFile(file.path, newContents);
	});
}
