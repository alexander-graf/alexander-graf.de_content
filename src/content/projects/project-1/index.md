---
title: "VPS Infrastruktur"
summary: "Selbst betriebene Server-Infrastruktur mit WireGuard VPN, Traefik Reverse Proxy, Docker und automatisierten Deployments."
date: "2026-01-01"
tags:
- Linux
- Docker
- WireGuard
- Traefik
- n8n
draft: false
---

Eine vollständig selbst verwaltete Server-Infrastruktur auf Basis von Hetzner und Ionos VPS.

## Komponenten

- **WireGuard** als VPN-Mesh zwischen allen Standorten (VPS, Heimnetz via pfsense, Windows-PC)
- **Traefik** als Reverse Proxy mit automatischen Let's Encrypt Zertifikaten
- **Docker Compose** für alle Dienste
- **n8n** für Workflow-Automatisierung
- **Syncthing** für Datei-Synchronisation zwischen Geräten
- **Vaultwarden** als selbst gehosteter Passwort-Manager

## Besonderheiten

Der gesamte Traffic läuft verschlüsselt über WireGuard. Alle Dienste sind über HTTPS erreichbar, Zertifikate werden automatisch erneuert.
