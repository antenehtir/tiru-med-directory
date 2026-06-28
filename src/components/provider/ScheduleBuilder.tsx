"use client";

import { DAYS_OF_WEEK, TIME_OPTIONS } from "@/lib/provider/onboarding-config";

export type ScheduleRow = {
  days: string[];
  open: string;
  close: string;
  closed: boolean;
};

type ScheduleBuilderProps = {
  value: ScheduleRow[];
  onChange: (rows: ScheduleRow[]) => void;
};

const DAY_SHORTCUTS = [
  { label: "Weekdays", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
  { label: "Weekend", days: ["Saturday", "Sunday"] },
  { label: "All week", days: [...DAYS_OF_WEEK] },
];

function ScheduleRowItem({
  row,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  row: ScheduleRow;
  index: number;
  onUpdate: (partial: Partial<ScheduleRow>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  function toggleDay(day: string) {
    const next = row.days.includes(day)
      ? row.days.filter((d) => d !== day)
      : [...row.days, day];
    onUpdate({ days: next });
  }

  function applyShortcut(days: string[]) {
    onUpdate({ days });
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          Schedule {index + 1}
        </p>
        {canRemove && (
          <button
            className="text-xs text-red-500 hover:text-red-600"
            onClick={onRemove}
            type="button"
          >
            Remove
          </button>
        )}
      </div>

      {/* Day shortcuts */}
      <div className="flex flex-wrap gap-1.5">
        {DAY_SHORTCUTS.map((shortcut) => (
          <button
            key={shortcut.label}
            className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            onClick={() => applyShortcut(shortcut.days)}
            type="button"
          >
            {shortcut.label}
          </button>
        ))}
      </div>

      {/* Day toggles */}
      <div className="flex flex-wrap gap-1.5">
        {DAYS_OF_WEEK.map((day) => (
          <button
            key={day}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
              row.days.includes(day)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
            onClick={() => toggleDay(day)}
            type="button"
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Closed toggle */}
      <label className="flex items-center gap-2 text-sm">
        <input
          checked={row.closed}
          onChange={(e) => onUpdate({ closed: e.target.checked })}
          type="checkbox"
        />
        <span className="text-muted-foreground">Closed on these days</span>
      </label>

      {/* Hours — hidden when closed */}
      {!row.closed && (
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-muted-foreground">Opens</label>
            <select
              className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => onUpdate({ open: e.target.value })}
              value={row.open}
            >
              <option value="">Select…</option>
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {row.open !== "Open 24 hours" && (
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-muted-foreground">Closes</label>
              <select
                className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => onUpdate({ close: e.target.value })}
                value={row.close}
              >
                <option value="">Select…</option>
                {TIME_OPTIONS.filter((t) => t !== "Open 24 hours").map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {row.days.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {row.days.length <= 3
            ? row.days.join(", ")
            : `${row.days.slice(0, 2).join(", ")} +${row.days.length - 2} more`}
          {" · "}
          {row.closed
            ? "Closed"
            : row.open === "Open 24 hours"
              ? "Open 24 hours"
              : row.open && row.close
                ? `${row.open} – ${row.close}`
                : "Hours not set"}
        </p>
      )}
    </div>
  );
}

export function ScheduleBuilder({ value, onChange }: ScheduleBuilderProps) {
  function addRow() {
    onChange([
      ...value,
      { days: [], open: "", close: "", closed: false },
    ]);
  }

  function updateRow(index: number, partial: Partial<ScheduleRow>) {
    const next = value.map((row, i) =>
      i === index ? { ...row, ...partial } : row,
    );
    onChange(next);
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const summary = value
    .filter((r) => r.days.length > 0)
    .map((r) => {
      const dayStr =
        r.days.length === 7
          ? "Every day"
          : r.days.length === 5 &&
              r.days.every((d) =>
                ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(d),
              )
            ? "Mon–Fri"
            : r.days.length <= 2
              ? r.days.map((d) => d.slice(0, 3)).join(", ")
              : `${r.days[0].slice(0, 3)}–${r.days[r.days.length - 1].slice(0, 3)}`;
      const hoursStr = r.closed
        ? "Closed"
        : r.open === "Open 24 hours"
          ? "24 hours"
          : `${r.open} – ${r.close}`;
      return `${dayStr}: ${hoursStr}`;
    })
    .join(" · ");

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {value.map((row, i) => (
          <ScheduleRowItem
            key={i}
            canRemove={value.length > 1}
            index={i}
            onRemove={() => removeRow(i)}
            onUpdate={(partial) => updateRow(i, partial)}
            row={row}
          />
        ))}
      </div>

      <button
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        onClick={addRow}
        type="button"
      >
        + Add different hours for other days
      </button>

      {summary && (
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">
            Schedule summary:
          </p>
          <p className="text-xs text-foreground mt-0.5">{summary}</p>
        </div>
      )}
    </div>
  );
}

export function scheduleToText(rows: ScheduleRow[]): string {
  return rows
    .filter((r) => r.days.length > 0)
    .map((r) => {
      const days = r.days.map((d) => d.slice(0, 3)).join(", ");
      const hours = r.closed
        ? "Closed"
        : r.open === "Open 24 hours"
          ? "Open 24 hours"
          : `${r.open} – ${r.close}`;
      return `${days}: ${hours}`;
    })
    .join("; ");
}
