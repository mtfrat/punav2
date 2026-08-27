import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  throw redirect(pathname.startsWith("/es/") ? "/es/servicios/software-a-medida" : "/services/custom-software", 301);
}

export default function LegacyIndustryRedirect() {
  return null;
}
