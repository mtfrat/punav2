import type { ReactNode } from "react";
import { Link } from "react-router";

/** Plain copy with internal markdown links: "[texto](/es/ruta)" becomes an SSR <Link>. Only same-site paths. */
export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\((\/(?!\/)[^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    const index = match.index;
    if (index > last) nodes.push(text.slice(last, index));
    nodes.push(<Link key={`${match[2]}-${index}`} to={match[2]}>{match[1]}</Link>);
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
