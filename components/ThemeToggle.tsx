"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("rankline-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-ink dark:text-white/80 shadow-soft transition-colors hover:border-gold-400"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
