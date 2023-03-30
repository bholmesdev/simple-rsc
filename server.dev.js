import { createServer } from "@hattip/adapter-node";
import { handler } from "./handler.js";
import { compose } from "@hattip/compose";
import { clientAssetsMiddleware } from "./client-assets.js";
import { createRefreshMiddleware } from "./utils/refresh.server.js";
import { build } from "./utils/build.js";

const port = 3000;

process.env.NODE_ENV = "development";

createServer(
  compose(clientAssetsMiddleware, handler, createRefreshMiddleware())
).listen(port, "localhost", async () => {
  await build();
  console.log(`⚛️ Future of React started on http://localhost:${port}`);
});
