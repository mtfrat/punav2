import { BadgeDollarSign, BarChart3, Building2, Calculator, CalendarClock, ClipboardList, FileText, FolderCheck, Landmark, Receipt, Scale, ShieldCheck, Stethoscope, Store, Users } from "lucide-react";
import type { DemoId, VerticalId } from "../../content/demos";

export const DEMO_ICONS: Record<DemoId, typeof FileText> = {
  collections: BadgeDollarSign,
  "stock-sync": ClipboardList,
  payroll: CalendarClock,
  "lead-scoring": Users,
  "wholesale-quotes": FileText,
  "store-dashboard": BarChart3,
  "convenio-multilateral": Landmark,
  "client-invoices": Receipt,
  "monthly-docs": FolderCheck,
  "policies-renewals": ShieldCheck,
};

export const VERTICAL_ICONS: Record<VerticalId, typeof FileText> = {
  accounting: Calculator,
  legal: Scale,
  insurance: ShieldCheck,
  "real-estate": Building2,
  clinics: Stethoscope,
  commerce: Store,
};
