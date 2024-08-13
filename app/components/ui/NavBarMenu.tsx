// Remix Modules
import { Link } from "@remix-run/react";

// External Modules
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
// import { motion } from "framer-motion";

// const transition = {
//   type: "spring",
//   mass: 0.5,
//   damping: 11.5,
//   stiffness: 100,
//   restDelta: 0.001,
//   restSpeed: 0.001,
// };

// export const MenuItem = ({
//   setActive,
//   active,
//   item,
//   children,
// }: {
//   setActive: (item: string) => void;
//   active: string | null;
//   item: string;
//   children?: React.ReactNode;
// }) => {
//   return (
//     <div onMouseEnter={() => setActive(item)} className="relative ">
//       <motion.p
//         transition={{ duration: 0.3 }}
//         className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
//       >
//         {item}
//       </motion.p>
//       {active !== null && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.85, y: 10 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           transition={transition}
//         >
//           {active === item && (
//             <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
//               <motion.div
//                 transition={transition}
//                 layoutId="active" // layoutId ensures smooth animation
//                 className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
//               >
//                 <motion.div
//                   layout // layout ensures smooth animation
//                   className="w-max h-full p-4"
//                 >
//                   {children}
//                 </motion.div>
//               </motion.div>
//             </div>
//           )}
//         </motion.div>
//       )}
//     </div>
//   );
// };

export const Menu = ({
  // setActive,
  className,
  children,
}: {
  // setActive: (item: string | null) => void;
  className?: string;
  children: React.ReactNode;
}) => {
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
    <nav
      // onMouseLeave={() => setActive(null)} // resets the state
      className={cn(
        `fixed left-1/2 top-4 z-50 flex w-full -translate-x-1/2 justify-center space-x-2 rounded-full
        border-2 border-transparent bg-white bg-opacity-70 px-4 py-6 shadow-input transition-[width,padding]
        duration-1000 dark:bg-background sm:space-x-4 sm:px-8`,
        floatTop ? "fixed-fill z-[9999] mx-auto py-4 dark:border-white/[0.2] xl:w-[1200px]" : "",
        className,
      )}
    >
      {children}
    </nav>
  );
};

// export const ProductItem = ({
//   title,
//   description,
//   href,
//   src,
// }: {
//   title: string;
//   description: string;
//   href: string;
//   src: string;
// }) => {
//   return (
//     <Link to={href} className="flex space-x-2">
//       <img
//         src={src}
//         width={140}
//         height={70}
//         alt={title}
//         className="flex-shrink-0 rounded-md shadow-2xl"
//       />
//       <div>
//         <h4 className="text-xl font-bold mb-1 text-black dark:text-white">{title}</h4>
//         <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
//           {description}
//         </p>
//       </div>
//     </Link>
//   );
// };

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <Link
      {...rest}
      className="font-medium text-neutral-300 transition-colors duration-200 hover:text-white"
    >
      {children}
    </Link>
  );
};
