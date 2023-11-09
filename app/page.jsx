import { Suspense } from 'react';
import { Albums } from './albums.jsx';
import Like from './Like.jsx';

export default async function Page() {
	return (
		<>
			<h1>From the server!</h1>
			<Like />
			<Suspense fallback="Getting albums">
				<Albums />
			</Suspense>
		</>
	);
}
