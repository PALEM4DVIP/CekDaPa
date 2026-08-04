import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OPR_ENDPOINT = "https://openpagerank.com/api/v1.0/getPageRank";
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
          "OPENPAGERANK_API_KEY belum diatur di server. Tambahkan environment variable ini di Vercel (Project Settings → Environment Variables), lalu redeploy.",
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
  const invalid = cleaned.filter((d) => !isValidDomain(d));

  const results: Record<string, any> = {};

  for (const d of invalid) {
    results[d] = {
      domain: d,
      status_code: 400,
      error: "Format domain tidak valid",
    };
  }

  if (valid.length > 0) {
    const params = new URLSearchParams();
    valid.forEach((d) => params.append("domains[]", d));

    try {
      const res = await fetch(`${OPR_ENDPOINT}?${params.toString()}`, {
        method: "GET",
        headers: {
          "API-OPR": apiKey,
          "User-Agent": "Rankline/1.0 (+https://vercel.com)",
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        // Non-JSON body (e.g. an HTML error/challenge page).
      }

      if (!res.ok || !data || data.status_code !== 200) {
        let message =
          data?.status_message ||
          data?.message ||
          data?.error ||
          (rawText ? rawText.slice(0, 200) : "") ||
          `OpenPageRank API mengembalikan status ${res.status}`;

        if (res.status === 401) {
          message = "API key OpenPageRank tidak valid atau belum diisi dengan benar.";
        } else if (res.status === 403) {
          message =
            "OpenPageRank menolak permintaan (403). Kemungkinan penyebab: API key salah/belum aktif, akun belum diverifikasi, atau kuota harian habis. Pesan asli: " +
            (data?.status_message || data?.message || data?.error || rawText.slice(0, 150) || "tidak ada detail");
        } else if (res.status === 429) {
          message = "Kuota permintaan OpenPageRank harian sudah habis.";
        }

        for (const d of valid) {
          results[d] = { domain: d, status_code: res.status, error: message };
        }
      } else {
        const responseList: any[] = Array.isArray(data.response) ? data.response : [];
        for (const item of responseList) {
          const key = cleanDomain(item.domain || "");
          results[key] = {
            domain: item.domain,
            status_code: item.status_code,
            error: item.status_code !== 200 ? item.error : undefined,
            page_rank_integer: item.page_rank_integer,
            page_rank_decimal:
              typeof item.page_rank_decimal === "string"
                ? parseFloat(item.page_rank_decimal)
                : item.page_rank_decimal,
            rank: item.rank ?? null,
          };
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
