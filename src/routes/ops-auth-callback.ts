import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import type { EmailOtpType } from "@supabase/supabase-js";
import { ADMIN_EMAIL, createAdminAuthClient, operationsHeaders } from "../lib/admin.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const { supabase, headers } = createAdminAuthClient(request);
  if (code) await supabase.auth.exchangeCodeForSession(code);
  else if (tokenHash && type) await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  const { data } = await supabase.auth.getUser();
  if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    await supabase.auth.signOut();
    throw redirect("/ops/login", { headers: operationsHeaders(headers) });
  }
  throw redirect("/ops", { headers: operationsHeaders(headers) });
}

export const headers = () => operationsHeaders();
