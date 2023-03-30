export default async function Pokemon() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  const data = await response.json();
  return <img src={data.sprites.front_default} />;
}
