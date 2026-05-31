type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-normal text-secondary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-[1.35rem] font-semibold leading-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
        {description}
      </p>
    </div>
  );
}
