"""Erzeugt die Spielgrafiken aus dem LPC-Generator-Repository.

    python3 build_sprites.py <pfad-zum-lpc-repo>

Quelle: https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator
Die Grafiken stehen unter CC-BY-SA / GPL / OGA-BY (siehe sprites/CREDITS.csv).

Ausgabe je Grafik: ein Atlas mit 128x128-Zellen, 13 Spalten, 6 Zeilen:
  0 Zauber, 1 Stoss, 2 Gehen (Bild 0 = Stehen), 3 Schlag, 4 Schuss, 5 Treffer
Spieler-Teile schauen nach rechts, Monster nach links.
"""
import csv, io, json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageOps

REPO = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / "sprites"
OUT.mkdir(exist_ok=True)
FILES = set(subprocess.run(["git", "-C", str(REPO), "ls-tree", "-r", "--name-only", "HEAD"], capture_output=True, text=True).stdout.split("\n"))
USED = []

def load(path):
    data = subprocess.run(["git", "-C", str(REPO), "show", "HEAD:" + path], capture_output=True).stdout
    USED.append(path)
    return Image.open(io.BytesIO(data)).convert("RGBA")

def first(*cands):
    for c in cands:
        if c in FILES: return c
    raise SystemExit("Nicht gefunden: " + " | ".join(cands))

def colorize(img, dark, mid, light):
    """Graustufen-Metall in eine Farbe umfaerben, Transparenz bleibt."""
    a = img.getchannel("A")
    g = ImageOps.autocontrast(img.convert("L"), cutoff=1)
    c = ImageOps.colorize(g, black=dark, mid=mid, white=light).convert("RGBA")
    c.putalpha(a)
    return c

# Reihen im LPC-Universal-Blatt (Richtung: 0 hoch, 1 links, 2 runter, 3 rechts)
ROWS = {"R": [3, 7, 11, 15, 19, 20], "L": [1, 5, 9, 13, 17, 20]}
FR = [7, 8, 9, 6, 13, 6]

def universal_to_atlas(img, side):
    atlas = Image.new("RGBA", (13 * 128, 6 * 128))
    for r, src in enumerate(ROWS[side]):
        for c in range(FR[r]):
            cell = img.crop((c * 64, src * 64, c * 64 + 64, src * 64 + 64))
            atlas.alpha_composite(cell, (c * 128 + 32, r * 128 + 32))
    return atlas

def oversize_into(atlas, img, row, side):
    """128px-Blaetter (Schlag/Gehen) mit 4 Richtungsreihen in eine Atlas-Zeile kopieren."""
    d = 3 if side == "R" else 1
    for c in range(min(13, img.width // 128)):
        atlas.alpha_composite(img.crop((c * 128, d * 128, c * 128 + 128, d * 128 + 128)), (c * 128, row * 128))

def merge(a, b):
    """Zwei Blaetter unterschiedlicher Groesse oben links buendig uebereinanderlegen."""
    if a is None: return b
    w, h = max(a.width, b.width), max(a.height, b.height)
    out = Image.new("RGBA", (w, h)); out.alpha_composite(a); out.alpha_composite(b)
    return out

def stack(paths, tint=None):
    base = None
    for p in paths:
        im = load(p)
        if tint: im = colorize(im, *tint)
        base = merge(base, im)
    return base

def save(name, atlas):
    atlas.save(OUT / (name + ".png"), optimize=True)

# ---------------- Farben der Stufen (dunkel, mittel, hell)
TIERS = [
    ("#3a2210", "#a8682c", "#f2c08a"), ("#1e1f22", "#7c7f86", "#d8dbe0"), ("#2a2e33", "#9aa3ab", "#f2f5f8"),
    ("#10183a", "#4a62b0", "#b8c8ff"), ("#0e2414", "#3f8a52", "#b8f0c4"), ("#0a2a30", "#2fa0b8", "#b8f6ff"),
    ("#3a0806", "#b8301e", "#ffb0a0"), ("#16150f", "#5e5a4e", "#c8c2b0"), ("#2a1a08", "#8a6a30", "#f2d890"),
    ("#1a0606", "#6a2424", "#d89a7a"),
]
P = "spritesheets/"
torso_b = first(P + "torso/armour/plate/male/base.png", P + "torso/armour/plate/male/steel.png")
arms_b = first(P + "arms/armour/plate/male/base.png", P + "arms/armour/plate/male/steel.png", P + "arms/armour/plate/male/iron.png")
legs_b = first(P + "legs/armour/plate/male/base.png", P + "legs/armour/plate/male/steel.png")
feet_b = first(P + "feet/armour/plate/male/base.png", P + "feet/armour/plate/male/steel.png", P + "feet/armour/plate/male/iron.png")
HELM = {0: "greathelm", 1: "greathelm", 2: "greathelm", 3: "greathelm", 4: "greathelm", 5: "greathelm", 6: "close", 7: "barbuta", 8: "spangenhelm", 9: "horned"}
def helm_path(kind):
    return first(P + f"hat/helmet/{kind}/male/base.png", P + f"hat/helmet/{kind}/adult/base.png", P + f"hat/helmet/{kind}/male/steel.png", P + f"hat/helmet/{kind}/adult.png", P + f"hat/helmet/{kind}/male.png")
shield_p = first(P + "shield/kite/male/kite_gray_gray.png", P + "shield/kite/male/kite_gray.png")

manifest = {"cell": 128, "cols": 13, "frames": FR, "player": {}, "monsters": {}}

# ---------------- Spieler-Grundkoerper und Kleidung
save("p_body", universal_to_atlas(stack([P + "body/bodies/male/light.png", P + "head/heads/human/male/light.png"]), "R"))
hair = [p for p in FILES if p.startswith(P + "hair/") and p.endswith("/adult/dark_brown.png")]
hair = sorted(hair, key=len)[:1] or [p for p in FILES if p.startswith(P + "hair/plain/") and p.endswith(".png")][:1]
if hair: save("p_hair", universal_to_atlas(load(hair[0]), "R"))
save("p_pants", universal_to_atlas(load(first(P + "legs/pants/male/brown.png")), "R"))
shirt = [p for p in FILES if p.startswith(P + "torso/clothes/longsleeve/") and "/male/" in p and p.endswith("/blue.png")][:1] \
     or [p for p in FILES if p.startswith(P + "torso/clothes/") and "/male/" in p and p.endswith(".png")][:1]
if shirt: save("p_shirt", universal_to_atlas(load(shirt[0]), "R"))

for t, tint in enumerate(TIERS):
    save(f"p_body{t}", universal_to_atlas(stack([arms_b, torso_b], tint), "R"))
    save(f"p_legs{t}", universal_to_atlas(stack([legs_b, feet_b], tint), "R"))
    save(f"p_helm{t}", universal_to_atlas(stack([helm_path(HELM[t])], tint), "R"))
    save(f"p_shield{t}", universal_to_atlas(stack([shield_p], tint), "R"))

# ---------------- Waffen des Spielers (rechts)
def weapon_atlas(name, universal=None, slash=None, walk=None, tint=None, behind=None):
    atlas = Image.new("RGBA", (13 * 128, 6 * 128))
    if behind: atlas.alpha_composite(universal_to_atlas(stack([behind], tint), "R"))
    if universal: atlas.alpha_composite(universal_to_atlas(stack([universal], tint), "R"))
    if slash:
        clear = Image.new("RGBA", (13 * 128, 128)); atlas.paste(clear, (0, 3 * 128))
        oversize_into(atlas, stack([slash], tint), 3, "R")
    if walk:
        clear = Image.new("RGBA", (13 * 128, 128)); atlas.paste(clear, (0, 2 * 128))
        oversize_into(atlas, stack([walk], tint), 2, "R")
    elif slash and not universal:
        pass
    if slash and (universal is None or name in ("w_melee8", "w_melee9")):
        # Grosse Waffen: im Stand das erste Schlagbild zeigen, Universal-Bild verwerfen
        w = stack([slash], tint)
        for row in (0, 1, 2, 4, 5):
            atlas.paste(Image.new("RGBA", (13 * 128, 128)), (0, row * 128))
        for c in range(13):
            atlas.alpha_composite(w.crop((0, 3 * 128, 128, 4 * 128)), (c * 128, 2 * 128))
    save(name, atlas)

sci_s = first(P + "weapon/sword/scimitar/slash/scimitar.png"); sci_w = first(P + "weapon/sword/scimitar/walk/scimitar.png")
for t in range(7): weapon_atlas(f"w_melee{t}", slash=sci_s, walk=sci_w, tint=TIERS[t] if t != 1 else None)
flail = [p for p in FILES if p.startswith(P + "weapon/blunt/flail/") and p.endswith(".png")]
weapon_atlas("w_melee7", slash=sci_s, walk=sci_w, tint=("#120612", "#4a1a4a", "#c08ac0"))   # Abyssal whip (dunkle Klinge)
ls = first(P + "weapon/sword/longsword/attack_slash/longsword.png"); lsu = first(P + "weapon/sword/longsword/longsword.png")
weapon_atlas("w_melee8", slash=ls, tint=("#2a2e33", "#c8ccd2", "#ffffff"))
sc = first(P + "weapon/polearm/scythe/attack_slash/scythe.png"); scu = first(P + "weapon/polearm/scythe/scythe.png")
weapon_atlas("w_melee9", slash=sc, tint=("#200404", "#8a1a1a", "#ff8a7a"))
bow_fg = first(P + "weapon/ranged/bow/normal/universal/foreground/medium.png"); bow_bg = first(P + "weapon/ranged/bow/normal/universal/background/medium.png")
BOWT = [("#2a1a0a", "#8a6234", "#e0b878"), ("#2a1a0a", "#9a7040", "#e8c890"), ("#2a1a0a", "#a58a4a", "#f0dca0"),
        ("#2a120a", "#8a5a2a", "#e0a870"), ("#1a1006", "#6a4a20", "#c89a5a"), ("#0a1a2a", "#3a5a8a", "#a8c8f0")]
for t in range(6): weapon_atlas(f"w_range{t}", universal=bow_fg, behind=bow_bg, tint=BOWT[t])
xb = first(P + "weapon/ranged/crossbow/foreground/crossbow.png", P + "weapon/ranged/crossbow/crossbow.png")
xbb = P + "weapon/ranged/crossbow/background/crossbow.png" if P + "weapon/ranged/crossbow/background/crossbow.png" in FILES else None
for t, tint in zip(range(6, 10), [TIERS[6], TIERS[7], ("#2a2a2a", "#c8c8c0", "#ffffff"), ("#050505", "#2a2a2a", "#8a8a8a")]):
    weapon_atlas(f"w_range{t}", universal=xb, behind=xbb, tint=tint)
st_fg = first(P + "weapon/magic/simple/foreground/simple.png"); st_bg = first(P + "weapon/magic/simple/background/simple.png")
STAFF = ["#e8f4ff", "#3a7aff", "#6aa04a", "#ff6a1a", "#d8a040", "#ff8a2a", "#9a5aff", "#7aff9a", "#4ad8ff", "#c060ff"]
for t in range(10):
    c = STAFF[t]
    weapon_atlas(f"w_mage{t}", universal=st_fg, behind=st_bg, tint=("#1a1208", "#6b4a26" if t < 7 else "#3a3a3a", c))

# ---------------- Monster (fertig zusammengesetzt, schauen nach links)
def mon(name, layers, tints=None, slash=None, walk=None, wtint=None):
    tints = tints or {}
    img = None
    for i, p in enumerate(layers):
        im = load(p)
        if i in tints: im = colorize(im, *tints[i])
        img = merge(img, im)
    atlas = universal_to_atlas(img, "L")
    if slash:
        w = stack([slash], wtint)
        oversize_into(atlas, w, 3, "L")
        for c in range(6):   # Waffe auch beim Stehen/Gehen zeigen (erstes Schlagbild)
            atlas.alpha_composite(w.crop((0, 128, 128, 256)), (c * 128, 2 * 128)) if c == 0 else None
    save("m_" + name, atlas)

B = P + "body/bodies/"; H = P + "head/heads/"
pants = lambda c: first(P + f"legs/pants/male/{c}.png", P + "legs/pants/male/brown.png")
club_s = first(P + "weapon/blunt/mace/attack_slash/mace.png")
axe_s = first(P + "weapon/blunt/waraxe/attack_slash/waraxe.png")
mon("rat", [B + "male/fur_brown.png", first(H + "rat/adult.png"), pants("brown")])
mon("goblin", [B + "male/bright_green.png", first(H + "goblin/adult.png"), pants("brown")], slash=sci_s, wtint=TIERS[1])
mon("wolf", [B + "male/fur_white.png", first(H + "wolf/male.png", H + "wolf/female.png"), first(P + "legs/fur/male/white.png", pants("charcoal")) if any(p.startswith(P + "legs/fur/") for p in FILES) else pants("charcoal")])
mon("hillgiant", [B + "muscular/taupe.png", first(H + "human/male/taupe.png"), pants("brown")], slash=club_s, wtint=("#2a1a0a", "#7a5a3a", "#c8a070"))
mon("troll", [B + "muscular/blue.png", first(H + "troll/adult.png"), pants("charcoal")], tints={0: ("#0a1a2a", "#7aa0c0", "#e8f6ff"), 1: ("#0a1a2a", "#7aa0c0", "#e8f6ff")}, slash=club_s, wtint=("#101820", "#6a7a8a", "#c8d8e8"))
mon("firegiant", [B + "muscular/amber.png", first(H + "human/male/amber.png"), pants("black")], tints={0: ("#3a0800", "#d0602f", "#ffd080"), 1: ("#3a0800", "#d0602f", "#ffd080")}, slash=club_s, wtint=("#200800", "#8a3a10", "#ffb060"))
mon("hellhound", [B + "male/fur_black.png", first(H + "wolf/male.png", H + "wolf/female.png")], tints={0: ("#000000", "#3a1612", "#a83020"), 1: ("#000000", "#3a1612", "#c84030")})
mon("demon", [B + "muscular/black.png", first(H + "minotaur/male.png"), pants("black")], tints={0: ("#200000", "#9b2020", "#ff8060"), 1: ("#200000", "#9b2020", "#ff8060")}, slash=axe_s, wtint=("#100808", "#4a3030", "#a08080"))
mon("dragon", [B + "muscular/black.png", first(H + "lizard/male.png")], tints={0: ("#000000", "#2d2d33", "#8a8a9a"), 1: ("#000000", "#2d2d33", "#9a9aaa")}, slash=sci_s, wtint=("#000000", "#3a3a40", "#9a9aa8"))
mon("dharok", [B + "male/zombie.png", first(H + "human/male/zombie.png"), legs_b, feet_b, arms_b, torso_b, helm_path("barbuta")],
    tints={2: TIERS[7], 3: TIERS[7], 4: TIERS[7], 5: TIERS[7], 6: TIERS[7]}, slash=axe_s, wtint=("#101010", "#5a5a5a", "#c0c0c0"))
mon("graardor", [B + "muscular/dark_green.png", first(H + "orc/male.png"), legs_b, torso_b], tints={2: TIERS[8], 3: TIERS[8]}, slash=club_s, wtint=("#100800", "#5a4a30", "#d8b25a"))
mon("nex", [B + "male/lavender.png", first(H + "human/male/lavender.png"), legs_b, torso_b, helm_path("horned")],
    tints={0: ("#100018", "#7a5aa0", "#e0c8ff"), 1: ("#100018", "#7a5aa0", "#e0c8ff"), 2: ("#0a0010", "#3a2a5a", "#a08ad0"), 3: ("#0a0010", "#3a2a5a", "#a08ad0"), 4: ("#0a0010", "#3a2a5a", "#c0a8f0")})

# ---------------- Member-Ruestung, Umhaenge, Stiefel, Handschuhe, neue Waffen und Monster
def find(prefix, *prefer):
    cands = sorted(p for p in FILES if p.startswith(prefix) and p.endswith(".png"))
    for want in prefer:
        for c in cands:
            if c.endswith("/" + want + ".png"): return c
    if not cands: raise SystemExit("Nicht gefunden: " + prefix)
    return cands[0]
def shade(hexcol, f):
    h = hexcol.lstrip("#"); r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(v * f))) for v in (r, g, b))
def tri(col): return (shade(col, .25), col, shade(col, 1.9))

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import json as _j, re as _re
eng = (Path(__file__).resolve().parent.parent / "engine.js").read_text()
sets = _re.findall(r'\["(\w+)", "([^"]+)", "(helm|body|legs|hands)", \["(range|mage)", \d+\][^\]]*?"(#[0-9a-f]{6})"', eng)
LEATHER = find(P + "torso/armour/leather/male/", "brown", "leather")
SLEEVE = find(P + "torso/clothes/longsleeve/", "white", "gray", "blue")
HOSE = find(P + "legs/hose/male/", "brown", "gray")
PANTA = find(P + "legs/pantaloons/male/", "white", "gray", "blue")
HOOD = find(P + "hat/cloth/hood/adult/", "gray", "brown")
WIZ = find(P + "hat/magic/wizard/base/adult/", "base_gray", "gray", "blue")
BRACER = find(P + "arms/bracers/male/", "steel", "iron", "bronze")
BOOTS = find(P + "feet/boots/male/", "brown", "black") if any(f.startswith(P + "feet/boots/male/") for f in FILES) else find(P + "feet/boots/", "brown")
CAPE_F = find(P + "cape/solid/male/", "gray", "black"); CAPE_B = find(P + "cape/solid_behind/", "gray", "black")
for sid, name, slot, style, col in sets:
    t = tri(col)
    if slot == "body":
        if sid.startswith(("armadyl", "masori")): layers, tints = [arms_b, torso_b], [t, t]
        elif style == "range": layers, tints = [SLEEVE, LEATHER], [tri(shade(col, .7)), t]
        else: layers, tints = [SLEEVE], [t]
    elif slot == "legs":
        if sid.startswith(("armadyl", "masori")): layers, tints = [legs_b, feet_b], [t, t]
        elif style == "range": layers, tints = [HOSE], [t]
        else: layers, tints = [PANTA], [t]
    elif slot == "helm":
        if sid.startswith("armadyl"): layers, tints = [helm_path("armet")], [t]
        elif sid.startswith("masori"): layers, tints = [helm_path("close")], [t]
        elif sid in ("coif", "karils_coif", "ahrims_hood"): layers, tints = [HOOD], [t]
        else: layers, tints = [WIZ], [t]
    else:
        layers, tints = [BRACER], [t]
    img = None
    for lp, tt in zip(layers, tints): img = merge(img, colorize(load(lp), *tt))
    save("p_" + sid, universal_to_atlas(img, "R"))
# Handschuhe, Stiefel, Umhaenge aus den Zubehoer-Items
acc = _re.findall(r'(\w+): U\(\{ name: "([^"]+)", slot: "(feet|hands|cape)".*?col: "(#[0-9a-f]{6})"', eng)
for sid, name, slot, col in acc:
    t = tri(col)
    if slot == "hands": save("p_" + sid, universal_to_atlas(colorize(load(BRACER), *t), "R"))
    elif slot == "feet": save("p_" + sid, universal_to_atlas(colorize(load(BOOTS), *t), "R"))
    else:
        save("p_capeF_" + sid, universal_to_atlas(colorize(load(CAPE_F), *t), "R"))
        save("p_capeB_" + sid, universal_to_atlas(colorize(load(CAPE_B), *t), "R"))
# Einzigartige Waffen
weapon_atlas("w_whip", slash=sci_s, walk=sci_w, tint=("#120612", "#4a1a4a", "#c08ac0"))
weapon_atlas("w_maul", slash=club_s, tint=("#101010", "#6a6a6a", "#d0d0d0"))
weapon_atlas("w_darkbow", universal=bow_fg, behind=bow_bg, tint=("#050008", "#2a1a3a", "#9a7ac8"))
# Stufe 7 Nahkampf ist jetzt Dharok's greataxe
weapon_atlas("w_melee7", slash=axe_s, tint=("#101010", "#5a5a5a", "#c0c0c0"))
# Neue Monster
mon("gargoyle", [B + "muscular/black.png", first(H + "troll/adult.png"), pants("charcoal")], tints={0: ("#101010", "#6a6a64", "#c8c8c0"), 1: ("#101010", "#6a6a64", "#d8d8d0"), 2: ("#000000", "#3a3a38", "#8a8a88")})
mon("abyssal", [B + "muscular/black.png", first(H + "minotaur/male.png")], tints={0: ("#100010", "#6a1a5a", "#e080c8"), 1: ("#100010", "#8a2a6a", "#ff9ae0")})
boar = first(H + "boarman/male.png", H + "boarman/adult.png") if any(f.startswith(H + "boarman/") for f in FILES) else first(H + "minotaur/male.png")
mon("darkbeast", [B + "muscular/black.png", boar, pants("black")], tints={0: ("#000000", "#2a2a2a", "#6a6a6a"), 1: ("#000000", "#2a2a2a", "#7a7a7a")}, slash=club_s, wtint=("#000000", "#3a2a2a", "#8a6a6a"))
mon("kbd", [B + "muscular/black.png", first(H + "lizard/male.png"), helm_path("horned")], tints={0: ("#000000", "#1a1a1e", "#5a5a6a"), 1: ("#000000", "#22222a", "#6a6a7a"), 2: ("#000000", "#3a3a3a", "#c8c0b0")}, slash=sci_s, wtint=("#000000", "#2a2a30", "#8a8a9a"))

# Zwischen-Bosse und Raid-Bosse (Version 10)
mon("smokedevil", [B + "muscular/black.png", first(H + "alien/adult.png")], tints={0: ("#101010", "#5a5a58", "#b8b8b0"), 1: ("#101010", "#6a6a66", "#d0d0c8")})
mon("kraken", [B + "muscular/black.png", first(H + "alien/adult.png"), pants("charcoal")], tints={0: ("#001018", "#1a6a7a", "#7ae0e8"), 1: ("#001018", "#2a7a8a", "#9af0f8")})
mon("zulrah", [B + "muscular/black.png", first(H + "lizard/male.png")], tints={0: ("#001008", "#2a8a4a", "#a0f0a0"), 1: ("#001008", "#3a9a5a", "#b8ffb0")})
mon("duke", [B + "muscular/black.png", first(H + "wartotaur/adult.png"), helm_path("horned")], tints={0: ("#000810", "#2a3a5a", "#8aa0d0"), 1: ("#000810", "#34466a", "#9ab0e0"), 2: ("#000000", "#3a3a4a", "#c8c8e0")}, slash=club_s, wtint=("#000010", "#2a3a5a", "#8aa0d0"))
mon("corp", [B + "muscular/black.png", first(H + "wartotaur/adult.png")], tints={0: ("#101808", "#8a9a6a", "#f0f8d8"), 1: ("#101808", "#9aaa7a", "#ffffe8")})
mon("nightmare", [B + "male/black.png", first(H + "vampire/adult.png"), legs_b, torso_b], tints={0: ("#08000c", "#3a1a4a", "#a070c0"), 1: ("#08000c", "#4a2a5a", "#b890d8"), 2: ("#000000", "#2a1a30", "#6a4a7a"), 3: ("#000000", "#2a1a30", "#6a4a7a")}, slash=sci_s, wtint=("#000000", "#3a1a4a", "#c090e0"))
mon("olm", [B + "muscular/black.png", first(H + "lizard/male.png"), helm_path("horned")], tints={0: ("#181008", "#c8b8a0", "#fff8e8"), 1: ("#181008", "#d8c8b0", "#fffaf0"), 2: ("#200800", "#a04a10", "#ffb060")}, slash=club_s, wtint=("#180800", "#8a4a20", "#ffb070"))
mon("verzik", [B + "female/black.png", first(H + "vampire/adult.png"), legs_b, torso_b, helm_path("horned")], tints={0: ("#100008", "#6a1a3a", "#e080a8"), 1: ("#100008", "#7a2a4a", "#f098c0"), 2: ("#080000", "#5a0a14", "#c03040"), 3: ("#080000", "#5a0a14", "#c03040"), 4: ("#080000", "#3a0a10", "#a02030")}, slash=sci_s, wtint=("#100000", "#7a1020", "#ff6070"))
mon("warden", [B + "skeleton/skeleton.png", first(H + "skeleton/skeleton.png"), legs_b, torso_b, helm_path("spangenhelm")], tints={0: ("#1a1000", "#a08030", "#fff0a0"), 1: ("#1a1000", "#b09040", "#fff8b8"), 2: ("#100800", "#8a6a20", "#ffe080"), 3: ("#100800", "#8a6a20", "#ffe080"), 4: ("#100800", "#c8a040", "#fff0b0")}, slash=club_s, wtint=("#100800", "#c8a040", "#fff0b0"))

# ---------------- Lizenz-Nachweis nur fuer die genutzten Dateien
rows = []
credits_txt = subprocess.run(["git", "-C", str(REPO), "show", "HEAD:CREDITS.csv"], capture_output=True, text=True).stdout
with io.StringIO(credits_txt) as f:
    rd = csv.reader(f); header = next(rd)
    used = [u[len("spritesheets/"):] for u in set(USED)]
    for r in rd:
        # Eintraege gelten fuer Ordner: jede genutzte Datei unterhalb des Ordners
        if r and r[0] and len(r) > 2 and r[2].strip() and any(u == r[0] or u.startswith(r[0] + "/") for u in used): rows.append(r)
with open(OUT / "CREDITS.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(header); w.writerows(rows)
(OUT / "README.txt").write_text(
    "Pixel-Grafiken aus dem Liberated Pixel Cup (LPC) und dem Universal LPC Spritesheet Character Generator\n"
    "https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator\n\n"
    "Lizenzen: CC-BY-SA 3.0 / GPL 3.0 / OGA-BY (je Datei, siehe CREDITS.csv mit allen Autorinnen und Autoren).\n"
    "Fuer dieses Spiel umgefaerbt und zu Animations-Atlanten zusammengesetzt (tools/build_sprites.py).\n", encoding="utf-8")
print("Grafiken:", len(list(OUT.glob("*.png"))), "| genutzte Quelldateien:", len(set(USED)), "| Credits-Zeilen:", len(rows))
