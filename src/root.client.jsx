import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client";
import "../utils/refresh.client.js";

// HACK: map webpack resolution to native ESM
// @ts-expect-error Property '__webpack_require__' does not exist on type 'Window & typeof globalThis'.
window.__webpack_require__ = async (id) => {
  console.log({ id });
  return import(id);
};

// @ts-expect-error
const root = createRoot(document.getElementById("root"));
// @ts-expect-error
const devPanelRoot = createRoot(document.getElementById("dev-panel-root"));

// Fetch the server root to render on the client
const { pathname } = window.location;
const pathWithoutExt = pathname === "/" ? "index" : pathname.replace(/\/$/, "");
const jsFile = pathWithoutExt + ".js";

createFromFetch(fetch(`/dist/server/root.server.jsx`)).then(
  (ele) => {
    root.render(<StrictMode>{ele}</StrictMode>);
  });

devPanelRoot.render(<DevPanel />);

function DevPanel() {
  const [content, setContent] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();

    fetch("/dist/server/root.server.jsx", {
      signal: abortController.signal,
    }).then(async (res) => {
      const reader = res.body?.getReader();
      if (!reader) return;

      let allDone = false;

      while (!allDone) {
        const { value, done } = await reader.read();
        if (done) {
          allDone = true;
        } else {
          const decoded = new TextDecoder().decode(value);
          setContent((state) => [...state, decoded]);
        }
      }
    });

    return () => abortController.abort();
  }, []);

  return (
    <aside className="fixed bottom-0 left-0 right-0 bg-white rounded-2 border-2 border-transparent border-t-slate-300 max-h-96 overflow-y-scroll">
      <h2 className="font-bold p-3">Dev panel</h2>
      <ul style={{ padding: 0 }}>
        {content.map((entry, idx) => (
          <div className={'px-3 py-1 ' + (idx === 0 ? 'bg-blue-100' : idx === 1 ? 'bg-green-100' : 'bg-orange-200')}>
            {idx === 0 ? <h3 className="font-bold text-blue-900">Initial defs</h3> : null}
            {idx === 1 ? <h3 className="font-bold text-green-900">Main server response</h3> : null}
            {idx >= 2 ? <h3 className="font-bold text-orange-900">Later response</h3> : null}
            <li style={{ listStyle: "none" }} key={entry}>
              {entry}
            </li>
          </div>
        ))}
      </ul>
    </aside>
  );
}
