import bjorkPost from './bjork-post.json';
import ladyGagaTheFame from './lady-gaga-the-fame.json';
import glassAnimalsHowToBeAMHumanBeing from './glass-animals-how-to-be.json';

/**
 * @typedef Song
 * @property {string} title
 * @property {string} duration
 *
 * @typedef Album
 * @property {string} id
 * @property {string} artist
 * @property {string} title
 * @property {string} cover
 * @property {Song[]} songs
 */
const albums = [bjorkPost, ladyGagaTheFame, glassAnimalsHowToBeAMHumanBeing];

const artificialWait = (ms = 1500) => new Promise((resolve) => setTimeout(resolve, ms));

/** @returns {Promise<Album[]>} */
export async function getAll() {
	await artificialWait();
	return albums;
}

/** @returns {Promise<Album | undefined>} */
export async function getById(id) {
	await artificialWait();
	return albums.find((album) => album.id === id);
}
