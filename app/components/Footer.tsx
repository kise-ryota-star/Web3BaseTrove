// External Modules
import { Github } from "lucide-react";

// Components
import { Button } from "./ui/button";

// Assets Imports
import logoPng from "~/assets/logo/logo-52.png";
import logoWebp from "~/assets/logo/logo-52.webp";
import logoAvif from "~/assets/logo/logo-52.avif";

export default function Footer() {
  const startingYear = 2024;

  return (
    <footer className="mb-10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <picture>
              <source srcSet={logoAvif} type="image/avif" />
              <source srcSet={logoWebp} type="image/webp" />
              <img src={logoPng} alt="Trove" className="h-auto w-10" />
            </picture>
            <p className="text-2xl font-semibold">Trove</p>
          </div>

          <Button variant="ghost" size="icon" className="ml-5 flex items-center gap-2" asChild>
            <a
              href="https://github.com/kise-ryota-star/TokenTrove"
              target="_blank"
              rel="noreferrer noopener"
              referrerPolicy="no-referrer"
            >
              <Github size={28} color="#fff" />
            </a>
          </Button>
        </div>
        <p>
          © Trove{" "}
          {new Date().getFullYear() > startingYear
            ? `${startingYear} - ${new Date().getFullYear()}`
            : startingYear}
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
