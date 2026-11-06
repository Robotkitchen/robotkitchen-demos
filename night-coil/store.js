(function () {
  "use strict";

  /**
   * Night Coil BBQ — Iron Chef series demo #1 (food truck).
   * Invented brand. Service-level benchmark: Kogi BBQ / The Halal Guys.
   * Function benchmark: Square / Roaming Hunger style mobile order + cart.
   * Payments: Stripe Checkout via POST /api/create-checkout-session (TEST).
   * Fallback: mock Stripe test checkout page when STRIPE_SECRET_KEY unset.
   */
  const TAX_RATE = 0.06625; // NJ
  const TIP_OPTIONS = [0, 15, 18, 20];
  const CART_KEY = "nc_demo_cart_v1";
  const RK_CARD_KEY = "rk_source_card_dismissed";
  const CHECKOUT_API = "/api/create-checkout-session";

  const CATEGORIES = ["Tacos", "Bowls", "Sides", "Drinks"];

  const PRODUCTS = [
    {
      id: "short-rib-taco",
      category: "Tacos",
      name: "Charred Short-Rib Taco",
      blurb: "Soy-garlic short rib, pickled onion, sesame crema, cilantro on a flour tortilla.",
      price: 6.5,
      img: "img/short-rib-taco.jpg",
      options: {
        heat: {
          label: "Heat",
          type: "radio",
          required: true,
          choices: [
            { id: "mild", label: "Mild", price: 0 },
            { id: "medium", label: "Medium", price: 0 },
            { id: "fire", label: "Coil Fire", price: 0 }
          ]
        },
        extras: {
          label: "Extras",
          type: "check",
          choices: [
            { id: "egg", label: "Soft egg", price: 1.5 },
            { id: "kimchi", label: "Kimchi", price: 1.0 },
            { id: "extra-meat", label: "Extra short rib", price: 3.5 }
          ]
        }
      }
    },
    {
      id: "bulgogi-taco",
      category: "Tacos",
      name: "Bulgogi Street Taco",
      blurb: "Sweet soy beef, scallion, roasted garlic aioli, toasted sesame.",
      price: 5.75,
      img: "img/bulgogi-taco.jpg",
      options: {
        heat: {
          label: "Heat",
          type: "radio",
          required: true,
          choices: [
            { id: "mild", label: "Mild", price: 0 },
            { id: "medium", label: "Medium", price: 0 },
            { id: "fire", label: "Coil Fire", price: 0 }
          ]
        }
      }
    },
    {
      id: "spicy-pork-taco",
      category: "Tacos",
      name: "Gochujang Pork Taco",
      blurb: "Spicy pork shoulder, cabbage slaw, lime, crushed peanuts.",
      price: 5.95,
      img: "img/spicy-pork-taco.jpg",
      options: {
        heat: {
          label: "Heat",
          type: "radio",
          required: true,
          choices: [
            { id: "mild", label: "Mild", price: 0 },
            { id: "medium", label: "Medium", price: 0 },
            { id: "fire", label: "Coil Fire", price: 0 }
          ]
        }
      }
    },
    {
      id: "mushroom-taco",
      category: "Tacos",
      name: "Roasted Mushroom Taco",
      blurb: "Charred oyster mushrooms, chili oil, herbs. Vegetarian.",
      price: 5.5,
      img: "img/mushroom-taco.jpg",
      options: {}
    },
    {
      id: "coil-bowl",
      category: "Bowls",
      name: "Night Coil Bowl",
      blurb: "Rice, short rib, kimchi, egg, cucumber, sesame. Truck signature.",
      price: 14.5,
      img: "img/coil-bowl.jpg",
      options: {
        base: {
          label: "Base",
          type: "radio",
          required: true,
          choices: [
            { id: "rice", label: "Steamed rice", price: 0 },
            { id: "greens", label: "Greens (+$1)", price: 1 }
          ]
        }
      }
    },
    {
      id: "banchan-bowl",
      category: "Bowls",
      name: "Banchan Bowl",
      blurb: "Assorted banchan over rice with chili crisp and soft egg.",
      price: 12.0,
      img: "img/banchan-bowl.jpg",
      options: {}
    },
    {
      id: "kimchi-fries",
      category: "Sides",
      name: "Kimchi Cheese Fries",
      blurb: "Crispy fries, melted cheese, kimchi, scallion, gochujang drizzle.",
      price: 7.5,
      img: "img/kimchi-fries.jpg",
      options: {
        size: {
          label: "Size",
          type: "radio",
          required: true,
          choices: [
            { id: "reg", label: "Regular", price: 0 },
            { id: "large", label: "Large (+$2.50)", price: 2.5 }
          ]
        }
      }
    },
    {
      id: "pickles",
      category: "Sides",
      name: "House Pickles",
      blurb: "Cucumber + radish pickle cup.",
      price: 3.0,
      img: "img/pickles.jpg",
      options: {}
    },
    {
      id: "horchata",
      category: "Drinks",
      name: "Toasted Rice Horchata",
      blurb: "Cold, lightly sweet. Truck favorite.",
      price: 4.0,
      img: "img/horchata.jpg",
      options: {}
    },
    {
      id: "barley-tea",
      category: "Drinks",
      name: "Iced Barley Tea",
      blurb: "Unsweetened, roasted barley.",
      price: 2.5,
      img: "img/barley-tea.jpg",
      options: {}
    },
    {
      id: "soda",
      category: "Drinks",
      name: "Can Soda",
      blurb: "Assorted cans.",
      price: 1.75,
      img: "img/soda.jpg",
      options: {
        flavor: {
          label: "Flavor",
          type: "radio",
          required: true,
          choices: [
            { id: "cola", label: "Cola", price: 0 },
            { id: "lemon", label: "Lemon-lime", price: 0 },
            { id: "ginger", label: "Ginger ale", price: 0 }
          ]
        }
      }
    }
  ];

  const state = {
    category: "all",
    cart: loadCart(),
    tipPct: 18,
    fulfill: "pickup",
    name: "",
    phone: "",
    email: "",
    note: "",
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

  function cartTip(sub) {
    return sub * (state.tipPct / 100);
  }

  function cartTotal() {
    const sub = cartSubtotal();
    return sub + cartTax(sub) + cartTip(sub);
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
        const labels = val
          .map((cid) => {
            const c = group.choices.find((x) => x.id === cid);
            return c ? c.label : cid;
          })
          .join(", ");
        bits.push(labels);
      } else if (val) {
        const c = group.choices.find((x) => x.id === val);
        bits.push(c ? c.label : String(val));
      }
    });
    return bits.join(" · ");
  }


  // Screenshot / QA seed: ?seed=1 preloads a small cart
  if (/[?&]seed=1(?:&|$)/.test(location.search) && !state.cart.length) {
    state.cart = [
      { id: "short-rib-taco", qty: 2, opts: { heat: "medium", extras: ["kimchi"] } },
      { id: "kimchi-fries", qty: 1, opts: { size: "reg" } },
      { id: "horchata", qty: 1, opts: {} }
    ];
    state.name = "Demo Guest";
    state.phone = "(732) 555-0142";
    state.email = "demo@robotkitchen.us";
    saveCart();
  }

  function route() {
    const hash = location.hash || "#/";
    if (hash.startsWith("#/checkout")) return "checkout";
    if (hash.startsWith("#/success")) return "success";
    if (hash.startsWith("#/cancel")) return "cancel";
    return "menu";
  }

  function setCartOpen(open) {
    const drawer = document.getElementById("cart-drawer");
    const scrim = document.getElementById("cart-scrim");
    const btn = document.getElementById("cart-toggle");
    drawer.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) scrim.hidden = false;
    else scrim.hidden = true;
  }

  function updateCartBadge() {
    document.getElementById("cart-count").textContent = String(cartCount());
  }

  function renderCart() {
    const body = document.getElementById("cart-body");
    const foot = document.getElementById("cart-foot");
    updateCartBadge();
    if (!state.cart.length) {
      body.innerHTML = '<div class="cart-empty">Your cart is empty.<br/>Add a taco to get rolling.</div>';
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
          '">' +
          '<div><div class="cart-line-name">' +
          escapeHtml(p ? p.name : line.id) +
          "</div>" +
          (meta ? '<div class="cart-line-meta">' + escapeHtml(meta) + "</div>" : "") +
          '<div class="qty-ctrl">' +
          '<button type="button" data-act="dec" aria-label="Decrease">−</button>' +
          "<span>" +
          line.qty +
          "</span>" +
          '<button type="button" data-act="inc" aria-label="Increase">+</button>' +
          '<button type="button" data-act="rm" aria-label="Remove" style="margin-left:0.35rem;width:auto;padding:0 0.45rem;font-size:0.75rem">Remove</button>' +
          "</div></div>" +
          "<div class=\"price\">" +
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
      '<div class="line-row"><span class="muted">Tax (est.)</span><span>' +
      money(cartTax(sub)) +
      "</span></div>" +
      '<div class="line-row total"><span>Total</span><span>' +
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
    if (go) {
      go.addEventListener("click", () => setCartOpen(false));
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderMenu() {
    const app = document.getElementById("app");
    const cats =
      '<div class="cat-bar"><div class="cat-scroll" role="toolbar" aria-label="Menu categories">' +
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
        return (
          '<section class="menu-section" id="cat-' +
          escapeHtml(cat.toLowerCase()) +
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
      '<img src="img/hero.jpg" alt="Night Coil BBQ short-rib tacos" />' +
      '<div class="hero-overlay">' +
      "<h1>Order ahead</h1>" +
      "<p>Korean short-rib tacos from a rolling kitchen. Pickup at the truck window.</p>" +
      '<div class="hero-badges"><span class="badge">Food truck</span><span class="badge">Stripe TEST</span><span class="badge">Iron Chef demo #1</span></div>' +
      "</div></section>" +
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
    const unit = (function () {
      let t = p.price;
      Object.keys(state.modalOpts).forEach((key) => {
        const g = p.options[key];
        if (!g) return;
        const val = state.modalOpts[key];
        if (g.type === "check" && Array.isArray(val)) {
          val.forEach((cid) => {
            const c = g.choices.find((x) => x.id === cid);
            if (c) t += c.price;
          });
        } else {
          const c = g.choices.find((x) => x.id === val);
          if (c) t += c.price;
        }
      });
      return t;
    })();

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
          '<label class="opt-choice"><input type="' +
          (g.type === "check" ? "checkbox" : "radio") +
          '" name="' +
          escapeHtml(key) +
          '" value="' +
          escapeHtml(c.id) +
          '"' +
          (checked ? " checked" : "") +
          " /> " +
          escapeHtml(c.label) +
          "<span>" +
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
      "</h2>" +
      '<p class="muted">' +
      escapeHtml(p.blurb) +
      "</p>" +
      optsHtml +
      '<div class="modal-actions">' +
      '<div class="qty-ctrl">' +
      '<button type="button" id="mq-dec" aria-label="Decrease">−</button>' +
      "<span id=\"mq\">" +
      state.modalQty +
      "</span>" +
      '<button type="button" id="mq-inc" aria-label="Increase">+</button>' +
      "</div>" +
      '<button type="button" class="primary-btn" id="add-cart">Add · ' +
      money(unit * state.modalQty) +
      "</button></div></div>";

    modal.hidden = false;
    scrim.hidden = false;
    modal.style.position = "fixed";

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

  function renderCheckout() {
    const app = document.getElementById("app");
    if (!state.cart.length) {
      app.innerHTML =
        '<div class="checkout-view"><h1>Checkout</h1><p class="checkout-sub">Your cart is empty.</p>' +
        '<a class="primary-btn" href="#/">Back to menu</a></div>';
      return;
    }
    const sub = cartSubtotal();
    const tax = cartTax(sub);
    const tip = cartTip(sub);
    const total = sub + tax + tip;

    app.innerHTML =
      '<div class="checkout-view">' +
      "<h1>Checkout</h1>" +
      '<p class="checkout-sub">Pickup at the Night Coil window</p>' +
      '<div class="panel"><h2>Fulfillment</h2>' +
      '<div class="seg">' +
      '<button type="button" id="ful-pickup" aria-pressed="' +
      (state.fulfill === "pickup") +
      '">Pickup</button>' +
      '<button type="button" id="ful-later" aria-pressed="' +
      (state.fulfill === "later") +
      '">Schedule</button></div>' +
      '<p class="muted" style="margin:0.65rem 0 0;font-size:0.85rem">' +
      (state.fulfill === "pickup"
        ? "We’ll text when your order is at the window (demo)."
        : "Schedule is demo-only — pick ASAP at the truck for this preview.") +
      "</p></div>" +
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
      '<div class="field"><label for="c-note">Order note</label><input id="c-note" value="' +
      escapeHtml(state.note) +
      '" placeholder="No onions, extra napkins…" /></div></div>' +
      '<div class="panel"><h2>Tip</h2><div class="tip-row" id="tips">' +
      TIP_OPTIONS.map(
        (t) =>
          '<button type="button" data-tip="' +
          t +
          '" aria-pressed="' +
          (state.tipPct === t) +
          '">' +
          (t === 0 ? "No tip" : t + "%") +
          "</button>"
      ).join("") +
      "</div></div>" +
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
      '<div class="line-row"><span class="muted">Tax</span><span>' +
      money(tax) +
      "</span></div>" +
      '<div class="line-row"><span class="muted">Tip</span><span>' +
      money(tip) +
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
      '<a class="ghost-btn" href="#/">Back to menu</a>' +
      '<p class="muted" style="margin-top:0.85rem;font-size:0.8rem;text-align:center">Secure checkout · demo only — no real charges.</p>' +
      "</div>";

    document.getElementById("ful-pickup").onclick = () => {
      state.fulfill = "pickup";
      renderCheckout();
    };
    document.getElementById("ful-later").onclick = () => {
      state.fulfill = "later";
      renderCheckout();
    };
    ["c-name", "c-phone", "c-email", "c-note"].forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener("input", () => {
        if (id === "c-name") state.name = el.value;
        if (id === "c-phone") state.phone = el.value;
        if (id === "c-email") state.email = el.value;
        if (id === "c-note") state.note = el.value;
      });
    });
    document.querySelectorAll("#tips button").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tipPct = Number(btn.getAttribute("data-tip"));
        renderCheckout();
      });
    });
    document.getElementById("pay-btn").onclick = startPay;
  }

  async function startPay() {
    if (state.paying) return;
    if (!state.name.trim() || !state.phone.trim()) {
      state.payError = "Add a name and phone so the truck can call you (demo).";
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
    // Tip + tax as separate line items so Stripe Checkout totals match
    const sub = cartSubtotal();
    const taxCents = Math.round(cartTax(sub) * 100);
    const tipCents = Math.round(cartTip(sub) * 100);
    if (taxCents > 0) {
      items.push({ id: "tax", name: "Sales tax (est.)", unit_amount: taxCents, quantity: 1 });
    }
    if (tipCents > 0) {
      items.push({ id: "tip", name: "Tip (" + state.tipPct + "%)", unit_amount: tipCents, quantity: 1 });
    }

    const payload = {
      demo: "night-coil",
      customer: {
        name: state.name.trim(),
        phone: state.phone.trim(),
        email: state.email.trim() || undefined
      },
      note: state.note.trim() || undefined,
      fulfill: state.fulfill,
      items,
      success_url: origin + "/demo/night-coil/#/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/demo/night-coil/#/cancel"
    };

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
        // Persist payload for mock page
        sessionStorage.setItem(
          "nc_demo_checkout_payload",
          JSON.stringify({
            ...payload,
            total: cartTotal(),
            reason: data.error || "no_stripe_key"
          })
        );
        location.href = "mock-checkout.html";
        return;
      }
      state.payError = (data && data.error) || "Could not start Stripe Checkout.";
    } catch (err) {
      // Network / local static server: use mock checkout
      sessionStorage.setItem(
        "nc_demo_checkout_payload",
        JSON.stringify({
          ...payload,
          total: cartTotal(),
          reason: "api_unreachable"
        })
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
    const params = new URLSearchParams((location.hash.split("?")[1] || ""));
    const sid = params.get("session_id") || "mock";
    const alnum = String(sid).replace(/[^a-zA-Z0-9]/g, "");
    const orderNum = "NC-" + (alnum.slice(-6) || "DEMO00").toUpperCase();
    state.cart = [];
    saveCart();
    renderCart();
    app.innerHTML =
      '<div class="success-view">' +
      '<div class="success-icon">✓</div>' +
      "<h1>Order placed (demo)</h1>" +
      '<p class="checkout-sub">Thanks' +
      (state.name ? ", " + escapeHtml(state.name) : "") +
      ". This was a test payment — no real charge.</p>" +
      '<div class="panel"><div class="line-row"><span class="muted">Order #</span><span>' +
      escapeHtml(orderNum) +
      "</span></div></div>" +
      '<a class="primary-btn" href="#/">Back to menu</a></div>';
  }

  function renderCancel() {
    const app = document.getElementById("app");
    app.innerHTML =
      '<div class="checkout-view"><h1>Checkout canceled</h1>' +
      '<p class="checkout-sub">No charge was made. Your cart is still here.</p>' +
      '<a class="primary-btn" href="#/checkout">Return to checkout</a>' +
      '<a class="ghost-btn" href="#/">Back to menu</a></div>';
  }

  function render() {
    const r = route();
    if (r === "checkout") renderCheckout();
    else if (r === "success") renderSuccess();
    else if (r === "cancel") renderCancel();
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
