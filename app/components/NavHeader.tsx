import { Link } from "@remix-run/react";

// External Modules
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Components
import { HoveredLink, Menu } from "./ui/NavBarMenu";

// Assets Imports
import logoPng from "~/assets/logo/logo-52.png";
import logoWebp from "~/assets/logo/logo-52.webp";
import logoAvif from "~/assets/logo/logo-52.avif";

export default function NavHeader() {
  //   const [active, setActive] = useState<string | null>(null);

  return (
    <Menu className="items-center justify-between">
      <div>
        <Link to="/" className="flex items-center gap-2">
          <picture>
            <source srcSet={logoAvif} type="image/avif" />
            <source srcSet={logoWebp} type="image/webp" />
            <img src={logoPng} alt="Trove" className="h-auto w-10" />
          </picture>
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
