// src/index.jsx
import LikeButton from 'data:text/javascript,import DefaultExport from "file:///Users/benholmes/Repositories/rsc-node/dist/LikeButton.client.js";DefaultExport.$$typeof = Symbol.for("react.client.reference");DefaultExport.$$id="./LikeButton.client";const debugProxy = new Proxy(DefaultExport, { get(_target, id) { console.log({_target, id});if (id === \'$$typeof\') { return DefaultExport.$$typeof };return undefined; } });export default DefaultExport';
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
async function ServerComponent() {
  await new Promise((resolve) => setTimeout(resolve, 1e3));
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("h1", { children: "Welcome to server components!" }),
    /* @__PURE__ */ jsx(LikeButton, {})
  ] });
}
export {
  ServerComponent as default
};
