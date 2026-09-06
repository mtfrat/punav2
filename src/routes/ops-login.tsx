import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect } from "react-router";
import { ArrowRight, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { ADMIN_EMAIL, assertTrustedMutation, createAdminAuthClient, operationsHeaders, opsData } from "../lib/admin.server";
import "../ops.css";

const attempts = new Map<string, { count: number; resetAt: number }>();
const magicLinkMessage = "Si el email está autorizado, vas a recibir un enlace privado. Revisá también spam.";
const invalidCredentialsMessage = "El email o la contraseña no son correctos.";

type ActionData = {
  error?: string;
  sent?: boolean;
  message?: string;
};

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
  const form = await request.formData();
  const intent = String(form.get("intent") || "password");
  const email = String(form.get("email") || "").trim().toLowerCase();
  const { supabase, headers } = createAdminAuthClient(request);

  if (limited(request)) {
    return opsData({ error: "Demasiados intentos. Esperá 15 minutos antes de volver a probar." } satisfies ActionData, headers, 429);
  }

  if (intent === "password") {
    const password = String(form.get("password") || "");
    if (email !== ADMIN_EMAIL || !password) {
      return opsData({ error: invalidCredentialsMessage } satisfies ActionData, headers, 401);
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || data.user?.email?.trim().toLowerCase() !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      return opsData({ error: invalidCredentialsMessage } satisfies ActionData, headers, 401);
    }
    throw redirect("/ops", { headers: operationsHeaders(headers) });
  }

  if (intent !== "magic_link") {
    return opsData({ error: "Solicitud de acceso inválida." } satisfies ActionData, headers, 400);
  }

  if (email === ADMIN_EMAIL) {
    const current = new URL(request.url);
    const productionOrigin = "https://www.puna-tech.com";
    const origin = current.hostname === "localhost" || current.hostname === "127.0.0.1" ? current.origin : productionOrigin;
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/ops/auth/callback`, shouldCreateUser: false } });
  }
  return opsData({ sent: true, message: magicLinkMessage } satisfies ActionData, headers);
}

export const meta: MetaFunction = () => [{ title: "Private operations | Puna Tech" }, { name: "robots", content: "noindex, nofollow, noarchive" }];
export const headers = () => operationsHeaders();

export default function OpsLogin({ loaderData, actionData }: { loaderData: { sent: boolean }; actionData?: ActionData }) {
  const [linkError, setLinkError] = useState("");
  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (fragment.get("error_code") === "otp_expired" || fragment.get("error") === "access_denied") {
      setLinkError("Ese enlace ya venció o fue utilizado. Ingresá con tu contraseña o solicitá uno nuevo.");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);
  const sent = actionData?.sent || loaderData.sent;

  return <main className="ops-login" id="ops-main"><section className="ops-login-panel">
    <div className="ops-login-mark"><LockKeyhole aria-hidden="true"/></div>
    <p className="ops-eyebrow">Puna Operations</p>
    <h1>Panel privado</h1>
    <p>Ingresá con tu usuario administrador para revisar contenido, campañas y oportunidades.</p>
    {linkError ? <div className="ops-notice ops-notice-error" role="alert">{linkError}</div> : null}
    {actionData?.error ? <div className="ops-notice ops-notice-error" role="alert">{actionData.error}</div> : null}
    {sent ? <div className="ops-notice ops-notice-success" role="status" aria-live="polite"><KeyRound aria-hidden="true"/> {actionData?.message || magicLinkMessage}</div> : null}

    <Form method="post" className="ops-login-form">
      <input type="hidden" name="intent" value="password"/>
      <label><span>Email</span><input type="email" name="email" autoComplete="username" required/></label>
      <label><span>Contraseña</span><input type="password" name="password" autoComplete="current-password" required/></label>
      <button className="ops-button" type="submit">Ingresar <ArrowRight aria-hidden="true" size={18}/></button>
    </Form>

    <details className="ops-login-alternative">
      <summary><Mail aria-hidden="true" size={17}/>Ingresar con un enlace por email</summary>
      <Form method="post" className="ops-login-form">
        <input type="hidden" name="intent" value="magic_link"/>
        <label><span>Email autorizado</span><input type="email" name="email" autoComplete="email" required/></label>
        <button className="ops-button ops-button-secondary" type="submit">Enviar magic link</button>
      </Form>
    </details>
    <small>Sesión privada · cookies seguras · acceso exclusivo del administrador</small>
  </section></main>;
}
