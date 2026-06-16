import Link from "next/link";

const diagnosticsTypes = [
  { label: "All", href: "/diagnostics", value: "" },
  { label: "Laboratories", href: "/diagnostics?type=laboratory", value: "laboratory" },
  { label: "Imaging", href: "/diagnostics?type=imaging", value: "imaging" },
];

type DiagnosticsFilterChipsProps = {
  activeType?: string;
};

export function DiagnosticsFilterChips({
  activeType = "",
}: DiagnosticsFilterChipsProps) {
  return (
    <div className="flex max-w-full flex-wrap gap-2">
      {diagnosticsTypes.map((type) => {
        const isActive = type.value === activeType;

        return (
          <Link
            key={type.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-strong-border"
            }`}
            href={type.href}
          >
            {type.label}
          </Link>
        );
      })}
    </div>
  );
}
