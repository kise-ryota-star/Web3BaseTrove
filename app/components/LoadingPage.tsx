import { LoaderCircle } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="my-20 flex h-40 w-full flex-1 items-center justify-center">
      <LoaderCircle className="animate-spin text-amber-500" />
      <p className="ml-2 text-2xl text-amber-500">Loading...</p>
    </div>
  );
}
