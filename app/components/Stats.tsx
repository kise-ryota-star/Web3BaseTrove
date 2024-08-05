// Internal Modules
import { cn } from "~/lib/utils";

interface StatsProps {
  title: string;
  value: string | React.ReactNode;
  desc?: string;
  figure?: string;
  className?: string;
  children?: React.ReactNode;
  large?: boolean;
}

export default function Stats({
  title,
  value,
  desc,
  figure,
  className,
  children,
  large = false,
}: StatsProps) {
  return (
    <div className={cn("daisy-stats overflow-hidden bg-dark-blue shadow", className)}>
      <div className="daisy-stat">
        {figure && (
          <div className="daisy-stat-figure text-xl text-primary text-white">{figure}</div>
        )}
        {large ? (
          <>
            <div className="daisy-stat-title text-white md:text-lg lg:text-xl">{title}</div>
            <div className="daisy-stat-value my-1 text-amber-500 md:text-5xl lg:text-6xl">
              {value}
            </div>
            {desc && <div className="daisy-stat-desc md:text-base lg:text-lg">{desc}</div>}
          </>
        ) : (
          <>
            <div className="daisy-stat-title text-white">{title}</div>
            <div className="daisy-stat-value text-amber-500">{value}</div>
            {desc && <div className="daisy-stat-desc">{desc}</div>}
          </>
        )}
      </div>

      {children}
    </div>
  );
}
