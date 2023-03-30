import { Suspense } from "react";
import { getAll, getById } from "../db/fetch.js";
import LikeButton from "./LikeButton";
import SearchableAlbumList from "./SearchableAlbumList";
import BjorkAlbum from "./BjorkAlbum";

export default async function ServerRoot({ search }) {
  return (
    <>
      <h1>Welcome to server components?</h1>
      <h2>You are looking for "{search}"</h2>
      <Suspense fallback={<h2>Loading...</h2>}>
        <Albums search={search} />
      </Suspense>
    </>
  );
}

async function Albums({ search }) {
  const albums = await getAll();
  return (
    // Client part
    <SearchableAlbumList search={search} albums={albums} />
  );
}
