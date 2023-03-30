import { Suspense } from "react";
import { getAll, getById } from "../db/fetch.js";
import SearchableAlbumList from "./SearchableAlbumList";

export default async function ServerRoot({ search }) {
  return (
    <>
      <h1>Welcome to server components?</h1>
      <h2>Search results for "{search}"</h2>
      <Suspense fallback={<h2>Loading...</h2>}>
        <Albums search={search} />
      </Suspense>
    </>
  );
}

async function Albums({ search }) {
  const albums = await getAll();
  return (
    <SearchableAlbumList search={search} albums={albums} />
  );
}
