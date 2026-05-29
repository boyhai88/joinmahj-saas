import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import Button from "@/components/ui/button";

export const metadata = {
  title: "Profile — JoinMahj",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected route: no session → bounce to login.
  if (!user) {
    redirect("/login");
  }

  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

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
            Your profile
          </h1>
          <p className="mb-6 text-sm text-muted">You&rsquo;re logged in.</p>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <dt className="text-muted">Email</dt>
              <dd className="font-medium text-fg">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <dt className="text-muted">User ID</dt>
              <dd className="max-w-[55%] truncate font-mono text-xs text-fg">
                {user.id}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Member since</dt>
              <dd className="font-medium text-fg">{joined}</dd>
            </div>
          </dl>

          <form action={signOut} className="mt-8">
            <Button type="submit" variant="secondary" className="w-full">
              Log out
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="font-medium text-primary hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
