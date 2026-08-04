"use client";

import { ArrowUpRight, ArrowDownRight, ListChecks } from "lucide-react";
import type { DomainResult } from "@/lib/types";

function Gauge({ value }: { value: number }) {
  // value: 0–10 scale
  const pct = Math.max(0, Math.min(1, value / 10));
  const radius = 46;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference * (1 - pct);

  return (
    <svg viewBox="0 0 120 66" className="w-28 h-16">
      <path
        d="M 14 60 A 46 46 0 0 1 106 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        className="text-navy-100 dark:text-white/10"
      />
      <path
        d="M 14 60 A 46 46 0 0 1 106 60"
        fill="none"
        stroke="url(#goldStroke)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
      />
      <defs>
        <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E3B968" />
          <stop offset="100%" stopColor="#A97A2C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function StatsCards({ results }: { results: DomainResult[] }) {
  const valid = results.filter((r) => r.status_code === 200 && typeof r.page_rank_decimal === "number");

  if (valid.length === 0) return null;

  const avg =
    valid.reduce((sum, r) => sum + (r.page_rank_decimal ?? 0), 0) / valid.length;

  const highest = [...valid].sort(
    (a, b) => (b.page_rank_decimal ?? 0) - (a.page_rank_decimal ?? 0)
  )[0];
  const lowest = [...valid].sort(
    (a, b) => (a.page_rank_decimal ?? 0) - (b.page_rank_decimal ?? 0)
  )[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-soft p-5 flex items-center justify-between animate-rise-in">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-light dark:text-white/40 mb-1">
            Rata-rata OPR
          </p>
          <p className="font-display text-2xl font-semibold text-ink dark:text-white">
            {avg.toFixed(2)}
          </p>
        </div>
        <Gauge value={avg} />
      </div>

      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-soft p-5 animate-rise-in">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-light dark:text-white/40 mb-1 flex items-center gap-1.5">
          <ArrowUpRight size={13} className="text-teal-500" /> Domain tertinggi
        </p>
        <p className="font-mono text-sm text-ink dark:text-white/90 truncate" title={highest.domain}>
          {highest.domain}
        </p>
        <p className="font-display text-2xl font-semibold text-teal-500 mt-1">
          {highest.page_rank_decimal?.toFixed(2)}
        </p>
      </div>

      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-soft p-5 animate-rise-in">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-light dark:text-white/40 mb-1 flex items-center gap-1.5">
          <ArrowDownRight size={13} className="text-coral-500" /> Domain terendah
        </p>
        <p className="font-mono text-sm text-ink dark:text-white/90 truncate" title={lowest.domain}>
          {lowest.domain}
        </p>
        <p className="font-display text-2xl font-semibold text-coral-500 mt-1">
          {lowest.page_rank_decimal?.toFixed(2)}
        </p>
      </div>

      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-soft p-5 animate-rise-in">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-light dark:text-white/40 mb-1 flex items-center gap-1.5">
          <ListChecks size={13} className="text-gold-500" /> Domain diproses
        </p>
        <p className="font-display text-2xl font-semibold text-ink dark:text-white">
          {valid.length}
          <span className="text-sm font-body font-normal text-ink-light dark:text-white/40"> / {results.length}</span>
        </p>
      </div>
    </div>
  );
}
