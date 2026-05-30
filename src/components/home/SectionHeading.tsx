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
      <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
