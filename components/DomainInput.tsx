"use client";

import { ClipboardPaste, Trash2 } from "lucide-react";

const MAX_DOMAINS = 100;

export default function DomainInput({
  value,
  onChange,
  count,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  count: number;
  disabled: boolean;
}) {
  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      onChange(value ? `${value}\n${text}` : text);
    } catch {
      // Clipboard read may be blocked; user can paste manually.
    }
  }

  const overLimit = count > MAX_DOMAINS;

  return (
    <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-soft p-5">
      <div className="flex items-center justify-between mb-3">
        <label htmlFor="domains" className="font-display text-sm font-semibold tracking-wide text-ink dark:text-white/90">
          Daftar domain
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePaste}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-light dark:text-white/60 hover:bg-canvas-light dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
          >
            <ClipboardPaste size={13} /> Tempel
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled || !value}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-light dark:text-white/60 hover:bg-canvas-light dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
          >
            <Trash2 size={13} /> Bersihkan
          </button>
        </div>
      </div>

      <textarea
        id="domains"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"contoh.com\nanthropic.com\nwikipedia.org\n\n(satu domain per baris, maks 100)"}
        rows={8}
        className="w-full resize-y rounded-xl border border-border-light dark:border-border-dark bg-canvas-light/60 dark:bg-black/20 px-4 py-3 font-mono text-sm text-ink dark:text-white/90 placeholder:text-ink-light/50 dark:placeholder:text-white/25 focus:border-gold-400 outline-none transition-colors disabled:opacity-60"
      />

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={overLimit ? "text-coral-500 font-medium" : "text-ink-light dark:text-white/40"}>
          {count} / {MAX_DOMAINS} domain
        </span>
        {overLimit && (
          <span className="text-coral-500 font-medium">
            Melebihi batas — hapus {count - MAX_DOMAINS} domain
          </span>
        )}
      </div>
    </div>
  );
}
