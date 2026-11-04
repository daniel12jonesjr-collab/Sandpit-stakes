// Offline-Speicher fuer die installierte App.
// Seite + version.json: immer erst frisch aus dem Netz (Updates kommen sofort an), ohne Netz aus dem Speicher.
// Icons und Schriften: erst Speicher, sonst Netz.
const CACHE = "sandpit-grind-2d-v5";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png", "fonts/digits.woff2", "sprites/m_abyssal.png", "sprites/m_darkbeast.png", "sprites/m_demon.png", "sprites/m_dharok.png", "sprites/m_dragon.png", "sprites/m_firegiant.png", "sprites/m_gargoyle.png", "sprites/m_goblin.png", "sprites/m_graardor.png", "sprites/m_hellhound.png", "sprites/m_hillgiant.png", "sprites/m_kbd.png", "sprites/m_nex.png", "sprites/m_rat.png", "sprites/m_troll.png", "sprites/m_wolf.png", "sprites/p_ahrims_hood.png", "sprites/p_ahrims_robeskirt.png", "sprites/p_ahrims_robetop.png", "sprites/p_ancestral_hat.png", "sprites/p_ancestral_robe_bottom.png", "sprites/p_ancestral_robe_top.png", "sprites/p_armadyl_chainskirt.png", "sprites/p_armadyl_chestplate.png", "sprites/p_armadyl_helmet.png", "sprites/p_barrows_gloves.png", "sprites/p_black_dhide_body.png", "sprites/p_black_dhide_chaps.png", "sprites/p_black_dhide_vambs.png", "sprites/p_blue_dhide_body.png", "sprites/p_blue_dhide_chaps.png", "sprites/p_body.png", "sprites/p_body0.png", "sprites/p_body1.png", "sprites/p_body2.png", "sprites/p_body3.png", "sprites/p_body4.png", "sprites/p_body5.png", "sprites/p_body6.png", "sprites/p_body7.png", "sprites/p_body8.png", "sprites/p_body9.png", "sprites/p_capeB_avas_accumulator.png", "sprites/p_capeB_fire_cape.png", "sprites/p_capeB_infernal_cape.png", "sprites/p_capeB_obsidian_cape.png", "sprites/p_capeF_avas_accumulator.png", "sprites/p_capeF_fire_cape.png", "sprites/p_capeF_infernal_cape.png", "sprites/p_capeF_obsidian_cape.png", "sprites/p_coif.png", "sprites/p_combat_bracelet.png", "sprites/p_dragon_boots.png", "sprites/p_eternal_boots.png", "sprites/p_ferocious_gloves.png", "sprites/p_green_dhide_body.png", "sprites/p_green_dhide_chaps.png", "sprites/p_green_dhide_vambs.png", "sprites/p_hair.png", "sprites/p_helm0.png", "sprites/p_helm1.png", "sprites/p_helm2.png", "sprites/p_helm3.png", "sprites/p_helm4.png", "sprites/p_helm5.png", "sprites/p_helm6.png", "sprites/p_helm7.png", "sprites/p_helm8.png", "sprites/p_helm9.png", "sprites/p_infinity_bottoms.png", "sprites/p_infinity_hat.png", "sprites/p_infinity_top.png", "sprites/p_karils_coif.png", "sprites/p_karils_skirt.png", "sprites/p_karils_top.png", "sprites/p_legs0.png", "sprites/p_legs1.png", "sprites/p_legs2.png", "sprites/p_legs3.png", "sprites/p_legs4.png", "sprites/p_legs5.png", "sprites/p_legs6.png", "sprites/p_legs7.png", "sprites/p_legs8.png", "sprites/p_legs9.png", "sprites/p_masori_body.png", "sprites/p_masori_chaps.png", "sprites/p_masori_mask.png", "sprites/p_mystic_hat.png", "sprites/p_mystic_robe_bottom.png", "sprites/p_mystic_robe_top.png", "sprites/p_pants.png", "sprites/p_primordial_boots.png", "sprites/p_ranger_boots.png", "sprites/p_red_dhide_body.png", "sprites/p_red_dhide_chaps.png", "sprites/p_rune_boots.png", "sprites/p_shield0.png", "sprites/p_shield1.png", "sprites/p_shield2.png", "sprites/p_shield3.png", "sprites/p_shield4.png", "sprites/p_shield5.png", "sprites/p_shield6.png", "sprites/p_shield7.png", "sprites/p_shield8.png", "sprites/p_shield9.png", "sprites/p_shirt.png", "sprites/p_wizard_hat.png", "sprites/p_wizard_robe_skirt.png", "sprites/p_wizard_robe_top.png", "sprites/w_darkbow.png", "sprites/w_mage0.png", "sprites/w_mage1.png", "sprites/w_mage2.png", "sprites/w_mage3.png", "sprites/w_mage4.png", "sprites/w_mage5.png", "sprites/w_mage6.png", "sprites/w_mage7.png", "sprites/w_mage8.png", "sprites/w_mage9.png", "sprites/w_maul.png", "sprites/w_melee0.png", "sprites/w_melee1.png", "sprites/w_melee2.png", "sprites/w_melee3.png", "sprites/w_melee4.png", "sprites/w_melee5.png", "sprites/w_melee6.png", "sprites/w_melee7.png", "sprites/w_melee8.png", "sprites/w_melee9.png", "sprites/w_range0.png", "sprites/w_range1.png", "sprites/w_range2.png", "sprites/w_range3.png", "sprites/w_range4.png", "sprites/w_range5.png", "sprites/w_range6.png", "sprites/w_range7.png", "sprites/w_range8.png", "sprites/w_range9.png", "sprites/w_whip.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const fresh = e.request.mode === "navigate" || url.pathname.endsWith("version.json") || url.pathname.endsWith("index.html");
  if (fresh) {
    e.respondWith(fetch(e.request.url, { cache: "no-store" }).then(res => {
      if (e.request.mode === "navigate") { const copy = res.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); }
      return res;
    }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    if (res.ok || res.type === "opaque") caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  })));
});
