// External Modules
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface MultiplierCardProps {
  icon: React.ReactNode;
  effect: React.ReactNode;
  children?: React.ReactNode;
}

export default function MultiplierCard({ icon, children, effect }: MultiplierCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group/canvas-card relative flex h-[20rem] w-full max-w-sm items-center justify-center rounded-3xl
        border border-black/[0.2] p-4 dark:border-white/[0.2]"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 h-full w-full"
          >
            {effect}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 h-full w-full">
        <div
          className="absolute left-1/2 top-1/2 mx-auto flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center
            justify-center text-center transition duration-200 group-hover/canvas-card:-translate-y-[60%]
            group-hover/canvas-card:opacity-0"
        >
          {icon}
        </div>
        <div
          className="relative z-10 mt-4 flex h-full w-full items-center justify-center text-xl text-black opacity-0
            transition duration-200 group-hover/canvas-card:-translate-y-2 group-hover/canvas-card:text-white
            group-hover/canvas-card:opacity-100 dark:text-white"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
