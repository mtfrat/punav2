import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

/** Old short path. vercel.json also 301s this before the app; this keeps one hop when the edge rule is not applied. */
export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  throw redirect(`/es/automatizaciones/automatizar-cobranzas${url.search}`, 301);
}

export default function LegacyCobranzasRedirect() {
  return null;
}
