import * as XLSX from "xlsx";
import type { DomainResult } from "./types";

function toRows(results: DomainResult[]) {
  return results.map((r, i) => ({
    "No": i + 1,
    "Domain": r.domain,
    "PageRank": r.page_rank_decimal ?? "",
    "PageRank (Integer)": r.page_rank_integer ?? "",
    "Rank Global": r.rank ?? "",
    "Status": r.status_code === 200 ? "OK" : r.error || "Error",
  }));
}

export function exportToCSV(results: DomainResult[], filename = "opr-results.csv") {
  const rows = toRows(results);
  const headers = Object.keys(rows[0] ?? {});
  const escape = (val: unknown) => {
    const s = String(val ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape((row as any)[h])).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

export function exportToExcel(results: DomainResult[], filename = "opr-results.xlsx") {
  const rows = toRows(results);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 32 },
    { wch: 12 },
    { wch: 16 },
    { wch: 12 },
    { wch: 12 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "OPR Results");
  XLSX.writeFile(workbook, filename);
}

export async function copyResultsToClipboard(results: DomainResult[]): Promise<void> {
  const rows = toRows(results);
  const headers = Object.keys(rows[0] ?? {});
  const text = [
    headers.join("\t"),
    ...rows.map((row) => headers.map((h) => (row as any)[h]).join("\t")),
  ].join("\n");
  await navigator.clipboard.writeText(text);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
