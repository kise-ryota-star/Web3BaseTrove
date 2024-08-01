// Remix Modules
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

export default function _Main({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p>fuck</p>
      <Outlet />
    </div>
  );
}
