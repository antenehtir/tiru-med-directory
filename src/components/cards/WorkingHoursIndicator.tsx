type WorkingHoursIndicatorProps = {
  hours?: string | null;
};

export function WorkingHoursIndicator({ hours }: WorkingHoursIndicatorProps) {
  const normalized = hours?.trim();

  if (!normalized) {
    return null;
  }

  const isEmergency = normalized.toLowerCase().includes("24");

  if (isEmergency) {
    return (
      <p className="flex items-center text-xs font-medium text-red-600">
        <span className="mr-1.5 inline-block size-2 shrink-0 animate-pulse rounded-full bg-red-500" />
        24/7 Emergency Service
      </p>
    );
  }

  return <p className="text-xs text-muted-foreground">{normalized}</p>;
}
