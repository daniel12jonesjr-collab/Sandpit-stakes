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
    melee: ["Bronze scimitar", "Iron scimitar", "Steel scimitar", "Mithril scimitar", "Adamant scimitar", "Rune scimitar", "Dragon scimitar", "Abyssal whip", "Bandos godsword", "Scythe of vitur"],
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
    { id: "steel", name: "Steel Skin", lvl: 28, drain: .1, def: .15 },
    { id: "ustr", name: "Ultimate Strength", lvl: 31, drain: .1, str: .15 },
    { id: "irefl", name: "Incredible Reflexes", lvl: 34, drain: .1, att: .15 },
    { id: "pmage", name: "Protect from Magic", lvl: 37, drain: .2, protect: "mage" },
    { id: "prange", name: "Protect from Missiles", lvl: 40, drain: .2, protect: "range" },
    { id: "pmelee", name: "Protect from Melee", lvl: 43, drain: .2, protect: "melee" },
    { id: "eagle", name: "Eagle Eye", lvl: 44, drain: .1, range: .15 },
    { id: "mystic", name: "Mystic Might", lvl: 45, drain: .1, mage: .15 },
    { id: "piety", name: "Piety", lvl: 70, drain: .4, att: .2, str: .23, def: .25 },
    { id: "rigour", name: "Rigour", lvl: 74, drain: .4, range: .23, def: .25 },
    { id: "augury", name: "Augury", lvl: 77, drain: .4, mage: .25, def: .25 },
  ];
  // Gruppen, die sich gegenseitig ausschliessen
  const PRAYER_GROUP = { steel: "def", piety: "boost", rigour: "boost", augury: "boost", ustr: "str", irefl: "att", eagle: "range", mystic: "mage", pmage: "protect", prange: "protect", pmelee: "protect" };
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

  const itemId = (slot, t) => slot + ":" + t;
  const isGear = id => typeof id === "string" && id.includes(":");
  const parseItem = id => { const [s, t] = id.split(":"); return { slot: s, tier: +t }; };
  const foodOf = id => FOOD.find(f => f.id === id);
  const bonesOf = id => BONES.find(b => b.id === id);
  const potionOf = id => POTIONS.find(p => p.id === id);
  function itemName(id) {
    if (isGear(id)) { const { slot, tier } = parseItem(id); return NAMES[slot][tier]; }
    const x = foodOf(id) || bonesOf(id) || potionOf(id); return x ? x.name : id;
  }
  function itemPrice(slot, t) { return Math.round(PRICE[t] * SLOT_PRICE[slot]); }
  function baseValue(id) {
    if (isGear(id)) { const { slot, tier } = parseItem(id); return Math.round((PRICE[tier] || PRICE[6] * Math.pow(3, tier - 6)) * SLOT_PRICE[slot]); }
    const x = foodOf(id) || bonesOf(id) || potionOf(id); return x ? x.price : 0;
  }
  const sellPrice = id => Math.round(baseValue(id) * .35);
  const highAlch = id => Math.round(baseValue(id) * .6);
  const ALCH_LEVEL = 55, NATURE_PRICE = 180, ALCH_XP = 65;
  function requirement(id) {
    if (!isGear(id)) return null;
    const { slot, tier } = parseItem(id);
    return { skill: SLOTS[slot].skill, level: TIER[tier].req };
  }

  // ---------------- Monster / Orte. styles: Angriffsarten mit Gewicht (Bosse wechseln)
  const M = (o) => Object.assign({ atkSpeed: 4, defBonus: 0, size: 1, styles: [["melee", 1]] }, o);
  const MONSTERS = [
    M({ id: "chicken", name: "Chicken", place: "Lumbridge", lvl: 1, hp: 3, att: 1, def: 1, max: 1, gold: [1, 6], shape: "bird", col: "#ece6d3", ground: "grass", bones: "bones", drops: [["shrimps", 1, 4]] }),
    M({ id: "rat", name: "Giant rat", place: "Lumbridge Swamp", lvl: 4, hp: 7, att: 3, def: 3, max: 2, gold: [4, 14], shape: "rat", col: "#6f5a4a", ground: "swamp", bones: "bones", drops: [["shrimps", 2, 4], [itemId("helm", 1), 1, 30]] }),
    M({ id: "goblin", name: "Goblin", place: "Goblin Village", lvl: 9, hp: 13, att: 7, def: 6, max: 3, gold: [10, 35], shape: "goblin", col: "#6aa04a", ground: "grass", bones: "bones", drops: [["trout", 1, 4], [itemId("melee", 1), 1, 40], [itemId("shield", 2), 1, 60]] }),
    M({ id: "wolf", name: "White wolf", place: "White Wolf Mountain", lvl: 17, hp: 24, att: 15, def: 12, max: 5, gold: [25, 80], shape: "wolf", col: "#dfe3e8", ground: "snow", bones: "bones", drops: [["trout", 2, 3], [itemId("range", 2), 1, 45], [itemId("body", 2), 1, 70]] }),
    M({ id: "hillgiant", name: "Hill Giant", place: "Edgeville Dungeon", lvl: 28, hp: 38, att: 25, def: 22, max: 8, gold: [60, 200], shape: "giant", col: "#c9a27a", ground: "cave", size: 1.35, bones: "big_bones", drops: [["lobster", 1, 4], [itemId("melee", 3), 1, 40], [itemId("legs", 3), 1, 55]] }),
    M({ id: "troll", name: "Ice troll", place: "Jatizso", lvl: 45, hp: 50, att: 40, def: 38, max: 11, gold: [150, 500], shape: "troll", col: "#a9c4d2", ground: "snow", size: 1.3, bones: "big_bones", drops: [["lobster", 2, 3], ["prayer_potion", 1, 12], [itemId("body", 4), 1, 60], [itemId("mage", 4), 1, 50]] }),
    M({ id: "firegiant", name: "Fire giant", place: "Brimhaven Dungeon", lvl: 62, hp: 65, att: 55, def: 52, max: 15, gold: [400, 1200], shape: "giant", col: "#d0602f", ground: "lava", size: 1.5, bones: "big_bones", drops: [["shark", 1, 4], ["prayer_potion", 1, 10], [itemId("melee", 5), 1, 60], [itemId("helm", 5), 1, 45]] }),
    M({ id: "hellhound", name: "Hellhound", place: "Taverley Dungeon", lvl: 80, hp: 80, att: 72, def: 68, max: 19, gold: [900, 2600], shape: "hound", col: "#3a1f1c", ground: "lava", size: 1.2, bones: "bones", drops: [["shark", 2, 3], ["prayer_potion", 1, 8], [itemId("range", 5), 1, 50], [itemId("legs", 6), 1, 120]] }),
    M({ id: "demon", name: "Greater demon", place: "Chaos Tunnels", lvl: 100, hp: 100, att: 88, def: 84, max: 23, gold: [2000, 5000], shape: "demon", col: "#9b2020", ground: "lava", size: 1.5, bones: "big_bones", styles: [["melee", 3], ["mage", 1]], drops: [["shark", 2, 2], ["prayer_potion", 1, 6], [itemId("mage", 6), 1, 80], [itemId("shield", 6), 1, 70]] }),
    M({ id: "dragon", name: "Black dragon", place: "Taverley Dungeon", lvl: 125, hp: 130, att: 118, def: 102, max: 30, gold: [4000, 9000], shape: "dragon", col: "#2d2d33", ground: "cave", size: 1.6, bones: "dragon_bones", styles: [["melee", 2], ["mage", 1]], drops: [["manta", 1, 3], ["prayer_potion", 1, 5], [itemId("body", 6), 1, 45], [itemId("melee", 6), 1, 40], [itemId("helm", 6), 1, 35], [itemId("range", 6), 1, 50]] }),
    M({ id: "dharok", name: "Dharok the Wretched", place: "Barrows", lvl: 150, hp: 170, att: 142, def: 132, max: 38, gold: [7000, 15000], shape: "dharok", col: "#5f5a50", ground: "crypt", size: 1.15, boss: true, bones: "big_bones", drops: [["manta", 2, 2], ["prayer_potion", 2, 3], ...SLOT_KEYS.map(s => [itemId(s, 7), 1, 22])] }),
    M({ id: "graardor", name: "General Graardor", place: "God Wars Dungeon", lvl: 185, hp: 210, att: 168, def: 152, max: 44, gold: [12000, 26000], shape: "ogre", col: "#7a6a4a", ground: "dirt", size: 1.8, boss: true, bones: "big_bones", styles: [["melee", 3], ["range", 1]], drops: [["manta", 2, 2], ["prayer_potion", 2, 3], ...SLOT_KEYS.map(s => [itemId(s, 8), 1, 26])] }),
    M({ id: "nex", name: "Nex", place: "Ancient Prison", lvl: 240, hp: 280, att: 196, def: 178, max: 52, gold: [25000, 60000], shape: "nex", col: "#4a3a6a", ground: "void", size: 1.5, boss: true, bones: "dragon_bones", styles: [["melee", 1], ["range", 1], ["mage", 1]], drops: [["manta", 3, 2], ["prayer_potion", 2, 2], ...SLOT_KEYS.map(s => [itemId(s, 9), 1, 30])] }),
  ];
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
    for (const s of ARMOUR_SLOTS) if (eq[s] != null) def += Math.round(ARM[eq[s]] * SLOTS[s].mult);
    return def;
  }
  function weaponOf(eq) { return eq.weapon ? parseItem(eq.weapon) : { slot: "melee", tier: -1 }; }
  function stylesFor(eq) {
    const w = weaponOf(eq).slot;
    if (w === "range") return [{ id: "range", name: "Genau", xp: "Fernkampf" }];
    if (w === "mage") return [{ id: "mage", name: "Zaubern", xp: "Magie" }];
    return [{ id: "acc", name: "Genau", xp: "Angriff" }, { id: "aggr", name: "Aggressiv", xp: "Stärke" }, { id: "defn", name: "Defensiv", xp: "Verteidigung" }];
  }
  // boosts: Ergebnis von prayerBoosts()
  function playerAttack(lv, eq, style, m, boosts) {
    const B = boosts || prayerBoosts([]);
    const w = weaponOf(eq), t = w.tier;
    const mDefRoll = (m.def + 9) * (m.defBonus + 64);
    if (w.slot === "range") {
      const eff = Math.floor(lv.range * (1 + B.range)) + 8;
      return { chance: hitChance(eff * (W_ATK[t] + 64), mDefRoll), max: Math.max(1, Math.floor(.5 + eff * (W_STR[t] + 64) / 640)) };
    }
    if (w.slot === "mage") {
      const eff = Math.floor(lv.mage * (1 + B.mage)) + 8;
      return { chance: hitChance(eff * (W_ATK[t] + 64), mDefRoll), max: Math.floor(SPELL[t] * (1 + lv.mage / 200 + B.mage * .3)) };
    }
    const atk = t >= 0 ? W_ATK[t] : 0, str = t >= 0 ? W_STR[t] : 0;
    const eff = Math.floor(lv.att * (1 + B.att)) + 8 + (style === "acc" ? 3 : 0);
    const effStr = Math.floor(lv.str * (1 + B.str)) + 8 + (style === "aggr" ? 3 : 0);
    return { chance: hitChance(eff * (atk + 64), mDefRoll), max: Math.max(1, Math.floor(.5 + effStr * (str + 64) / 640)) };
  }
  // mstyle: Angriffsart des Monsters. Schutzgebet blockt bei normalen Monstern alles, bei Bossen 60 %.
  function monsterAttack(lv, eq, m, style, mstyle, boosts) {
    const B = boosts || prayerBoosts([]);
    const defLv = Math.floor(lv.def * (1 + B.def)) + 9 + (style === "defn" ? 3 : 0);
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

  root.Grind = { XP_RATE, TICK_MS, XP_TABLE, levelFor, SKILLS, SKILL_NAME, TIER, NAMES, SLOTS, SLOT_KEYS, ARMOUR_SLOTS, FOOD, BONES, POTIONS, PRAYERS,
    prayerConflicts, prayerBoosts, MONSTERS, pickStyle, W_ATK, W_STR, SPELL, ARM, itemId, isGear, parseItem, foodOf, bonesOf, potionOf, itemName, itemPrice,
    baseValue, sellPrice, highAlch, ALCH_LEVEL, NATURE_PRICE, ALCH_XP, requirement, hitChance, playerAttack, monsterAttack, armourBonus, weaponOf, stylesFor,
    xpFor, combatLevel, levelColour };
})(typeof window !== "undefined" ? window : globalThis);
