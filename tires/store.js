(function () {
  "use strict";

  // Premium Auto Service demo — merged models, unique photos, TEST MODE checkout only.
  const TAG = "cannabisway03-20";
  const TEST_CARD = "4242424242424242";
  const FAKE_PK = "pk_test_DEMO_NOT_REAL";

  const MODELS = [
    {
      id: "mich-ps4s",
      brand: "Michelin",
      name: "Pilot Sport 4S",
      kind: "tire",
      img: "img/ps4s-official.jpg",
      blurb: "Max-performance summer UHP · OE on AMG, Ferrari, Porsche",
      variants: [
        { id: "mich-ps4s-25540-20", size: "255/40ZR20", load: "101Y XL", price: 363.99, rating: 4.7, reviews: 2140, asin: "B072KKQ9GT" },
        { id: "mich-ps4s-25535-20", size: "255/35ZR20", load: "97Y XL", price: 379.99, rating: 4.6, reviews: 890, asin: "B0721QB8WC" },
        { id: "mich-ps4s-29530-21", size: "295/30ZR21", load: "102Y XL", price: 489.99, rating: 4.6, reviews: 620, asin: "B08QV41HMZ" },
      ],
    },
    {
      id: "pir-pz4",
      brand: "Pirelli",
      name: "P Zero (PZ4)",
      kind: "tire",
      img: "img/pirelli-pz4-24540r19.jpg",
      blurb: "UHP summer · BMW / Audi / Porsche fitment",
      variants: [
        { id: "pir-pz4-24540-19", size: "245/40R19", load: "98Y XL", price: 338.0, rating: 4.5, reviews: 980, asin: "B08NWMRKMY" },
      ],
    },
    {
      id: "bri-psport",
      brand: "Bridgestone",
      name: "Potenza Sport",
      kind: "tire",
      img: "img/bridgestone-potenza-27535r20.jpg",
      blurb: "Wet grip and high-speed stability",
      variants: [
        { id: "bri-psport-27535-20", size: "275/35R20", load: "102Y XL", price: 446.0, rating: 4.6, reviews: 640, asin: "B097F9QYY5" },
      ],
    },
    {
      id: "cont-ecs02",
      brand: "Continental",
      name: "ExtremeContact Sport 02",
      kind: "tire",
      img: "img/continental-ecs02-25535r20.jpg",
      blurb: "SportPlus tech · dry and wet braking",
      variants: [
        { id: "cont-ecs02-25535-20", size: "255/35ZR20", load: "97Y XL", price: 301.4, rating: 4.8, reviews: 87, asin: "B0BFKYZ154" },
      ],
    },
    {
      id: "jaco-elitepro",
      brand: "JACO",
      name: "ElitePro Tire Pressure Gauge",
      kind: "accessory",
      img: "img/B016R9KKCU.jpg",
      blurb: "Solid brass · ANSI-calibrated ±1.5% · 100 PSI",
      variants: [
        { id: "jaco-elitepro-gauge", size: "Accessory", load: "100 PSI", price: 17.99, rating: 4.7, reviews: 18200, asin: "B016R9KKCU" },
      ],
    },
  ];

  const PRODUCTS = MODELS.flatMap((m) =>
    m.variants.map((v) => ({
      id: v.id,
      modelId: m.id,
      brand: m.brand,
      name: m.name,
      kind: m.kind,
      img: m.img,
      blurb: m.blurb,
      size: v.size,
      load: v.load,
      price: v.price,
      rating: v.rating,
      reviews: v.reviews,
      asin: v.asin,
    }))
  );

  const SIZES = Array.from(
    new Set(PRODUCTS.map((p) => p.size).filter((s) => s && s !== "Accessory"))
  ).sort();
  const BRANDS = Array.from(new Set(MODELS.map((m) => m.brand)));

  const PROMO = { buy: 3, free: 1, label: "Buy 3 Get 1 Free" };

  const state = {
    size: "all",
    brand: "all",
    selSize: {},
    cart: loadCart(),
    checkout: {
      step: 1,
      fulfillment: "ship",
      name: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      date: "",
      time: "09:00",
      cardName: "",
      cardNumber: "",
      exp: "",
      cvc: "",
      orderId: null,
    },
  };

  const app = document.getElementById("app");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartScrim = document.getElementById("cart-scrim");
  const cartBody = document.getElementById("cart-body");
  const cartFoot = document.getElementById("cart-foot");
  const cartCount = document.getElementById("cart-count");

  function loadCart() {
    try {
      const raw = sessionStorage.getItem("pas_demo_cart_v2");
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }
  function saveCart() {
    sessionStorage.setItem("pas_demo_cart_v2", JSON.stringify(state.cart));
  }

  function money(n) {
    return "$" + Number(n).toFixed(2);
  }
  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function digits(s) {
    return String(s || "").replace(/\D/g, "");
  }
  function formatCard(s) {
    const d = digits(s).slice(0, 16);
    return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function promoFreeQty(qty) {
    return Math.floor(Number(qty) / (PROMO.buy + PROMO.free)) * PROMO.free;
  }
  function promoPaidQty(qty) {
    return Number(qty) - promoFreeQty(qty);
  }
  function lineGross(price, qty) {
    return price * qty;
  }
  function lineDiscount(price, qty) {
    return price * promoFreeQty(qty);
  }
  function lineNet(price, qty) {
    return price * promoPaidQty(qty);
  }

  function cartQty() {
    return state.cart.reduce((s, l) => s + l.qty, 0);
  }
  function cartGross() {
    return state.cart.reduce((s, l) => {
      const p = PRODUCTS.find((x) => x.id === l.id);
      return s + (p ? lineGross(p.price, l.qty) : 0);
    }, 0);
  }
  function cartDiscount() {
    return state.cart.reduce((s, l) => {
      const p = PRODUCTS.find((x) => x.id === l.id);
      return s + (p ? lineDiscount(p.price, l.qty) : 0);
    }, 0);
  }
  function cartSubtotal() {
    return state.cart.reduce((s, l) => {
      const p = PRODUCTS.find((x) => x.id === l.id);
      return s + (p ? lineNet(p.price, l.qty) : 0);
    }, 0);
  }

  function productImg(p, cls) {
    const src = p.img || "img/ps4s-official.jpg";
    const alt = esc(p.brand + " " + p.name + (p.size ? " " + p.size : ""));
    return (
      '<img class="' +
      (cls || "product-photo") +
      '" src="' +
      src +
      '" alt="' +
      alt +
      '" width="640" height="640" loading="lazy" decoding="async" />'
    );
  }

  function priceBlock(p) {
    const unit = p.kind === "accessory" || p.size === "Accessory" ? "" : "<small>/tire</small>";
    return '<div class="price">' + money(p.price) + unit + "</div>";
  }

  function route() {
    const hash = location.hash || "#/";
    if (hash.startsWith("#/checkout")) return "checkout";
    if (hash.startsWith("#/confirm")) return "confirm";
    if (hash.startsWith("#/product/")) return "product";
    return "shop";
  }
  function productIdFromHash() {
    const hash = location.hash || "";
    const m = hash.match(/^#\/product\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function filteredModels() {
    return MODELS.filter((m) => {
      if (state.brand !== "all" && m.brand !== state.brand) return false;
      if (state.size !== "all") {
        if (m.kind === "accessory") return false;
        if (!m.variants.some((v) => v.size === state.size)) return false;
      }
      return true;
    });
  }

  function selectedVariant(model) {
    const preferred = state.selSize[model.id];
    if (preferred && model.variants.some((v) => v.id === preferred)) {
      return model.variants.find((v) => v.id === preferred);
    }
    if (state.size !== "all") {
      const hit = model.variants.find((v) => v.size === state.size);
      if (hit) return hit;
    }
    return model.variants[0];
  }

  function renderShop() {
    const list = filteredModels();
    // Guard: no duplicate image URLs on page
    app.innerHTML =
      '<section class="hero">' +
      '<div class="hero-fit">' +
      '<p class="hero-fit-label">We fit</p>' +
      '<ul class="hero-brands" aria-label="We fit">' +
      ["BMW", "Mercedes-Benz", "Porsche", "Lamborghini", "Ferrari"].map((b) => "<li>" + b + "</li>").join("") +
      "</ul></div>" +
      "<h1>Fitted for the extraordinary</h1>" +
      "<p>Michelin, Pirelli, Bridgestone &amp; Continental UHP sizes for luxury performance cars. Demo checkout is <strong>TEST MODE</strong> only — no real charges.</p>" +
      "</section>" +
      '<section class="filters" aria-label="Filters">' +
      '<div class="filter-row">' +
      '<div class="filter-field"><label class="filter-label" for="filter-size">Tire size</label>' +
      '<select id="filter-size">' +
      '<option value="all"' +
      (state.size === "all" ? " selected" : "") +
      ">All sizes</option>" +
      SIZES.map(
        (s) =>
          '<option value="' +
          s +
          '"' +
          (state.size === s ? " selected" : "") +
          ">" +
          s +
          "</option>"
      ).join("") +
      "</select></div>" +
      '<div class="filter-field"><label class="filter-label" for="filter-brand">Brand</label>' +
      '<select id="filter-brand">' +
      '<option value="all"' +
      (state.brand === "all" ? " selected" : "") +
      ">All brands</option>" +
      BRANDS.map(
        (b) =>
          '<option value="' +
          b +
          '"' +
          (state.brand === b ? " selected" : "") +
          ">" +
          b +
          "</option>"
      ).join("") +
      "</select></div></div>" +
      '<button type="button" class="clear-btn" id="clear-filters">Clear</button>' +
      "</section>" +
      '<div class="results-meta"><h2>Shop</h2><span>' +
      list.length +
      " of " +
      MODELS.length +
      " products</span></div>" +
      '<div class="grid" id="product-grid">' +
      (list.length
        ? list.map(modelCard).join("")
        : '<div class="empty">No products match these filters. Clear filters to see the full selection.</div>') +
      "</div>";

    const sizeSel = document.getElementById("filter-size");
    const brandSel = document.getElementById("filter-brand");
    if (sizeSel)
      sizeSel.addEventListener("change", () => {
        state.size = sizeSel.value;
        render();
      });
    if (brandSel)
      brandSel.addEventListener("change", () => {
        state.brand = brandSel.value;
        render();
      });
    const clear = document.getElementById("clear-filters");
    if (clear) {
      clear.addEventListener("click", () => {
        state.size = "all";
        state.brand = "all";
        render();
      });
    }
    bindModelCards(app);
  }

  function modelCard(m) {
    const v = selectedVariant(m);
    const isAcc = m.kind === "accessory";
    const sizeCtrl = isAcc
      ? '<div class="card-size">' + esc(v.load || "Accessory") + "</div>"
      : '<div class="field size-field"><label class="filter-label" for="size-' +
        m.id +
        '">Size</label>' +
        '<select class="card-size-select" id="size-' +
        m.id +
        '" data-model="' +
        m.id +
        '">' +
        m.variants
          .map(
            (opt) =>
              '<option value="' +
              opt.id +
              '"' +
              (opt.id === v.id ? " selected" : "") +
              ">" +
              opt.size +
              (opt.load ? " · " + opt.load : "") +
              " — " +
              money(opt.price) +
              "</option>"
          )
          .join("") +
        "</select></div>";

    return (
      '<article class="card" data-model="' +
      m.id +
      '">' +
      '<a class="card-art" href="#/product/' +
      encodeURIComponent(v.id) +
      '" aria-label="View ' +
      esc(m.name) +
      '">' +
      productImg({ brand: m.brand, name: m.name, size: v.size, img: m.img }) +
      "</a>" +
      '<div class="card-body">' +
      '<div class="card-brand">' +
      esc(m.brand) +
      "</div>" +
      '<h3 class="card-name"><a href="#/product/' +
      encodeURIComponent(v.id) +
      '">' +
      esc(m.name) +
      "</a></h3>" +
      (m.blurb ? '<p class="card-blurb">' + esc(m.blurb) + "</p>" : "") +
      sizeCtrl +
      '<div class="card-rating"><span class="stars" aria-hidden="true">★★★★☆</span> ' +
      v.rating +
      " · " +
      v.reviews +
      " reviews</div>" +
      '<div class="card-price-row">' +
      '<div class="price" data-price-for="' +
      m.id +
      '">' +
      money(v.price) +
      (isAcc ? "" : "<small>/tire</small>") +
      "</div>" +
      '<button type="button" class="add-btn" data-add-model="' +
      m.id +
      '">Add to cart</button>' +
      "</div></div></article>"
    );
  }

  function bindModelCards(root) {
    root.querySelectorAll(".card-size-select").forEach((sel) => {
      sel.addEventListener("change", () => {
        const modelId = sel.getAttribute("data-model");
        state.selSize[modelId] = sel.value;
        const v = PRODUCTS.find((p) => p.id === sel.value);
        const card = sel.closest(".card");
        if (v && card) {
          const price = card.querySelector('[data-price-for="' + modelId + '"]');
          if (price) {
            price.innerHTML =
              money(v.price) + (v.kind === "accessory" || v.size === "Accessory" ? "" : "<small>/tire</small>");
          }
          card.querySelectorAll('a[href^="#/product/"]').forEach((a) => {
            a.setAttribute("href", "#/product/" + encodeURIComponent(v.id));
          });
        }
      });
    });
    root.querySelectorAll("[data-add-model]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modelId = btn.getAttribute("data-add-model");
        const model = MODELS.find((m) => m.id === modelId);
        if (!model) return;
        const v = selectedVariant(model);
        // sync from select if present
        const sel = document.getElementById("size-" + modelId);
        const id = sel && sel.value ? sel.value : v.id;
        addToCart(id);
        openCart();
      });
    });
  }

  function renderProduct() {
    const id = productIdFromHash();
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) {
      location.hash = "#/";
      return;
    }
    const model = MODELS.find((m) => m.id === p.modelId);
    state.selSize[p.modelId] = p.id;
    const isAcc = p.kind === "accessory";
    const sizeCtrl =
      model && model.variants.length > 1
        ? '<div class="field size-field"><label class="filter-label" for="pd-size">Size</label>' +
          '<select id="pd-size">' +
          model.variants
            .map(
              (opt) =>
                '<option value="' +
                opt.id +
                '"' +
                (opt.id === p.id ? " selected" : "") +
                ">" +
                opt.size +
                (opt.load ? " · " + opt.load : "") +
                " — " +
                money(opt.price) +
                "</option>"
            )
            .join("") +
          "</select></div>"
        : '<div class="card-size">' +
          (isAcc ? esc(p.load || "Accessory") : esc(p.size + (p.load ? " · " + p.load : ""))) +
          "</div>";

    app.innerHTML =
      '<div class="product-page">' +
      '<a class="back-link" href="#/">← Back to shop</a>' +
      '<div class="product-layout">' +
      '<div class="product-art">' +
      productImg(p, "product-photo large") +
      "</div>" +
      '<div class="product-info">' +
      '<div class="card-brand">' +
      esc(p.brand) +
      "</div>" +
      "<h1>" +
      esc(p.name) +
      "</h1>" +
      (p.blurb ? "<p>" + esc(p.blurb) + "</p>" : "") +
      sizeCtrl +
      '<div class="card-rating"><span class="stars" aria-hidden="true">★★★★☆</span> ' +
      p.rating +
      " · " +
      p.reviews +
      " reviews</div>" +
      '<div class="product-price-row">' +
      '<div class="price" id="pd-price">' +
      money(p.price) +
      (isAcc ? "" : "<small>/tire</small>") +
      "</div>" +
      '<button type="button" class="add-btn" id="pd-add">Add to cart</button>' +
      "</div>" +
      '<p class="product-note">Demo checkout is TEST MODE only — no real charges.' +
      (p.asin
        ? ' <a href="https://www.amazon.com/dp/' +
          p.asin +
          "?tag=" +
          TAG +
          '" target="_blank" rel="sponsored noopener">Also listed on Amazon</a>.'
        : "") +
      "</p>" +
      "</div></div></div>";

    const pdSize = document.getElementById("pd-size");
    if (pdSize) {
      pdSize.addEventListener("change", () => {
        location.hash = "#/product/" + encodeURIComponent(pdSize.value);
      });
    }
    document.getElementById("pd-add").onclick = () => {
      const vid = pdSize ? pdSize.value : p.id;
      addToCart(vid);
      openCart();
    };
  }

  function addToCart(id) {
    if (!PRODUCTS.some((p) => p.id === id)) return;
    const line = state.cart.find((l) => l.id === id);
    if (line) line.qty += 1;
    else state.cart.push({ id: id, qty: 1 });
    saveCart();
    updateCartUI();
  }
  function setQty(id, qty) {
    const line = state.cart.find((l) => l.id === id);
    if (!line) return;
    if (qty <= 0) state.cart = state.cart.filter((l) => l.id !== id);
    else line.qty = qty;
    saveCart();
    updateCartUI();
    if (route() === "checkout") render();
  }

  function updateCartUI() {
    cartCount.textContent = String(cartQty());
    if (!state.cart.length) {
      cartBody.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
      cartFoot.innerHTML = "";
      return;
    }
    cartBody.innerHTML = state.cart
      .map((l) => {
        const p = PRODUCTS.find((x) => x.id === l.id);
        if (!p) return "";
        const free = promoFreeQty(l.qty);
        const gross = lineGross(p.price, l.qty);
        const net = lineNet(p.price, l.qty);
        const disc = lineDiscount(p.price, l.qty);
        const sizeLabel =
          p.kind === "accessory" || p.size === "Accessory"
            ? p.load || "Accessory"
            : p.size + (p.load ? " · " + p.load : "");
        return (
          '<div class="cart-line">' +
          '<div class="cart-thumb">' +
          productImg(p, "product-photo thumb") +
          "</div>" +
          "<div><h3>" +
          esc(p.name) +
          "</h3><p>" +
          esc(p.brand) +
          " · " +
          esc(sizeLabel) +
          "</p>" +
          '<div class="qty-row">' +
          '<button type="button" data-qty="' +
          p.id +
          '" data-delta="-1" aria-label="Decrease">−</button>' +
          "<span>" +
          l.qty +
          "</span>" +
          '<button type="button" data-qty="' +
          p.id +
          '" data-delta="1" aria-label="Increase">+</button>' +
          "</div>" +
          (free
            ? '<div class="cart-promo-line">Buy 3 Get 1 Free −' + money(disc) + " (" + free + " free)</div>"
            : "") +
          '<button type="button" class="remove-link" data-remove="' +
          p.id +
          '">Remove</button></div>' +
          '<div class="cart-line-price">' +
          (free ? '<span class="was">' + money(gross) + "</span>" + money(net) : money(net)) +
          "</div></div>"
        );
      })
      .join("");

    const discTotal = cartDiscount();
    cartFoot.innerHTML =
      (discTotal
        ? '<div class="cart-total-row muted"><span>Items</span><span>' +
          money(cartGross()) +
          "</span></div>" +
          '<div class="cart-total-row promo"><span>Buy 3 Get 1 Free</span><span>−' +
          money(discTotal) +
          "</span></div>"
        : "") +
      '<div class="cart-total-row"><span>Subtotal</span><span>' +
      money(cartSubtotal()) +
      "</span></div>" +
      '<a class="primary-btn" href="#/checkout" id="go-checkout">Checkout</a>' +
      '<p style="margin:0;font-size:0.75rem;color:var(--muted);text-align:center">Demo cart only — nothing is ordered or charged.</p>';

    cartBody.querySelectorAll("[data-qty]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-qty");
        const delta = Number(btn.getAttribute("data-delta"));
        const line = state.cart.find((l) => l.id === id);
        setQty(id, (line ? line.qty : 0) + delta);
      });
    });
    cartBody.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => setQty(btn.getAttribute("data-remove"), 0));
    });
    const go = document.getElementById("go-checkout");
    if (go) go.addEventListener("click", () => closeCart());
  }

  function openCart() {
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartScrim.hidden = false;
    document.body.classList.add("cart-open");
    document.getElementById("cart-toggle").setAttribute("aria-expanded", "true");
  }
  function closeCart() {
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartScrim.hidden = true;
    document.body.classList.remove("cart-open");
    document.getElementById("cart-toggle").setAttribute("aria-expanded", "false");
  }

  function renderCheckout() {
    if (!state.cart.length) {
      location.hash = "#/";
      return;
    }
    const c = state.checkout;
    if (c.step > 3) c.step = 3;
    if (c.step < 1) c.step = 1;

    app.innerHTML =
      '<div class="checkout">' +
      "<h1>Checkout</h1>" +
      '<p class="checkout-sub">Demo checkout — no payment processor is contacted.</p>' +
      '<div class="steps">' +
      stepPill(1, "Fulfillment") +
      stepPill(2, "Payment (test)") +
      stepPill(3, "Review") +
      "</div>" +
      (c.step === 1 ? stepFulfillment() : "") +
      (c.step === 2 ? stepPayment() : "") +
      (c.step === 3 ? stepReview() : "") +
      "</div>";

    bindCheckout();
  }

  function stepPill(n, label) {
    const c = state.checkout.step;
    const cls = n === c ? "on" : n < c ? "done" : "";
    return '<span class="step-pill ' + cls + '">' + n + ". " + label + "</span>";
  }

  function stepFulfillment() {
    const c = state.checkout;
    return (
      '<form class="panel" id="fulfill-form">' +
      "<h2>Shipping or install appointment</h2>" +
      '<div class="radio-group" role="radiogroup" aria-label="Fulfillment">' +
      radio("fulfillment", "ship", "Ship to me", "Demo shipping — no package is sent", c.fulfillment === "ship") +
      radio("fulfillment", "install", "Book install appointment", "Demo booking — no shop visit is scheduled", c.fulfillment === "install") +
      "</div>" +
      '<div class="field" style="margin-top:1rem"><label for="name">Full name</label>' +
      '<input id="name" name="name" required autocomplete="name" value="' +
      esc(c.name) +
      '" /></div>' +
      '<div class="field"><label for="email">Email</label>' +
      '<input id="email" name="email" type="email" required autocomplete="email" value="' +
      esc(c.email) +
      '" /></div>' +
      (c.fulfillment === "ship"
        ? '<div class="field"><label for="address">Street address</label>' +
          '<input id="address" name="address" required autocomplete="street-address" value="' +
          esc(c.address) +
          '" /></div>' +
          '<div class="field-row three">' +
          '<div class="field"><label for="city">City</label><input id="city" name="city" required value="' +
          esc(c.city) +
          '" /></div>' +
          '<div class="field"><label for="st">State</label><input id="st" name="state" required maxlength="2" value="' +
          esc(c.state) +
          '" /></div>' +
          '<div class="field"><label for="zip">ZIP</label><input id="zip" name="zip" required value="' +
          esc(c.zip) +
          '" /></div></div>'
        : '<div class="field-row two">' +
          '<div class="field"><label for="date">Preferred date</label><input id="date" name="date" type="date" required value="' +
          esc(c.date) +
          '" /></div>' +
          '<div class="field"><label for="time">Time window</label>' +
          '<select id="time" name="time">' +
          opt("09:00", "9:00–11:00 AM", c.time) +
          opt("11:00", "11:00 AM–1:00 PM", c.time) +
          opt("13:00", "1:00–3:00 PM", c.time) +
          opt("15:00", "3:00–5:00 PM", c.time) +
          "</select></div></div>" +
          '<p style="font-size:0.8rem;color:var(--muted);margin:0 0 0.75rem">Demo atelier: Premium Auto Service · Sample location, NJ</p>') +
      '<div class="actions">' +
      '<a class="secondary-btn" href="#/">Back to shop</a>' +
      '<button type="submit" class="primary-btn">Continue to payment</button>' +
      "</div></form>"
    );
  }

  function stepPayment() {
    const c = state.checkout;
    return (
      '<form class="panel" id="pay-form">' +
      "<h2>Payment <span class=\"demo-pill\">TEST MODE</span></h2>" +
      '<div class="test-banner"><strong>TEST MODE — simulated Stripe-style form.</strong> ' +
      "No network call to Stripe. Charges nothing. Accepts only the public test number " +
      "<code>4242 4242 4242 4242</code>. Any other number is rejected.</div>" +
      '<p class="pay-key">Publishable key (placeholder, not real): <code>' +
      FAKE_PK +
      "</code></p>" +
      '<div class="field"><label for="cardName">Name on card</label>' +
      '<input id="cardName" name="cardName" required autocomplete="cc-name" value="' +
      esc(c.cardName) +
      '" /></div>' +
      '<div class="field"><label for="cardNumber">Card number</label>' +
      '<input id="cardNumber" name="cardNumber" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" required value="' +
      esc(formatCard(c.cardNumber)) +
      '" />' +
      '<div class="err" id="card-err" hidden></div></div>' +
      '<div class="field-row two">' +
      '<div class="field"><label for="exp">Expiry (MM/YY)</label>' +
      '<input id="exp" name="exp" placeholder="12/28" required autocomplete="cc-exp" value="' +
      esc(c.exp) +
      '" /></div>' +
      '<div class="field"><label for="cvc">CVC</label>' +
      '<input id="cvc" name="cvc" inputmode="numeric" required autocomplete="cc-csc" maxlength="4" value="' +
      esc(c.cvc) +
      '" /></div></div>' +
      '<div class="actions">' +
      '<button type="button" class="secondary-btn" id="back-fulfill">Back</button>' +
      '<button type="submit" class="primary-btn">Review order</button>' +
      "</div></form>"
    );
  }

  function stepReview() {
    const c = state.checkout;
    const lines = state.cart
      .map((l) => {
        const p = PRODUCTS.find((x) => x.id === l.id);
        if (!p) return "";
        const free = promoFreeQty(l.qty);
        const net = lineNet(p.price, l.qty);
        const disc = lineDiscount(p.price, l.qty);
        return (
          '<div class="line"><span>' +
          l.qty +
          "× " +
          p.name +
          " (" +
          p.size +
          ')</span><span>' +
          money(lineGross(p.price, l.qty)) +
          "</span></div>" +
          (free
            ? '<div class="line promo"><span>Buy 3 Get 1 Free (−' +
              free +
              ")</span><span>−" +
              money(disc) +
              "</span></div>"
            : "")
        );
      })
      .join("");
    const fulfill =
      c.fulfillment === "ship"
        ? "Ship to " + esc(c.name) + ", " + esc(c.address) + ", " + esc(c.city) + " " + esc(c.state) + " " + esc(c.zip)
        : "Install appointment · " + esc(c.date) + " · " + esc(c.time) + " window";
    return (
      '<div class="panel">' +
      "<h2>Review demo order</h2>" +
      '<div class="order-summary">' +
      lines +
      '<div class="line"><span>Shipping / install</span><span>Demo · $0.00</span></div>' +
      (cartDiscount()
        ? '<div class="line promo"><span>Promo savings</span><span>−' +
          money(cartDiscount()) +
          "</span></div>"
        : "") +
      '<div class="line total"><span>Total</span><span>' +
      money(cartSubtotal()) +
      "</span></div></div>" +
      '<p style="font-size:0.85rem;color:var(--muted);margin:0.85rem 0 0">' +
      fulfill +
      "<br/>Paid with test card ending 4242 · key " +
      FAKE_PK +
      "</p>" +
      '<div class="actions" style="margin-top:1rem">' +
      '<button type="button" class="secondary-btn" id="back-pay">Back</button>' +
      '<button type="button" class="primary-btn" id="place-order">Place demo order</button>' +
      "</div>" +
      '<p style="font-size:0.75rem;color:var(--muted);margin:0.75rem 0 0">Places a local demo confirmation only. No charge, no email, no inventory change.</p>' +
      "</div>"
    );
  }

  function radio(name, value, title, sub, checked) {
    return (
      '<label class="radio-card"><input type="radio" name="' +
      name +
      '" value="' +
      value +
      '"' +
      (checked ? " checked" : "") +
      " />" +
      "<div><strong>" +
      title +
      "</strong><span>" +
      sub +
      "</span></div></label>"
    );
  }
  function opt(v, label, cur) {
    return '<option value="' + v + '"' + (cur === v ? " selected" : "") + ">" + label + "</option>";
  }
  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function digits(s) {
    return String(s || "").replace(/\D/g, "");
  }
  function formatCard(s) {
    const d = digits(s).slice(0, 16);
    return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function bindCheckout() {
    const c = state.checkout;
    const fulfillForm = document.getElementById("fulfill-form");
    if (fulfillForm) {
      fulfillForm.querySelectorAll('input[name="fulfillment"]').forEach((r) => {
        r.addEventListener("change", () => {
          c.fulfillment = r.value;
          // preserve typed fields
          c.name = fulfillForm.name.value;
          c.email = fulfillForm.email.value;
          render();
        });
      });
      fulfillForm.addEventListener("submit", (e) => {
        e.preventDefault();
        c.name = fulfillForm.name.value.trim();
        c.email = fulfillForm.email.value.trim();
        if (c.fulfillment === "ship") {
          c.address = fulfillForm.address.value.trim();
          c.city = fulfillForm.city.value.trim();
          c.state = fulfillForm.state.value.trim().toUpperCase();
          c.zip = fulfillForm.zip.value.trim();
        } else {
          c.date = fulfillForm.date.value;
          c.time = fulfillForm.time.value;
        }
        c.step = 2;
        render();
      });
    }

    const payForm = document.getElementById("pay-form");
    if (payForm) {
      const cardInput = document.getElementById("cardNumber");
      cardInput.addEventListener("input", () => {
        const pos = cardInput.selectionStart;
        const before = cardInput.value;
        cardInput.value = formatCard(before);
        // naive caret restore
        try {
          cardInput.setSelectionRange(cardInput.value.length, cardInput.value.length);
        } catch (_) {}
      });
      document.getElementById("back-fulfill").addEventListener("click", () => {
        c.step = 1;
        render();
      });
      payForm.addEventListener("submit", (e) => {
        e.preventDefault();
        c.cardName = payForm.cardName.value.trim();
        c.cardNumber = digits(payForm.cardNumber.value);
        c.exp = payForm.exp.value.trim();
        c.cvc = payForm.cvc.value.trim();
        const err = document.getElementById("card-err");
        if (c.cardNumber !== TEST_CARD) {
          err.hidden = false;
          err.textContent =
            "TEST MODE: only Stripe’s public test number 4242 4242 4242 4242 is accepted. No charge is made.";
          return;
        }
        err.hidden = true;
        // Explicitly no Stripe / network call — local validation only.
        c.step = 3;
        render();
      });
    }

    const backPay = document.getElementById("back-pay");
    if (backPay) {
      backPay.addEventListener("click", () => {
        c.step = 2;
        render();
      });
    }
    const place = document.getElementById("place-order");
    if (place) {
      place.addEventListener("click", () => {
        // Simulated authorization only. No fetch/XHR to Stripe or any payment API.
        c.orderId = "DEMO-" + Date.now().toString(36).toUpperCase();
        const snapshot = {
          orderId: c.orderId,
          total: cartSubtotal(),
          lines: state.cart.map((l) => ({ ...l })),
          fulfillment: c.fulfillment,
          name: c.name,
          email: c.email,
        };
        sessionStorage.setItem("summit_tire_demo_order", JSON.stringify(snapshot));
        state.cart = [];
        saveCart();
        updateCartUI();
        location.hash = "#/confirm";
      });
    }
  }

  function renderConfirm() {
    let order = null;
    try {
      order = JSON.parse(sessionStorage.getItem("summit_tire_demo_order") || "null");
    } catch (_) {}
    if (!order) {
      location.hash = "#/";
      return;
    }
    app.innerHTML =
      '<div class="checkout confirm">' +
      '<div class="confirm-check" aria-hidden="true">✓</div>' +
      "<h1>Demo order confirmed</h1>" +
      "<p>This is a local simulation. Nothing was charged, shipped, or emailed.</p>" +
      '<div class="confirm-box">' +
      "<div><strong>Order ID</strong><br/>" +
      esc(order.orderId) +
      "</div>" +
      '<div style="margin-top:0.65rem"><strong>Total</strong><br/>' +
      money(order.total) +
      " (demo)</div>" +
      '<div style="margin-top:0.65rem"><strong>Payment</strong><br/>Test card · 4242 · ' +
      FAKE_PK +
      "</div>" +
      '<div style="margin-top:0.65rem"><strong>Customer</strong><br/>' +
      esc(order.name) +
      " · " +
      esc(order.email) +
      "</div></div>" +
      '<a class="primary-btn" href="#/" style="max-width:220px;margin:0 auto">Back to shop</a>' +
      "</div>";
    state.checkout.step = 1;
  }

  function render() {
    const r = route();
    if (r === "checkout") renderCheckout();
    else if (r === "confirm") renderConfirm();
    else if (r === "product") renderProduct();
    else renderShop();
    updateCartUI();
  }

  document.getElementById("cart-toggle").addEventListener("click", () => {
    if (cartDrawer.classList.contains("open")) closeCart();
    else openCart();
  });
  document.getElementById("cart-close").addEventListener("click", closeCart);
  cartScrim.addEventListener("click", closeCart);
  window.addEventListener("hashchange", render);

  render();
})();
