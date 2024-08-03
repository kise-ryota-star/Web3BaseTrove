// Remix Modules
import { Outlet } from "@remix-run/react";

// Components
import NavHeader from "~/components/NavHeader";
import Footer from "~/components/Footer";
import { Toaster } from "~/components/ui/toaster";

export default function _Main() {
  return (
    <div className="flex h-full min-h-dvh flex-1 flex-col p-2 sm:p-4">
      <NavHeader />
      <Outlet />
      <Footer />
      <Toaster />
    </div>
  );
}
