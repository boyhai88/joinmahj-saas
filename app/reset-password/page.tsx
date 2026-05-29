import Link from "next/link";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset password — JoinMahj",
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-display text-2xl font-semibold tracking-[-0.03em] text-fg"
          >
            Join<span className="text-accent">Mahj</span>
          </Link>
        </div>

        <div className="rounded-card border border-border bg-surface p-8 shadow-soft">
          <h1 className="mb-1 font-display text-3xl font-medium tracking-[-0.02em] text-fg">
            Set a new password
          </h1>
          <p className="mb-6 text-sm text-muted">
            Choose a new password for your account.
          </p>

          <ResetPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  );
}
