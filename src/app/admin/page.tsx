"use client";

import { DataDeletionRequest, Job, User } from "@/types";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminPage() {
  const { ready } = useAuthGuard({ roles: ["admin"] });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    const load = async () => {
      setLoading(true);
      try {
        const [u, j, d] = await Promise.all([
          apiClient.adminListUsers(),
          apiClient.adminListJobs(),
          apiClient.adminListDeletionRequests(),
        ]);
        if (u.success) setUsers(u.data || []);
        if (j.success) setJobs(j.data || []);
        if (d.success) setDeletionRequests(d.data || []);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [ready]);

  const moderateUser = async (id: string, action: "suspend" | "unsuspend" | "soft_delete") => {
    setBusyId(id);
    try {
      const res = await apiClient.adminModerateUser(id, action);
      if (!res.success || !res.data) return toast.error(res.message || "Could not update user");
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data! : u)));
      toast.success("User updated");
    } finally {
      setBusyId(null);
    }
  };

  const moderateJob = async (id: string, action: "close" | "soft_delete" | "restore") => {
    setBusyId(id);
    try {
      const res = await apiClient.adminModerateJob(id, action);
      if (!res.success || !res.data) return toast.error(res.message || "Could not update job");
      setJobs((prev) => prev.map((j) => (j._id === id ? res.data! : j)));
      toast.success("Job updated");
    } finally {
      setBusyId(null);
    }
  };

  const reviewRequest = async (
    id: string,
    status: "approved" | "rejected" | "processed",
  ) => {
    setBusyId(id);
    try {
      const res = await apiClient.adminReviewDeletionRequest(id, status);
      if (!res.success || !res.data) return toast.error(res.message || "Could not update request");
      setDeletionRequests((prev) => prev.map((r) => (r._id === id ? res.data! : r)));
      toast.success("Request updated");
    } finally {
      setBusyId(null);
    }
  };

  if (!ready || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h1 className="text-2xl font-bold text-foreground">Admin moderation</h1>
          <p className="text-sm text-fg-muted">Review users, jobs, and deletion requests.</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Users</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u._id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
                <div className="min-w-[14rem] flex-1 text-sm">
                  <p className="font-medium text-foreground">{u.name} ({u.role})</p>
                  <p className="text-fg-subtle">{u.email}</p>
                </div>
                <button disabled={busyId===u._id} onClick={() => void moderateUser(u._id, "suspend")} className="rounded-md border border-border px-2 py-1 text-xs">Suspend</button>
                <button disabled={busyId===u._id} onClick={() => void moderateUser(u._id, "unsuspend")} className="rounded-md border border-border px-2 py-1 text-xs">Unsuspend</button>
                <button disabled={busyId===u._id} onClick={() => void moderateUser(u._id, "soft_delete")} className="rounded-md border border-destructive px-2 py-1 text-xs text-destructive">Soft delete</button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Jobs</h2>
          <div className="space-y-2">
            {jobs.map((j) => (
              <div key={j._id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
                <div className="min-w-[14rem] flex-1 text-sm">
                  <p className="font-medium text-foreground">{j.title}</p>
                  <p className="text-fg-subtle">{j.company} · {j.status}{j.deletedAt ? " · archived" : ""}</p>
                </div>
                <button disabled={busyId===j._id} onClick={() => void moderateJob(j._id, "close")} className="rounded-md border border-border px-2 py-1 text-xs">Close</button>
                <button disabled={busyId===j._id} onClick={() => void moderateJob(j._id, "soft_delete")} className="rounded-md border border-destructive px-2 py-1 text-xs text-destructive">Soft delete</button>
                <button disabled={busyId===j._id} onClick={() => void moderateJob(j._id, "restore")} className="rounded-md border border-border px-2 py-1 text-xs">Restore</button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Data deletion requests</h2>
          <div className="space-y-2">
            {deletionRequests.map((r) => (
              <div key={r._id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
                <div className="min-w-[14rem] flex-1 text-sm">
                  <p className="font-medium text-foreground">Status: {r.status}</p>
                  <p className="text-fg-subtle">{r.reason || "No reason provided"}</p>
                </div>
                <button disabled={busyId===r._id} onClick={() => void reviewRequest(r._id, "approved")} className="rounded-md border border-border px-2 py-1 text-xs">Approve</button>
                <button disabled={busyId===r._id} onClick={() => void reviewRequest(r._id, "rejected")} className="rounded-md border border-border px-2 py-1 text-xs">Reject</button>
                <button disabled={busyId===r._id} onClick={() => void reviewRequest(r._id, "processed")} className="rounded-md border border-border px-2 py-1 text-xs">Mark processed</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
