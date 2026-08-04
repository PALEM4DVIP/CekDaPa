"use client";

import { useMemo, useState } from "react";
import { Gauge, Loader2, AlertTriangle } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import DomainInput from "@/components/DomainInput";
import StatsCards from "@/components/StatsCards";
import ResultsTable from "@/components/ResultsTable";
import type { CheckState, DomainResult } from "@/lib/types";

const MAX_DOMAINS = 100;
const CHUNK_SIZE = 10;

function parseDomains(raw: string): string[] {
  const list = raw
    .split(/\r?\n/)
    .map((d) => d.trim())
    .filter(Boolean);
  return Array.from(new Set(list));
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function Home() {
  const [raw, setRaw] = useState("");
  const [state, setState] = useState<CheckState>("idle");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const domains = useMemo(() => parseDomains(raw), [raw]);
  const overLimit = domains.length > MAX_DOMAINS;
  const canCheck = domains.length > 0 && !overLimit && state !== "running";

  async function handleCheck() {
    setState("running");
    setErrorMsg(null);
    setResults([]);
    setProgress(0);

    const chunks = chunk(domains, CHUNK_SIZE);
    const collected: DomainResult[] = [];

    try {
      for (let i = 0; i < chunks.length; i++) {
        const res = await fetch("/api/check-domains", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domains: chunks[i] }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Terjadi kesalahan saat memeriksa domain.");
        }

        collected.push(...(data.results ?? []));
        setResults([...collected]);
        setProgress(Math.round(((i + 1) / chunks.length) * 100));
      }
      setState("done");
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan tak terduga.");
      setState("error");
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        <header className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-800 dark:bg-gold-400 text-white dark:text-navy-900 shadow-soft">
              <Gauge size={19} strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-ink dark:text-white leading-tight">
                Rankline
              </h1>
              <p className="text-xs text-ink-light dark:text-white/40">
                Bulk Open PageRank checker
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <section className="mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-white mb-2 leading-tight">
            Cek otoritas hingga 100 domain,{" "}
            <span className="text-gold-500">sekali jalan.</span>
          </h2>
          <p className="text-sm text-ink-light dark:text-white/50 max-w-xl">
            Tempel daftar domain, jalankan pengecekan Open PageRank secara massal,
            lalu urutkan, cari, dan ekspor hasilnya ke CSV atau Excel.
          </p>
        </section>

        <div className="space-y-6">
          <DomainInput
            value={raw}
            onChange={setRaw}
            count={domains.length}
            disabled={state === "running"}
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={handleCheck}
              disabled={!canCheck}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-800 dark:bg-gold-400 px-5 py-2.5 text-sm font-semibold text-white dark:text-navy-900 shadow-soft hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {state === "running" && <Loader2 size={15} className="animate-spin" />}
              {state === "running" ? "Memeriksa domain…" : "Periksa domain"}
            </button>

            {state === "running" && (
              <div className="flex-1 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-navy-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold-gradient transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-ink-light dark:text-white/40 w-10 text-right">
                  {progress}%
                </span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-coral-500/30 bg-coral-500/5 px-4 py-3 text-sm text-coral-500">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <StatsCards results={results} />
              <ResultsTable results={results} />
            </>
          )}
        </div>

        <footer className="mt-12 text-center text-xs text-ink-light/60 dark:text-white/25">
          Data otoritas domain disediakan oleh Open PageRank (openpagerank.com).
        </footer>
      </div>
    </main>
  );
}
