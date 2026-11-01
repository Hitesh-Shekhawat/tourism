/**
 * Journal articles. Optional (§5.I): while this list is empty, the journal routes 404 and
 * the nav link and homepage teaser are hidden. Add articles as objects here; `body` paragraphs
 * starting with "## " render as subheadings.
 */
export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO yyyy-mm-dd
  author: string;
  body: string[];
};

export const journal: Article[] = [];

export const getArticle = (slug: string) => journal.find((a) => a.slug === slug);
