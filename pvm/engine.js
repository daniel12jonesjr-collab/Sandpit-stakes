// ============================================================
// Sandpit Grind – Spielregeln (reine Logik, ohne Grafik)
// Wird in index.html eingebaut und von test.js geprueft.
// Inoffizielles Fan-Projekt: Item- und Monsternamen wie im Original,
// alle Grafiken sind selbst gebaut.
// ============================================================
(function (root) {
  "use strict";

  const XP_RATE = 45;          // schnelllebig: 45-fache Erfahrung
  const TICK_MS = 600;         // ein Spiel-Tick

  // Klassische Erfahrungs-Tabelle (Stufe 99 = 13.034.431 XP)
  const XP_TABLE = [0, 0];
  (function () { let pts = 0; for (let l = 1; l < 99; l++) { pts += Math.floor(l + 300 * Math.pow(2, l / 7)); XP_TABLE[l + 1] = Math.floor(pts / 4); } })();
  function levelFor(xp) { let l = 1; while (l < 99 && xp >= XP_TABLE[l + 1]) l++; return l; }

  const SKILLS = ["att", "str", "def", "range", "mage", "hp"];
  const SKILL_NAME = { att: "Angriff", str: "Stärke", def: "Verteidigung", range: "Fernkampf", mage: "Magie", hp: "Lebenspunkte" };

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
  // Item-Namen wie im Original
  const NAMES = {
    melee: ["Bronze scimitar", "Iron scimitar", "Steel scimitar", "Mithril scimitar", "Adamant scimitar", "Rune scimitar", "Dragon scimitar", "Abyssal whip", "Bandos godsword", "Scythe of vitur"],
    range: ["Shortbow", "Oak shortbow", "Willow shortbow", "Maple shortbow", "Yew shortbow", "Magic shortbow", "Dragon crossbow", "Karil's crossbow", "Armadyl crossbow", "Twisted bow"],
    mage: ["Staff of air", "Staff of water", "Staff of earth", "Staff of fire", "Battlestaff", "Mystic fire staff", "Ancient staff", "Ahrim's staff", "Staff of the dead", "Tumeken's shadow"],
    helm: ["Bronze full helm", "Iron full helm", "Steel full helm", "Mithril full helm", "Adamant full helm", "Rune full helm", "Dragon full helm", "Dharok's helm", "Neitiznot faceguard", "Torva full helm"],
    body: ["Bronze platebody", "Iron platebody", "Steel platebody", "Mithril platebody", "Adamant platebody", "Rune platebody", "Dragon platebody", "Dharok's platebody", "Bandos chestplate", "Torva platebody"],
    legs: ["Bronze platelegs", "Iron platelegs", "Steel platelegs", "Mithril platelegs", "Adamant platelegs", "Rune platelegs", "Dragon platelegs", "Dharok's platelegs", "Bandos tassets", "Torva platelegs"],
    shield: ["Bronze kiteshield", "Iron kiteshield", "Steel kiteshield", "Mithril kiteshield", "Adamant kiteshield", "Rune kiteshield", "Dragon kiteshield", "Dragon defender", "Avernic defender", "Elysian spirit shield"],
  };
  const W_ATK = [4, 7, 11, 16, 22, 30, 40, 54, 68, 84];     // Treffer-Bonus Waffe
  const W_STR = [3, 6, 10, 15, 22, 30, 42, 56, 70, 86];     // Schaden-Bonus Waffe (Nah/Fern)
  const SPELL = [5, 7, 9, 12, 14, 17, 21, 26, 31, 37];      // Zauber-Max-Hit je Stab-Stufe
  const ARM = [2, 4, 6, 9, 12, 16, 22, 30, 38, 48];         // Verteidigung je Helm-Einheit
  const SLOTS = {
    melee: { kind: "weapon", style: "melee", skill: "att", label: "Waffe" },
    range: { kind: "weapon", style: "range", skill: "range", label: "Waffe" },
    mage: { kind: "weapon", style: "mage", skill: "mage", label: "Waffe" },
    helm: { kind: "armour", mult: 1, skill: "def", label: "Kopf" },
    body: { kind: "armour", mult: 3, skill: "def", label: "Körper" },
    legs: { kind: "armour", mult: 2, skill: "def", label: "Beine" },
    shield: { kind: "armour", mult: 1.5, skill: "def", label: "Schild" },
  };
  const SLOT_KEYS = Object.keys(SLOTS);
  const ARMOUR_SLOTS = ["helm", "body", "legs", "shield"];
  const PRICE = [40, 160, 600, 2500, 9000, 35000, 140000, 0, 0, 0];   // 0 = nur als Drop
  const SLOT_PRICE = { melee: 1.4, range: 1.4, mage: 1.4, helm: .8, body: 2, legs: 1.5, shield: 1.1 };

  const FOOD = [
    { id: "shrimps", name: "Shrimps", heal: 3, price: 8 },
    { id: "trout", name: "Trout", heal: 7, price: 30 },
    { id: "lobster", name: "Lobster", heal: 12, price: 110 },
    { id: "shark", name: "Shark", heal: 20, price: 420 },
    { id: "manta", name: "Manta ray", heal: 22, price: 1100 },
  ];

  const itemId = (slot, t) => slot + ":" + t;
  const isGear = id => typeof id === "string" && id.includes(":");
  const parseItem = id => { const [s, t] = id.split(":"); return { slot: s, tier: +t }; };
  const foodOf = id => FOOD.find(f => f.id === id);
  function itemName(id) {
    if (!isGear(id)) { const f = foodOf(id); return f ? f.name : id; }
    const { slot, tier } = parseItem(id); return NAMES[slot][tier];
  }
  function itemPrice(slot, t) { return Math.round(PRICE[t] * SLOT_PRICE[slot]); }
  function sellPrice(id) {
    if (!isGear(id)) { const f = foodOf(id); return f ? Math.floor(f.price * .4) : 0; }
    const { slot, tier } = parseItem(id);
    const p = PRICE[tier] || PRICE[6] * Math.pow(3, tier - 6);
    return Math.round(p * SLOT_PRICE[slot] * .35);
  }
  function requirement(id) {
    if (!isGear(id)) return null;
    const { slot, tier } = parseItem(id);
    return { skill: SLOTS[slot].skill, level: TIER[tier].req };
  }

  // ---------------- Monster / Orte
  const M = (o) => Object.assign({ atkSpeed: 4, defBonus: 0, size: 1 }, o);
  const MONSTERS = [
    M({ id: "chicken", name: "Chicken", place: "Lumbridge", lvl: 1, hp: 3, att: 1, def: 1, max: 1, gold: [1, 6], shape: "bird", col: "#ece6d3", ground: "grass", drops: [["shrimps", 1, 4]] }),
    M({ id: "rat", name: "Giant rat", place: "Lumbridge Swamp", lvl: 4, hp: 7, att: 3, def: 3, max: 2, gold: [4, 14], shape: "quad", col: "#6f5a4a", ground: "swamp", size: .75, drops: [["shrimps", 2, 4], [itemId("helm", 1), 1, 30]] }),
    M({ id: "goblin", name: "Goblin", place: "Goblin Village", lvl: 9, hp: 13, att: 7, def: 6, max: 3, gold: [10, 35], shape: "biped", col: "#6aa04a", ground: "grass", size: .8, drops: [["trout", 1, 4], [itemId("melee", 1), 1, 40], [itemId("shield", 2), 1, 60]] }),
    M({ id: "wolf", name: "White wolf", place: "White Wolf Mountain", lvl: 17, hp: 24, att: 15, def: 12, max: 5, gold: [25, 80], shape: "quad", col: "#d7dbe0", ground: "snow", drops: [["trout", 2, 3], [itemId("range", 2), 1, 45], [itemId("body", 2), 1, 70]] }),
    M({ id: "hillgiant", name: "Hill Giant", place: "Edgeville Dungeon", lvl: 28, hp: 38, att: 25, def: 22, max: 8, gold: [60, 200], shape: "biped", col: "#c9a27a", ground: "cave", size: 1.45, club: true, drops: [["lobster", 1, 4], [itemId("melee", 3), 1, 40], [itemId("legs", 3), 1, 55]] }),
    M({ id: "troll", name: "Ice troll", place: "Jatizso", lvl: 45, hp: 50, att: 40, def: 38, max: 11, gold: [150, 500], shape: "biped", col: "#9fb7c4", ground: "snow", size: 1.4, club: true, drops: [["lobster", 2, 3], [itemId("body", 4), 1, 60], [itemId("mage", 4), 1, 50]] }),
    M({ id: "firegiant", name: "Fire giant", place: "Brimhaven Dungeon", lvl: 62, hp: 65, att: 55, def: 52, max: 15, gold: [400, 1200], shape: "biped", col: "#d0602f", ground: "lava", size: 1.6, club: true, drops: [["shark", 1, 4], [itemId("melee", 5), 1, 60], [itemId("helm", 5), 1, 45]] }),
    M({ id: "hellhound", name: "Hellhound", place: "Taverley Dungeon", lvl: 80, hp: 80, att: 72, def: 68, max: 19, gold: [900, 2600], shape: "quad", col: "#3a1f1c", ground: "lava", size: 1.25, drops: [["shark", 2, 3], [itemId("range", 5), 1, 50], [itemId("legs", 6), 1, 120]] }),
    M({ id: "demon", name: "Greater demon", place: "Chaos Tunnels", lvl: 100, hp: 100, att: 88, def: 84, max: 23, gold: [2000, 5000], shape: "demon", col: "#9b2020", ground: "lava", size: 1.6, drops: [["shark", 2, 2], [itemId("mage", 6), 1, 80], [itemId("shield", 6), 1, 70]] }),
    M({ id: "dragon", name: "Black dragon", place: "Taverley Dungeon", lvl: 125, hp: 130, att: 118, def: 102, max: 30, gold: [4000, 9000], shape: "dragon", col: "#2d2d33", ground: "cave", size: 1.6, drops: [["manta", 1, 3], [itemId("body", 6), 1, 45], [itemId("melee", 6), 1, 40], [itemId("helm", 6), 1, 35], [itemId("range", 6), 1, 50]] }),
    M({ id: "dharok", name: "Dharok the Wretched", place: "Barrows", lvl: 150, hp: 170, att: 142, def: 132, max: 38, gold: [7000, 15000], shape: "wight", col: "#5f5a50", ground: "crypt", size: 1.15, boss: true, drops: [["manta", 2, 2], ...SLOT_KEYS.map(s => [itemId(s, 7), 1, 22])] }),
    M({ id: "graardor", name: "General Graardor", place: "God Wars Dungeon", lvl: 185, hp: 210, att: 168, def: 152, max: 44, gold: [12000, 26000], shape: "ogre", col: "#7a6a4a", ground: "dirt", size: 1.9, boss: true, drops: [["manta", 2, 2], ...SLOT_KEYS.map(s => [itemId(s, 8), 1, 26])] }),
    M({ id: "nex", name: "Nex", place: "Ancient Prison", lvl: 240, hp: 280, att: 196, def: 178, max: 52, gold: [25000, 60000], shape: "nex", col: "#4a3a6a", ground: "void", size: 1.5, boss: true, drops: [["manta", 3, 2], ...SLOT_KEYS.map(s => [itemId(s, 9), 1, 30])] }),
  ];

  // ---------------- Kampf-Formeln (klassisches Angriffs-/Verteidigungs-Wurf-Prinzip)
  function hitChance(attRoll, defRoll) {
    return attRoll > defRoll ? 1 - (defRoll + 2) / (2 * (attRoll + 1)) : attRoll / (2 * (defRoll + 1));
  }
  function armourBonus(eq) {
    let def = 0;
    for (const s of ARMOUR_SLOTS) if (eq[s] != null) def += Math.round(ARM[eq[s]] * SLOTS[s].mult);
    return def;
  }
  // eq = { weapon: "melee:3" | null, helm: tier|null, body, legs, shield }
  function weaponOf(eq) { return eq.weapon ? parseItem(eq.weapon) : { slot: "melee", tier: -1 }; }
  function stylesFor(eq) {
    const w = weaponOf(eq).slot;
    if (w === "range") return [{ id: "range", name: "Genau", xp: "Fernkampf" }];
    if (w === "mage") return [{ id: "mage", name: "Zaubern", xp: "Magie" }];
    return [{ id: "acc", name: "Genau", xp: "Angriff" }, { id: "aggr", name: "Aggressiv", xp: "Stärke" }, { id: "defn", name: "Defensiv", xp: "Verteidigung" }];
  }
  function playerAttack(lv, eq, style, m) {
    const w = weaponOf(eq), t = w.tier;
    const mDefRoll = (m.def + 9) * (m.defBonus + 64);
    if (w.slot === "range") {
      const eff = lv.range + 8;
      return { chance: hitChance(eff * (W_ATK[t] + 64), mDefRoll), max: Math.max(1, Math.floor(.5 + eff * (W_STR[t] + 64) / 640)) };
    }
    if (w.slot === "mage") {
      const eff = lv.mage + 8;
      return { chance: hitChance(eff * (W_ATK[t] + 64), mDefRoll), max: Math.floor(SPELL[t] * (1 + lv.mage / 200)) };
    }
    const atk = t >= 0 ? W_ATK[t] : 0, str = t >= 0 ? W_STR[t] : 0;
    const eff = lv.att + 8 + (style === "acc" ? 3 : 0), effStr = lv.str + 8 + (style === "aggr" ? 3 : 0);
    return { chance: hitChance(eff * (atk + 64), mDefRoll), max: Math.max(1, Math.floor(.5 + effStr * (str + 64) / 640)) };
  }
  function monsterAttack(lv, eq, m, style) {
    const defLv = lv.def + 9 + (style === "defn" ? 3 : 0);
    return { chance: hitChance((m.att + 9) * 64, defLv * (armourBonus(eq) + 64)), max: m.max };
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
    const base = .25 * (lv.def + lv.hp);
    const melee = .325 * (lv.att + lv.str), range = .325 * Math.floor(1.5 * lv.range), mage = .325 * Math.floor(1.5 * lv.mage);
    return Math.floor(base + Math.max(melee, range, mage));
  }
  // Farbe der Monster-Stufe relativ zur eigenen Kampfstufe (gruen = schwaecher, rot = staerker)
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

  root.Grind = { XP_RATE, TICK_MS, XP_TABLE, levelFor, SKILLS, SKILL_NAME, TIER, NAMES, SLOTS, SLOT_KEYS, ARMOUR_SLOTS, FOOD, MONSTERS,
    W_ATK, W_STR, SPELL, ARM, itemId, isGear, parseItem, foodOf, itemName, itemPrice, sellPrice, requirement,
    hitChance, playerAttack, monsterAttack, armourBonus, weaponOf, stylesFor, xpFor, combatLevel, levelColour };
})(typeof window !== "undefined" ? window : globalThis);
