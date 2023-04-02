import fs from 'node:fs';

/** @type {import('@hattip/compose').RequestHandler} */
export async function clientAssetsMiddleware(context) {
	// Serve static JS assets in `dist/client/`
	const { pathname } = new URL(context.request.url);
	if (pathname.startsWith('/dist/client/') && pathname.endsWith('.js')) {
		const contents = await fs.promises.readFile(new URL('.' + pathname, import.meta.url), 'utf-8');
		return new Response(contents, {
			headers: {
				'Content-Type': 'application/javascript'
			}
		});
	}
}
