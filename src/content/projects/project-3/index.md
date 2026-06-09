---
title: "Shopware 6 Plugin-Entwicklung"
summary: "Entwicklung und Deployment von Custom Plugins für Shopware 6 auf Produktions- und Entwicklungsumgebungen."
date: "2025-06-01"
tags:
- Shopware
- PHP
- Docker
- E-Commerce
draft: false
---

Entwicklung von Shopware 6 Plugins für Kundenprojekte, inkl. eigenem Deployment-Workflow über SSH und Docker.

## Workflow

1. Plugin-Entwicklung in lokaler dockware-Umgebung
2. Automatisierter Transfer auf Produktionsserver via `docker cp` + `scp`
3. Plugin-Installation und Cache-Clearing per Remote-Befehl
4. Parallele Dev- und Prod-Umgebung auf `prod-bso-01`

## Infrastruktur

Beide Shopware-Instanzen (Prod + Dev) laufen in separaten Docker-Containern auf demselben Server, getrennt durch eigene PHP-Container und Datenbanken.
