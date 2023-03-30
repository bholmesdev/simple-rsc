import { createServer } from "@hattip/adapter-node";
import { handler } from "./handler.js";
// import { compose } from "@hattip/compose";
// import { createRefreshMiddleware } from "./utils/refresh.server";

const port = 3000;

process.env.NODE_ENV = "development";

createServer(handler).listen(port, "localhost", () => {
  console.log(`⚛️ Future of React started on http://localhost:${port}`);
});
