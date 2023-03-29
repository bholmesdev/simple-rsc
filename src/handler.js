import * as ReactServerDom from "react-server-dom-webpack/server.browser";
import fs from "node:fs";
import { build as esbuild } from "esbuild";
import { fileURLToPath } from "node:url";
import { dist, jsxExts, resolveDist, resolveSrc } from "./utils/index.js";

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
    /** @type {Record<string, any>} */
    const bundleMap = {};
    /** @type {Set<string>} */
    const clientEntryPoints = new Set();

    console.log("Building server components");
    await esbuild({
      entryPoints: [fileURLToPath(resolveSrc("index.jsx"))],
      outdir: fileURLToPath(dist),
      bundle: true,
      packages: "external",
      format: "esm",
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
                    const absoluteDist = new URL(resolveDist(path) + ".js");

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
    console.log("Building client components");
    await esbuild({
      entryPoints: [...clientEntryPoints],
      outdir: fileURLToPath(dist),
      bundle: true,
      format: "esm",
      splitting: true,
    });

    const App = await import(resolveDist("index.js").href);

    const stream = ReactServerDom.renderToReadableStream(
      App.default(),
      bundleMap
    );
    return new Response(stream);
  }
  return new Response("Not found", { status: 404 });
}

const relativeOrAbsolutePath = /^\.{0,2}\//;
