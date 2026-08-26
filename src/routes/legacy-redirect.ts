import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const target = url.pathname === "/en" ? "/" : url.pathname.replace(/^\/en(?=\/)/, "") || "/";
  return redirect(`${target}${url.search}`, 301);
}
