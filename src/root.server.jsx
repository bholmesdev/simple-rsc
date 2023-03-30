import { Suspense } from "react";
import Pokemon from "./Pokemon";
import { getAll, getById } from "../db/fetch.js";
import LikeButton from "./LikeButton";

export default async function ServerRoot() {
  const albums = await getAll();
  return (
    <>
      <h1>Welcome to server components?</h1>
      <LikeButton />
      <Suspense>
        <Pokemon />
      </Suspense>
    </>
  );
}

