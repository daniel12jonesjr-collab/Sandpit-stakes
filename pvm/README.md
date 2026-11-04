# Sandpit Grind (PvM)

Pixel-Rollenspiel fürs iPhone: an Spots von **Chicken bis Nex** kämpfen, Skills bis 99 leveln, Gold und Drops sammeln, Ausrüstung von **Bronze bis Torva** freispielen.

**Spielen:** https://daniel12jonesjr-collab.github.io/Sandpit-stakes/pvm/ → in Safari **Teilen → Zum Home-Bildschirm**

## Inhalt
- Skills: Angriff, Stärke, Verteidigung, Fernkampf, Magie, Gebet, Lebenspunkte (45-fache XP)
- 13 Gegner, Bosse wechseln ihren Angriffsstil (Ziel-Box zeigt den nächsten Angriff)
- Gebete: Schutzgebete, Piety, Rigour, Augury u. a., Prayer potions, Knochen vergraben
- 10 Ausrüstungsstufen je Waffe/Rüstung, Shop bis Dragon, Barrows/Bandos/Torva nur als Boss-Drop
- Inventar (28), Bank, Auto-Essen, Spielstand-Code
- **Member-Items:** Amulett-, Ring-, Umhang-, Stiefel- und Handschuh-Slot (Glory, Fury, Torture, Anguish, Occult, Berserker/Archers/Seers/Ultor ring, Fire/Infernal cape, Dragon/Primordial/Eternal/Ranger boots, Barrows/Ferocious gloves)
- **Fernkampf- und Magie-Rüstung:** d'hide (Green bis Black), Karil's, Armadyl, Masori; Wizard, Mystic, Infinity, Ahrim's, Ancestral
- **Defensive Stile:** Weitschuss (Fernkampf + Verteidigung), Defensiv zaubern (Magie + Verteidigung)
- **Slayer-Gegner mit Uniques:** Gargoyle (Granite maul), Abyssal demon (Abyssal whip), Dark beast (Dark bow), King Black Dragon (Draconic visage)
- **Loot:** sichtbar auf dem Boden mit Wertfarben, Runen/Kräuter/Samen/Edelsteine/Barren stapeln in der Bank, Clue scrolls mit Belohnungskisten, Loot-Tracker
- **High Alchemy** aus Inventar und Bank (Magie 55, Nature rune)

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
