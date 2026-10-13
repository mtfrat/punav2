import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { PassThrough, Transform } from "node:stream";
import plusJakartaHref from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2";
import type { AppLoadContext, EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";

export const streamTimeout = 5_000;

// Inlined so the LCP face is not a second network hop after the stylesheet.
const unicodeRange = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const face = (src: string) =>
  `<style id="lcp-font">@font-face{font-family:"Plus Jakarta Sans Variable";font-style:normal;font-display:optional;font-weight:200 800;src:url("${src}") format("woff2-variations");unicode-range:${unicodeRange}}</style>`;
const linkedFace = `<link rel="preload" href="${plusJakartaHref}" as="font" type="font/woff2" crossorigin="anonymous"/>${face(plusJakartaHref)}`;

// Home HTML is prerendered where this file exists. The same read runs again
// when the server module loads on Vercel, and file tracing does not ship the
// woff2 into the function. A missing file must not crash sitemap or blog.
function inlinedFace() {
  try {
    const require = createRequire(import.meta.url);
    const plusJakartaPath = require.resolve(
      "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2",
    );
    return face(`data:font/woff2;base64,${readFileSync(plusJakartaPath).toString("base64")}`);
  } catch {
    return null;
  }
}

const homeFace = inlinedFace();

function fontMarkup(requestUrl: string) {
  const path = new URL(requestUrl).pathname.replace(/\/$/, "") || "/";
  // Home inlines the LCP face. Other routes keep a preloaded file so their HTML stays small.
  return (path === "/" || path === "/es") && homeFace ? homeFace : linkedFace;
}

function embedLcpFont(markup: string) {
  let done = false;
  return new Transform({
    transform(chunk, _encoding, callback) {
      if (done) {
        callback(null, chunk);
        return;
      }
      const text = chunk.toString();
      const marker = "<head>";
      const index = text.indexOf(marker);
      if (index === -1) {
        callback(null, chunk);
        return;
      }
      done = true;
      callback(null, text.slice(0, index + marker.length) + markup + text.slice(index + marker.length));
    },
  });
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  }

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");
    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(() => abort(), streamTimeout + 1000);

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });
          const stream = createReadableStreamFromReadable(body.pipe(embedLcpFont(fontMarkup(request.url))));
          responseHeaders.set("Content-Type", "text/html");
          resolve(new Response(stream, { headers: responseHeaders, status: responseStatusCode }));
          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) console.error(error);
        },
      },
    );
  });
}
