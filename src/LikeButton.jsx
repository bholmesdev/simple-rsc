"use client";
import { useState } from "react";

export default function LikeButton() {
  const [liked, setLiked] = useState(false);
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? "Unlike" : "Like"}
    </button>
  );
}
