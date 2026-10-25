import { buildPunaMd } from "../lib/llms";

export async function loader() {
  return new Response(buildPunaMd(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
