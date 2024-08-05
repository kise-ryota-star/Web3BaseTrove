// Internal Modules
import { cn } from "~/lib/utils";

interface FeatureBarProps {
  itemNumber: number;
  title: string;
  description: string;
  image: "space" | "explorer" | "nebula";
  titleFirst?: boolean;
}

export default function FeatureBar({
  itemNumber,
  title,
  description,
  image,
  titleFirst = true,
}: FeatureBarProps) {
  const img =
    image === "explorer"
      ? "bg-[url('/images/explorer.png')] bg-explorer-pos"
      : image === "nebula"
        ? "bg-nebula"
        : "bg-space";

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div
        className={`flex grid-cols-3 grid-rows-1 ${titleFirst ? "flex-col" : "flex-col-reverse"} gap-4 md:grid`}
      >
        {titleFirst ? (
          <>
            <h3 className="my-5 mt-5 flex text-xl sm:text-2xl md:my-0">
              <span>{itemNumber}. &nbsp;</span>
              <span>{title}</span>
            </h3>
            <div
              className={cn("relative col-span-2 flex rounded-2xl bg-right bg-no-repeat p-5", img)}
            >
              <div className="bg-left-right-bg-fade absolute left-0 top-0 h-full w-full rounded-2xl"></div>
              <p className="relative z-10 !leading-relaxed sm:mr-20 lg:mr-32">{description}</p>
            </div>
          </>
        ) : (
          <>
            <div
              className={cn(
                "bg-explorer-pos relative col-span-2 flex rounded-2xl bg-no-repeat p-5",
                img,
              )}
            >
              <div className="bg-left-right-bg-fade absolute left-0 top-0 h-full w-full rounded-2xl"></div>
              <p className="relative z-10 !leading-relaxed sm:mr-20 lg:mr-32">{description}</p>
            </div>
            <h3 className="my-5 mt-5 flex text-xl sm:text-2xl md:my-0">
              <span>{itemNumber}. &nbsp;</span>
              <span>{title}</span>
            </h3>
          </>
        )}
      </div>
    </div>
  );
}
