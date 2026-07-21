import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { searchExcerpt } from "@/lib/utils/textConverter";

// Statischer Suchindex für die globale Header-Suche. Wird einmal geladen,
// statt in jede Seite eingebettet zu werden. Ein neuer Blogbeitrag landet beim
// nächsten Build automatisch hier; die Datei wird mit no-cache ausgeliefert
// (siehe nginx.conf, location /), Besucher bekommen also nach jedem Deploy den
// aktuellen Stand.
const visible = (d: { id: string; data: { draft?: boolean } }) =>
  Boolean(d.id.match(/^(?!-)/)) && d.data.draft !== true;

export const GET: APIRoute = async () => {
  const allBlog = await getCollection("blog");
  const allPages = await getCollection("pages");

  const posts = allBlog.filter(visible).map((post) => ({
    id: post.id,
    title: post.data.title || "",
    description: post.data.description || "",
    tags: post.data.tags || [],
    body: searchExcerpt(post.body ?? ""),
    type: "blog",
    url: `/blog/${post.id}`,
  }));

  const pages = allPages.filter(visible).map((page) => ({
    id: page.id,
    title: page.data.title || "",
    description: page.data.description || "",
    tags: [],
    body: searchExcerpt(page.body ?? ""),
    type: "page",
    url: `/${page.id}`,
  }));

  return new Response(JSON.stringify({ posts, pages }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
