import { Link } from "@remix-run/react";

// External Modules
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Components
import { HoveredLink, Menu } from "./ui/NavBarMenu";

// Assets Imports
import logo from "~/assets/logo.png";

export default function NavHeader() {
  //   const [active, setActive] = useState<string | null>(null);

  return (
    <Menu className="items-center justify-between">
      <div>
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Trove" className="h-auto w-10" />
          <p className="text-2xl font-semibold">Trove</p>
        </Link>
      </div>
      <div className="flex gap-6 text-lg">
        <HoveredLink href="/">Home</HoveredLink>
        <HoveredLink href="/mint">Mint</HoveredLink>
        <HoveredLink href="/stake">Stake</HoveredLink>
        <HoveredLink href="/auction">Auction</HoveredLink>
      </div>
      <div>
        <ConnectButton accountStatus={{ smallScreen: "address", largeScreen: "full" }} />
      </div>
    </Menu>
  );
}
