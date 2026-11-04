// ============================================================
// Sandpit Grind – Spielregeln (reine Logik, ohne Grafik)
// Inoffizielles Fan-Projekt für den privaten Gebrauch.
// Item- und Monsternamen wie im Original, alle Grafiken selbst gezeichnet.
// ============================================================
(function (root) {
  "use strict";

  const XP_RATE = 45;          // schnelllebig: 45-fache Erfahrung
  const TICK_MS = 600;         // ein Spiel-Tick

  const XP_TABLE = [0, 0];
  (function () { let pts = 0; for (let l = 1; l < 99; l++) { pts += Math.floor(l + 300 * Math.pow(2, l / 7)); XP_TABLE[l + 1] = Math.floor(pts / 4); } })();
  function levelFor(xp) { let l = 1; while (l < 99 && xp >= XP_TABLE[l + 1]) l++; return l; }

  const SKILLS = ["att", "str", "def", "range", "mage", "pray", "hp"];
  const SKILL_NAME = { att: "Angriff", str: "Stärke", def: "Verteidigung", range: "Fernkampf", mage: "Magie", pray: "Gebet", hp: "Lebenspunkte" };

  // ---------------- Ausruestung: 10 Stufen
  const TIER = [
    { name: "Bronze", req: 1, c: ["#b07a45", "#7d5530"] },
    { name: "Iron", req: 1, c: ["#8a8d92", "#606368"] },
    { name: "Steel", req: 5, c: ["#b8bec4", "#80878d"] },
    { name: "Mithril", req: 20, c: ["#5f74b0", "#43548a"] },
    { name: "Adamant", req: 30, c: ["#4f9461", "#376b45"] },
    { name: "Rune", req: 40, c: ["#4cb6cc", "#2f8494"] },
    { name: "Dragon", req: 60, c: ["#c8402f", "#8a2a20"] },
    { name: "Barrows", req: 70, c: ["#6f6a5e", "#4a463d"] },
    { name: "Bandos", req: 75, c: ["#8b6a2f", "#5e471e"] },
    { name: "Torva", req: 80, c: ["#6a3030", "#3a1a18"] },
  ];
  const NAMES = {
    melee: ["Bronze scimitar", "Iron scimitar", "Steel scimitar", "Mithril scimitar", "Adamant scimitar", "Rune scimitar", "Dragon scimitar", "Dharok's greataxe", "Bandos godsword", "Scythe of vitur"],
    range: ["Shortbow", "Oak shortbow", "Willow shortbow", "Maple shortbow", "Yew shortbow", "Magic shortbow", "Dragon crossbow", "Karil's crossbow", "Armadyl crossbow", "Twisted bow"],
    mage: ["Staff of air", "Staff of water", "Staff of earth", "Staff of fire", "Battlestaff", "Mystic fire staff", "Ancient staff", "Ahrim's staff", "Staff of the dead", "Tumeken's shadow"],
    helm: ["Bronze full helm", "Iron full helm", "Steel full helm", "Mithril full helm", "Adamant full helm", "Rune full helm", "Dragon full helm", "Dharok's helm", "Neitiznot faceguard", "Torva full helm"],
    body: ["Bronze platebody", "Iron platebody", "Steel platebody", "Mithril platebody", "Adamant platebody", "Rune platebody", "Dragon platebody", "Dharok's platebody", "Bandos chestplate", "Torva platebody"],
    legs: ["Bronze platelegs", "Iron platelegs", "Steel platelegs", "Mithril platelegs", "Adamant platelegs", "Rune platelegs", "Dragon platelegs", "Dharok's platelegs", "Bandos tassets", "Torva platelegs"],
    shield: ["Bronze kiteshield", "Iron kiteshield", "Steel kiteshield", "Mithril kiteshield", "Adamant kiteshield", "Rune kiteshield", "Dragon kiteshield", "Dragon defender", "Avernic defender", "Elysian spirit shield"],
  };
  const W_ATK = [4, 7, 11, 16, 22, 30, 40, 54, 68, 84];
  const W_STR = [3, 6, 10, 15, 22, 30, 42, 56, 70, 86];
  const SPELL = [5, 7, 9, 12, 14, 17, 21, 26, 31, 37];
  const ARM = [2, 4, 6, 9, 12, 16, 22, 30, 38, 48];
  const SLOTS = {
    melee: { kind: "weapon", skill: "att" }, range: { kind: "weapon", skill: "range" }, mage: { kind: "weapon", skill: "mage" },
    helm: { kind: "armour", mult: 1, skill: "def" }, body: { kind: "armour", mult: 3, skill: "def" },
    legs: { kind: "armour", mult: 2, skill: "def" }, shield: { kind: "armour", mult: 1.5, skill: "def" },
  };
  const SLOT_KEYS = Object.keys(SLOTS);
  const ARMOUR_SLOTS = ["helm", "body", "legs", "shield"];
  const PRICE = [40, 160, 600, 2500, 9000, 35000, 140000, 0, 0, 0];
  const SLOT_PRICE = { melee: 1.4, range: 1.4, mage: 1.4, helm: .8, body: 2, legs: 1.5, shield: 1.1 };

  // ---------------- Verbrauchsgegenstaende
  const FOOD = [
    { id: "shrimps", name: "Shrimps", heal: 3, price: 8 },
    { id: "trout", name: "Trout", heal: 7, price: 30 },
    { id: "lobster", name: "Lobster", heal: 12, price: 110 },
    { id: "shark", name: "Shark", heal: 20, price: 420 },
    { id: "manta", name: "Manta ray", heal: 22, price: 1100 },
  ];
  const BONES = [
    { id: "bones", name: "Bones", xp: 4.5, price: 20 },
    { id: "big_bones", name: "Big bones", xp: 15, price: 150 },
    { id: "dragon_bones", name: "Dragon bones", xp: 72, price: 1800 },
  ];
  const POTIONS = [
    { id: "prayer_potion", name: "Prayer potion", price: 600, restore: (lvl) => 7 + Math.floor(lvl / 4) },
  ];

  // ---------------- Gebete (wie im Original)
  const PRAYERS = [
    { id: "thick", name: "Thick Skin", lvl: 1, drain: .04, def: .05 },
    { id: "burst", name: "Burst of Strength", lvl: 4, drain: .04, str: .05 },
    { id: "clarity", name: "Clarity of Thought", lvl: 7, drain: .04, att: .05 },
    { id: "sharp", name: "Sharp Eye", lvl: 8, drain: .04, range: .05 },
    { id: "mwill", name: "Mystic Will", lvl: 9, drain: .04, mage: .05 },
    { id: "rock", name: "Rock Skin", lvl: 10, drain: .07, def: .1 },
    { id: "superh", name: "Superhuman Strength", lvl: 13, drain: .07, str: .1 },
    { id: "improved", name: "Improved Reflexes", lvl: 16, drain: .07, att: .1 },
    { id: "hawk", name: "Hawk Eye", lvl: 26, drain: .07, range: .1 },
    { id: "mlore", name: "Mystic Lore", lvl: 27, drain: .07, mage: .1 },
    { id: "steel", name: "Steel Skin", lvl: 28, drain: .1, def: .15 },
    { id: "ustr", name: "Ultimate Strength", lvl: 31, drain: .1, str: .15 },
    { id: "irefl", name: "Incredible Reflexes", lvl: 34, drain: .1, att: .15 },
    { id: "pmage", name: "Protect from Magic", lvl: 37, drain: .2, protect: "mage" },
    { id: "prange", name: "Protect from Missiles", lvl: 40, drain: .2, protect: "range" },
    { id: "pmelee", name: "Protect from Melee", lvl: 43, drain: .2, protect: "melee" },
    { id: "eagle", name: "Eagle Eye", lvl: 44, drain: .1, range: .15 },
    { id: "mystic", name: "Mystic Might", lvl: 45, drain: .1, mage: .15 },
    { id: "chivalry", name: "Chivalry", lvl: 60, drain: .3, att: .15, str: .18, def: .2 },
    { id: "piety", name: "Piety", lvl: 70, drain: .4, att: .2, str: .23, def: .25 },
    { id: "rigour", name: "Rigour", lvl: 74, drain: .4, range: .23, def: .25 },
    { id: "augury", name: "Augury", lvl: 77, drain: .4, mage: .25, def: .25 },
  ];
  // Gruppen, die sich gegenseitig ausschliessen
  const PRAYER_GROUP = { thick: "def", rock: "def", steel: "def", burst: "str", superh: "str", ustr: "str", clarity: "att", improved: "att", irefl: "att",
    sharp: "range", hawk: "range", eagle: "range", mwill: "mage", mlore: "mage", mystic: "mage",
    chivalry: "boost", piety: "boost", rigour: "boost", augury: "boost", pmage: "protect", prange: "protect", pmelee: "protect" };
  function prayerConflicts(a, b) {
    if (a === b) return false;
    const ga = PRAYER_GROUP[a], gb = PRAYER_GROUP[b];
    if (ga === "protect" || gb === "protect") return ga === gb;
    if (ga === "boost" || gb === "boost") return true;
    return ga === gb;
  }
  function prayerBoosts(active) {
    const b = { att: 0, str: 0, def: 0, range: 0, mage: 0, protect: null };
    for (const id of active || []) { const p = PRAYERS.find(x => x.id === id); if (!p) continue; for (const k of ["att", "str", "def", "range", "mage"]) b[k] = Math.max(b[k], p[k] || 0); if (p.protect) b.protect = p.protect; }
    return b;
  }

  // ---------------- Einzigartige Items (Member-Items) und Materialien
  // Boni: atk = Angriff (alle Stile), str = Nahkampf-Staerke, rstr = Fernkampf-Staerke, mdmg = Magie-Schaden in %, def = Verteidigung
  const U = (o) => Object.assign({ atk: 0, ratk: 0, matk: 0, str: 0, rstr: 0, mdmg: 0, def: 0 }, o);
  // Ruestungs-Sets fuer Fernkampf und Magie: [id, Name, Slot, Stufe, ratk/matk, rstr/mdmg, def, Wert, Farbe, Quelle]
  const SETS = [
    // Fernkampf
    ["coif", "Coif", "helm", ["range", 20], 2, 0, 4, 2000, "#8a6234", "shop"],
    ["green_dhide_body", "Green d'hide body", "body", ["range", 40], 15, 0, 20, 8000, "#3a7a2a", "shop"],
    ["green_dhide_chaps", "Green d'hide chaps", "legs", ["range", 40], 8, 0, 10, 4000, "#3a7a2a", "shop"],
    ["green_dhide_vambs", "Green d'hide vambraces", "hands", ["range", 40], 8, 0, 3, 2000, "#3a7a2a", "shop"],
    ["blue_dhide_body", "Blue d'hide body", "body", ["range", 50], 20, 0, 26, 20000, "#2a4a9a", "shop"],
    ["blue_dhide_chaps", "Blue d'hide chaps", "legs", ["range", 50], 11, 0, 14, 10000, "#2a4a9a", "shop"],
    ["red_dhide_body", "Red d'hide body", "body", ["range", 60], 25, 0, 32, 45000, "#9a2a2a", "shop"],
    ["red_dhide_chaps", "Red d'hide chaps", "legs", ["range", 60], 14, 0, 18, 22000, "#9a2a2a", "shop"],
    ["black_dhide_body", "Black d'hide body", "body", ["range", 70], 30, 0, 38, 80000, "#2a2a2e", "shop"],
    ["black_dhide_chaps", "Black d'hide chaps", "legs", ["range", 70], 17, 0, 22, 40000, "#2a2a2e", "shop"],
    ["black_dhide_vambs", "Black d'hide vambraces", "hands", ["range", 70], 11, 1, 6, 15000, "#2a2a2e", "shop"],
    ["karils_coif", "Karil's coif", "helm", ["range", 70], 7, 0, 8, 300000, "#5a5a4a", "drop"],
    ["karils_top", "Karil's leathertop", "body", ["range", 70], 30, 0, 45, 1200000, "#5a5a4a", "drop"],
    ["karils_skirt", "Karil's leatherskirt", "legs", ["range", 70], 19, 0, 27, 600000, "#5a5a4a", "drop"],
    ["armadyl_helmet", "Armadyl helmet", "helm", ["range", 75], 10, 0, 12, 4000000, "#e8e0c0", "drop"],
    ["armadyl_chestplate", "Armadyl chestplate", "body", ["range", 75], 33, 1, 55, 20000000, "#e8e0c0", "drop"],
    ["armadyl_chainskirt", "Armadyl chainskirt", "legs", ["range", 75], 20, 1, 32, 20000000, "#e8e0c0", "drop"],
    ["masori_mask", "Masori mask (f)", "helm", ["range", 80], 12, 2, 14, 15000000, "#c8a050", "drop"],
    ["masori_body", "Masori body (f)", "body", ["range", 80], 43, 4, 60, 80000000, "#c8a050", "drop"],
    ["masori_chaps", "Masori chaps (f)", "legs", ["range", 80], 27, 2, 36, 50000000, "#c8a050", "drop"],
    // Magie
    ["wizard_hat", "Wizard hat", "helm", ["mage", 1], 2, 0, 0, 500, "#2a3aa0", "shop"],
    ["wizard_robe_top", "Wizard robe top", "body", ["mage", 1], 3, 0, 0, 800, "#2a3aa0", "shop"],
    ["wizard_robe_skirt", "Blue skirt", "legs", ["mage", 1], 2, 0, 0, 400, "#2a3aa0", "shop"],
    ["mystic_hat", "Mystic hat", "helm", ["mage", 40], 4, 0, 2, 15000, "#3a5ac8", "shop"],
    ["mystic_robe_top", "Mystic robe top", "body", ["mage", 40], 20, 1, 8, 70000, "#3a5ac8", "shop"],
    ["mystic_robe_bottom", "Mystic robe bottom", "legs", ["mage", 40], 15, 0, 5, 45000, "#3a5ac8", "shop"],
    ["infinity_hat", "Infinity hat", "helm", ["mage", 50], 6, 1, 4, 300000, "#2a6ac8", "drop"],
    ["infinity_top", "Infinity top", "body", ["mage", 50], 22, 1, 12, 400000, "#2a6ac8", "drop"],
    ["infinity_bottoms", "Infinity bottoms", "legs", ["mage", 50], 17, 1, 9, 600000, "#2a6ac8", "drop"],
    ["ahrims_hood", "Ahrim's hood", "helm", ["mage", 70], 6, 1, 15, 300000, "#3a3a4a", "drop"],
    ["ahrims_robetop", "Ahrim's robetop", "body", ["mage", 70], 30, 2, 52, 1000000, "#3a3a4a", "drop"],
    ["ahrims_robeskirt", "Ahrim's robeskirt", "legs", ["mage", 70], 22, 1, 33, 1200000, "#3a3a4a", "drop"],
    ["ancestral_hat", "Ancestral hat", "helm", ["mage", 75], 8, 2, 12, 30000000, "#4a3a8a", "drop"],
    ["ancestral_robe_top", "Ancestral robe top", "body", ["mage", 75], 35, 3, 30, 60000000, "#4a3a8a", "drop"],
    ["ancestral_robe_bottom", "Ancestral robe bottom", "legs", ["mage", 75], 26, 2, 22, 40000000, "#4a3a8a", "drop"],
  ];
  const ITEMS = {
    // Waffen
    abyssal_whip: U({ name: "Abyssal whip", slot: "melee", atk: 70, str: 72, req: ["att", 70], value: 2500000, sprite: "w_whip", col: "#4a1a4a" }),
    granite_maul: U({ name: "Granite maul", slot: "melee", atk: 58, str: 80, req: ["str", 50], value: 900000, sprite: "w_maul", col: "#6a6a6a" }),
    // Magie-Waffen (spell = Max-Hit-Basis wie bei Stufen-Staeben)
    ibans_staff: U({ name: "Iban's staff (u)", slot: "mage", set: "mage", atk: 34, spell: 19, req: ["mage", 50], value: 90000, shop: true, sprite: "w_mage5", col: "#6a4a8a" }),
    trident_seas: U({ name: "Trident of the seas", slot: "mage", set: "mage", atk: 62, spell: 30, req: ["mage", 75], value: 1500000, sprite: "w_mage6", col: "#2ab8c8" }),
    trident_swamp: U({ name: "Trident of the swamp", slot: "mage", set: "mage", atk: 66, spell: 31, req: ["mage", 75], value: 8000000, sprite: "w_mage7", col: "#3a8a3a" }),
    kodai_wand: U({ name: "Kodai wand", slot: "mage", set: "mage", atk: 76, spell: 34, req: ["mage", 80], value: 40000000, sprite: "w_mage8", col: "#3a6ae0" }),
    harmonised_staff: U({ name: "Harmonised nightmare staff", slot: "mage", set: "mage", atk: 80, spell: 35, req: ["mage", 82], value: 35000000, sprite: "w_mage8", col: "#8a6ac8" }),
    sanguinesti_staff: U({ name: "Sanguinesti staff", slot: "mage", set: "mage", atk: 78, spell: 36, req: ["mage", 82], value: 60000000, sprite: "w_mage8", col: "#c82030" }),
    // Weitere starke Waffen
    toxic_blowpipe: U({ name: "Toxic blowpipe", slot: "range", atk: 66, rstr: 70, req: ["range", 75], value: 3000000, sprite: "w_range6", col: "#3ac040" }),
    bow_faerdhinen: U({ name: "Bow of faerdhinen (c)", slot: "range", atk: 82, rstr: 82, req: ["range", 80], value: 40000000, sprite: "w_range5", col: "#e0c060" }),
    saradomin_sword: U({ name: "Saradomin sword", slot: "melee", atk: 62, str: 70, req: ["att", 70], value: 2000000, sprite: "w_melee8", col: "#e8e8f0" }),
    abyssal_tentacle: U({ name: "Abyssal tentacle", slot: "melee", atk: 76, str: 76, req: ["att", 75], value: 4000000, sprite: "w_whip", col: "#3a3a3a" }),
    ghrazi_rapier: U({ name: "Ghrazi rapier", slot: "melee", atk: 82, str: 84, req: ["att", 80], value: 30000000, sprite: "w_melee6", col: "#c8c8d0" }),
    // Magie-Schilde, Umhang, Schmuck (matk = Magie-Angriff, mdmg = Magie-Schaden in %)
    mages_book: U({ name: "Mage's book", slot: "shield", set: "mage", matk: 15, value: 60000, shop: true, req: ["mage", 50], sprite: null, col: "#8a3a2a" }),
    arcane_spirit_shield: U({ name: "Arcane spirit shield", slot: "shield", set: "mage", matk: 20, mdmg: 2, def: 60, value: 40000000, req: ["mage", 65], sprite: "p_shield9", col: "#e0c060" }),
    elidinis_ward: U({ name: "Elidinis' ward (f)", slot: "shield", set: "mage", matk: 25, mdmg: 5, def: 55, value: 60000000, req: ["mage", 80], sprite: "p_shield8", col: "#c8a050" }),
    imbued_zamorak_cape: U({ name: "Imbued zamorak cape", slot: "cape", set: "mage", matk: 15, mdmg: 2, def: 3, value: 300000, shop: true, req: ["mage", 75], col: "#c82020" }),
    amulet_magic: U({ name: "Amulet of magic", slot: "neck", set: "mage", matk: 10, value: 3000, shop: true, col: "#3a6ae0" }),
    god_book: U({ name: "Book of darkness", slot: "shield", set: "mage", matk: 10, mdmg: 1, def: 5, value: 12000, shop: true, req: ["mage", 30], sprite: null, col: "#3a2a3a" }),
    tormented_bracelet: U({ name: "Tormented bracelet", slot: "hands", set: "mage", matk: 10, mdmg: 5, value: 15000000, req: ["mage", 75], col: "#8a3ac8" }),
    magus_ring: U({ name: "Magus ring", slot: "ring", set: "mage", matk: 6, mdmg: 6, value: 12000000, req: ["mage", 80], col: "#3ac8e8" }),
    virtus_mask: U({ name: "Virtus mask", slot: "helm", set: "mage", matk: 8, mdmg: 1, def: 10, value: 3000000, req: ["mage", 78], sprite: "p_ancestral_hat", col: "#2a3a6a" }),
    virtus_robe_top: U({ name: "Virtus robe top", slot: "body", set: "mage", matk: 35, mdmg: 2, def: 45, value: 8000000, req: ["mage", 78], sprite: "p_ancestral_robe_top", col: "#2a3a6a" }),
    virtus_robe_bottom: U({ name: "Virtus robe bottom", slot: "legs", set: "mage", matk: 26, mdmg: 2, def: 30, value: 6000000, req: ["mage", 78], sprite: "p_ancestral_robe_bottom", col: "#2a3a6a" }),
    dark_bow: U({ name: "Dark bow", slot: "range", atk: 78, rstr: 74, req: ["range", 60], value: 1800000, sprite: "w_darkbow", col: "#2a1a3a" }),
    // Amulette
    amulet_strength: U({ name: "Amulet of strength", slot: "neck", str: 10, value: 5000, shop: true, col: "#c84030" }),
    amulet_power: U({ name: "Amulet of power", slot: "neck", atk: 6, str: 6, def: 6, value: 20000, shop: true, col: "#e0e0e0" }),
    amulet_glory: U({ name: "Amulet of glory", slot: "neck", atk: 10, str: 6, rstr: 4, mdmg: 2, def: 3, value: 80000, shop: true, col: "#4a8ae0" }),
    amulet_fury: U({ name: "Amulet of fury", slot: "neck", atk: 10, str: 8, rstr: 4, mdmg: 5, def: 15, value: 2200000, col: "#e8d080" }),
    amulet_torture: U({ name: "Amulet of torture", slot: "neck", atk: 15, str: 10, value: 9000000, col: "#c83020" }),
    necklace_anguish: U({ name: "Necklace of anguish", slot: "neck", atk: 15, rstr: 10, value: 8000000, col: "#5ac040" }),
    occult_necklace: U({ name: "Occult necklace", slot: "neck", mdmg: 10, value: 700000, col: "#9a5aff" }),
    // Ringe
    warrior_ring: U({ name: "Warrior ring", slot: "ring", atk: 4, value: 40000, shop: true, col: "#c8c8c8" }),
    berserker_ring: U({ name: "Berserker ring", slot: "ring", str: 4, value: 2500000, col: "#c83020" }),
    archers_ring: U({ name: "Archers ring", slot: "ring", atk: 4, rstr: 2, value: 3000000, col: "#5ac040" }),
    seers_ring: U({ name: "Seers ring", slot: "ring", mdmg: 4, value: 1500000, col: "#4a8ae0" }),
    ultor_ring: U({ name: "Ultor ring", slot: "ring", str: 12, value: 40000000, col: "#e8a020" }),
    // Umhaenge
    obsidian_cape: U({ name: "Obsidian cape", slot: "cape", str: 2, def: 9, value: 60000, shop: true, col: "#3a1a1a" }),
    avas_accumulator: U({ name: "Ava's accumulator", slot: "cape", atk: 4, rstr: 3, def: 4, value: 120000, shop: true, col: "#8a6234" }),
    fire_cape: U({ name: "Fire cape", slot: "cape", str: 4, def: 11, value: 0, col: "#ff6a10" }),
    infernal_cape: U({ name: "Infernal cape", slot: "cape", str: 8, rstr: 2, mdmg: 1, def: 12, value: 0, col: "#ff3a00" }),
    // Stiefel
    rune_boots: U({ name: "Rune boots", slot: "feet", str: 2, def: 12, value: 25000, shop: true, req: ["def", 40], col: "#4cb6cc" }),
    ranger_boots: U({ name: "Ranger boots", slot: "feet", atk: 8, rstr: 2, def: 6, value: 30000000, col: "#2a6a2a" }),
    dragon_boots: U({ name: "Dragon boots", slot: "feet", str: 4, def: 16, value: 250000, req: ["def", 60], col: "#c8402f" }),
    primordial_boots: U({ name: "Primordial boots", slot: "feet", str: 5, def: 22, value: 30000000, req: ["def", 75], col: "#8a2a2a" }),
    eternal_boots: U({ name: "Eternal boots", slot: "feet", mdmg: 2, def: 8, value: 4000000, req: ["def", 75], col: "#6aa0ff" }),
    // Handschuhe
    combat_bracelet: U({ name: "Combat bracelet", slot: "hands", atk: 7, str: 4, def: 5, value: 15000, shop: true, col: "#c8a040" }),
    barrows_gloves: U({ name: "Barrows gloves", slot: "hands", atk: 12, str: 12, rstr: 12, mdmg: 2, def: 12, value: 130000, shop: true, req: ["def", 41], col: "#5a3a2a" }),
    ferocious_gloves: U({ name: "Ferocious gloves", slot: "hands", atk: 16, str: 14, def: 4, value: 8000000, req: ["att", 80], col: "#3a2a2a" }),
    // Materialien (werden automatisch in der Bank gestapelt)
    nature_rune: { name: "Nature rune", mat: "rune", value: 180, col: "#3aa040" },
    law_rune: { name: "Law rune", mat: "rune", value: 200, col: "#4a6ae0" },
    death_rune: { name: "Death rune", mat: "rune", value: 220, col: "#e8e8e8" },
    blood_rune: { name: "Blood rune", mat: "rune", value: 320, col: "#c82020" },
    grimy_ranarr: { name: "Grimy ranarr weed", mat: "herb", value: 6500, col: "#3a8a3a" },
    grimy_snapdragon: { name: "Grimy snapdragon", mat: "herb", value: 8000, col: "#5a9a2a" },
    grimy_torstol: { name: "Grimy torstol", mat: "herb", value: 7500, col: "#2a6a1a" },
    ranarr_seed: { name: "Ranarr seed", mat: "seed", value: 32000, col: "#8a6234" },
    snapdragon_seed: { name: "Snapdragon seed", mat: "seed", value: 45000, col: "#7a5a2a" },
    torstol_seed: { name: "Torstol seed", mat: "seed", value: 65000, col: "#6a4a1a" },
    uncut_sapphire: { name: "Uncut sapphire", mat: "gem", value: 300, col: "#3a5ae0" },
    uncut_emerald: { name: "Uncut emerald", mat: "gem", value: 650, col: "#3ac040" },
    uncut_ruby: { name: "Uncut ruby", mat: "gem", value: 1300, col: "#e03030" },
    uncut_diamond: { name: "Uncut diamond", mat: "gem", value: 3200, col: "#e8f0f8" },
    uncut_dragonstone: { name: "Uncut dragonstone", mat: "gem", value: 13000, col: "#b040e0" },
    coal: { name: "Coal", mat: "bar", value: 150, col: "#2a2a2a" },
    adamantite_bar: { name: "Adamantite bar", mat: "bar", value: 2200, col: "#4f9461" },
    rune_bar: { name: "Runite bar", mat: "bar", value: 12500, col: "#4cb6cc" },
    draconic_visage: { name: "Draconic visage", mat: "rare", value: 3500000, col: "#3a3a3a" },
    third_age_platebody: { name: "3rd age platebody", mat: "rare", value: 45000000, col: "#e8e8f0" },
    gilded_platebody: { name: "Gilded platebody", mat: "rare", value: 2000000, col: "#e8c040" },
    robin_hood_hat: { name: "Robin hood hat", mat: "rare", value: 3500000, col: "#3a7a2a" },
    clue_hard: { name: "Clue scroll (hard)", clue: true, value: 0, col: "#e8dcb0" },
  };
  for (const [id, name, slot, req, a, d, def, value, col, src] of SETS) {
    const range = req[0] === "range";
    ITEMS[id] = U({ name, slot, req, value, col, shop: src === "shop", set: range ? "range" : "mage",
      ratk: range ? a : 0, rstr: range ? d : 0, matk: range ? 0 : a, mdmg: range ? 0 : d, def });
  }
  const EXTRA_SLOTS = ["neck", "ring", "cape", "feet", "hands"];
  // Gemeinsame Seltene-Drop-Tabelle (ab mittleren Gegnern)
  const RARE_TABLE = [["uncut_sapphire", 1, 18], ["uncut_emerald", 1, 30], ["uncut_ruby", 1, 55], ["uncut_diamond", 1, 110], ["uncut_dragonstone", 1, 400], ["clue_hard", 1, 70], ["law_rune", 25, 25], ["nature_rune", 30, 20]];
  function openClue() {
    const out = [["coins", 20000 + Math.floor(Math.random() * 180000)]];
    const roll = Math.random();
    if (roll < .02) out.push(["third_age_platebody", 1]);
    else if (roll < .07) out.push(["ranger_boots", 1]);
    else if (roll < .14) out.push(["robin_hood_hat", 1]);
    else if (roll < .24) out.push(["gilded_platebody", 1]);
    else if (roll < .5) out.push(["amulet_glory", 1]);
    out.push(["rune_bar", 1 + Math.floor(Math.random() * 4)]);
    if (Math.random() < .5) out.push(["law_rune", 50 + Math.floor(Math.random() * 100)]);
    return out;
  }

  const itemId = (slot, t) => slot + ":" + t;
  const isGear = id => typeof id === "string" && id.includes(":");
  const parseItem = id => { const [s, t] = id.split(":"); return { slot: s, tier: +t }; };
  const foodOf = id => FOOD.find(f => f.id === id);
  const bonesOf = id => BONES.find(b => b.id === id);
  const potionOf = id => POTIONS.find(p => p.id === id);
  function itemName(id) {
    if (ITEMS[id]) return ITEMS[id].name;
    if (id === "coins") return "Coins";
    if (isGear(id)) { const { slot, tier } = parseItem(id); return NAMES[slot][tier]; }
    const x = foodOf(id) || bonesOf(id) || potionOf(id); return x ? x.name : id;
  }
  function itemPrice(slot, t) { return Math.round(PRICE[t] * SLOT_PRICE[slot]); }
  function baseValue(id) {
    if (ITEMS[id]) return ITEMS[id].value;
    if (isGear(id)) { const { slot, tier } = parseItem(id); return Math.round((PRICE[tier] || PRICE[6] * Math.pow(3, tier - 6)) * SLOT_PRICE[slot]); }
    const x = foodOf(id) || bonesOf(id) || potionOf(id); return x ? x.price : 0;
  }
  const sellPrice = id => Math.round(baseValue(id) * .35);
  const highAlch = id => Math.round(baseValue(id) * .6);
  const ALCH_LEVEL = 55, NATURE_PRICE = 180, ALCH_XP = 65;
  function requirement(id) {
    if (ITEMS[id]) return ITEMS[id].req ? { skill: ITEMS[id].req[0], level: ITEMS[id].req[1] } : null;
    if (!isGear(id)) return null;
    const { slot, tier } = parseItem(id);
    return { skill: SLOTS[slot].skill, level: TIER[tier].req };
  }

  // ---------------- Monster / Orte. styles: Angriffsarten mit Gewicht (Bosse wechseln)
  const M = (o) => Object.assign({ atkSpeed: 4, defBonus: 0, size: 1, styles: [["melee", 1]] }, o);
  const MONSTERS = [
    M({ id: "chicken", name: "Chicken", place: "Lumbridge", lvl: 1, hp: 3, att: 1, def: 1, max: 1, gold: [1, 6], shape: "bird", col: "#ece6d3", ground: "grass", bones: "bones", drops: [["shrimps", 1, 4]] }),
    M({ id: "rat", name: "Giant rat", place: "Lumbridge Swamp", lvl: 4, hp: 7, att: 3, def: 3, max: 2, gold: [4, 14], shape: "rat", col: "#6f5a4a", ground: "swamp", bones: "bones", drops: [["shrimps", 2, 4], [itemId("helm", 1), 1, 30]] }),
    M({ id: "goblin", name: "Goblin", place: "Goblin Village", lvl: 9, hp: 13, att: 7, def: 6, max: 3, gold: [10, 35], shape: "goblin", col: "#6aa04a", ground: "grass", bones: "bones", drops: [["trout", 1, 4], [itemId("melee", 1), 1, 40], [itemId("shield", 2), 1, 60], ["nature_rune", 4, 8], ["coal", 1, 10]] }),
    M({ id: "wolf", name: "White wolf", place: "White Wolf Mountain", lvl: 17, hp: 24, att: 15, def: 12, max: 5, gold: [25, 80], shape: "wolf", col: "#dfe3e8", ground: "snow", bones: "bones", drops: [["trout", 2, 3], [itemId("range", 2), 1, 45], [itemId("body", 2), 1, 70], ["law_rune", 3, 10], ["uncut_sapphire", 1, 20]] }),
    M({ id: "hillgiant", name: "Hill Giant", place: "Edgeville Dungeon", lvl: 28, hp: 38, att: 25, def: 22, max: 8, gold: [60, 200], shape: "giant", col: "#c9a27a", ground: "cave", size: 1.35, bones: "big_bones", drops: [["lobster", 1, 4], [itemId("melee", 3), 1, 40], [itemId("legs", 3), 1, 55], ["law_rune", 6, 6], ["grimy_ranarr", 1, 35], ["adamantite_bar", 1, 25], ["obsidian_cape", 1, 160]] }),
    M({ id: "troll", name: "Ice troll", place: "Jatizso", lvl: 45, hp: 50, att: 40, def: 38, max: 11, gold: [150, 500], shape: "troll", col: "#a9c4d2", ground: "snow", size: 1.3, bones: "big_bones", drops: [["lobster", 2, 3], ["prayer_potion", 1, 12], [itemId("body", 4), 1, 60], [itemId("mage", 4), 1, 50], ["nature_rune", 12, 6], ["grimy_ranarr", 1, 20], ["warrior_ring", 1, 120]] }),
    M({ id: "firegiant", name: "Fire giant", place: "Brimhaven Dungeon", lvl: 62, hp: 65, att: 55, def: 52, max: 15, gold: [400, 1200], shape: "giant", col: "#d0602f", ground: "lava", size: 1.5, bones: "big_bones", drops: [["shark", 1, 4], ["prayer_potion", 1, 10], [itemId("melee", 5), 1, 60], [itemId("helm", 5), 1, 45], ["fire_cape", 1, 220], ["blood_rune", 8, 8], ["rune_bar", 1, 20], ["amulet_power", 1, 90]] }),
    M({ id: "hellhound", name: "Hellhound", place: "Taverley Dungeon", lvl: 80, hp: 80, att: 72, def: 68, max: 19, gold: [900, 2600], shape: "hound", col: "#3a1f1c", ground: "lava", size: 1.2, bones: "bones", drops: [["shark", 2, 3], ["prayer_potion", 1, 8], [itemId("range", 5), 1, 50], [itemId("legs", 6), 1, 120], ["death_rune", 15, 6], ["grimy_snapdragon", 1, 22], ["primordial_boots", 1, 800]] }),
    M({ id: "demon", name: "Greater demon", place: "Chaos Tunnels", lvl: 100, hp: 100, att: 88, def: 84, max: 23, gold: [2000, 5000], shape: "demon", col: "#9b2020", ground: "lava", size: 1.5, bones: "big_bones", styles: [["melee", 3], ["mage", 1]], drops: [["shark", 2, 2], ["prayer_potion", 1, 6], [itemId("mage", 6), 1, 80], [itemId("shield", 6), 1, 70], ["blood_rune", 12, 5], ["rune_bar", 1, 12], ["seers_ring", 1, 260], ["infinity_hat", 1, 120], ["infinity_bottoms", 1, 160], ["tormented_bracelet", 1, 400], ["trident_seas", 1, 220]] }),
    M({ id: "gargoyle", name: "Gargoyle", place: "Slayer Tower", lvl: 111, hp: 105, att: 92, def: 110, max: 22, gold: [2500, 6000], shape: "gargoyle", col: "#6a6a64", ground: "crypt", size: 1.45, bones: "big_bones", drops: [["shark", 1, 3], ["granite_maul", 1, 80], ["rune_bar", 2, 8], ["adamantite_bar", 4, 6], ["berserker_ring", 1, 220], ["dragon_boots", 1, 140]] }),
    M({ id: "abyssal", name: "Abyssal demon", place: "Slayer Tower", lvl: 124, hp: 150, att: 105, def: 95, max: 26, gold: [3000, 8000], shape: "abyssal", col: "#5a1a5a", ground: "crypt", size: 1.45, bones: "big_bones", drops: [["shark", 1, 3], ["abyssal_whip", 1, 90], ["blood_rune", 15, 5], ["death_rune", 20, 5], ["grimy_ranarr", 1, 8], ["occult_necklace", 1, 260], ["ranarr_seed", 1, 25], ["infinity_top", 1, 140], ["abyssal_tentacle", 1, 300], ["trident_seas", 1, 160], ["mages_book", 1, 120]] }),
    M({ id: "smokedevil", name: "Smoke devil", place: "Smoke Devil Dungeon", lvl: 135, hp: 140, att: 108, def: 104, max: 26, gold: [3000, 7000], shape: "devil", col: "#6a6a66", ground: "cave", size: 1.1, bones: "bones", styles: [["range", 1]], drops: [["shark", 2, 3], ["prayer_potion", 1, 6], [itemId("mage", 6), 1, 45], ["occult_necklace", 1, 70], ["infinity_top", 1, 90], ["infinity_hat", 1, 70], ["mystic_robe_top", 1, 30], ["blood_rune", 15, 5], ["uncut_diamond", 1, 25]] }),
    M({ id: "kraken", name: "Kraken", place: "Kraken Cove", lvl: 145, hp: 170, att: 115, def: 90, max: 30, gold: [5000, 11000], shape: "kraken", col: "#2a8a9a", ground: "swamp", size: 1.5, boss: true, bones: "big_bones", styles: [["mage", 1]], drops: [["manta", 1, 3], ["prayer_potion", 2, 4], ["trident_seas", 1, 25], ["abyssal_tentacle", 1, 45], ["mages_book", 1, 30], ["occult_necklace", 1, 60], ["death_rune", 30, 4], ["snapdragon_seed", 1, 30]] }),
    M({ id: "dragon", name: "Black dragon", place: "Taverley Dungeon", lvl: 125, hp: 130, att: 118, def: 102, max: 30, gold: [4000, 9000], shape: "dragon", col: "#2d2d33", ground: "cave", size: 1.6, bones: "dragon_bones", styles: [["melee", 2], ["mage", 1]], drops: [["manta", 1, 3], ["prayer_potion", 1, 5], [itemId("body", 6), 1, 45], [itemId("melee", 6), 1, 40], [itemId("helm", 6), 1, 35], [itemId("range", 6), 1, 50], ["rune_bar", 2, 6], ["draconic_visage", 1, 400], ["archers_ring", 1, 320], ["trident_swamp", 1, 260], ["god_book", 1, 120]] }),
    M({ id: "zulrah", name: "Zulrah", place: "Zul-Andra", lvl: 165, hp: 190, att: 132, def: 120, max: 34, gold: [7000, 16000], shape: "snake", col: "#3a9a5a", ground: "swamp", size: 1.6, boss: true, bones: "big_bones", styles: [["range", 1], ["mage", 1]], drops: [["manta", 2, 3], ["prayer_potion", 2, 4], ["toxic_blowpipe", 1, 30], ["trident_swamp", 1, 30], ["eternal_boots", 1, 120], ["grimy_snapdragon", 3, 6], ["snapdragon_seed", 1, 20], ["torstol_seed", 1, 40]] }),
    M({ id: "dharok", name: "Dharok the Wretched", place: "Barrows", lvl: 150, hp: 170, att: 142, def: 132, max: 38, gold: [7000, 15000], shape: "dharok", col: "#5f5a50", ground: "crypt", size: 1.15, boss: true, bones: "big_bones", drops: [["manta", 2, 2], ["prayer_potion", 2, 3], ...SLOT_KEYS.map(s => [itemId(s, 7), 1, 22]), ["amulet_fury", 1, 160], ["grimy_torstol", 2, 6], ["torstol_seed", 1, 25], ["karils_coif", 1, 40], ["karils_top", 1, 45], ["karils_skirt", 1, 45], ["ahrims_hood", 1, 40], ["ahrims_robetop", 1, 45], ["ahrims_robeskirt", 1, 45], ["harmonised_staff", 1, 160], ["saradomin_sword", 1, 60]] }),
    M({ id: "darkbeast", name: "Dark beast", place: "Kourend Catacombs", lvl: 182, hp: 220, att: 150, def: 140, max: 40, gold: [9000, 20000], shape: "darkbeast", col: "#2a2a2a", ground: "swamp", size: 1.55, bones: "big_bones", drops: [["manta", 1, 3], ["dark_bow", 1, 70], ["death_rune", 40, 4], ["grimy_snapdragon", 1, 8], ["snapdragon_seed", 1, 30], ["necklace_anguish", 1, 300], ["eternal_boots", 1, 320], ["armadyl_helmet", 1, 120], ["armadyl_chainskirt", 1, 160], ["toxic_blowpipe", 1, 200], ["magus_ring", 1, 450], ["trident_swamp", 1, 300]] }),
    M({ id: "graardor", name: "General Graardor", place: "God Wars Dungeon", lvl: 185, hp: 210, att: 168, def: 152, max: 44, gold: [12000, 26000], shape: "ogre", col: "#7a6a4a", ground: "dirt", size: 1.8, boss: true, bones: "big_bones", styles: [["melee", 3], ["range", 1]], drops: [["manta", 2, 2], ["prayer_potion", 2, 3], ...SLOT_KEYS.map(s => [itemId(s, 8), 1, 26]), ["primordial_boots", 1, 110], ["amulet_torture", 1, 140], ["ultor_ring", 1, 260], ["ferocious_gloves", 1, 200], ["armadyl_chestplate", 1, 160], ["saradomin_sword", 1, 40]] }),
    M({ id: "duke", name: "Duke Sucellus", place: "Ghorrock Prison", lvl: 195, hp: 230, att: 160, def: 140, max: 42, gold: [14000, 30000], shape: "duke", col: "#34466a", ground: "snow", size: 1.6, boss: true, bones: "big_bones", styles: [["mage", 2], ["melee", 1]], drops: [["manta", 2, 2], ["prayer_potion", 2, 3], ["virtus_mask", 1, 20], ["virtus_robe_top", 1, 25], ["virtus_robe_bottom", 1, 25], ["magus_ring", 1, 45], ["imbued_zamorak_cape", 1, 30], ["blood_rune", 40, 4]] }),
    M({ id: "kbd", name: "King Black Dragon", place: "KBD Lair", lvl: 210, hp: 255, att: 178, def: 160, max: 48, gold: [15000, 35000], shape: "kbd", col: "#1a1a1e", ground: "lava", size: 2, boss: true, bones: "dragon_bones", styles: [["melee", 2], ["mage", 2]], drops: [["manta", 2, 2], ["draconic_visage", 1, 60], ["amulet_fury", 1, 90], ["rune_bar", 5, 3], ...SLOT_KEYS.filter(k => k !== "shield").map(k => [itemId(k, 6), 1, 14]), ["ancestral_hat", 1, 110], ["arcane_spirit_shield", 1, 220], ["trident_swamp", 1, 120], ["magus_ring", 1, 250]] }),
    M({ id: "corp", name: "Corporeal Beast", place: "Corporeal Beast's Lair", lvl: 215, hp: 270, att: 172, def: 175, max: 46, gold: [18000, 40000], shape: "corp", col: "#c8d0a8", ground: "cave", size: 1.8, boss: true, bones: "big_bones", styles: [["mage", 2], ["melee", 1]], drops: [["manta", 2, 2], ["prayer_potion", 2, 3], ["arcane_spirit_shield", 1, 45], [itemId("shield", 9), 1, 140], [itemId("shield", 8), 1, 40], ["death_rune", 50, 4], ["uncut_dragonstone", 1, 20]] }),
    M({ id: "nightmare", name: "The Nightmare", place: "Sisterhood Sanctuary", lvl: 230, hp: 280, att: 185, def: 165, max: 48, gold: [22000, 50000], shape: "nightmare", col: "#5a2a6a", ground: "void", size: 1.6, boss: true, bones: "dragon_bones", styles: [["melee", 1], ["range", 1], ["mage", 1]], drops: [["manta", 2, 2], ["prayer_potion", 2, 3], ["harmonised_staff", 1, 35], [itemId("mage", 8), 1, 30], ["tormented_bracelet", 1, 60], ["amulet_fury", 1, 40], ["blood_rune", 60, 4]] }),
    M({ id: "nex", name: "Nex", place: "Ancient Prison", lvl: 240, hp: 280, att: 196, def: 178, max: 52, gold: [25000, 60000], shape: "nex", col: "#4a3a6a", ground: "void", size: 1.5, boss: true, bones: "dragon_bones", styles: [["melee", 1], ["range", 1], ["mage", 1]], drops: [["manta", 3, 2], ["prayer_potion", 2, 2], ...SLOT_KEYS.map(s => [itemId(s, 9), 1, 30]), ["infernal_cape", 1, 120], ["torstol_seed", 2, 10], ["necklace_anguish", 1, 120], ["ultor_ring", 1, 150], ["masori_mask", 1, 60], ["masori_body", 1, 80], ["masori_chaps", 1, 70], ["ancestral_robe_top", 1, 80], ["ancestral_robe_bottom", 1, 70], ["bow_faerdhinen", 1, 100], ["ghrazi_rapier", 1, 100], ["tormented_bracelet", 1, 80]] }),
    M({ id: "olm", name: "Great Olm", place: "Chambers of Xeric", lvl: 260, hp: 300, att: 205, def: 185, max: 54, gold: [35000, 80000], shape: "olm", col: "#e8dcc8", ground: "crypt", size: 1.8, boss: true, bones: "dragon_bones", styles: [["mage", 1], ["range", 1], ["melee", 1]], drops: [["manta", 3, 2], ["prayer_potion", 2, 2], ["kodai_wand", 1, 25], ["ancestral_hat", 1, 25], ["ancestral_robe_top", 1, 30], ["ancestral_robe_bottom", 1, 30], [itemId("range", 9), 1, 80], ["dragon_boots", 1, 10], ["torstol_seed", 2, 8]] }),
    M({ id: "verzik", name: "Verzik Vitur", place: "Theatre of Blood", lvl: 280, hp: 320, att: 220, def: 195, max: 58, gold: [45000, 100000], shape: "verzik", col: "#8a1a3a", ground: "crypt", size: 1.6, boss: true, bones: "dragon_bones", styles: [["melee", 1], ["range", 1], ["mage", 1]], drops: [["manta", 3, 2], ["prayer_potion", 2, 2], ["sanguinesti_staff", 1, 22], ["ghrazi_rapier", 1, 22], [itemId("melee", 9), 1, 70], [itemId("shield", 8), 1, 14], ["blood_rune", 100, 3]] }),
    M({ id: "warden", name: "Tumeken's Warden", place: "Tombs of Amascut", lvl: 300, hp: 340, att: 232, def: 205, max: 62, gold: [60000, 130000], shape: "warden", col: "#c8a040", ground: "dirt", size: 1.7, boss: true, bones: "dragon_bones", styles: [["mage", 1], ["range", 1], ["melee", 1]], drops: [["manta", 3, 2], ["prayer_potion", 2, 2], [itemId("mage", 9), 1, 45], ["elidinis_ward", 1, 25], ["masori_mask", 1, 25], ["masori_body", 1, 35], ["masori_chaps", 1, 30], ["bow_faerdhinen", 1, 40], ["torstol_seed", 2, 6]] }),
  ];
  MONSTERS.sort((a, b) => a.lvl - b.lvl);
  function pickStyle(m) {
    const total = m.styles.reduce((a, s) => a + s[1], 0);
    let r = Math.random() * total;
    for (const [s, w] of m.styles) if ((r -= w) <= 0) return s;
    return m.styles[0][0];
  }

  // ---------------- Kampf-Formeln
  function hitChance(attRoll, defRoll) {
    return attRoll > defRoll ? 1 - (defRoll + 2) / (2 * (attRoll + 1)) : attRoll / (2 * (defRoll + 1));
  }
  function armourBonus(eq) {
    let def = 0;
    for (const s of ARMOUR_SLOTS) if (typeof eq[s] === "number") def += Math.round(ARM[eq[s]] * SLOTS[s].mult);
    return def + extraBonus(eq).def;
  }
  // Waffe: Stufen-Waffe ("melee:3") oder einzigartige Waffe ("abyssal_whip")
  function weaponOf(eq) {
    if (!eq.weapon) return { slot: "melee", tier: -1, atk: 0, str: 0, spell: 2 };
    const u = ITEMS[eq.weapon];
    if (u) return { slot: u.slot, tier: u.spell ? Math.min(9, Math.max(5, Math.round((u.spell - 14) / 3) + 5)) : 6, atk: u.atk, str: u.slot === "range" ? u.rstr : u.str, spell: u.spell || SPELL[6], unique: true };
    const w = parseItem(eq.weapon);
    return { slot: w.slot, tier: w.tier, atk: W_ATK[w.tier], str: W_STR[w.tier], spell: SPELL[w.tier] };
  }
  // Summe der Boni aus Amulett, Ring, Umhang, Stiefeln, Handschuhen
  function extraBonus(eq) {
    const b = { atk: 0, ratk: 0, matk: 0, str: 0, rstr: 0, mdmg: 0, def: 0 };
    for (const k of EXTRA_SLOTS.concat(ARMOUR_SLOTS)) { const u = typeof eq[k] === "string" && ITEMS[eq[k]]; if (u) for (const x in b) b[x] += u[x] || 0; }
    return b;
  }
  function stylesFor(eq) {
    const w = weaponOf(eq).slot;
    if (w === "range") return [{ id: "range", name: "Genau", xp: "Fernkampf" }, { id: "rdef", name: "Weitschuss", xp: "Fernk. + Vert." }];
    if (w === "mage") return [{ id: "mage", name: "Zaubern", xp: "Magie" }, { id: "mdef", name: "Defensiv zaubern", xp: "Magie + Vert." }];
    return [{ id: "acc", name: "Genau", xp: "Angriff" }, { id: "aggr", name: "Aggressiv", xp: "Stärke" }, { id: "defn", name: "Defensiv", xp: "Verteidigung" }];
  }
  // boosts: Ergebnis von prayerBoosts()
  function playerAttack(lv, eq, style, m, boosts) {
    const B = boosts || prayerBoosts([]);
    const w = weaponOf(eq), X = extraBonus(eq);
    const mDefRoll = (m.def + 9) * (m.defBonus + 64);
    if (w.slot === "range") {
      const eff = Math.floor(lv.range * (1 + B.range)) + 8;
      return { chance: hitChance(eff * (w.atk + X.atk + X.ratk + 64), mDefRoll), max: Math.max(1, Math.floor(.5 + eff * (w.str + X.rstr + 64) / 640)) };
    }
    if (w.slot === "mage") {
      const eff = Math.floor(lv.mage * (1 + B.mage)) + 8;
      return { chance: hitChance(eff * (w.atk + X.atk + X.matk + 64), mDefRoll), max: Math.floor(w.spell * (1 + lv.mage / 200 + B.mage * .3 + X.mdmg / 100)) };
    }
    const eff = Math.floor(lv.att * (1 + B.att)) + 8 + (style === "acc" ? 3 : 0);
    const effStr = Math.floor(lv.str * (1 + B.str)) + 8 + (style === "aggr" ? 3 : 0);
    return { chance: hitChance(eff * (w.atk + X.atk + 64), mDefRoll), max: Math.max(1, Math.floor(.5 + effStr * (w.str + X.str + 64) / 640)) };
  }
  // mstyle: Angriffsart des Monsters. Schutzgebet blockt bei normalen Monstern alles, bei Bossen 60 %.
  function monsterAttack(lv, eq, m, style, mstyle, boosts) {
    const B = boosts || prayerBoosts([]);
    const defLv = Math.floor(lv.def * (1 + B.def)) + 9 + (style === "defn" || style === "rdef" || style === "mdef" ? 3 : 0);
    const defRoll = mstyle === "mage" ? (Math.floor(lv.mage * .7 + lv.def * .3) + 9) * (Math.floor(armourBonus(eq) * .5) + 64) : defLv * (armourBonus(eq) + 64);
    const protectedHit = B.protect === mstyle;
    return { chance: hitChance((m.att + 9) * 64, defRoll), max: m.max, mult: protectedHit ? (m.boss ? .4 : 0) : 1 };
  }
  function xpFor(style, dmg) {
    const x = dmg * 4 * XP_RATE, hp = Math.round(dmg * 1.33 * XP_RATE);
    if (style === "acc") return { att: x, hp };
    if (style === "aggr") return { str: x, hp };
    if (style === "defn") return { def: x, hp };
    if (style === "range") return { range: x, hp };
    if (style === "rdef") return { range: x / 2, def: x / 2, hp };
    if (style === "mdef") return { mage: Math.round(x / 3), def: Math.round(x / 4), hp };
    return { mage: x, hp };
  }
  function combatLevel(lv) {
    const base = .25 * (lv.def + lv.hp + Math.floor(lv.pray / 2));
    const melee = .325 * (lv.att + lv.str), range = .325 * Math.floor(1.5 * lv.range), mage = .325 * Math.floor(1.5 * lv.mage);
    return Math.floor(base + Math.max(melee, range, mage));
  }
  function levelColour(myCmb, theirLvl) {
    const d = theirLvl - myCmb;
    if (d <= -10) return "#00ff00";
    if (d <= -6) return "#40ff00";
    if (d <= -3) return "#80ff00";
    if (d < 0) return "#c0ff00";
    if (d === 0) return "#ffff00";
    if (d < 3) return "#ffc000";
    if (d < 6) return "#ff8000";
    if (d < 9) return "#ff4000";
    return "#ff0000";
  }

  root.Grind = { SETS, ITEMS, EXTRA_SLOTS, RARE_TABLE, openClue, extraBonus, XP_RATE, TICK_MS, XP_TABLE, levelFor, SKILLS, SKILL_NAME, TIER, NAMES, SLOTS, SLOT_KEYS, ARMOUR_SLOTS, FOOD, BONES, POTIONS, PRAYERS,
    prayerConflicts, prayerBoosts, MONSTERS, pickStyle, W_ATK, W_STR, SPELL, ARM, itemId, isGear, parseItem, foodOf, bonesOf, potionOf, itemName, itemPrice,
    baseValue, sellPrice, highAlch, ALCH_LEVEL, NATURE_PRICE, ALCH_XP, requirement, hitChance, playerAttack, monsterAttack, armourBonus, weaponOf, stylesFor,
    xpFor, combatLevel, levelColour };
})(typeof window !== "undefined" ? window : globalThis);
