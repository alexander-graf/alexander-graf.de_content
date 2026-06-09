import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Alexander Graf",
  DESCRIPTION: "Privater Blog und persönliche Vorstellung von Alexander Graf. Technische Artikel über Linux, Server, Netzwerke und mehr.",
  AUTHOR: "Alexander Graf",
}

// Work Page
export const WORK: Page = {
  TITLE: "Mein Weg",
  DESCRIPTION: "Meilensteine — wie aus Neugier meine Leidenschaft wurde.",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Technische Artikel über Linux, Server, Netzwerke, Infrastruktur und mehr.",
}

// Projects Page
export const PROJECTS: Page = {
  TITLE: "Projekte",
  DESCRIPTION: "Meine persönlichen Open-Source- und Freizeitprojekte.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Suche",
  DESCRIPTION: "Alle Beiträge und Projekte durchsuchen.",
}

// Links
export const LINKS: Links = [
  {
    TEXT: "Home",
    HREF: "/",
  },
  {
    TEXT: "Mein Weg",
    HREF: "/work",
  },
  {
    TEXT: "Blog",
    HREF: "/blog",
  },
  {
    TEXT: "Projekte",
    HREF: "/projects",
  },
  {
    TEXT: "Kontakt",
    HREF: "/kontakt",
  },
]

// Socials
export const SOCIALS: Socials = [
  {
    NAME: "Email",
    ICON: "email",
    TEXT: "info@alexander-graf.de",
    HREF: "mailto:info@alexander-graf.de",
  },
  {
    NAME: "Github",
    ICON: "github",
    TEXT: "alexander-graf",
    HREF: "https://github.com/alexander-graf",
  },
]

