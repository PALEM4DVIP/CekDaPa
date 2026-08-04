export type DomainResult = {
  domain: string;
  status_code: number;
  error?: string;
  page_rank_integer?: number;
  page_rank_decimal?: number;
  rank?: string | null;
};

export type CheckState = "idle" | "running" | "done" | "error";
