// External Modules
import React from "react";

// Components
import { CardBody, CardContainer, CardItem } from "~/components/3dCard";

interface InfoCardProps {
  cardTitle: string;
  cardIllustration: React.ReactNode;
  link: string;
  className?: string;
}

export default function InfoCard({ className, cardIllustration, cardTitle, link }: InfoCardProps) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer noopener"
      referrerPolicy="no-referrer"
      className={className}
    >
      <CardContainer containerClassName="w-full" className="w-full">
        <CardBody
          className="group/card relative h-auto w-full rounded-xl border border-black/[0.1] bg-gray-50 p-6
            dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]
            sm:w-[30rem]"
        >
          <CardItem translateZ="40" className="mt-4 w-full">
            {cardIllustration}
          </CardItem>
          <CardItem
            as="h3"
            translateZ="60"
            className="mx-auto mt-2 max-w-sm text-base font-semibold text-neutral-500 dark:text-neutral-300 md:text-lg"
          >
            {cardTitle}
          </CardItem>
        </CardBody>
      </CardContainer>
    </a>
  );
}
