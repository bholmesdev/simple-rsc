import { getAll } from '../data/db.js';

export async function Albums() {
	const albums = await getAll();
	return (
		<ul>
			{albums.map((a) => (
				<img key={a.id} src={a.cover} alt={a.title} />
			))}
		</ul>
	);
}
