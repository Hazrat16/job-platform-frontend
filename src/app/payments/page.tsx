"use client";

import { Payment } from "@/types";
import { apiClient, getUser } from "@/utils/api";
import { Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

function PaymentsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [amount, setAmount] = useState("100");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getMyPayments();
      if (!res.success) {
        toast.error(res.message || "Could not load payments");
        setPayments([]);
        return;
      }
      setPayments(res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "employer") {
      toast.error("Payments are available for employer accounts.");
      router.replace("/");
      return;
    }
    void load();
  }, [load, router]);

  useEffect(() => {
    const ssl = searchParams.get("ssl");
    if (!ssl) return;
    if (ssl === "success") {
      toast.success("Payment completed. Thank you.");
      void load();
    } else if (ssl === "fail") {
      toast.error("Payment did not complete.");
      void load();
    } else if (ssl === "cancel") {
      toast("Payment was cancelled.");
      void load();
    }
    router.replace("/payments");
  }, [searchParams, load, router]);

  const handlePay = async () => {
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || n < 10 || n > 500_000) {
      toast.error("Enter an amount between 10 and 500,000 BDT.");
      return;
    }
    setPaying(true);
    try {
      const res = await apiClient.initSslCommerzPayment(n);
      if (!res.success || !res.data?.gatewayUrl) {
        toast.error(res.message || "Could not start payment");
        return;
      }
      window.location.href = res.data.gatewayUrl;
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-white/50">
            <Wallet className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Payments (BDT)
            </h1>
            <p className="text-sm text-slate-600">
              Top up via SSLCOMMERZ (cards, mobile banking, and more). Sandbox test cards are
              listed in the{" "}
              <a
                href="https://developer.sslcommerz.com/doc/v4/"
                className="font-medium text-indigo-600 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                SSLCOMMERZ developer docs
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-indigo-950/5 ring-1 ring-slate-900/5 backdrop-blur-md">
          <h2 className="text-lg font-bold text-slate-900">Start a payment</h2>
          <p className="mt-1 text-sm text-slate-600">
            Configure <code className="rounded-md bg-slate-100/90 px-1.5 py-0.5 text-xs">SSLCOMMERZ_*</code> and{" "}
            <code className="rounded-md bg-slate-100/90 px-1.5 py-0.5 text-xs">API_PUBLIC_BASE_URL</code> on the API
            server. Callbacks must reach your backend (use a public URL or tunnel for IPN in
            development).
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Amount (BDT)</span>
              <input
                type="number"
                min={10}
                max={500_000}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-40 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-2 text-slate-900 shadow-inner shadow-slate-900/5 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
            <button
              type="button"
              onClick={() => void handlePay()}
              disabled={paying}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60"
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Starting…
                </>
              ) : (
                "Pay with SSLCOMMERZ"
              )}
            </button>
          </div>
        </div>

        <h2 className="mb-3 text-lg font-bold text-slate-900">Recent activity</h2>
        {loading ? (
          <div className="text-slate-500">Loading…</div>
        ) : payments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-indigo-200/60 bg-white/70 p-6 text-slate-600 shadow-inner backdrop-blur-sm">
            No payments yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {payments.map((p) => (
              <li
                key={p._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-sm shadow-md ring-1 ring-slate-900/5 backdrop-blur-sm"
              >
                <div>
                  <span className="font-mono text-slate-800">{p.tranId}</span>
                  <span className="mx-2 text-slate-400">·</span>
                  <span className="font-semibold text-slate-900">
                    ৳{p.amount.toLocaleString("en-BD")}
                  </span>
                  <span className="mx-2 text-gray-400">·</span>
                  <span
                    className={
                      p.status === "completed"
                        ? "text-green-700"
                        : p.status === "pending"
                          ? "text-amber-700"
                          : "text-red-700"
                    }
                  >
                    {p.status}
                  </span>
                </div>
                <time className="text-gray-500" dateTime={p.createdAt}>
                  {new Date(p.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link href="/my-jobs" className="font-medium text-indigo-600 hover:underline">
            Back to My Jobs
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-600">
          Loading…
        </div>
      }
    >
      <PaymentsInner />
    </Suspense>
  );
}
