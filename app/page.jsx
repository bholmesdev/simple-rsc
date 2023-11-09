import { Suspense } from 'react';
import { getAll } from '../data/db.js';

async function Albums() {
	const albums = await getAll();
	return (
		<ul>
			{albums.map((a) => (
				<li key={a.id}>
					<img src={a.cover} alt={a.title} />
					<div>
						<h3>{a.title}</h3>
						<p>{a.songs.length} songs</p>
					</div>
				</li>
			))}
		</ul>
	);
}

export default async function Page() {
	return (
		<>
			<h1>Spotifn’t</h1>
			<Suspense fallback="Getting albums">
				<Albums />
			</Suspense>
		</>
	);
}
