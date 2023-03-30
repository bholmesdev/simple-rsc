import { build as esbuild } from "esbuild";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  jsxExts,
  relativeOrAbsolutePath,
  resolveClientDist,
  resolveDist,
  resolveSrc,
  writeBundleMap,
} from "./index.js";

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

  console.log("💿 Building server components");
  const serverDist = resolveDist("server/");
  if (!fs.existsSync(serverDist)) {
    await fs.promises.mkdir(serverDist, { recursive: true });
  }

  await esbuild({
    entryPoints: [fileURLToPath(resolveSrc("root.server.jsx"))],
    outdir: fileURLToPath(serverDist),
    bundle: true,
    packages: "external",
    format: "esm",
    logLevel: "error",
    plugins: [
      {
        name: "resolve-client-imports",
        setup(build) {
          build.onResolve(
            { filter: relativeOrAbsolutePath },
            async ({ path, ...opts }) => {
              for (const jsxExt of jsxExts) {
                // Note: assumes file extension is omitted
                const absoluteSrc = new URL(resolveSrc(path) + jsxExt);

                if (fs.existsSync(absoluteSrc)) {
                  // Check for `"use client"` annotation
                  const contents = await fs.promises.readFile(
                    absoluteSrc,
                    "utf-8"
                  );
                  if (!contents.startsWith('"use client"')) return;

                  clientEntryPoints.add(fileURLToPath(absoluteSrc));
                  const absoluteDist = new URL(resolveClientDist(path) + ".js");

                  // Resolved as client-side ESM import
                  const id = new URL(`${path}.js`, "file:///dist/client/")
                    .pathname;

                  bundleMap[id] = {
                    id,
                    chunks: [],
                    name: "default", // TODO support named exports
                    async: true,
                  };

                  return {
                    path: `data:text/javascript,import DefaultExport from ${JSON.stringify(
                      absoluteDist.href
                    )};DefaultExport.$$typeof = Symbol.for("react.client.reference");DefaultExport.$$id=${JSON.stringify(
                      id
                    )};export default DefaultExport`,
                    external: true,
                  };
                }
              }
            }
          );
        },
      },
    ],
  });

  if (clientEntryPoints.size > 0) {
    console.log("🏝 Building client components");
    const clientDist = resolveDist("client/");
    if (!fs.existsSync(clientDist)) {
      await fs.promises.mkdir(clientDist, { recursive: true });
    }

    await esbuild({
      entryPoints: [
        ...clientEntryPoints,
        fileURLToPath(resolveSrc("root.client.jsx")),
      ],
      outdir: fileURLToPath(clientDist),
      bundle: true,
      format: "esm",
      splitting: true,
      logLevel: "error",
    });
  }

  await writeBundleMap(bundleMap);

  return bundleMap;
}
