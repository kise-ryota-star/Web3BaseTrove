// External Modules
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleX } from "lucide-react";

// Internal Modules
import { useNotification } from "~/hooks/useNotificationBar";
import { cn } from "~/lib/utils";

interface NotificationBarProps {
  className?: string;
}

export default function NotificationBar({ className }: NotificationBarProps) {
  const { message, hideNotification } = useNotification();

  const [floatTop, setFloatTop] = useState(false);

  useEffect(() => {
    const handleOnScroll = () => {
      if (window.scrollY > 5) {
        return setFloatTop(true);
      }
      if (window.scrollY <= 5) {
        return setFloatTop(false);
      }
    };

    handleOnScroll();

    window.addEventListener("scroll", handleOnScroll);
    return () => window.removeEventListener("scroll", handleOnScroll);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.aside
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0, transition: { duration: 0.5 } }}
          transition={{ duration: 1.5 }}
          className={cn(
            `fixed left-0 top-0 z-[9999] flex w-full items-center bg-destructive px-3 py-2
            text-destructive-foreground transition-[width,padding,top,left,border-radius] duration-1000`,
            floatTop
              ? "fixed-fill top-1.5 mx-auto rounded-xl dark:border-white/[0.2] min-[400px]:left-4 xl:w-[1200px]"
              : "",
            className,
          )}
        >
          {message}
          <button
            onClick={hideNotification}
            className="ml-auto transition-transform hover:scale-105"
          >
            <CircleX size={20} />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
