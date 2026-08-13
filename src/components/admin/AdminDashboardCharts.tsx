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

// Matches the CS / Official / Verified badge colors used throughout the
// admin UI (see BADGE_VARIANTS in AdminFacilityList.tsx and the color
// mapping documented in src/lib/design-tokens.ts) so this chart reads as
// the same system rather than an unrelated palette.
export const BADGE_CHART_COLORS = {
  communitySubmitted: "#F59E0B", // amber-500 — matches the CS "warning" badge family
  facilityOwned: "#3B82F6", // blue-500 — matches the Official "info" badge
  verified: "#10B981", // emerald-500 — matches the Verified "success" badge
};

// Matches the Listing Requests (violet) / Claims Pending (rose) stat card
// accent colors from the dashboard's statCards array.
const NEW_LISTINGS_COLOR = "#8B5CF6"; // violet-500
const CLAIMS_COLOR = "#F43F5E"; // rose-500

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
          formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
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
        <Bar dataKey="newListings" fill={NEW_LISTINGS_COLOR} name="New Listings" radius={[3, 3, 0, 0]} stackId="a" />
        <Bar dataKey="claims" fill={CLAIMS_COLOR} name="Claims" radius={[3, 3, 0, 0]} stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
