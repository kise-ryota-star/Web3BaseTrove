// Remix Modules
import { Link } from "@remix-run/react";

// Components
import { Button } from "./ui/button";

// Asserts Imports
import logoPng from "~/assets/logo/logo-52.png";
import logoWebp from "~/assets/logo/logo-52.webp";
import logoAvif from "~/assets/logo/logo-52.avif";

interface ErrorPageProps {
  code: number;
  title: string;
  message: string | null;
}

export default function ErrorPage({ code, title, message }: ErrorPageProps) {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
      <picture>
        <source srcSet={logoAvif} type="image/avif" />
        <source srcSet={logoWebp} type="image/webp" />
        <img src={logoPng} alt="Trove" className="h-auto w-10" />
      </picture>
      <h1 className="mt-2 text-center text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
        {code} <br /> {title}
      </h1>
      {message && <p className="mt-2 max-w-sm">{message}</p>}
      <Button asChild className="mt-4">
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
