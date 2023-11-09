import { Suspense } from 'react';
import { getAll } from '../data/db.js';
import Like from './Like.jsx';

async function Albums() {
	const albums = await getAll();
	return (
		<ul>
			{albums.map((a) => (
				<li key={a.id} className="flex gap-2 items-center mb-2">
					<img className="w-20 aspect-square" src={a.cover} alt={a.title} />
					<div>
						<h3 className="text-xl">{a.title}</h3>
						<p>{a.songs.length} songs</p>
						<Like />
					</div>
				</li>
			))}
		</ul>
	);
}

export default async function Page() {
	return (
		<>
			<h1 className="text-3xl mb-3">Spotifn’t</h1>
			<Suspense fallback="Getting albums">
				<Albums />
			</Suspense>
		</>
	);
}
