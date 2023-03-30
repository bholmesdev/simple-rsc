import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client";

// HACK: map webpack resolution to native ESM
// @ts-expect-error Property '__webpack_require__' does not exist on type 'Window & typeof globalThis'.
window.__webpack_require__ = async (id) => {
  console.log({ id })
  return import(id);
};

// @ts-expect-error
const root = createRoot(document.getElementById("root"));

// Fetch the server root to render on the client
const { pathname } = window.location;
const pathWithoutExt = pathname === '/' ? 'index' : pathname.replace(/\/$/, '');
const jsFile = pathWithoutExt + ".js";

createFromFetch(fetch(`/dist/server/root.server.jsx`)).then(
  (ele) => {
    root.render(<StrictMode>{ele}</StrictMode>);
  }
);
