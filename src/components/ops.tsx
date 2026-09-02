import type { ReactNode } from "react";
import { Form, Link, NavLink, useNavigation } from "react-router";
import {
  Activity,
  BookOpenText,
  FileCheck2,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Send,
  UsersRound,
} from "lucide-react";
import { socialStatusLabel } from "../lib/social-studio";
const PAGE_SIZE = 25;

const nav = (contentStudioEnabled: boolean) => [
  { label: "Inicio", items: [{ to: "/ops", label: "Resumen", icon: LayoutDashboard, end: true }] },
  { label: "Editorial", items: [
    { to: "/ops/content", label: "Artículos", icon: BookOpenText },
    { to: "/ops/briefs", label: "Briefs", icon: FileCheck2 },
    { to: contentStudioEnabled ? "/ops/social" : "/ops/distribution", label: "Social Studio", icon: Send },
  ] },
  { label: "Adquisición", items: [
    { to: "/ops/prospects", label: "Prospectos", icon: UsersRound },
    { to: "/ops/leads", label: "Leads", icon: Inbox },
  ] },
  { label: "Sistema", items: [{ to: "/ops/runs", label: "Ejecuciones", icon: Activity }] },
];

function OpsBrand() {
  return <span className="ops-brand"><svg aria-hidden="true" viewBox="0 0 76 48"><path d="M0 48 23 12l18 36H0Z" fill="#ff6b00"/><path d="M18 48 48 0l28 48H18Z" fill="currentColor"/><path d="M51 48 64 25l12 23H51Z" fill="#7d2935"/></svg><span><strong>Puna</strong><small>Operations</small></span></span>;
}

function Navigation({ contentStudioEnabled }: { contentStudioEnabled: boolean }) {
  return <nav className="ops-navigation" aria-label="Operaciones">
    {nav(contentStudioEnabled).map((group) => <section className="ops-navigation-group" key={group.label} aria-label={group.label}><span>{group.label}</span>{group.items.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? "active" : undefined}><Icon aria-hidden="true" size={19}/><span>{label}</span></NavLink>)}</section>)}
  </nav>;
}

export function OpsShell({ email, contentStudioEnabled, children }: { email: string; contentStudioEnabled: boolean; children: ReactNode }) {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  return <div className={`ops-shell${busy ? " is-busy" : ""}`}>
    <a className="skip-link" href="#ops-main">Saltar al contenido</a>
    {busy ? <div className="ops-progress" role="status" aria-live="polite"><span/>Procesando…</div> : null}
    <aside className="ops-sidebar"><Link to="/ops" aria-label="Puna Operations"><OpsBrand/></Link><Navigation contentStudioEnabled={contentStudioEnabled}/><div className="ops-sidebar-user"><span>Sesión privada</span><strong>{email}</strong><Form method="post" action="/ops"><input type="hidden" name="intent" value="logout"/><button type="submit"><LogOut aria-hidden="true" size={18}/>Cerrar sesión</button></Form></div></aside>
    <header className="ops-mobile-header"><Link to="/ops" aria-label="Puna Operations"><OpsBrand/></Link><details><summary aria-label="Abrir navegación"><Menu aria-hidden="true"/></summary><div><Navigation contentStudioEnabled={contentStudioEnabled}/><Form method="post" action="/ops"><input type="hidden" name="intent" value="logout"/><button className="ops-link-button" type="submit"><LogOut aria-hidden="true" size={18}/>Cerrar sesión</button></Form></div></details></header>
    <main id="ops-main" className="ops-main" aria-busy={busy}>{children}</main>
  </div>;
}

export function OpsPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="ops-page-header"><div><p className="ops-eyebrow">{eyebrow}</p><h1>{title}</h1>{description ? <p>{description}</p> : null}</div>{action ? <div className="ops-page-action">{action}</div> : null}</header>;
}

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const status = value || "unknown";
  const socialStatuses = ["draft", "approved", "rejected", "published", "archived"];
  const label = socialStatuses.includes(status) ? socialStatusLabel(status) : status.replace(/_/g, " ");
  return <span className={`ops-status ops-status-${status.replace(/_/g, "-")}`}><span aria-hidden="true"/>{label}</span>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="ops-empty"><FileCheck2 aria-hidden="true"/><h2>{title}</h2><p>{body}</p></div>;
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "error" }) {
  return <div className={`ops-notice ops-notice-${tone}`} role={tone === "error" ? "alert" : "status"} aria-live="polite">{children}</div>;
}

export function Pager({ page, count, path, params }: { page: number; count: number | null; path: string; params?: URLSearchParams }) {
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));
  if (totalPages <= 1) return null;
  const href = (next: number) => { const query = new URLSearchParams(params); query.set("page", String(next)); return `${path}?${query}`; };
  return <nav className="ops-pager" aria-label="Paginación"><span>Página {page} de {totalPages}</span><div>{page > 1 ? <Link to={href(page - 1)}>Anterior</Link> : <span aria-disabled="true">Anterior</span>}{page < totalPages ? <Link to={href(page + 1)}>Siguiente</Link> : <span aria-disabled="true">Siguiente</span>}</div></nav>;
}

export function Field({ label, name, value, required, type = "text", children, hint, maxLength }: { label: string; name: string; value?: string | number | null; required?: boolean; type?: string; children?: ReactNode; hint?: string; maxLength?: number }) {
  return <label className="ops-field"><span>{label}{required ? <b aria-hidden="true"> *</b> : null}</span>{children || <input name={name} type={type} defaultValue={value ?? ""} required={required} maxLength={maxLength}/>} {hint ? <small>{hint}</small> : null}</label>;
}

export function TextAreaField({ label, name, value, required, rows = 5, hint, maxLength }: { label: string; name: string; value?: string | null; required?: boolean; rows?: number; hint?: string; maxLength?: number }) {
  return <label className="ops-field"><span>{label}{required ? <b aria-hidden="true"> *</b> : null}</span><textarea name={name} defaultValue={value || ""} required={required} rows={rows} maxLength={maxLength}/>{hint ? <small>{hint}</small> : null}</label>;
}

export function SubmitButton({ children, intent = "save", danger = false, confirmMessage }: { children: ReactNode; intent?: string; danger?: boolean; confirmMessage?: string }) {
  const navigation = useNavigation();
  return <button disabled={navigation.state !== "idle"} className={danger ? "ops-button ops-button-danger" : "ops-button"} type="submit" name="intent" value={intent} onClick={confirmMessage ? (event) => { if (!window.confirm(confirmMessage)) event.preventDefault(); } : undefined}>{navigation.state === "submitting" ? "Guardando…" : children}</button>;
}

export function formatDate(value: string | null | undefined, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "—";
  return new Intl.DateTimeFormat("es-AR", includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
}

export function jsonSummary(value: unknown) {
  if (!value) return "—";
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join(", ") || "—";
  if (typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([key, item]) => `${key}: ${String(item)}`).join(" · ") || "—";
  return String(value);
}
