// Source from: https://dev.to/craigmorten/how-to-code-live-browser-refresh-in-deno-309o
import chokidar from "chokidar";
import { fileURLToPath } from "node:url";
import { build } from "./build.js";
import { src } from "./index.js";
import { relative } from "node:path";

/**
 * Constructs a refresh middleware for reloading
 * the browser on file changes.
 *
 * @returns {import('@hattip/compose').RequestHandler} middleware
 */
export function createRefreshMiddleware() {
  buildWatch();

  return refreshMiddleware;
}

/**
 * Watch files from src directory
 * and trigger a build + refresh on change.
 */
async function buildWatch() {
  chokidar
    .watch(fileURLToPath(src), { ignoreInitial: true })
    .on("all", async (event, path) => {
      console.log("[change]", relative(fileURLToPath(src), path));
      await build();
    });

  // for (const socket of sockets) {
  //   socket.send("refresh");
  // }
}

/** @type {Set<WebSocket>} */
const sockets = new Set();

/**
 * Upgrade a request connection to a WebSocket if
 * the url ends with "/__refresh"
 * @type {import('@hattip/compose').RequestHandler}
 */
function refreshMiddleware(context) {
  const { pathname } = new URL(context.request.url);

  if (pathname.endsWith("/__refresh")) {
    // TODO: something? Deno's tool cool for me
    // const { response, socket } = Deno.upgradeWebSocket(req);
    // sockets.add(socket);
    // socket.onclose = () => {
    //   sockets.delete(socket);
    // };
    // return response;
  }
  return undefined;
}
