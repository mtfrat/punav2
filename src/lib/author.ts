// Blog signature policy (Martin, 2026-11-02): the blog is signed "Martin", never with the surname.
// Applied when a post row is mapped, so the byline, meta tags, JSON-LD and the serialized loader data all agree,
// whatever is stored in posts.author_name / posts.reviewer_name.
export const DEFAULT_AUTHOR = "Puna Tech Engineering";

export function publicPersonName(name: string | null | undefined): string | null {
  if (typeof name !== "string") return null;
  const cleaned = name.replace(/\s*\bFraticelli\b/gi, "").replace(/\s{2,}/g, " ").trim();
  return cleaned || null;
}

/** Article.author for JSON-LD: a Person for a named author, the Organization for the studio byline. */
export function articleAuthorSchema(name: string | null | undefined) {
  const author = publicPersonName(name) || DEFAULT_AUTHOR;
  return author === DEFAULT_AUTHOR ? { "@type": "Organization", name: author } : { "@type": "Person", name: author };
}
