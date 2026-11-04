# Sandpit Grind (PvM)

Pixel-Rollenspiel fürs iPhone: an Spots von **Chicken bis Nex** kämpfen, Skills bis 99 leveln, Gold und Drops sammeln, Ausrüstung von **Bronze bis Torva** freispielen.

**Spielen:** https://daniel12jonesjr-collab.github.io/Sandpit-stakes/pvm/ → in Safari **Teilen → Zum Home-Bildschirm**

## Inhalt
- Skills: Angriff, Stärke, Verteidigung, Fernkampf, Magie, Gebet, Lebenspunkte (45-fache XP)
- 13 Gegner, Bosse wechseln ihren Angriffsstil (Ziel-Box zeigt den nächsten Angriff)
- Gebete: Schutzgebete, Piety, Rigour, Augury u. a., Prayer potions, Knochen vergraben
- 10 Ausrüstungsstufen je Waffe/Rüstung, Shop bis Dragon, Barrows/Bandos/Torva nur als Boss-Drop
- Inventar (28), Bank, Auto-Essen, Spielstand-Code

## Grafik und Lizenzen
Figuren aus dem **Liberated Pixel Cup (LPC)** über den Universal LPC Spritesheet Character Generator
(https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator), Lizenzen CC-BY-SA 3.0 / GPL 3.0 / OGA-BY.
Alle Autorinnen und Autoren: `sprites/CREDITS.csv`. Umgefärbt und zusammengesetzt mit `tools/build_sprites.py`.

Inoffizielles Fan-Projekt für den privaten Gebrauch, nicht mit Jagex verbunden. Item- und Monsternamen wie im Original, keine Jagex-Grafiken.

## Bauen
```
python3 tools/build_sprites.py <pfad-zum-lpc-repo>   # Grafiken neu erzeugen (optional)
python3 build.py                                      # index.html aus game.src.html + engine.js
```
