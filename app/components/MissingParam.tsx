// Remix Modules
import { useLocation } from "@remix-run/react";

// Internal Modules
import { cn } from "~/lib/utils";

interface MissingParamProps {
  className?: string;
}

export default function MissingParam({ className }: MissingParamProps) {
  const location = useLocation();

  return (
    <div className={cn("flex h-full flex-1 items-center justify-center p-4 sm:p-10", className)}>
      <div>
        <h1 className="mb-3 text-3xl font-semibold">Something went wrong!</h1>
        <p>
          You could open an issue on{" "}
          <a
            className="text-blue-400 transition-colors duration-200 hover:text-blue-600"
            href="https://github.com/AlstonChan/Web3BaseTrove/issues"
          >
            GitHub
          </a>{" "}
          to notify us about it
        </p>
        <p className="word-break-word">
          Path: <code>{location.pathname}</code>
        </p>
      </div>
    </div>
  );
}
