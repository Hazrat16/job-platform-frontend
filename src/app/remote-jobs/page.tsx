"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import type { RemoteJobListing } from "@/types";
import { apiClient } from "@/utils/api";
import { Briefcase, ExternalLink, Globe, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function RemoteJobsPage() {
  const { ready } = useAuthGuard({ roles: ["jobseeker"] });
  const [jobs, setJobs] = useState<RemoteJobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"" | "remotive" | "arbeitnow">("");

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getRemoteJobs({
          search: query || undefined,
          source: source || undefined,
          limit: 120,
        });
        if (cancelled) return;
        if (!res.success) {
          toast.error(res.message || "Failed to load remote jobs");
          return;
        }
        setJobs(res.data || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [ready, query, source]);

  const sorted = useMemo(
    () =>
      [...jobs].sort((a, b) => {
        const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return db - da;
      }),
    [jobs],
  );

  if (!ready) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-fg-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Remote Jobs</h1>
          <p className="text-sm text-fg-muted">
            Aggregated from free job APIs (Remotive and Arbeitnow).
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, company, tags..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as "" | "remotive" | "arbeitnow")}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">All sources</option>
            <option value="remotive">Remotive</option>
            <option value="arbeitnow">Arbeitnow</option>
          </select>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-fg-muted">
            Loading remote jobs...
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Globe className="mx-auto mb-2 h-8 w-8 text-fg-subtle" />
            <p className="font-medium text-foreground">No remote jobs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((job) => (
              <article key={job.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-foreground">{job.title}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-fg-muted">
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.company}
                      </span>
                      <span>{job.location}</span>
                      <span className="rounded-full bg-card-muted px-2 py-0.5 text-xs uppercase">
                        {job.source}
                      </span>
                    </div>
                    {job.tags.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {job.tags.slice(0, 6).map((t) => (
                          <span key={t} className="rounded bg-card-muted px-2 py-0.5 text-xs text-fg-muted">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white"
                  >
                    Apply
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

