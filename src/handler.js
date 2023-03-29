import * as ReactServerDom from "react-server-dom-webpack/server.browser";
import fs from "node:fs";
import { build as esbuild } from "esbuild";
import { fileURLToPath } from "node:url";

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
    const distUrl = new URL("../dist/", import.meta.url);
    await esbuild({
      entryPoints: [
        fileURLToPath(new URL("./LikeButton.client.jsx", import.meta.url)),
      ],
      outdir: fileURLToPath(distUrl),
      bundle: true,
      packages: "external",
      format: "esm",
    });
    /** @type {Record<string, any>} */
    const bundleMap = {};
    await esbuild({
      entryPoints: [fileURLToPath(new URL("./index.jsx", import.meta.url))],
      outdir: fileURLToPath(distUrl),
      bundle: true,
      packages: "external",
      format: "esm",
      plugins: [
        {
          name: "resolve-client-imports",
          setup(build) {
            build.onResolve({ filter: getClientFiles() }, ({ path }) => {
              console.log(path);
              const extResolved = path.replace(/\.(jsx|\.tsx)$/, "") + ".js";
              const absoluteUrl = new URL(extResolved, distUrl);
              bundleMap[path] = {
                id: path,
                chunks: [],
                name: "LikeButton", // TODO generate
                async: true,
              };

              return {
                path: `data:text/javascript,import DefaultExport from ${JSON.stringify(
                  absoluteUrl.href
                )};DefaultExport.$$typeof = Symbol.for("react.client.reference");DefaultExport.$$id=${JSON.stringify(
                  path
                )};export default DefaultExport`,
                external: true,
              };
            });
          },
        },
      ],
    });
    const App = await import(
      new URL("../dist/index.js", import.meta.url).pathname
    );

    const stream = ReactServerDom.renderToReadableStream(
      App.default(),
      bundleMap
    );
    return new Response(stream);
  }
  return new Response("Not found", { status: 404 });
}

/**
 *
 * @returns {RegExp}
 */
function getClientFiles() {
  // TODO: generate list for esbuild resolution
  return /\.client/;
}
