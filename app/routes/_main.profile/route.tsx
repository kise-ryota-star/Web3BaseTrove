// Remix Modules
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Profile | Trove" }];
};

export default function Mint() {
  return <div>Profile</div>;
}
