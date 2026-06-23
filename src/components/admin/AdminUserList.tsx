"use client";

import { useState, useTransition } from "react";
import { addAdminUser, removeAdminUser, updateAdminRole } from "@/app/admin/(protected)/users/actions";

type AdminUser = {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  created_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-teal-50 text-teal-700 border-teal-200",
  admin: "bg-blue-50 text-blue-700 border-blue-200",
};

export function AdminUserList({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!newEmail) return;
    setError(null);
    startTransition(async () => {
      const result = await addAdminUser(newEmail, newName, newRole);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowAddForm(false);
        setNewEmail("");
        setNewName("");
        setNewRole("admin");
      }
    });
  }

  function handleRoleChange(userId: string, newRoleValue: string) {
    startTransition(async () => {
      await updateAdminRole(userId, newRoleValue);
    });
  }

  function handleRemove(userId: string, email: string) {
    if (!confirm(`Remove admin access for ${email}?`)) return;
    startTransition(async () => {
      await removeAdminUser(userId);
    });
  }

  return (
    <div className="space-y-4">
      {/* User table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Added</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {user.display_name ?? "—"}
                    {isSelf && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${ROLE_COLORS[user.role] ?? ""}`}
                    >
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          defaultValue={user.role}
                          disabled={isPending}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        <button
                          className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          disabled={isPending}
                          onClick={() => handleRemove(user.id, user.email)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add admin form */}
      {showAddForm ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 font-semibold text-foreground">Add admin user</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            The user must already exist in Supabase Auth. Go to Supabase Dashboard
            → Authentication → Users → Create new user first, then add them here.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              value={newEmail}
            />
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Display name"
              type="text"
              value={newName}
            />
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => setNewRole(e.target.value)}
              value={newRole}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              disabled={isPending || !newEmail}
              onClick={handleAdd}
              type="button"
            >
              {isPending ? "Adding..." : "Add admin"}
            </button>
            <button
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
              onClick={() => {
                setShowAddForm(false);
                setError(null);
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="rounded-lg border border-primary/30 bg-card px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/5"
          onClick={() => setShowAddForm(true)}
          type="button"
        >
          + Add admin user
        </button>
      )}
    </div>
  );
}
