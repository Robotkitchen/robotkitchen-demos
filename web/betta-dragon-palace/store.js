(function () {
  "use strict";

  /**
   * Betta Home — Robot Kitchen portfolio demo.
   * Fictional aquarium-grade live betta + supplies shop.
   * Pattern: Night Coil / WEAN (POST /api/create-checkout-session, Stripe TEST).
   * Order numbers: BDP-xxxxxx
   * Images: original SVG / Pillow mark art (no third-party photos).
   */
  const TAX_RATE = 0.06625; // NJ sales tax on goods
  const CART_KEY = "bdp_demo_cart_v1";
  const RK_CARD_KEY = "rk_source_card_dismissed_bdp";
  const CHECKOUT_API = "/api/create-checkout-session";
  const PAYLOAD_KEY = "bdp_demo_checkout_payload";
  const BASE = "/demo/web/betta-dragon-palace";

  const SHIP_OPTIONS = [
    { id: "overnight", label: "Overnight live / express", price: 48, liveOk: true },
    { id: "ground", label: "Ground (supplies only)", price: 9.5, liveOk: false },
    { id: "pickup", label: "Local pickup — demo studio", price: 0, liveOk: true }
  ];

  const CATEGORIES = [
    "Live Bettas",
    "Food",
    "Tanks & Kits",
    "Heaters & Thermometers",
    "Filters",
    "Water Care & Tests",
    "Leaves & Botanicals",
    "Hides & Caves",
    "Plants",
    "Substrate",
    "Lighting",
    "Shipping & Acclimation",
    "Medications & Salts",
    "Cleaning Tools",
    "Breeding Supplies",
    "Quarantine"
  ];

  const PRODUCTS = [
    // Live Bettas
    { id: "crimson-veil", category: "Live Bettas", live: true, name: "Crimson Veil Halfmoon", blurb: "Deep red halfmoon male. Demo listing — fictional lineage name.", price: 48, img: "img/crimson-veil.jpg", options: { size: { label: "Age class", type: "radio", required: true, choices: [{ id: "young", label: "Young adult", price: 0 }, { id: "show", label: "Show size (+$18)", price: 18 }] } } },
    { id: "violet-emperor", category: "Live Bettas", live: true, name: "Violet Emperor", blurb: "Purple-iridescent crown-tail style fins. Demo fish.", price: 52, img: "img/violet-emperor.jpg", options: { size: { label: "Age class", type: "radio", required: true, choices: [{ id: "young", label: "Young adult", price: 0 }, { id: "show", label: "Show size (+$18)", price: 18 }] } } },
    { id: "teal-dragon", category: "Live Bettas", live: true, name: "Teal Dragon", blurb: "Teal body with dragon-scale shimmer. Demo fish.", price: 56, img: "img/teal-dragon.jpg", options: {} },
    { id: "amber-crown", category: "Live Bettas", live: true, name: "Amber Crown", blurb: "Warm amber plakat with full crown dorsal. Demo fish.", price: 44, img: "img/amber-crown.jpg", options: {} },
    { id: "pearl-ghost", category: "Live Bettas", live: true, name: "Pearl Ghost", blurb: "Pale pearl body with soft fin wash. Demo fish.", price: 46, img: "img/pearl-ghost.jpg", options: {} },
    { id: "galaxy-koi", category: "Live Bettas", live: true, name: "Galaxy Koi", blurb: "Koi-pattern blue/white marbling. Demo fish.", price: 62, img: "img/galaxy-koi.jpg", options: { size: { label: "Age class", type: "radio", required: true, choices: [{ id: "young", label: "Young adult", price: 0 }, { id: "show", label: "Show size (+$22)", price: 22 }] } } },

    // Food
    { id: "palace-pellets", category: "Food", live: false, name: "Palace Daily Pellets", blurb: "Slow-sinking demo pellets sized for bettas.", price: 12.5, img: "img/palace-pellets.jpg", options: { size: { label: "Jar size", type: "radio", required: true, choices: [{ id: "sm", label: "30 g", price: 0 }, { id: "lg", label: "90 g (+$8)", price: 8 }] } } },
    { id: "frozen-bloodworms", category: "Food", live: false, name: "Frozen Bloodworm Cubes", blurb: "Demo frozen treat pack (shipped with cold pack when available).", price: 9.75, img: "img/frozen-bloodworms.jpg", options: {} },
    { id: "dragon-pellets", category: "Food", live: false, name: "Dragon Color Boost", blurb: "Color-support formula — fictional demo SKU.", price: 14, img: "img/dragon-pellets.jpg", options: {} },

    // Tanks & Kits
    { id: "nano-palace-5", category: "Tanks & Kits", live: false, name: "Nano Palace 5-Gallon", blurb: "Clear glass cube starter tank. Demo kit shell.", price: 54, img: "img/nano-palace-5.jpg", options: { kit: { label: "Bundle", type: "radio", required: true, choices: [{ id: "tank", label: "Tank only", price: 0 }, { id: "starter", label: "Starter kit (+$39)", price: 39 }] } } },
    { id: "palace-10", category: "Tanks & Kits", live: false, name: "Palace Ten 10-Gallon", blurb: "Roomier glass tank for planted setups. Demo SKU.", price: 78, img: "img/palace-10.jpg", options: {} },

    // 1. Heaters & thermometers
    { id: "ember-heater", category: "Heaters & Thermometers", live: false, name: "Ember Adjustable Heater 50W", blurb: "Demo adjustable heater for small tropical tanks.", price: 24, img: "img/ember-heater.jpg", options: { watt: { label: "Wattage", type: "radio", required: true, choices: [{ id: "50", label: "50W", price: 0 }, { id: "100", label: "100W (+$8)", price: 8 }] } } },
    { id: "tide-thermometer", category: "Heaters & Thermometers", live: false, name: "Tide Stick Thermometer", blurb: "Demo glass stick thermometer for spot checks.", price: 7.5, img: "img/tide-thermometer.jpg", options: {} },

    // 2. Filters
    { id: "whisper-sponge", category: "Filters", live: false, name: "Whisper Sponge Filter", blurb: "Gentle biological sponge — demo low-flow filter.", price: 16, img: "img/whisper-sponge.jpg", options: { pack: { label: "Include air pump?", type: "radio", required: true, choices: [{ id: "sponge", label: "Sponge only", price: 0 }, { id: "kit", label: "With air pump (+$22)", price: 22 }] } } },
    { id: "softflow-filter", category: "Filters", live: false, name: "Softflow Internal Filter", blurb: "Adjustable low-current internal filter. Demo SKU.", price: 19, img: "img/softflow-filter.jpg", options: {} },

    // 3. Water care & tests
    { id: "crystal-drops", category: "Water Care & Tests", live: false, name: "Crystal Conditioner", blurb: "Demo tap-water conditioner drops.", price: 11, img: "img/crystal-drops.jpg", options: { size: { label: "Bottle", type: "radio", required: true, choices: [{ id: "100", label: "100 ml", price: 0 }, { id: "250", label: "250 ml (+$7)", price: 7 }] } } },
    { id: "cycle-start", category: "Water Care & Tests", live: false, name: "Cycle Start Bacteria", blurb: "Demo bottled bacteria starter for new tanks.", price: 13.5, img: "img/cycle-start.jpg", options: {} },
    { id: "palace-test-kit", category: "Water Care & Tests", live: false, name: "Palace Liquid Test Kit", blurb: "Demo kit for ammonia, nitrite, nitrate, pH.", price: 32, img: "img/palace-test-kit.jpg", options: {} },

    // 4. Leaves & botanicals
    { id: "catappa-leaf", category: "Leaves & Botanicals", live: false, name: "Catappa Leaf Pack (10)", blurb: "Demo Indian almond leaf pack for blackwater tint.", price: 8.5, img: "img/catappa-leaf.jpg", options: {} },
    { id: "mopani-drift", category: "Leaves & Botanicals", live: false, name: "Mopani Drift Accent", blurb: "Demo tannin-releasing wood piece (smooth edges).", price: 14, img: "img/mopani-drift.jpg", options: {} },

    // 5. Hammocks
    
    // 6. Hides
    { id: "coconut-hide", category: "Hides & Caves", live: false, name: "Coconut Hideaway", blurb: "Demo smooth coconut cave hide.", price: 9, img: "img/coconut-hide.jpg", options: {} },
    
    // 7. Plants
    { id: "java-fern", category: "Plants", live: false, name: "Java Fern Cluster", blurb: "Demo live-plant style listing (illustration).", price: 11, img: "img/java-fern.jpg", options: {} },
    { id: "marimo-orb", category: "Plants", live: false, name: "Marimo Orb", blurb: "Demo moss orb accent.", price: 10, img: "img/marimo-orb.jpg", options: {} },
    
    // 8. Substrate
    { id: "palace-gravel", category: "Substrate", live: false, name: "Palace Smooth Gravel", blurb: "Rounded demo gravel, 5 lb bag.", price: 9, img: "img/palace-gravel.jpg", options: { color: { label: "Color", type: "radio", required: true, choices: [{ id: "slate", label: "Slate", price: 0 }, { id: "sandstone", label: "Sandstone", price: 0 }] } } },
    { id: "betta-sand", category: "Substrate", live: false, name: "River Soft Sand", blurb: "Fine soft sand — demo 5 lb bag.", price: 10.5, img: "img/betta-sand.jpg", options: {} },

    // 9. Lighting
    { id: "aurora-led", category: "Lighting", live: false, name: "Aurora LED Bar", blurb: "Demo LED light bar with gentle modes.", price: 36, img: "img/aurora-led.jpg", options: { timer: { label: "Timer", type: "radio", required: true, choices: [{ id: "none", label: "Bar only", price: 0 }, { id: "timer", label: "With timer (+$14)", price: 14 }] } } },

    // 10. Lids
    
    // 11. Breeders / dividers
        
    // 12. Shipping & acclimation
    { id: "ship-heat-pack", category: "Shipping & Acclimation", live: false, name: "72-Hour Heat Pack (2)", blurb: "Demo heat packs for insulated live shipping kits.", price: 8, img: "img/ship-heat-pack.jpg", options: {} },
    { id: "breather-bags", category: "Shipping & Acclimation", live: false, name: "Breather Bag Pack (10)", blurb: "Demo transport bags for short moves.", price: 11, img: "img/breather-bags.jpg", options: {} },

    // 13. Medications & salts
    { id: "fin-mend", category: "Medications & Salts", live: false, name: "Fin Mend Treatment", blurb: "Demo bottle for mild fin issues — fictional formula.", price: 10, img: "img/fin-mend.jpg", options: {} },
    { id: "parasite-guard", category: "Medications & Salts", live: false, name: "Parasite Guard", blurb: "Demo external-parasite support treatment.", price: 14, img: "img/parasite-guard.jpg", options: {} },
    { id: "palace-salt", category: "Medications & Salts", live: false, name: "Palace Aquarium Salt", blurb: "Demo aquarium salt — dose carefully (label is fictional).", price: 6.5, img: "img/palace-salt.jpg", options: {} },

    // 14. Cleaning
        { id: "soft-net", category: "Cleaning Tools", live: false, name: "Soft Mesh Net", blurb: "Fine soft net — demo QT-friendly tool.", price: 5.5, img: "img/soft-net.jpg", options: {} },

    // 15. Enrichment
        
    // 16. Feeding tools
        
    // 17. Breeding
    { id: "brine-hatchery", category: "Breeding Supplies", live: false, name: "Brine Hatchery Kit", blurb: "Demo hatchery jar kit for baby brine shrimp.", price: 28, img: "img/brine-hatchery.jpg", options: {} },
    { id: "nest-anchor", category: "Breeding Supplies", live: false, name: "Bubble Nest Anchor", blurb: "Demo floating nest base disc.", price: 5, img: "img/nest-anchor.jpg", options: {} },

    // 18. Quarantine
    { id: "qt-starter", category: "Quarantine", live: false, name: "QT Starter Bundle", blurb: "Demo bare-bottom QT bundle: sponge, heater sleeve, hide.", price: 49, img: "img/qt-starter.jpg", options: {} }
  ];

  const state = {
    category: "all",
    cart: loadCart(),
    shipId: "overnight",
    fulfill: "ship",
    name: "",
    phone: "",
    email: "",
    note: "",
    address: "",
    modal: null,
    modalQty: 1,
    modalOpts: {},
    paying: false,
    payError: ""
  };

  function loadCart() {
    try {
      const raw = sessionStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    sessionStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  }

  function money(n) {
    return "$" + (Math.round(n * 100) / 100).toFixed(2);
  }

  function productById(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function cartHasLive() {
    return state.cart.some((l) => {
      const p = productById(l.id);
      return p && p.live;
    });
  }

  function allowedShipOptions() {
    const live = cartHasLive();
    return SHIP_OPTIONS.filter((s) => !live || s.liveOk);
  }

  function ensureShipValid() {
    const allowed = allowedShipOptions();
    if (!allowed.find((s) => s.id === state.shipId)) {
      // Prefer ground for supplies-only; overnight when live is in cart.
      const prefer = cartHasLive() ? "overnight" : "ground";
      const hit = allowed.find((s) => s.id === prefer) || allowed[0];
      state.shipId = hit ? hit.id : "pickup";
    }
    state.fulfill = state.shipId === "pickup" ? "pickup" : "ship";
  }

  function lineUnitPrice(line) {
    const p = productById(line.id);
    if (!p) return 0;
    let total = p.price;
    Object.keys(line.opts || {}).forEach((key) => {
      const group = p.options && p.options[key];
      if (!group) return;
      const val = line.opts[key];
      if (group.type === "check" && Array.isArray(val)) {
        val.forEach((cid) => {
          const c = group.choices.find((x) => x.id === cid);
          if (c) total += c.price;
        });
      } else {
        const c = group.choices.find((x) => x.id === val);
        if (c) total += c.price;
      }
    });
    return total;
  }

  function cartCount() {
    return state.cart.reduce((n, l) => n + l.qty, 0);
  }

  function cartSubtotal() {
    return state.cart.reduce((n, l) => n + lineUnitPrice(l) * l.qty, 0);
  }

  function cartTax(sub) {
    return sub * TAX_RATE;
  }

  function shipPrice() {
    ensureShipValid();
    const opt = SHIP_OPTIONS.find((s) => s.id === state.shipId) || SHIP_OPTIONS[0];
    return opt.price;
  }

  function cartTotal() {
    const sub = cartSubtotal();
    return sub + cartTax(sub) + shipPrice();
  }

  function optsLabel(line) {
    const p = productById(line.id);
    if (!p) return "";
    const bits = [];
    Object.keys(line.opts || {}).forEach((key) => {
      const group = p.options && p.options[key];
      if (!group) return;
      const val = line.opts[key];
      if (group.type === "check" && Array.isArray(val) && val.length) {
        bits.push(
          val
            .map((cid) => {
              const c = group.choices.find((x) => x.id === cid);
              return c ? c.label : cid;
            })
            .join(", ")
        );
      } else if (val) {
        const c = group.choices.find((x) => x.id === val);
        bits.push(c ? c.label : String(val));
      }
    });
    return bits.join(" · ");
  }

  if (/[?&]seed=1(?:&|$)/.test(location.search) && !state.cart.length) {
    state.cart = [
      { id: "crimson-veil", qty: 1, opts: { size: "young" } },
      { id: "palace-pellets", qty: 1, opts: { size: "sm" } }
    ];
    state.name = "Demo Guest";
    state.phone = "(732) 555-0199";
    state.email = "demo@robotkitchen.us";
    state.shipId = "overnight";
    saveCart();
  }

  function route() {
    const hash = location.hash || "#/";
    if (hash.startsWith("#/checkout")) return "checkout";
    if (hash.startsWith("#/success")) return "success";
    if (hash.startsWith("#/cancel")) return "cancel";
    if (hash.startsWith("#/shipping")) return "shipping";
    return "menu";
  }

  function setCartOpen(open) {
    const drawer = document.getElementById("cart-drawer");
    const scrim = document.getElementById("cart-scrim");
    const btn = document.getElementById("cart-toggle");
    drawer.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    scrim.hidden = !open;
  }

  function updateCartBadge() {
    document.getElementById("cart-count").textContent = String(cartCount());
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCart() {
    const body = document.getElementById("cart-body");
    const foot = document.getElementById("cart-foot");
    updateCartBadge();
    ensureShipValid();
    if (!state.cart.length) {
      body.innerHTML = '<div class="cart-empty">Your cart is empty.<br/>Add a betta or supply to begin.</div>';
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = state.cart
      .map((line, idx) => {
        const p = productById(line.id);
        const meta = optsLabel(line);
        return (
          '<div class="cart-line" data-idx="' +
          idx +
          '"><div><div class="cart-line-name">' +
          escapeHtml(p ? p.name : line.id) +
          (p && p.live ? ' <span class="live-tag">Live</span>' : "") +
          "</div>" +
          (meta ? '<div class="cart-line-meta">' + escapeHtml(meta) + "</div>" : "") +
          '<div class="qty-ctrl">' +
          '<button type="button" data-act="dec" aria-label="Decrease">−</button>' +
          "<span>" +
          line.qty +
          "</span>" +
          '<button type="button" data-act="inc" aria-label="Increase">+</button>' +
          '<button type="button" data-act="rm" aria-label="Remove" style="margin-left:0.35rem;width:auto;padding:0 0.45rem;font-size:0.75rem">Remove</button>' +
          "</div></div><div class=\"price\">" +
          money(lineUnitPrice(line) * line.qty) +
          "</div></div>"
        );
      })
      .join("");

    const sub = cartSubtotal();
    foot.innerHTML =
      '<div class="line-row"><span class="muted">Subtotal</span><span>' +
      money(sub) +
      "</span></div>" +
      '<div class="line-row"><span class="muted">Tax (NJ 6.625%)</span><span>' +
      money(cartTax(sub)) +
      "</span></div>" +
      '<div class="line-row total"><span>Goods total</span><span>' +
      money(sub + cartTax(sub)) +
      "</span></div>" +
      '<div class="btn-row"><a class="primary-btn" href="#/checkout" id="go-checkout">Checkout</a></div>';

    body.querySelectorAll(".cart-line").forEach((el) => {
      const idx = Number(el.getAttribute("data-idx"));
      el.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const act = btn.getAttribute("data-act");
          if (act === "inc") state.cart[idx].qty += 1;
          if (act === "dec") state.cart[idx].qty = Math.max(1, state.cart[idx].qty - 1);
          if (act === "rm") state.cart.splice(idx, 1);
          saveCart();
          renderCart();
          if (route() === "checkout") render();
        });
      });
    });
    const go = document.getElementById("go-checkout");
    if (go) go.addEventListener("click", () => setCartOpen(false));
  }

  function renderMenu() {
    const app = document.getElementById("app");
    const cats =
      '<div class="cat-bar"><div class="cat-scroll" role="toolbar" aria-label="Shop categories">' +
      '<button type="button" class="cat-chip" data-cat="all" aria-pressed="' +
      (state.category === "all") +
      '">All</button>' +
      CATEGORIES.map(
        (c) =>
          '<button type="button" class="cat-chip" data-cat="' +
          escapeHtml(c) +
          '" aria-pressed="' +
          (state.category === c) +
          '">' +
          escapeHtml(c) +
          "</button>"
      ).join("") +
      "</div></div>";

    const sections = (state.category === "all" ? CATEGORIES : [state.category])
      .map((cat) => {
        const items = PRODUCTS.filter((p) => p.category === cat);
        if (!items.length) return "";
        return (
          '<section class="menu-section" id="cat-' +
          escapeHtml(cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")) +
          '"><h2>' +
          escapeHtml(cat) +
          '</h2><div class="menu-list">' +
          items
            .map(
              (p) =>
                '<button type="button" class="menu-item" data-id="' +
                escapeHtml(p.id) +
                '"><div class="menu-item-body"><h3>' +
                escapeHtml(p.name) +
                (p.live ? ' <span class="live-tag">Live</span>' : "") +
                "</h3><p>" +
                escapeHtml(p.blurb) +
                '</p><div class="price">' +
                money(p.price) +
                '</div></div><img class="menu-item-img" src="' +
                escapeHtml(p.img) +
                '" alt="" /></button>'
            )
            .join("") +
          "</div></section>"
        );
      })
      .join("");

    app.innerHTML =
      '<section class="hero">' +
      '<img class="hero-photo" src="img/hero-kawaii.jpg" alt="Betta Home aquarium scene" />' +
      '<div class="hero-overlay">' +
      "<h1>Aquarium-grade bettas</h1>" +
      "<p>Live fish &amp; a full supply catalog — fictional demo shop with Stripe TEST checkout.</p>" +
      '<div class="hero-badges"><span class="badge">Live + supplies</span><span class="badge">NJ tax demo</span><span class="badge">Stripe TEST</span></div>' +
      "</div></section>" +
      '<div class="policy-banner">Live animals ship overnight only (weather holds apply) or choose <strong>local pickup</strong>. <a href="#/shipping">Read demo shipping policy →</a></div>' +
      cats +
      sections;

    app.querySelectorAll(".cat-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.category = btn.getAttribute("data-cat");
        renderMenu();
      });
    });
    app.querySelectorAll(".menu-item").forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.getAttribute("data-id")));
    });
  }

  function defaultOpts(product) {
    const opts = {};
    Object.keys(product.options || {}).forEach((key) => {
      const g = product.options[key];
      if (g.type === "check") opts[key] = [];
      else if (g.choices && g.choices.length) opts[key] = g.choices[0].id;
    });
    return opts;
  }

  function openModal(id) {
    const p = productById(id);
    if (!p) return;
    state.modal = p;
    state.modalQty = 1;
    state.modalOpts = defaultOpts(p);
    drawModal();
  }

  function drawModal() {
    const p = state.modal;
    const modal = document.getElementById("item-modal");
    const scrim = document.getElementById("modal-scrim");
    if (!p) {
      modal.hidden = true;
      scrim.hidden = true;
      return;
    }
    let unit = p.price;
    Object.keys(state.modalOpts).forEach((key) => {
      const g = p.options[key];
      if (!g) return;
      const val = state.modalOpts[key];
      if (g.type === "check" && Array.isArray(val)) {
        val.forEach((cid) => {
          const c = g.choices.find((x) => x.id === cid);
          if (c) unit += c.price;
        });
      } else {
        const c = g.choices.find((x) => x.id === val);
        if (c) unit += c.price;
      }
    });

    let optsHtml = "";
    Object.keys(p.options || {}).forEach((key) => {
      const g = p.options[key];
      optsHtml += '<fieldset class="opt-group"><legend>' + escapeHtml(g.label) + "</legend>";
      g.choices.forEach((c) => {
        const checked =
          g.type === "check"
            ? (state.modalOpts[key] || []).indexOf(c.id) >= 0
            : state.modalOpts[key] === c.id;
        optsHtml +=
          '<label class="opt-choice"><span><input type="' +
          (g.type === "check" ? "checkbox" : "radio") +
          '" name="' +
          escapeHtml(key) +
          '" value="' +
          escapeHtml(c.id) +
          '"' +
          (checked ? " checked" : "") +
          " /> " +
          escapeHtml(c.label) +
          "</span><span>" +
          (c.price ? "+" + money(c.price) : "") +
          "</span></label>";
      });
      optsHtml += "</fieldset>";
    });

    modal.innerHTML =
      '<img class="modal-hero" src="' +
      escapeHtml(p.img) +
      '" alt="" />' +
      '<div class="modal-pad">' +
      '<button type="button" class="icon-btn" id="modal-x" aria-label="Close" style="position:absolute;top:0.5rem;right:0.5rem;background:rgba(0,0,0,0.45);border-radius:999px;color:#fff">×</button>' +
      '<h2 id="modal-title">' +
      escapeHtml(p.name) +
      (p.live ? ' <span class="live-tag">Live</span>' : "") +
      "</h2>" +
      '<p class="muted">' +
      escapeHtml(p.blurb) +
      "</p>" +
      (p.live
        ? '<p class="ship-note">Live animal — overnight shipping or local pickup only. See <a href="#/shipping">shipping policy</a>.</p>'
        : "") +
      optsHtml +
      '<div class="modal-actions">' +
      '<div class="qty-ctrl">' +
      '<button type="button" id="mq-dec" aria-label="Decrease">−</button>' +
      '<span id="mq">' +
      state.modalQty +
      "</span>" +
      '<button type="button" id="mq-inc" aria-label="Increase">+</button>' +
      "</div>" +
      '<button type="button" class="primary-btn" id="add-cart">Add · ' +
      money(unit * state.modalQty) +
      "</button></div></div>";

    modal.hidden = false;
    scrim.hidden = false;

    document.getElementById("modal-x").onclick = closeModal;
    document.getElementById("mq-dec").onclick = () => {
      state.modalQty = Math.max(1, state.modalQty - 1);
      drawModal();
    };
    document.getElementById("mq-inc").onclick = () => {
      state.modalQty += 1;
      drawModal();
    };
    modal.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        const name = input.name;
        const g = p.options[name];
        if (g.type === "check") {
          const set = new Set(state.modalOpts[name] || []);
          if (input.checked) set.add(input.value);
          else set.delete(input.value);
          state.modalOpts[name] = Array.from(set);
        } else {
          state.modalOpts[name] = input.value;
        }
        drawModal();
      });
    });
    document.getElementById("add-cart").onclick = () => {
      state.cart.push({
        id: p.id,
        qty: state.modalQty,
        opts: JSON.parse(JSON.stringify(state.modalOpts))
      });
      saveCart();
      closeModal();
      renderCart();
      setCartOpen(true);
    };
  }

  function closeModal() {
    state.modal = null;
    document.getElementById("item-modal").hidden = true;
    document.getElementById("modal-scrim").hidden = true;
  }
  function renderShippingPolicy() {
    const app = document.getElementById("app");
    app.innerHTML =
      '<div class="policy-view">' +
      "<h1>Live-animal shipping</h1>" +
      '<p class="checkout-sub">Fictional demo policy for Betta Home — not real carrier rules.</p>' +
      '<div class="panel">' +
      "<h2>Overnight only for live fish</h2>" +
      "<p>Live bettas in this demo may only use <strong>Overnight</strong> delivery or <strong>Local pickup</strong>. Ground shipping locks when a live animal is in the cart.</p>" +
      "<h2>Ship days (demo)</h2>" +
      "<ul><li>Live orders leave the demo warehouse Mon–Wed only.</li>" +
      "<li>Orders placed Thu–Sun wait until the next Monday ship window.</li>" +
      "<li>Supplies-only orders may use ground any weekday in this demo.</li></ul>" +
      "<h2>Weather &amp; temperature holds</h2>" +
      "<p>If the demo forecast along the route shows extreme heat or cold, live shipments pause automatically until the hold clears. You would get a demo email; no real weather data is used here.</p>" +
      "<h2>DOA (dead on arrival) — demo promise</h2>" +
      "<ul><li>Photo of the unopened bag within 2 hours of delivery (demo rule).</li>" +
      "<li>Keep the fish in the bag until support replies (demo script).</li>" +
      "<li>Replacement or store credit on approved claims — fictional process only.</li></ul>" +
      "<h2>Local pickup</h2>" +
      "<p>Pickup is available at the fictional <strong>Betta Home demo studio</strong> (East Brunswick, NJ area — invented address shown at checkout). No shipping fee.</p>" +
      '<p class="fictional-note">This entire policy is invented for a Robot Kitchen portfolio demo. It is not advice for shipping real animals.</p>' +
      "</div>" +
      '<a class="primary-btn" href="#/">Back to shop</a>' +
      '<a class="ghost-btn" href="#/checkout">Go to checkout</a></div>';
  }

  function renderCheckout() {
    const app = document.getElementById("app");
    if (!state.cart.length) {
      app.innerHTML =
        '<div class="checkout-view"><h1>Checkout</h1><p class="checkout-sub">Your cart is empty.</p>' +
        '<a class="primary-btn" href="#/">Back to shop</a></div>';
      return;
    }
    ensureShipValid();
    const sub = cartSubtotal();
    const tax = cartTax(sub);
    const ship = shipPrice();
    const total = sub + tax + ship;
    const live = cartHasLive();
    const shipOpts = allowedShipOptions();

    app.innerHTML =
      '<div class="checkout-view">' +
      "<h1>Checkout</h1>" +
      '<p class="checkout-sub">Stripe TEST · NJ sales tax on goods · demo only</p>' +
      (live
        ? '<div class="mock-banner" role="status">Cart includes live animals — overnight or local pickup only. <a href="#/shipping" style="color:inherit">Policy</a></div>'
        : "") +
      '<div class="panel"><h2>Delivery</h2><div class="ship-list" id="ships">' +
      SHIP_OPTIONS.map((s) => {
        const ok = shipOpts.some((a) => a.id === s.id);
        return (
          '<button type="button" class="ship-opt" data-ship="' +
          escapeHtml(s.id) +
          '" aria-pressed="' +
          (state.shipId === s.id) +
          '"' +
          (ok ? "" : " disabled") +
          "><span>" +
          escapeHtml(s.label) +
          (ok ? "" : " (unavailable with live fish)") +
          "</span><span>" +
          money(s.price) +
          "</span></button>"
        );
      }).join("") +
      "</div>" +
      (state.shipId === "pickup"
        ? '<p class="ship-note">Pickup at fictional demo studio — 100 Demo Lane, East Brunswick, NJ (not a real address).</p>'
        : state.shipId === "overnight"
          ? '<p class="ship-note">Overnight: ships Mon–Wed in this demo. Weather holds may delay.</p>'
          : '<p class="ship-note">Ground: supplies only. Not offered when live fish are in the cart.</p>') +
      "</div>" +
      '<div class="panel"><h2>Contact</h2>' +
      '<div class="field"><label for="c-name">Name</label><input id="c-name" autocomplete="name" value="' +
      escapeHtml(state.name) +
      '" placeholder="Your name" /></div>' +
      '<div class="field"><label for="c-phone">Phone</label><input id="c-phone" inputmode="tel" autocomplete="tel" value="' +
      escapeHtml(state.phone) +
      '" placeholder="(555) 555-0100" /></div>' +
      '<div class="field"><label for="c-email">Email (receipt)</label><input id="c-email" type="email" autocomplete="email" value="' +
      escapeHtml(state.email) +
      '" placeholder="you@email.com" /></div>' +
      (state.shipId !== "pickup"
        ? '<div class="field"><label for="c-address">Ship-to address</label><input id="c-address" autocomplete="street-address" value="' +
          escapeHtml(state.address) +
          '" placeholder="Street, city, NJ ZIP" /></div>'
        : "") +
      '<div class="field"><label for="c-note">Order note</label><input id="c-note" value="' +
      escapeHtml(state.note) +
      '" placeholder="Gate code, preferred pickup window…" /></div></div>' +
      '<div class="panel"><h2>Order summary</h2>' +
      state.cart
        .map((line) => {
          const p = productById(line.id);
          return (
            '<div class="line-row"><span>' +
            escapeHtml(p ? p.name : line.id) +
            " ×" +
            line.qty +
            '</span><span>' +
            money(lineUnitPrice(line) * line.qty) +
            "</span></div>"
          );
        })
        .join("") +
      '<div class="line-row"><span class="muted">Subtotal</span><span>' +
      money(sub) +
      "</span></div>" +
      '<div class="line-row"><span class="muted">NJ sales tax (6.625%)</span><span>' +
      money(tax) +
      "</span></div>" +
      '<div class="line-row"><span class="muted">Shipping / pickup</span><span>' +
      money(ship) +
      "</span></div>" +
      '<div class="line-row total"><span>Total</span><span>' +
      money(total) +
      "</span></div></div>" +
      (state.payError
        ? '<div class="mock-banner" role="alert">' + escapeHtml(state.payError) + "</div>"
        : "") +
      '<button type="button" class="primary-btn" id="pay-btn"' +
      (state.paying ? " disabled" : "") +
      ">" +
      (state.paying ? "Starting Stripe…" : "Pay with Stripe (TEST)") +
      "</button>" +
      '<a class="ghost-btn" href="#/">Back to shop</a>' +
      '<p class="muted" style="margin-top:0.85rem;font-size:0.8rem;text-align:center">Secure checkout · demo only — no real charges.</p>' +
      "</div>";

    document.querySelectorAll("#ships .ship-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        state.shipId = btn.getAttribute("data-ship");
        state.fulfill = state.shipId === "pickup" ? "pickup" : "ship";
        renderCheckout();
      });
    });
    ["c-name", "c-phone", "c-email", "c-note", "c-address"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => {
        if (id === "c-name") state.name = el.value;
        if (id === "c-phone") state.phone = el.value;
        if (id === "c-email") state.email = el.value;
        if (id === "c-note") state.note = el.value;
        if (id === "c-address") state.address = el.value;
      });
    });
    document.getElementById("pay-btn").onclick = startPay;
  }

  async function startPay() {
    if (state.paying) return;
    if (!state.name.trim() || !state.phone.trim()) {
      state.payError = "Add a name and phone for this demo order.";
      renderCheckout();
      return;
    }
    if (state.shipId !== "pickup" && !state.address.trim()) {
      state.payError = "Add a ship-to address, or choose local pickup.";
      renderCheckout();
      return;
    }
    state.paying = true;
    state.payError = "";
    renderCheckout();

    const origin = location.origin;
    const items = state.cart.map((line) => {
      const p = productById(line.id);
      return {
        id: line.id,
        name: p ? p.name : line.id,
        unit_amount: Math.round(lineUnitPrice(line) * 100),
        quantity: line.qty,
        description: optsLabel(line) || undefined
      };
    });
    const sub = cartSubtotal();
    const taxCents = Math.round(cartTax(sub) * 100);
    const shipCents = Math.round(shipPrice() * 100);
    if (taxCents > 0) {
      items.push({ id: "tax", name: "NJ sales tax (6.625%)", unit_amount: taxCents, quantity: 1 });
    }
    if (shipCents > 0) {
      const shipLabel = (SHIP_OPTIONS.find((s) => s.id === state.shipId) || {}).label || "Shipping";
      items.push({ id: "ship", name: "Shipping — " + shipLabel, unit_amount: shipCents, quantity: 1 });
    } else if (state.shipId === "pickup") {
      items.push({ id: "pickup", name: "Local pickup (no charge)", unit_amount: 0, quantity: 1 });
    }

    const payload = {
      demo: "betta-dragon-palace",
      customer: {
        name: state.name.trim(),
        phone: state.phone.trim(),
        email: state.email.trim() || undefined
      },
      note: state.note.trim() || undefined,
      fulfill: state.fulfill,
      ship: state.shipId,
      items: items.filter((it) => it.unit_amount > 0 || it.id === "pickup"),
      success_url: origin + BASE + "/#/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + BASE + "/#/cancel"
    };
    // Stripe skips $0 lines; keep billable items only for API
    payload.items = payload.items.filter((it) => it.unit_amount > 0);

    try {
      const res = await fetch(CHECKOUT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (data && data.url) {
        location.href = data.url;
        return;
      }
      if (data && (data.fallback || data.mock || res.status === 503 || !res.ok)) {
        sessionStorage.setItem(
          PAYLOAD_KEY,
          JSON.stringify({ ...payload, total: cartTotal(), reason: data.error || "no_stripe_key" })
        );
        location.href = "mock-checkout.html";
        return;
      }
      state.payError = (data && data.error) || "Could not start Stripe Checkout.";
    } catch (err) {
      sessionStorage.setItem(
        PAYLOAD_KEY,
        JSON.stringify({ ...payload, total: cartTotal(), reason: "api_unreachable" })
      );
      location.href = "mock-checkout.html";
      return;
    } finally {
      state.paying = false;
    }
    renderCheckout();
  }

  function renderSuccess() {
    const app = document.getElementById("app");
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const sid = params.get("session_id") || "mock";
    const alnum = String(sid).replace(/[^a-zA-Z0-9]/g, "");
    const orderNum = "BDP-" + (alnum.slice(-6) || "DEMO00").toUpperCase();
    state.cart = [];
    saveCart();
    renderCart();
    app.innerHTML =
      '<div class="success-view">' +
      '<div class="success-icon">✓</div>' +
      "<h1>Order placed (demo)</h1>" +
      '<p class="checkout-sub">Thanks' +
      (state.name ? ", " + escapeHtml(state.name) : "") +
      ". Test payment only — no real charge.</p>" +
      '<div class="panel"><div class="line-row"><span class="muted">Order #</span><span>' +
      escapeHtml(orderNum) +
      "</span></div>" +
      '<div class="line-row"><span class="muted">Fulfillment</span><span>' +
      escapeHtml(state.fulfill === "pickup" ? "Local pickup" : "Ship (" + state.shipId + ")") +
      "</span></div></div>" +
      '<a class="primary-btn" href="#/">Back to shop</a></div>';
  }

  function renderCancel() {
    const app = document.getElementById("app");
    app.innerHTML =
      '<div class="checkout-view"><h1>Checkout canceled</h1>' +
      '<p class="checkout-sub">No charge was made. Your cart is still here.</p>' +
      '<a class="primary-btn" href="#/checkout">Return to checkout</a>' +
      '<a class="ghost-btn" href="#/">Back to shop</a></div>';
  }

  function render() {
    const r = route();
    if (r !== "menu") setCartOpen(false);
    if (r === "checkout") renderCheckout();
    else if (r === "success") renderSuccess();
    else if (r === "cancel") renderCancel();
    else if (r === "shipping") renderShippingPolicy();
    else renderMenu();
    renderCart();
  }

  function initRkCard() {
    const card = document.getElementById("rk-source-card");
    const close = document.getElementById("rk-source-close");
    if (!card) return;
    try {
      if (sessionStorage.getItem(RK_CARD_KEY) === "1") return;
    } catch (_) {}
    card.hidden = false;
    setTimeout(() => card.classList.add("show"), 1000);
    close.addEventListener("click", () => {
      card.classList.remove("show");
      try {
        sessionStorage.setItem(RK_CARD_KEY, "1");
      } catch (_) {}
      setTimeout(() => {
        card.hidden = true;
      }, 400);
    });
  }

  document.getElementById("cart-toggle").addEventListener("click", () => {
    const open = !document.getElementById("cart-drawer").classList.contains("open");
    setCartOpen(open);
  });
  document.getElementById("cart-close").addEventListener("click", () => setCartOpen(false));
  document.getElementById("cart-scrim").addEventListener("click", () => setCartOpen(false));
  document.getElementById("modal-scrim").addEventListener("click", closeModal);
  window.addEventListener("hashchange", render);

  render();
  initRkCard();
})();
