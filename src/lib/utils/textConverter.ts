import { slug } from "github-slugger";
import { marked } from "marked";

// slugify
export const slugify = (content: string) => {
  return slug(content);
};

// markdownify
export const markdownify = (content: string, div?: boolean) => {
  if (!content) return "";
  return div ? marked.parse(content) : marked.parseInline(content);
};

// humanize
export const humanize = (content: string) => {
  return content
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/[-\s]+/g, " ")
    .replace(/^[a-z]/, function (m) {
      return m.toUpperCase();
    });
};

// titleify
export const titleify = (content: string) => {
  const humanized = humanize(content);
  return humanized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Kurzer Klartext-Auszug für den clientseitigen Suchindex. Der volle
// Markdown-Body jedes Beitrags wurde bisher in die Such-Props JEDER Seite
// serialisiert (bei 41 Beiträgen ~161 KB) und bei jeder Client-Navigation neu
// hydratisiert — Hauptursache für die träge Navigation. Ein Auszug genügt für
// Titel-/Beschreibungs-/Anfangstext-Suche und schrumpft die Seite drastisch.
export const searchExcerpt = (content: string, max = 500) => {
  const text = plainify(content || "").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max) : text;
};

// plainify
export const plainify = (content: string) => {
  if (!content) return "";
  const parseMarkdown: any = marked.parse(content);
  const filterBrackets = parseMarkdown.replace(/<\/?[^>]+(>|$)/gm, "");
  const filterSpaces = filterBrackets.replace(/[\r\n]\s*[\r\n]/gm, "");
  const stripHTML = htmlEntityDecoder(filterSpaces);
  return stripHTML;
};

// strip entities for plainify
const htmlEntityDecoder = (htmlWithEntities: string) => {
  let entityList: { [key: string]: string } = {
    "&nbsp;": " ",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
  };
  let htmlWithoutEntities: string = htmlWithEntities.replace(
    /(&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    (entity: string): string => {
      return entityList[entity];
    },
  );
  return htmlWithoutEntities;
};
