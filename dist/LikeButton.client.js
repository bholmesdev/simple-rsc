// src/LikeButton.client.jsx
import { useState } from "react";
import { jsx } from "react/jsx-runtime";
"use client";
function LikeButton() {
  const [liked, setLiked] = useState(false);
  return /* @__PURE__ */ jsx("button", { onClick: () => setLiked(!liked), children: liked ? "Unlike" : "Like" });
}
export {
  LikeButton as default
};
