import { Link } from "@remix-run/react";

// External Modules
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Components
import { HoveredLink, Menu } from "./ui/NavBarMenu";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";

// Assets Imports
import logoPng from "~/assets/logo/logo-52.png";
import logoWebp from "~/assets/logo/logo-52.webp";
import logoAvif from "~/assets/logo/logo-52.avif";
import { Button } from "./ui/button";
import { ArrowRight, MenuIcon } from "lucide-react";

export default function NavHeader() {
  //   const [active, setActive] = useState<string | null>(null);
  const routes = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Mint",
      link: "/mint",
    },
    {
      name: "Stake",
      link: "/stake",
    },
    {
      name: "Auction",
      link: "/auction",
    },
    {
      name: "Profile",
      link: "/profile",
    },
  ];

  const closeDrawer = () => {};

  return (
    <>
      <div className="w-full p-14"></div>
      <Menu className="flex grid-rows-1 items-center min-[880px]:grid min-[880px]:grid-cols-3">
        <div className="mr-auto">
          <Link to="/" className="flex items-center gap-2">
            <picture>
              <source srcSet={logoAvif} type="image/avif" />
              <source srcSet={logoWebp} type="image/webp" />
              <img src={logoPng} alt="Trove" className="h-auto w-6 sm:w-10" />
            </picture>
            <p className="text-base font-semibold sm:text-2xl">Trove</p>
          </Link>
        </div>
        <div className="relative z-10 !ml-0 hidden justify-center gap-6 text-lg min-[880px]:flex">
          {routes.map((route, index) => (
            <HoveredLink key={index} to={route.link}>
              {route.name}
            </HoveredLink>
          ))}
        </div>
        <div className="flex">
          <div className="ml-auto">
            <ConnectButton
              label="Connect"
              accountStatus={{ smallScreen: "address", largeScreen: "full" }}
              showBalance={false}
            />
          </div>

          <Drawer direction="right">
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2 min-[880px]:hidden">
                <MenuIcon />
              </Button>
            </DrawerTrigger>
            <DrawerContent hidePush className={`grid grid-rows-${routes.length}`}>
              {routes.map((route, index) => (
                <Link
                  to={route.link}
                  key={index}
                  className="group flex items-center justify-start bg-opacity-50 pl-5 transition-colors duration-200
                    hover:bg-slate-800"
                >
                  <p className="duration-600 mr-3 text-left transition-[margin] group-hover:mr-6">
                    {route.name}
                  </p>
                  <ArrowRight />
                </Link>
              ))}
            </DrawerContent>
          </Drawer>
        </div>
      </Menu>
    </>
  );
}
