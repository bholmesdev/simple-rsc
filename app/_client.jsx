import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createFromFetch } from 'react-server-dom-webpack/client';

// HACK: map webpack resolution to native ESM
// @ts-expect-error Property '__webpack_require__' does not exist on type 'Window & typeof globalThis'.
window.__webpack_require__ = async (id) => {
	return import(id);
};

// @ts-expect-error
const root = createRoot(document.getElementById('root'));

createFromFetch(fetch(`/rsc`)).then((ele) => {
	root.render(<StrictMode>{ele}</StrictMode>);
});
