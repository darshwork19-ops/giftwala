import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional link or action aligned to the right on wide screens. */
  action?: ReactNode;
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  id,
}: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2
          id={id}
          className="font-serif text-3xl leading-tight font-normal tracking-tight sm:text-4xl"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-base text-muted sm:text-lg">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
