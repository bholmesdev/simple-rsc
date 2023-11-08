import { Suspense } from 'react';
import { getAll } from './db/get.js';
import { AlbumList, SearchableAlbumList } from './AlbumComponents.jsx';

/** @param {{ search: string }} props */
export default async function ServerRoot({ search }) {
	return (
		<>
			<h1 className="text-2xl font-bold">AbraMix</h1>
			<Suspense fallback={<p>Loading...</p>}>
				<Albums search={search} />
			</Suspense>
		</>
	);
}

async function Albums({ search }) {
	const albums = await getAll();
	return <SearchableAlbumList albums={albums} search={search} />;
}