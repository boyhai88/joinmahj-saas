"use client";

import { useActionState } from "react";
import Button from "@/components/ui/button";
import { type AuthState } from "@/lib/auth/actions";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (prevState: AuthState, formData: FormData) => Promise<AuthState>;
};

const initialState: AuthState = {};

export default function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const isSignup = mode === "signup";
  const inputClasses =
    "w-full rounded-[12px] border border-border bg-bg px-4 py-3 text-sm text-fg outline-none transition focus:border-[oklch(72%_0.085_75/0.55)] focus:shadow-[0_0_0_3px_oklch(88%_0.04_75/0.45)] placeholder:text-[oklch(52%_0.025_85/0.55)]";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-fg">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-fg">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={isSignup ? 8 : undefined}
          placeholder={isSignup ? "At least 8 characters" : "Your password"}
          className={inputClasses}
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-[10px] border border-[oklch(58%_0.16_25/0.3)] bg-[oklch(58%_0.16_25/0.08)] px-3.5 py-2.5 text-[13px] text-[oklch(45%_0.16_25)]"
        >
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p
          role="status"
          className="rounded-[10px] border border-[oklch(58%_0.14_145/0.3)] bg-[oklch(58%_0.14_145/0.08)] px-3.5 py-2.5 text-[13px] text-[oklch(40%_0.12_145)]"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="mt-2 w-full" disabled={pending}>
        {pending
          ? isSignup
            ? "Creating account…"
            : "Logging in…"
          : isSignup
            ? "Create account"
            : "Log in"}
      </Button>
    </form>
  );
}
