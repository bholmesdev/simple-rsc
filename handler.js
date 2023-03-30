import * as ReactServerDom from "react-server-dom-webpack/server.browser";
import fs from "node:fs";
import { resolveDist, resolveServerDist } from "./utils/index.js";

/** @type {import('@hattip/core').HattipHandler} */
export async function handler(context) {
  const { pathname } = new URL(context.request.url);
  if (pathname === "/check") {
    return new Response("Server's running!");
  }
  if (pathname === "/") {
    const html = await fs.promises.readFile(
      new URL("./utils/templates/index.html", import.meta.url),
      "utf-8"
    );
    return new Response(html);
  }
  if (pathname === "/dist/server/root.server.jsx") {
    const App = await import(
      resolveServerDist(
        `root.server.js${
          // Invalidate cached module on every request in dev mode
          // WARNING: can cause memory leaks for long-running dev servers!
          process.env.NODE_ENV === "development"
            ? `?invalidate=${Date.now()}`
            : ""
        }`
      ).href
    );
    const bundleMap = await import(resolveDist("bundleMap.json").href, {
      assert: { type: "json" },
    });

    const stream = ReactServerDom.renderToReadableStream(
      App.default(),
      bundleMap
    );
    return new Response(stream, {
      // "Content-type" based on https://github.com/facebook/react/blob/main/fixtures/flight/server/global.js#L159
      headers: { "Content-type": "text/x-component" },
    });
  }
  return new Response("Not found", { status: 404 });
}
