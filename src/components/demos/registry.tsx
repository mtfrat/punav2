import type * as React from "react";
import CollectionsDemo from "./collections-demo";
import StockSyncDemo from "./stock-sync-demo";
import PayrollDemo from "./payroll-demo";
import LeadScoringDemo from "./lead-scoring-demo";
import QuoteDemo from "./quote-demo";
import DashboardDemo from "./dashboard-demo";
import VideoDemo from "./video-demo";
import type { DemoId } from "../../content/demos";
import type { Loc } from "./shared";

export const demoComponents: Record<DemoId, React.ComponentType<{ loc: Loc }>> = {
  collections: CollectionsDemo,
  "stock-sync": StockSyncDemo,
  payroll: PayrollDemo,
  "lead-scoring": LeadScoringDemo,
  "wholesale-quotes": QuoteDemo,
  "store-dashboard": DashboardDemo,
  "convenio-multilateral": VideoDemo,
};
