export const src = new URL("../../src/", import.meta.url);
export const dist = new URL("../../dist/", import.meta.url);
export const jsxExts = [".jsx", ".tsx"];

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
