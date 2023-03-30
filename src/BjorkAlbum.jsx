import fs from 'node:fs';

export default async function BjorkAlbum() {
  await new Promise(resolve => {
    setTimeout(resolve, 2000)
  });
  // const response = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  // const data = await response.json();
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // return <img src={data.sprites.front_default} alt={data.name} />;
  const data = await fs.promises.readFile(new URL('../../db/data/bjork-post.json', import.meta.url), 'utf-8');

  return <pre>{data.slice(0, 50)}</pre>
}
