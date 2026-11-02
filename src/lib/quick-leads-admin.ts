/** Admin-side reader for website_quick_leads (used by /ops/leads). Kept free of framework imports so it can be unit-tested. */

export const QUICK_LEAD_STATUSES = ["new", "contacted", "closed", "spam"];
export const QUICK_LEADS_LIMIT = 50;

type QuickLeadRow = Record<string, any>;
interface QuickLeadReader {
  from(table: string): {
    select(columns: string): {
      order(column: string, options: { ascending: boolean }): { limit(count: number): PromiseLike<{ data: QuickLeadRow[] | null; error: unknown }> };
    };
  };
}

/**
 * Latest quick leads. Never throws: if the table does not exist yet (migration not applied), the query errors, or
 * the client throws, the caller gets `quickAvailable: false` and /ops/leads keeps working.
 */
export async function loadQuickLeads(service: unknown): Promise<{ quickLeads: QuickLeadRow[]; quickAvailable: boolean }> {
  try {
    const result = await (service as QuickLeadReader).from("website_quick_leads").select("*").order("created_at", { ascending: false }).limit(QUICK_LEADS_LIMIT);
    if (result.error) return { quickLeads: [], quickAvailable: false };
    return { quickLeads: result.data || [], quickAvailable: true };
  } catch {
    return { quickLeads: [], quickAvailable: false };
  }
}
