// Internal Modules
import { cn } from "~/lib/utils";

interface StatsProps {
  title: string;
  value: string | React.ReactNode;
  desc: string;
  figure?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function Stats({ title, value, desc, figure, className, children }: StatsProps) {
  return (
    <div className={cn("daisy-stats overflow-hidden bg-dark-blue shadow", className)}>
      <div className="daisy-stat">
        {figure && (
          <div className="daisy-stat-figure text-xl text-primary text-white">{figure}</div>
        )}
        <div className="daisy-stat-title text-white">{title}</div>
        <div className="daisy-stat-value text-amber-500">{value}</div>
        <div className="daisy-stat-desc">{desc}</div>
      </div>

      {children}
    </div>
  );
}
