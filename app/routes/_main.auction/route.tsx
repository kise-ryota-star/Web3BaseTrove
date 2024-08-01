// Remix Modules
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Auction | Trove" }];
};

export default function Mint() {
  return <div>Auction</div>;
}
