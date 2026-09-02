import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Outlet, redirect } from "react-router";
import { OpsShell } from "../components/ops";
import { assertTrustedMutation, createAdminAuthClient, operationsHeaders, opsData, requireAdmin } from "../lib/admin.server";
import { contentComposerEnabled, contentStudioEnabled } from "../lib/content-worker.server";
import "../ops.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  return opsData({ email: context.email, contentStudioEnabled: contentStudioEnabled(), contentComposerEnabled: contentComposerEnabled() }, context.headers);
}

export async function action({ request }: ActionFunctionArgs) {
  assertTrustedMutation(request);
  const context = await requireAdmin(request);
  const form = await request.formData();
  if (form.get("intent") !== "logout") return opsData({ ok: false }, context.headers, 400);
  const { supabase, headers } = createAdminAuthClient(request);
  await supabase.auth.signOut();
  for (const [key, value] of headers.entries()) context.headers.append(key, value);
  throw redirect("/ops/login", { headers: operationsHeaders(context.headers) });
}

export const meta: MetaFunction = () => [{ title: "Puna Operations" }, { name: "robots", content: "noindex, nofollow, noarchive" }];
export const headers = () => operationsHeaders();

export default function OperationsLayout({ loaderData }: { loaderData: { email: string; contentStudioEnabled: boolean; contentComposerEnabled: boolean } }) {
  return <OpsShell email={loaderData.email} contentStudioEnabled={loaderData.contentStudioEnabled} contentComposerEnabled={loaderData.contentComposerEnabled}><Outlet/></OpsShell>;
}
