import type { MetaFunction } from "react-router";
import { data, useLocation } from "react-router";
import { isSpanishPath, StatusPage, statusDocumentMeta } from "../components/status-page";

export function loader() {
  return data(null, { status: 404 });
}

export const meta: MetaFunction = ({ location }) => statusDocumentMeta(location.pathname, true);

export default function NotFound() {
  const locale = isSpanishPath(useLocation().pathname) ? "es" : "en";
  return <StatusPage locale={locale} notFound />;
}
