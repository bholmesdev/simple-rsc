import LikeButton from "./LikeButton.client";

export default async function ServerComponent() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <><h1>Welcome to server components!</h1><LikeButton /></>;
}