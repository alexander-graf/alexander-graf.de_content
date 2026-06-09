---
title: "alexandergraf.de"
summary: "Diese Website — gebaut mit Astro, statisch generiert, automatisch deployed über GitHub Actions."
date: "2026-04-01"
tags:
- Astro
- TypeScript
- Tailwind
- GitHub Actions
draft: false
demoUrl: https://alexandergraf.de
repoUrl: https://github.com/alexander-graf/alexandergraf.de
---

Persönliche Website und Blog, gebaut mit dem Astro-Framework.

## Stack

- **Astro** als Static Site Generator
- **Tailwind CSS** für das Styling
- **Markdown / MDX** für Blog-Inhalte
- **GitHub Actions** für automatisches Deployment auf den VPS
- **Traefik** als Reverse Proxy mit HTTPS

## Deployment-Workflow

Jeder Push auf `main` löst eine GitHub Action aus, die die Seite baut und per SSH auf den VPS überträgt. Kein manuelles Eingreifen nötig.
