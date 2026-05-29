"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // A recovery session can arrive two ways:
    //  - PKCE: cookies already set by /auth/callback (getSession returns it)
    //  - Implicit: tokens in the URL hash, auto-detected by the browser client
    //    which then emits a PASSWORD_RECOVERY event.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  const fieldClasses =
    "w-full rounded-[12px] border border-border bg-bg px-4 py-3 text-sm text-fg outline-none transition focus:border-[oklch(72%_0.085_75/0.55)] focus:shadow-[0_0_0_3px_oklch(88%_0.04_75/0.45)] placeholder:text-[oklch(52%_0.025_85/0.55)]";

  if (success) {
    return (
      <p
        role="status"
        className="rounded-[10px] border border-[oklch(58%_0.14_145/0.3)] bg-[oklch(58%_0.14_145/0.08)] px-3.5 py-3 text-[14px] text-[oklch(40%_0.12_145)]"
      >
        Password updated. Redirecting you to log in…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!ready ? (
        <p className="rounded-[10px] border border-border bg-bg px-3.5 py-2.5 text-[13px] text-muted">
          Open this page from the link in your password reset email to continue.
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-fg">
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          className={fieldClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm" className="text-sm font-medium text-fg">
          Confirm Password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Re-enter your new password"
          className={fieldClasses}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-[10px] border border-[oklch(58%_0.16_25/0.3)] bg-[oklch(58%_0.16_25/0.08)] px-3.5 py-2.5 text-[13px] text-[oklch(45%_0.16_25)]"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" className="mt-2 w-full" disabled={pending || !ready}>
        {pending ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
