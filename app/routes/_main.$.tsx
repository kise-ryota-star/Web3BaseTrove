// Remix Modules
import { MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Page Not Found 404" },
    { name: "description", content: "The page your are looking for does not exists" },
  ];
};

export default function NotFound() {
  return (
    <div className="flex h-full flex-1 items-center justify-center">
      <h1 className="text-center text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
        404 - Page Not Found
      </h1>
    </div>
  );
}
