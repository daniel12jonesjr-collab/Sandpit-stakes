# Sandpit Stakes

Duell-Arena im Oldschool-Look fürs iPhone, mit Spielgeld. Spielbar als Web-App, offline und mit eigenem Icon.

**Spielen:** https://daniel12jonesjr-collab.github.io/sandpit-stakes/
Auf dem iPhone in Safari öffnen → **Teilen → Zum Home-Bildschirm**.

## Spielprinzip
- **Tribrid:** Nahkampf, Fernkampf oder Magie angreifen und das passende Schutzgebet wählen (40 % weniger Schaden). Waffe und Gebet des Gegners sind sichtbar, gute Gegner wechseln aber in letzter Sekunde.
- **Klassisch:** reine Dolch-Specials, pures Glück.
- **Ränge** von Bronze bis Drachen mit steigenden Einsätzen und schlaueren Gegnern. 3 Siege schalten den nächsten Rang frei.
- **Ausrüstung:** Waffen, Rüstung und Gebet in 6 Stufen verbessern.
- **Spielstand sichern:** unter *Verlauf* als Code kopieren und wieder laden.

Alle Grafiken sind selbst gezeichnet. Das Spiel ist ein Fan-Projekt und nicht mit Jagex verbunden.

## Dateien
| Datei | Zweck |
|---|---|
| `game.html` | Das Spiel (Quelle) |
| `build.py` | Baut daraus `index.html` für die installierbare App: `python3 build.py` |
| `index.html` | Installierbare App |
| `manifest.webmanifest`, `icon-*.png` | Name und Icon auf dem Home-Bildschirm |
| `sw.js` | Offline-Speicher |
| `version.json` | Versionsnummer. Bei jedem Update erhöhen, dann zeigt die App „Neue Version verfügbar“. |
