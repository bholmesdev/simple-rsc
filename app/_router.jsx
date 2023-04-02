import { StrictMode, useEffect, useState, use, startTransition, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { /* FOR FRAMEWORK DEVS */ createFromFetch } from 'react-server-dom-webpack/client';
import './dev-utils/live-reload.js';

// HACK: map webpack resolution to native ESM
// @ts-expect-error Property '__webpack_require__' does not exist on type 'Window & typeof globalThis'.
window.__webpack_require__ = async (id) => {
	console.log({ id });
	return import(id);
};

// @ts-expect-error
const root = createRoot(document.getElementById('root'));
root.render(
	<StrictMode>
		<Router />
	</StrictMode>
);

let callbacks = [];
// @ts-expect-error Property 'router' does not exist on type 'Window & typeof globalThis'.
window.router = {
	navigate(/** @type {string} */ url) {
		window.history.replaceState({}, '', url);
		callbacks.forEach((cb) => cb());
	}
};

function Router() {
	const [url, setUrl] = useState('/rsc' + window.location.search);

	useEffect(() => {
		function handleNavigate() {
			startTransition(() => {
				setUrl('/rsc' + window.location.search);
			});
		}
		callbacks.push(handleNavigate);
		window.addEventListener('popstate', handleNavigate);
		return () => {
			callbacks.splice(callbacks.indexOf(handleNavigate), 1);
			window.removeEventListener('popstate', handleNavigate);
		};
	}, []);

	return (
		<>
			<ServerOutput url={url} />
			<DevPanel url={url} />
		</>
	);
}

const initialCache = new Map();

function ServerOutput({ url }) {
	const [cache, setCache] = useState(initialCache);
	if (!cache.has(url)) {
		cache.set(url, createFromFetch(fetch(url)));
	}
	const lazyJsx = cache.get(url);
	return use(lazyJsx);
}

// ----------- debugging panel ----

function DevPanel({ url }) {
	const [content, setContent] = useState([]);

	const { mouseMove, getResizeProps } = useWindowResize({
		direction: 'vertical'
	});

	useEffect(() => {
		const abortController = new AbortController();

		fetch(url, {
			signal: abortController.signal
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
	}, [url]);

	return (
		<aside
			style={{ height: getDevtoolHeight(mouseMove) }}
			className="fixed bottom-0 left-0 right-0 bg-white rounded-2  overflow-y-scroll"
		>
			<div {...getResizeProps()} className="w-full h-4 cursor-row-resize select-none">
				<hr className="border-t-2" />
			</div>
			<h2 className="font-bold p-3 pt-0">Dev panel</h2>
			<ul className="p-0 whitespace-pre-wrap">
				{content.map((entry, idx) => (
					<div
						key={idx}
						className={
							'px-3 py-1 ' +
							(idx === 0 ? 'bg-blue-100' : idx === 1 ? 'bg-green-100' : 'bg-orange-200')
						}
					>
						{idx === 0 ? <h3 className="font-bold text-blue-900">Initial defs</h3> : null}
						{idx === 1 ? <h3 className="font-bold text-green-900">Main server response</h3> : null}
						{idx >= 2 ? <h3 className="font-bold text-orange-900">Later response</h3> : null}
						<li style={{ listStyle: 'none' }} key={entry}>
							{entry}
						</li>
					</div>
				))}
			</ul>
		</aside>
	);
}

/** @typedef {'vertical' | 'horizontal'} Direction */

const toLocalStorageKey = (/** @type {Direction} */ direction) =>
	`simple-rfc-devtool-resize-${direction}`;
const DEFAULT_HEIGHT = 260;

/**
 * @param {{ direction: Direction }} */
function useWindowResize({ direction }) {
	const [mouseMove, setMouseMove] = useState(getInitialSize(direction));
	const [isMouseDown, setIsMouseDown] = useState(false);
	const ref = useRef(null);

	const handleMouseDown = useCallback(() => {
		setIsMouseDown(true);
	}, []);

	const handleMouseUp = useCallback(() => {
		setIsMouseDown(false);
	}, []);

	const handleMouseMove = useCallback(
		(event) => {
			if (isMouseDown) {
				setMouseMove(direction === 'vertical' ? event.pageY : event.pageX);
			}
		},
		[isMouseDown]
	);

	const getResizeProps = () => {
		return {
			onMouseDown: handleMouseDown,
			ref
		};
	};

	useEffect(() => {
		let timeout;

		if (isMouseDown) {
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);
		}

		timeout = setTimeout(
			() =>
				localStorage.setItem(
					toLocalStorageKey(direction),
					String(mouseMove === null ? '' : mouseMove)
				),
			200
		);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			clearTimeout(timeout);
		};
	}, [isMouseDown]);

	return {
		mouseMove,
		getResizeProps
	};
}

function getDevtoolHeight(mouseMove) {
	return `${window.innerHeight - mouseMove}px`;
}

/** @param {Direction} direction */
function getInitialSize(direction) {
	const { localStorage } = window ?? {};
	return Number(localStorage?.getItem(toLocalStorageKey(direction)) ?? DEFAULT_HEIGHT);
}
