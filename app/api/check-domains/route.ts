import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OPR_ENDPOINT = "https://openpagerank.keywordseverywhere.com/v1/domains/bulk";
const MAX_DOMAINS_PER_CALL = 100;

function isValidDomain(domain: string): boolean {
  // Basic hostname validation: labels separated by dots, no protocol/path.
  const pattern =
    /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.(?!-)[a-zA-Z0-9-]{1,63}(?<!-))+$/;
  return pattern.test(domain);
}

function cleanDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENPAGERANK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENPAGERANK_API_KEY belum diatur di server. Buat key baru di openpagerank.keywordseverywhere.com/dashboard, lalu tambahkan sebagai environment variable di Vercel (Project Settings → Environment Variables) dan redeploy.",
      },
      { status: 500 }
    );
  }

  let body: { domains?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body request tidak valid." }, { status: 400 });
  }

  const rawDomains = Array.isArray(body.domains) ? body.domains : [];
  const cleaned = rawDomains.map(cleanDomain).filter(Boolean);

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "Tidak ada domain yang dikirim." }, { status: 400 });
  }
  if (cleaned.length > MAX_DOMAINS_PER_CALL) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_DOMAINS_PER_CALL} domain per permintaan.` },
      { status: 400 }
    );
  }

  const valid = cleaned.filter(isValidDomain);
  const invalidFormat = cleaned.filter((d) => !isValidDomain(d));

  const results: Record<string, any> = {};

  for (const d of invalidFormat) {
    results[d] = {
      domain: d,
      status_code: 400,
      error: "Format domain tidak valid",
    };
  }

  if (valid.length > 0) {
    try {
      const res = await fetch(OPR_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ domains: valid, include_history: false }),
        cache: "no-store",
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        // Non-JSON body (e.g. an HTML error/challenge page).
      }

      if (!res.ok || !data) {
        let message =
          data?.error?.message ||
          (rawText ? rawText.slice(0, 200) : "") ||
          `OpenPageRank API mengembalikan status ${res.status}`;

        if (res.status === 401) {
          message =
            "API key tidak valid. Pastikan kamu membuat key baru di openpagerank.keywordseverywhere.com/dashboard (format opr_live_...) dan menyimpannya sebagai OPENPAGERANK_API_KEY di Vercel.";
        } else if (res.status === 429) {
          message =
            data?.error?.type === "quota_error"
              ? "Kuota bulanan domain sudah habis."
              : "Terlalu banyak permintaan per menit, coba lagi sesaat lagi.";
        } else if (res.status === 400) {
          message = data?.error?.message || "Permintaan tidak valid.";
        }

        for (const d of valid) {
          results[d] = { domain: d, status_code: res.status, error: message };
        }
      } else {
        const list: any[] = Array.isArray(data.results) ? data.results : [];
        for (const item of list) {
          const key = cleanDomain(item.domain || "");
          if (item.found) {
            results[key] = {
              domain: item.domain,
              status_code: 200,
              page_rank_integer:
                typeof item.open_page_rank === "number" ? Math.round(item.open_page_rank) : undefined,
              page_rank_decimal: item.open_page_rank,
              rank: item.rank != null ? String(item.rank) : null,
              referring_domains: item.referring_domains,
            };
          } else {
            results[key] = {
              domain: item.domain,
              status_code: 404,
              error: "Domain tidak ditemukan di data Common Crawl",
            };
          }
        }

        const invalidFromApi: string[] = Array.isArray(data.invalid) ? data.invalid : [];
        for (const raw of invalidFromApi) {
          const key = cleanDomain(raw);
          results[key] = { domain: raw, status_code: 400, error: "Format domain tidak valid" };
        }
      }
    } catch (err: any) {
      for (const d of valid) {
        results[d] = {
          domain: d,
          status_code: 502,
          error: "Gagal menghubungi OpenPageRank API",
        };
      }
    }
  }

  const ordered = cleaned.map((d) => results[d] ?? { domain: d, status_code: 500, error: "Tidak ada hasil" });

  return NextResponse.json({ results: ordered });
}
