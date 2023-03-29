import * as ReactServerDom from "react-server-dom-webpack/server.browser";
import fs from "node:fs";
import { build as esbuild } from "esbuild";
import { fileURLToPath } from "node:url";
import {
  dist,
  jsxExts,
  relativeOrAbsolutePath,
  resolveClientDist,
  resolveDist,
  resolveSrc,
} from "./utils/index.js";

/** @type {import('@hattip/core').HattipHandler} */
export async function handler(context) {
  const { pathname } = new URL(context.request.url);
  if (pathname === "/check") {
    return new Response("Server's running!");
  }
  if (pathname.startsWith("/__routes/")) {
    const routePath = pathname.replace(/^\/__routes\//, "");
    return new Response(routePath);
  }
  if (pathname === "/") {
    const html = await fs.promises.readFile(
      new URL("index.html", import.meta.url),
      "utf-8"
    );
    return new Response(html);
  }
  if (pathname === "/root") {
    const bundleMap = await build();
    const App = await import(resolveDist("server/index.js").href);

    const stream = ReactServerDom.renderToReadableStream(
      App.default(),
      bundleMap
    );
    return new Response(stream);
  }
  return new Response("Not found", { status: 404 });
}

/**
 * Build all server and client components with esbuild
 *
 * @returns {Promise<Record<string, any>>} bundleMap for streaming
 */
async function build() {
  /** @type {Record<string, any>} */
  const bundleMap = {};
  /** @type {Set<string>} */
  const clientEntryPoints = new Set();

  const serverDist = resolveDist("server/");
  if (!fs.existsSync(serverDist)) {
    await fs.promises.mkdir(serverDist, { recursive: true });
  }

  console.log("💿 Building server components");
  await esbuild({
    entryPoints: [fileURLToPath(resolveSrc("index.jsx"))],
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
            ({ path, ...opts }) => {
              for (const jsxExt of jsxExts) {
                // Note: assumes file extension is omitted
                const absoluteSrc = new URL(resolveSrc(path) + jsxExt);

                if (fs.existsSync(absoluteSrc)) {
                  clientEntryPoints.add(fileURLToPath(absoluteSrc));
                  const absoluteDist = new URL(resolveClientDist(path) + ".js");

                  bundleMap[absoluteDist.href] = {
                    id: absoluteDist.href,
                    chunks: [],
                    name: "LikeButton", // TODO generate
                    async: true,
                  };

                  return {
                    path: `data:text/javascript,import DefaultExport from ${JSON.stringify(
                      absoluteDist.href
                    )};DefaultExport.$$typeof = Symbol.for("react.client.reference");DefaultExport.$$id=${JSON.stringify(
                      absoluteDist.href
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
  console.log("🏝 Building client components");

  const clientDist = resolveDist("client/");
  if (!fs.existsSync(clientDist)) {
    await fs.promises.mkdir(clientDist, { recursive: true });
  }

  await esbuild({
    entryPoints: [...clientEntryPoints],
    outdir: fileURLToPath(clientDist),
    bundle: true,
    format: "esm",
    splitting: true,
    logLevel: "error",
  });
  console.log("Done!");

  return bundleMap;
}
