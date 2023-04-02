import { build as esbuild } from 'esbuild';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	jsxExts,
	relativeOrAbsolutePath,
	resolveClientDist,
	resolveDist,
	resolveSrc,
	writeClientComponentMap
} from './utils.js';

/**
 * Build all server and client components with esbuild
 *
 * @returns {Promise<Record<string, any>>} bundleMap for streaming
 */
export async function build() {
	/** @type {Record<string, any>} */
	const bundleMap = {};
	/** @type {Set<string>} */
	const clientEntryPoints = new Set();

	console.log('💿 Building server components');
	const serverDist = resolveDist('server/');
	if (!fs.existsSync(serverDist)) {
		await fs.promises.mkdir(serverDist, { recursive: true });
	}

	/** @type {import('esbuild').BuildOptions} */
	const sharedConfig = {
		bundle: true,
		format: 'esm',
		logLevel: 'error'
	};

	const USE_CLIENT_ANNOTATIONS = ['"use client"', "'use client'"];

	await esbuild({
		...sharedConfig,
		entryPoints: [fileURLToPath(resolveSrc('page.jsx'))],
		outdir: fileURLToPath(serverDist),
		packages: 'external',
		plugins: [
			{
				name: 'resolve-client-imports',
				setup(build) {
					build.onResolve({ filter: relativeOrAbsolutePath }, async ({ path }) => {
						for (const jsxExt of jsxExts) {
							// Note: assumes file extension is omitted
							const absoluteSrc = new URL(resolveSrc(path) + jsxExt);

							if (fs.existsSync(absoluteSrc)) {
								// Check for `"use client"` annotation
								const contents = await fs.promises.readFile(absoluteSrc, 'utf-8');
								if (USE_CLIENT_ANNOTATIONS.some((annotation) => contents.startsWith(annotation)))
									return;

								clientEntryPoints.add(fileURLToPath(absoluteSrc));
								const absoluteDist = new URL(resolveClientDist(path) + '.js');

								// Resolved as client-side ESM import
								const id = new URL(`${path}.js`, 'file:///dist/client/').pathname;

								bundleMap[id] = {
									id,
									chunks: [],
									name: 'default', // TODO support named exports
									async: true
								};

								return {
									path: `data:text/javascript,import DefaultExport from ${JSON.stringify(
										absoluteDist.href
									)};DefaultExport.$$typeof = Symbol.for("react.client.reference");DefaultExport.$$id=${JSON.stringify(
										id
									)};export default DefaultExport`,
									external: true
								};
							}
						}
					});
				}
			}
		]
	});

	const clientDist = resolveDist('client/');
	if (!fs.existsSync(clientDist)) {
		await fs.promises.mkdir(clientDist, { recursive: true });
	}

	if (clientEntryPoints.size > 0) {
		console.log('🏝 Building client components');
	}

	await esbuild({
		...sharedConfig,
		entryPoints: [...clientEntryPoints, fileURLToPath(resolveSrc('_router.jsx'))],
		outdir: fileURLToPath(clientDist),
		splitting: true
	});

	await writeClientComponentMap(bundleMap);

	return bundleMap;
}
