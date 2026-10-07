import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { data } from "react-router";
import type { Locale } from "../content/site";
import { RouteErrorPage } from "../components/not-found-page";
import { localeFromPathname, notFoundDocumentMeta } from "../lib/not-found";

export function loader({ request }: LoaderFunctionArgs) {
  const locale = localeFromPathname(new URL(request.url).pathname);
  return data({ locale }, { status: 404 });
}

export const meta: MetaFunction<typeof loader> = ({ data: loaderData, location }) => {
  const locale = loaderData?.locale ?? localeFromPathname(location.pathname);
  return notFoundDocumentMeta(locale);
};

export default function NotFound({ loaderData }: { loaderData: { locale: Locale } }) {
  return <RouteErrorPage locale={loaderData.locale} notFound />;
}
