import Link from "next/link";
import AuthForm from "@/components/auth/auth-form";
import { signIn } from "@/lib/auth/actions";

export const metadata = {
  title: "Log in — JoinMahj",
};

export default function LoginPage() {
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
            Welcome back
          </h1>
          <p className="mb-6 text-sm text-muted">
            Log in to continue learning Mahjong.
          </p>

          <AuthForm mode="login" action={signIn} />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
