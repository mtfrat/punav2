import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import type * as React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useRouteLoaderData,
} from "react-router";
import { Analytics } from "./components/marketing";
import plusJakartaLatin from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2";
import "./index.css";

export const links: LinksFunction = () => [
  { rel: "preload", href: plusJakartaLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
  { rel: "manifest", href: "/site.webmanifest" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  return { locale: pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en" };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const locale = data?.locale === "es" ? "es" : "en";
  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FBF7F0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <><Analytics /><Outlet /></>;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="error-page" id="main-content">
      <p className="eyebrow">{notFound ? "404" : "Error"}</p>
      <h1>{notFound ? "This page could not be found." : "Something went wrong."}</h1>
      <p>{notFound ? "The URL may have changed. Return to the homepage to continue." : "Please retry or return to the homepage."}</p>
      <a className="button-primary" href="/">Return home <span aria-hidden="true">→</span></a>
    </main>
  );
}
