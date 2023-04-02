import { build as esbuild } from 'esbuild';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolveClientDist, resolveDist, resolveSrc, writeClientComponentMap } from './utils.js';

const USE_CLIENT_ANNOTATIONS = ['"use client"', "'use client'"];
const JSX_EXTS = ['.jsx', '.tsx'];
const relativeOrAbsolutePathRegex = /^\.{0,2}\//;

/**
 * Build all server and client components with esbuild
 */
export async function build() {
	/**
	 * Mapping from client-side component ID to React metadata.
	 * This is read by the server when generating the RSC stream.
	 * @type {Record<string, any>}
	 */
	const clientComponentMap = {};

	/**
	 * Discovered client modules to bundle with esbuild separately.
	 * @type {Set<string>}
	 */
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

	await esbuild({
		...sharedConfig,
		entryPoints: [fileURLToPath(resolveSrc('page.jsx'))],
		outdir: fileURLToPath(serverDist),
		packages: 'external',
		plugins: [
			{
				name: 'resolve-client-imports',
				setup(build) {
					// Intercept component imports to find client entry points
					build.onResolve({ filter: relativeOrAbsolutePathRegex }, async ({ path }) => {
						for (const jsxExt of JSX_EXTS) {
							// Note: assumes file extension is omitted
							// i.e. import paths are './Component', not './Component.jsx'
							const absoluteSrc = new URL(resolveSrc(path) + jsxExt);

							if (fs.existsSync(absoluteSrc)) {
								// Check for `"use client"` annotation. Short circuit if not found.
								const contents = await fs.promises.readFile(absoluteSrc, 'utf-8');
								if (!USE_CLIENT_ANNOTATIONS.some((annotation) => contents.startsWith(annotation)))
									return;

								clientEntryPoints.add(fileURLToPath(absoluteSrc));
								const absoluteDist = new URL(resolveClientDist(path) + '.js');

								// Path the browser will import this client-side component from.
								// This will be fulfilled by the server router.
								// @see './index.js'
								const id = `/dist/client/${path}.js`;

								clientComponentMap[id] = {
									id,
									chunks: [],
									name: 'default', // TODO support named exports
									async: true
								};

								return {
									// Encode the client component module in the import URL.
									// This is a... wacky solution to avoid import middleware.
									path: `data:text/javascript,${encodeURIComponent(
										getClientComponentModule(id, absoluteDist.href)
									)}`,
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

	// Write mapping from client-side component ID to chunk
	// This is read by the server when generating the RSC stream.
	await writeClientComponentMap(clientComponentMap);
}

/**
 * Wrap a client-side module import with metadata
 * that tells React this is a client-side component.
 * @param {string} id Client-side component ID. Used to look up React metadata.
 * @param {string} localImportPath Path to client-side module on the file system.
 */
function getClientComponentModule(id, localImportPath) {
	return `import DefaultExport from ${JSON.stringify(localImportPath)};
	DefaultExport.$$typeof = Symbol.for("react.client.reference");
	DefaultExport.$$id=${JSON.stringify(id)};
	export default DefaultExport;`;
}
