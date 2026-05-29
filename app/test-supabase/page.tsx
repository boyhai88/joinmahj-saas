import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Supabase connection test",
  robots: { index: false, follow: false },
};

export default async function TestSupabasePage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const hasUrl = Boolean(url);
  const hasAnonKey = Boolean(anonKey);

  let host = "—";
  if (url) {
    try {
      host = new URL(url).host;
    } catch {
      host = "Invalid URL";
    }
  }

  // Instantiate the existing Supabase client to confirm it initializes.
  let clientReady = false;
  try {
    await createClient();
    clientReady = true;
  } catch {
    clientReady = false;
  }

  const connected = hasUrl && hasAnonKey && clientReady;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-24 text-fg">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-soft">
        <h1 className="mb-2 font-display text-3xl font-medium tracking-[-0.02em]">
          {connected ? "Supabase Connected" : "Supabase Not Connected"}
        </h1>
        <p className="mb-6 text-sm text-muted">
          Temporary infrastructure check — safe to delete.
        </p>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <dt className="text-muted">NEXT_PUBLIC_SUPABASE_URL</dt>
            <dd className="font-medium">{hasUrl ? "Loaded" : "Missing"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <dt className="text-muted">NEXT_PUBLIC_SUPABASE_ANON_KEY</dt>
            <dd className="font-medium">{hasAnonKey ? "Loaded" : "Missing"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <dt className="text-muted">Client initialized</dt>
            <dd className="font-medium">{clientReady ? "Yes" : "No"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Project host</dt>
            <dd className="font-medium">{host}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
