import fs from "node:fs";

export const src = new URL("../src/", import.meta.url);
export const dist = new URL("../dist/", import.meta.url);
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

export async function writeBundleMap(bundleMap) {
  const bundleMapPath = resolveDist("bundleMap.json");
  await fs.promises.writeFile(bundleMapPath, JSON.stringify(bundleMap));
}

export async function readBundleMap() {
  const bundleMapPath = resolveDist("bundleMap.json");
  const bundleMap = await fs.promises.readFile(bundleMapPath, "utf-8");
  return JSON.parse(bundleMap);
}
