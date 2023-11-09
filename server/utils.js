import { fileURLToPath } from 'node:url';

export const app = new URL('../app/', import.meta.url);
export const dist = new URL('../dist/', import.meta.url);

/**
 *
 * @param {string} path
 * @returns {string}
 */
export function resolveApp(path) {
	return fileURLToPath(new URL(path, app));
}

/**
 *
 * @param {string} path
 * @returns {string}
 */
export function resolveDist(path = '') {
	return fileURLToPath(new URL(path, dist));
}
