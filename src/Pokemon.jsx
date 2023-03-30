export default async function Pokemon() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  const data = await response.json();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <img src={data.sprites.front_default} alt={data.name} />;
}
