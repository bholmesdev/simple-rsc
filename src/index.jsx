import LikeButton from "./LikeButton";
import { Suspense } from "react";
import Counter from "./Counter";

export default async function ServerComponent() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return (
    <>
      <h1>Welcome to server components!</h1>
      <LikeButton />
      <Counter />
      <Suspense fallback={<p>Fetching pokemon...</p>}>
        <Pokemon />
      </Suspense>
    </>
  );
}

async function Pokemon() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  const data = await response.json();
  return <img src={data.sprites.front_default} />;
}
