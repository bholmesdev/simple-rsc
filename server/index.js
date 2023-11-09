import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { build as esbuild } from 'esbuild';
import { resolveApp, resolveDist } from './utils.js';
import * as ReactServerDom from 'react-server-dom-webpack/server.browser';
import { createElement } from 'react';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFile, writeFile } from 'node:fs/promises';
import { init, parse } from 'es-module-lexer';

const clientComponentMap = {};
const app = new Hono();

await init;

app.get('/rsc', async (c) => {
	const { default: Page } = await import('../dist/page.js');
	const Comp = createElement(Page, {});
	const stream = ReactServerDom.renderToReadableStream(Comp, clientComponentMap);
	return new Response(stream, {
		headers: {
			'Content-type': 'react-jsx'
		}
	});
});

app.get('/dist/*', serveStatic({ root: './' }));

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
		outdir: resolveDist(),
		// avoid bundling npm packages
		packages: 'external',
		loader: {
			'.js': 'jsx'
		},
		plugins: [
			{
				name: 'resolve-client-imports',
				setup(build) {
					// Intercept component imports to find client entry points
					build.onResolve({ filter: /\.jsx$/ }, async ({ path }) => {
						const contents = await readFile(resolveApp(path), 'utf-8');
						if (!contents.startsWith('"use client"')) return;

						const distPath = resolveDist(path.replace(/\.jsx$/, '.js'));
						await esbuild({
							bundle: true,
							format: 'esm',
							logLevel: 'error',
							entryPoints: [resolveApp(path)],
							outdir: resolveDist(),
							// avoid bundling npm packages
							packages: 'external'
						});
						let builtContents = await readFile(distPath, 'utf-8');
						const [, exports] = parse(builtContents);
						for (const exp of exports) {
							const id = distPath + exp.n;

							clientComponentMap[id] = {
								id: `/dist/${path.replace(/\.jsx$/, '.js')}`,
								name: exp.n
							};

							builtContents += `
							${exp.ln}.$$typeof = Symbol.for("react.client.reference");
							${exp.ln}.$$id = ${JSON.stringify(id)};
							`;
						}

						await writeFile(distPath, builtContents);

						return {
							path: distPath
						};
					});
				}
			}
		]
	});
}

/**
 * @param {string} id React client component id
 * @param {string} raw File contents
 * @returns {string}
 */
function getClientComponentModule(id, raw) {
	return `${raw}
	module.exports.default.$$typeof = Symbol.for("react.client.reference");
	module.exports.default.$$id=${JSON.stringify(id)};`;
}
