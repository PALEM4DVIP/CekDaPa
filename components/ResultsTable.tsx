"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpDown, Copy, FileSpreadsheet, FileText, Check } from "lucide-react";
import type { DomainResult } from "@/lib/types";
import { copyResultsToClipboard, exportToCSV, exportToExcel } from "@/lib/export";

type SortKey = "domain" | "page_rank_decimal" | "rank";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "ok" | "error";

function AuthorityBar({ value }: { value: number }) {
  const pct = Math.max(2, Math.min(100, (value / 10) * 100));
  return (
    <div className="flex items-center gap-2 w-full max-w-[140px]">
      <div className="h-1.5 flex-1 rounded-full bg-navy-100 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gold-gradient animate-fill-bar"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums text-ink dark:text-white/80 w-8 text-right">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

export default function ResultsTable({ results }: { results: DomainResult[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("page_rank_decimal");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    let rows = results.filter((r) =>
      r.domain.toLowerCase().includes(query.trim().toLowerCase())
    );
    if (statusFilter === "ok") rows = rows.filter((r) => r.status_code === 200);
    if (statusFilter === "error") rows = rows.filter((r) => r.status_code !== 200);

    const dir = sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      if (sortKey === "domain") return dir * a.domain.localeCompare(b.domain);
      if (sortKey === "rank") {
        const av = a.rank ? parseInt(a.rank) : Number.MAX_SAFE_INTEGER;
        const bv = b.rank ? parseInt(b.rank) : Number.MAX_SAFE_INTEGER;
        return dir * (av - bv);
      }
      const av = a.page_rank_decimal ?? -1;
      const bv = b.page_rank_decimal ?? -1;
      return dir * (av - bv);
    });
    return rows;
  }, [results, query, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  async function handleCopy() {
    await copyResultsToClipboard(filtered);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const okCount = results.filter((r) => r.status_code === 200).length;
  const errorCount = results.length - okCount;

  return (
    <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-soft overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border-light dark:border-border-dark p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light/50 dark:text-white/30"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari domain…"
            className="w-full rounded-lg border border-border-light dark:border-border-dark bg-canvas-light/60 dark:bg-black/20 py-2 pl-9 pr-3 text-sm text-ink dark:text-white/90 placeholder:text-ink-light/40 dark:placeholder:text-white/25 focus:border-gold-400 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-border-light dark:border-border-dark overflow-hidden text-xs font-medium">
            {(["all", "ok", "error"] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 transition-colors ${
                  statusFilter === f
                    ? "bg-navy-800 text-white dark:bg-gold-400 dark:text-navy-900"
                    : "bg-transparent text-ink-light dark:text-white/50 hover:bg-canvas-light dark:hover:bg-white/5"
                }`}
              >
                {f === "all" ? `Semua (${results.length})` : f === "ok" ? `OK (${okCount})` : `Error (${errorCount})`}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-light dark:border-border-dark px-3 py-1.5 text-xs font-medium text-ink dark:text-white/80 hover:border-gold-400 transition-colors"
          >
            {copied ? <Check size={13} className="text-teal-500" /> : <Copy size={13} />}
            {copied ? "Tersalin" : "Salin"}
          </button>
          <button
            onClick={() => exportToCSV(filtered)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-light dark:border-border-dark px-3 py-1.5 text-xs font-medium text-ink dark:text-white/80 hover:border-gold-400 transition-colors"
          >
            <FileText size={13} /> CSV
          </button>
          <button
            onClick={() => exportToExcel(filtered)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 dark:bg-gold-400 px-3 py-1.5 text-xs font-medium text-white dark:text-navy-900 hover:opacity-90 transition-opacity"
          >
            <FileSpreadsheet size={13} /> Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark text-left text-xs uppercase tracking-wider text-ink-light dark:text-white/40">
              <th className="px-4 py-3 font-medium w-10">No</th>
              <th className="px-4 py-3 font-medium">
                <button onClick={() => toggleSort("domain")} className="inline-flex items-center gap-1 hover:text-ink dark:hover:text-white/80">
                  Domain <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">
                <button onClick={() => toggleSort("page_rank_decimal")} className="inline-flex items-center gap-1 hover:text-ink dark:hover:text-white/80">
                  PageRank <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">
                <button onClick={() => toggleSort("rank")} className="inline-flex items-center gap-1 hover:text-ink dark:hover:text-white/80">
                  Rank Global <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={r.domain + i}
                className="border-b border-border-light/60 dark:border-border-dark/60 last:border-0 hover:bg-canvas-light/50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-4 py-3 text-ink-light/60 dark:text-white/30 font-mono text-xs">{i + 1}</td>
                <td className="px-4 py-3 font-mono text-ink dark:text-white/90">{r.domain}</td>
                <td className="px-4 py-3">
                  {r.status_code === 200 && typeof r.page_rank_decimal === "number" ? (
                    <AuthorityBar value={r.page_rank_decimal} />
                  ) : (
                    <span className="text-ink-light/40 dark:text-white/20">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-light dark:text-white/50">
                  {r.rank ? `#${r.rank}` : "—"}
                </td>
                <td className="px-4 py-3">
                  {r.status_code === 200 ? (
                    <span className="inline-flex items-center rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-600 dark:text-teal-400">
                      OK
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center rounded-full bg-coral-500/10 px-2 py-0.5 text-xs font-medium text-coral-500"
                      title={r.error}
                    >
                      {r.error || "Error"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-light/50 dark:text-white/30">
                  Tidak ada domain yang cocok dengan pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
