// Remix Modules
import { Outlet } from "@remix-run/react";

// Components
import NavHeader from "~/components/NavHeader";
import Footer from "~/components/Footer";

export default function _Main() {
  return (
    <div className="flex h-full min-h-dvh flex-1 flex-col p-4">
      <NavHeader />
      <Outlet />
      <Footer />
    </div>
  );
}
