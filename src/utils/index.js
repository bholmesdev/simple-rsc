export const src = new URL("../../src/", import.meta.url);
export const dist = new URL("../../dist/", import.meta.url);
export const jsxExts = [".jsx", ".tsx"];
export const relativeOrAbsolutePath = /^\.{0,2}\//;

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
  return new URL(path, resolveDist("client/"));
}

export function resolveServerDist(path) {
  return new URL(path, resolveDist("server/"));
}
