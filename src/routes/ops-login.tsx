import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect } from "react-router";
import { ArrowRight, KeyRound, LockKeyhole } from "lucide-react";
import { ADMIN_EMAIL, assertTrustedMutation, createAdminAuthClient, operationsHeaders, opsData } from "../lib/admin.server";
import "../ops.css";

const attempts = new Map<string, { count: number; resetAt: number }>();
const genericMessage = "Si el email está autorizado, vas a recibir un enlace privado. Revisá también spam.";

function limited(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) { attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 }); return false; }
  current.count += 1;
  return current.count > 5;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createAdminAuthClient(request);
  const { data } = await supabase.auth.getUser();
  if (data.user?.email?.toLowerCase() === ADMIN_EMAIL) throw redirect("/ops", { headers: operationsHeaders(headers) });
  return opsData({ sent: new URL(request.url).searchParams.get("sent") === "1" }, headers);
}

export async function action({ request }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  if (limited(request)) return opsData({ sent: true, message: genericMessage }, undefined, 200);
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const { supabase, headers } = createAdminAuthClient(request);
  if (email === ADMIN_EMAIL) {
    const current = new URL(request.url);
    const productionOrigin = "https://www.puna-tech.com";
    const origin = current.hostname === "localhost" || current.hostname === "127.0.0.1" ? current.origin : productionOrigin;
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/ops/auth/callback`, shouldCreateUser: false } });
  }
  return opsData({ sent: true, message: genericMessage }, headers);
}

export const meta: MetaFunction = () => [{ title: "Private operations | Puna Tech" }, { name: "robots", content: "noindex, nofollow, noarchive" }];
export const headers = () => operationsHeaders();

export default function OpsLogin({ loaderData, actionData }: { loaderData: { sent: boolean }; actionData?: { sent?: boolean; message?: string } }) {
  const sent = actionData?.sent || loaderData.sent;
  return <main className="ops-login" id="ops-main"><section className="ops-login-panel"><div className="ops-login-mark"><LockKeyhole aria-hidden="true"/></div><p className="ops-eyebrow">Puna Operations</p><h1>Panel privado</h1><p>Revisá contenido, prospectos y ejecuciones sin exponer datos en la web pública.</p>{sent ? <div className="ops-notice ops-notice-success" role="status" aria-live="polite"><KeyRound aria-hidden="true"/> {actionData?.message || genericMessage}</div> : <Form method="post" className="ops-login-form"><label><span>Email autorizado</span><input type="email" name="email" autoComplete="email" required/></label><button className="ops-button" type="submit">Enviar magic link <ArrowRight aria-hidden="true" size={18}/></button></Form>}<small>Acceso sin contraseña · enlace temporal · sesión privada</small></section></main>;
}
