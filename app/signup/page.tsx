import Link from "next/link";
import AuthForm from "@/components/auth/auth-form";
import { signUp } from "@/lib/auth/actions";

export const metadata = {
  title: "Sign up — JoinMahj",
};

export default function SignupPage() {
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
            Join the table
          </h1>
          <p className="mb-6 text-sm text-muted">
            Create a free account to start the beginner roadmap.
          </p>

          <AuthForm mode="signup" action={signUp} />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
