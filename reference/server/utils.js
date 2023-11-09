import fs from 'node:fs';

export const src = new URL('../app/', import.meta.url);
export const dist = new URL('../dist/', import.meta.url);

/**
 *
 * @param {string} path
 * @returns {URL}
 */
export function resolveSrc(path) {
	return new URL(path, src);
}

/**
 *
 * @param {string} path
 * @returns {URL}
 */
export function resolveDist(path) {
	return new URL(path, dist);
}

export function resolveClientDist(path) {
	return new URL(path, resolveDist('client/'));
}

export function resolveServerDist(path) {
	return new URL(path, resolveDist('server/'));
}

export const clientComponentMapUrl = resolveDist('clientComponentMap.json');

export async function writeClientComponentMap(bundleMap) {
	await fs.promises.writeFile(clientComponentMapUrl, JSON.stringify(bundleMap));
}

export async function readClientComponentMap() {
	const bundleMap = await fs.promises.readFile(clientComponentMapUrl, 'utf-8');
	return JSON.parse(bundleMap);
}
