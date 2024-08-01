// Remix Modules
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Mint | Trove" }];
};

export default function Mint() {
  return <div>quack</div>;
}
