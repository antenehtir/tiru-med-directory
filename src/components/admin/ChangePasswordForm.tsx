"use client";

import { useState } from "react";
import { changePassword } from "@/app/admin/(protected)/account/actions";

function PasswordInput({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          autoComplete="off"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          id={id}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          type={show ? "text" : "password"}
          value={value}
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          onClick={onToggle}
          tabIndex={-1}
          type="button"
        >
          {show ? (
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round" strokeLinejoin="round"/>
              <line strokeLinecap="round" strokeLinejoin="round" x1="1" x2="23" y1="1" y2="23"/>
            </svg>
          ) : (
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    current.length >= 1 &&
    newPass.length >= 8 &&
    newPass === confirm &&
    !loading;

  async function handleSubmit() {
    setError(null);
    setSuccess(false);

    if (newPass !== confirm) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await changePassword(current, newPass);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setCurrent("");
      setNewPass("");
      setConfirm("");
      setTimeout(() => setSuccess(false), 4000);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 font-semibold text-foreground">Change Password</h2>

      <div className="flex flex-col gap-3">
        <PasswordInput
          id="current-password"
          label="Current password"
          onChange={setCurrent}
          onToggle={() => setShowCurrent((v) => !v)}
          show={showCurrent}
          value={current}
        />
        <PasswordInput
          id="new-password"
          label="New password"
          onChange={setNewPass}
          onToggle={() => setShowNew((v) => !v)}
          placeholder="Min. 8 characters"
          show={showNew}
          value={newPass}
        />
        <PasswordInput
          id="confirm-password"
          label="Confirm new password"
          onChange={setConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          show={showConfirm}
          value={confirm}
        />

        {newPass && confirm && newPass !== confirm && (
          <p className="text-xs text-red-500">Passwords do not match.</p>
        )}
        {newPass && newPass.length < 8 && (
          <p className="text-xs text-amber-500">
            Password must be at least 8 characters.
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-teal-600">
            ✓ Password updated successfully.
          </p>
        )}

        <button
          className="mt-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          disabled={!canSubmit}
          onClick={handleSubmit}
          type="button"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </div>
    </div>
  );
}
