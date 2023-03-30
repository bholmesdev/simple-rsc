import LikeButton from "./LikeButton";
import { Suspense } from "react";
import Counter from "./Counter";
import Pokemon from "./Pokemon";

export default async function ServerRoot() {
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

