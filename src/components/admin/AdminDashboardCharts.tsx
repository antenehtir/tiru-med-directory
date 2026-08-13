"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SUBMISSION_SERIES_COLORS } from "@/lib/admin/dashboard-colors";

export type BadgeDistributionDatum = {
  name: string;
  value: number;
  color: string;
};

export type SubmissionTrendDatum = {
  date: string;
  label: string;
  newListings: number;
  claims: number;
};

export function BadgeDistributionChart({ data }: { data: BadgeDistributionDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No facilities yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer height={260} width="100%">
      <PieChart>
        <Pie
          cx="50%"
          cy="50%"
          data={data}
          dataKey="value"
          innerRadius={60}
          nameKey="name"
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell fill={entry.color} key={entry.name} stroke="var(--card)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value, name) => {
            const num = typeof value === "number" ? value : Number(value ?? 0);
            return [`${num} (${Math.round((num / total) * 100)}%)`, name];
          }}
        />
        <Legend
          formatter={(value, entry) => {
            const count = (entry?.payload as unknown as BadgeDistributionDatum | undefined)?.value ?? 0;
            return (
              <span className="text-xs text-foreground">
                {value} ({count})
              </span>
            );
          }}
          iconSize={8}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SubmissionsTrendChart({ data }: { data: SubmissionTrendDatum[] }) {
  const hasData = data.some((d) => d.newListings > 0 || d.claims > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No submissions in the last 30 days.
      </div>
    );
  }

  return (
    <ResponsiveContainer height={260} width="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          fontSize={11}
          interval="preserveStartEnd"
          stroke="var(--muted-foreground)"
          tickLine={false}
        />
        <YAxis allowDecimals={false} fontSize={11} stroke="var(--muted-foreground)" tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend
          formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
          iconSize={8}
          iconType="circle"
        />
        <Bar
          dataKey="newListings"
          fill={SUBMISSION_SERIES_COLORS.newListings}
          name="New Listings"
          radius={[3, 3, 0, 0]}
          stackId="a"
        />
        <Bar
          dataKey="claims"
          fill={SUBMISSION_SERIES_COLORS.claims}
          name="Claims"
          radius={[3, 3, 0, 0]}
          stackId="a"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
