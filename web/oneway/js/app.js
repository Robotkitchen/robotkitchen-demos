/**
 * One Way — rider SPA (Robot Kitchen demo)
 * Fare quotes via /api/oneway/quote (home base stays server-side).
 */
import { t, initI18n } from "./i18n.js?v=20261106lang";
import { stampCardHtml } from "./stamps.js?v=20261105b";

const STORAGE_KEY = "oneway_demo_trip_v1";
const GEOCODE_UA = "OneWayRobotKitchenDemo/1.0 (contact: robotkitchen.us)";

const state = {
  mode: null, // to_airport | from_airport | other
  pickup: null,
  dropoff: null,
  airportCode: null,
  passengers: 1,
  bags: 0,
  flight: "",
  when: "later",
  bookingId: null,
  riderToken: null,
  pickupAt: null,
  quote: null,
  rating: 5,
  tip: 5,
  tripId: null,
  maps: { book: null, live: null },
  markers: {},
  routeLine: null,
  carMarker: null,
  liveTimer: null,
  config: null,
  payStatus: "pending",
};

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(() => t.classList.remove("show"), 2400);
}

function showScreen(name) {
  $$(".screen").forEach((s) => s.classList.toggle("active", s.dataset.screen === name));
  if (name === "book") setTimeout(() => invalidateMaps(), 50);
  if (name === "live") setTimeout(() => invalidateMaps(), 50);
  location.hash = name;
}

function invalidateMaps() {
  if (state.maps.book) state.maps.book.invalidateSize();
  if (state.maps.live) state.maps.live.invalidateSize();
}

function saveTrip(extra = {}) {
  const payload = {
    id: state.tripId,
    mode: state.mode,
    pickup: state.pickup,
    dropoff: state.dropoff,
    airportCode: state.airportCode,
    passengers: state.passengers,
    flight: state.flight,
    quote: state.quote,
    rating: state.rating,
    tip: state.tip,
    status: extra.status || "requested",
    updatedAt: Date.now(),
    ...extra,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  try {
    new BroadcastChannel("oneway_demo").postMessage({ type: "trip", payload });
  } catch (_) {}
  return payload;
}

async function loadConfig() {
  try {
    const res = await fetch("/api/oneway/config");
    const data = await res.json();
    if (data.ok) {
      state.config = data.config;
      return;
    }
  } catch (_) {}
  // Offline fallback (no home coords)
  state.config = {
    maxPassengers: 6,
    baseMaxPassengers: 4,
    largeGroupMultiplier: 1.35,
    freeBagsPerPassenger: 1,
    extraBagFeeUsd: 0,
    maxBagsPerPassenger: 2,
    airports: {
      EWR: { code: "EWR", name: "Newark Liberty", nameZh: "紐瓦克", lat: 40.6895, lng: -74.1745 },
      JFK: { code: "JFK", name: "JFK International", nameZh: "甘迺迪", lat: 40.6413, lng: -73.7781 },
      LGA: { code: "LGA", name: "LaGuardia", nameZh: "拉瓜地亞", lat: 40.7769, lng: -73.874 },
    },
    mapCenter: { lat: 40.5, lng: -74.3, zoom: 10 },
  };
}

async function fetchQuote() {
  const area = $("#fare-area");
  const btn = $("#btn-request");
  if (!state.pickup || !state.dropoff) {
    area.innerHTML = "";
    btn.disabled = true;
    state.quote = null;
    return;
  }
  area.innerHTML = `<div style="padding:8px;color:var(--muted);font-size:13px">${t("estimating")}</div>`;
  btn.disabled = true;
  try {
    const res = await fetch("/api/oneway/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickup: { lat: state.pickup.lat, lng: state.pickup.lng },
        dropoff: { lat: state.dropoff.lat, lng: state.dropoff.lng },
        passengers: state.passengers,
        bags: state.bags,
        airportCode: state.airportCode,
        riderPhone: ($("#rider-phone")?.value || "").trim() || undefined,
        role: "rider",
      }),
    });
    const data = await res.json();
    state.quote = data;
    if (!data.ok) {
      area.innerHTML = `<div class="fare-error">${data.error === "invalid_passengers" ? t("invalidPax") : data.error === "invalid_bags" ? t("invalidBags") : t("outside")}</div>`;
      btn.disabled = true;
      return;
    }
    const lugLine = `<div class="lug-line">${t("lugIncluded", data.freeBags)}</div>`;
    area.innerHTML = `
      <div class="fare-box">
        <div>
          <div class="label">${t("yourFare")}</div>
          <div class="amount price price-on-dark">${usd(data.fare)}</div>
          ${lugLine}
        </div>
        <div class="meta">
          ~${data.riderLegMiles} ${t("riderLeg")}<br />
          ~${data.etaMinutes} ${t("min")}<br />
          ${t("paxCount", data.passengers)}
        </div>
      </div>${loyaltyHtml(data)}`;
    updateLugWarn(data);
    btn.disabled = false;
  } catch (e) {
    area.innerHTML = `<div class="fare-error">${t("apiFail")}</div>`;
  }
}

function initMap(id) {
  const center = state.config?.mapCenter || { lat: 40.5, lng: -74.3, zoom: 10 };
  const map = L.map(id, { zoomControl: false, attributionControl: true }).setView(
    [center.lat, center.lng],
    center.zoom || 10
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  }).addTo(map);
  L.control.zoom({ position: "bottomleft" }).addTo(map);
  return map;
}

function pinIcon(color, label) {
  return L.divIcon({
    className: "car-marker-icon",
    html: `<div style="background:${color};color:#fff;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25)">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function carIcon() {
  return L.divIcon({
    className: "car-marker-icon",
    html: `<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35));transform:rotate(90deg)">🚗</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function updateBookMarkers() {
  const map = state.maps.book;
  if (!map) return;
  if (state.markers.pickup) map.removeLayer(state.markers.pickup);
  if (state.markers.dropoff) map.removeLayer(state.markers.dropoff);
  if (state.routeLine) map.removeLayer(state.routeLine);
  const bounds = [];
  if (state.pickup) {
    state.markers.pickup = L.marker([state.pickup.lat, state.pickup.lng], {
      icon: pinIcon("#111111", "P"),
    })
      .addTo(map)
      .bindPopup(t("pickup") + "<br>" + (state.pickup.label || ""));
    bounds.push([state.pickup.lat, state.pickup.lng]);
  }
  if (state.dropoff) {
    state.markers.dropoff = L.marker([state.dropoff.lat, state.dropoff.lng], {
      icon: pinIcon("#b8901f", "D"),
    })
      .addTo(map)
      .bindPopup(t("dropoff") + "<br>" + (state.dropoff.label || ""));
    bounds.push([state.dropoff.lat, state.dropoff.lng]);
  }
  if (state.pickup && state.dropoff) {
    state.routeLine = L.polyline(
      [
        [state.pickup.lat, state.pickup.lng],
        [state.dropoff.lat, state.dropoff.lng],
      ],
      { color: "#9a7417", weight: 4, opacity: 0.85, dashArray: "8 6" }
    ).addTo(map);
  }
  if (bounds.length === 1) map.setView(bounds[0], 12);
  else if (bounds.length === 2) map.fitBounds(bounds, { padding: [40, 40] });
}

async function geocode(q) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&accept-language=en&q=" +
    encodeURIComponent(q);
  const res = await fetch(url, { headers: { Accept: "application/json", "Accept-Language": "en" } });
  const data = await res.json();
  if (!data?.length) throw new Error("not found");
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    label: data[0].display_name.split(",").slice(0, 3).join(","),
  };
}

function fillAirportSelect() {
  const sel = $("#airport-select");
  if (!sel) return;
  const aps = state.config.airports;
  const cur = state.airportCode || "EWR";
  sel.innerHTML = Object.values(aps)
    .map((a) => `<option value="${a.code}" ${a.code === cur ? "selected" : ""}>${a.code} · ${document.documentElement.lang.startsWith("zh") ? a.nameZh : a.name}</option>`)
    .join("");
  sel.onchange = () => {
    const code = sel.value;
    state.airportCode = code;
    const ap = aps[code];
    if (!ap) return;
    const point = { lat: ap.lat, lng: ap.lng, label: `${ap.code} · ${ap.name}` };
    if (state.mode === "to_airport") {
      state.dropoff = point;
      $("#input-dropoff").value = point.label;
    } else if (state.mode === "from_airport") {
      state.pickup = point;
      $("#input-pickup").value = point.label;
    }
    updateBookMarkers();
    fetchQuote();
  };
}

function fillPaxBagsSelects() {
  const max = state.config.maxPassengers || 6;
  const baseMax = state.config.baseMaxPassengers || 4;
  const paxSel = $("#pax-select");
  const bagSel = $("#bags-select");
  if (!paxSel || !bagSel) return;
  paxSel.innerHTML = Array.from({ length: max }, (_, i) => i + 1)
    .map((n) => `<option value="${n}" ${n === state.passengers ? "selected" : ""}>${n}</option>`)
    .join("");
  const rebuildBags = () => {
    const maxBags = state.passengers * (state.config.maxBagsPerPassenger || 2);
    // Allow a couple over soft capacity so the oversize warning can appear
    const hard = Math.min(24, maxBags + 2);
    if (state.bags > hard) state.bags = hard;
    const opts = Array.from({ length: hard + 1 }, (_, n) => n);
    bagSel.innerHTML = opts.map((n) => `<option value="${n}" ${n === state.bags ? "selected" : ""}>${n}</option>`).join("");
    updateLugNote();
  };
  rebuildBags();
  $("#pax-note").textContent = t("paxNote", baseMax, max);
  paxSel.onchange = () => {
    state.passengers = Number(paxSel.value);
    rebuildBags();
    fetchQuote();
  };
  bagSel.onchange = () => {
    state.bags = Number(bagSel.value);
    updateLugNote();
    fetchQuote();
  };
}

function applyModeFromSelect(mode, { seed = true } = {}) {
  state.mode = mode || null;
  const fields = $("#book-fields");
  if (!mode) {
    fields.classList.add("hidden");
    state.pickup = state.dropoff = null;
    state.airportCode = null;
    state.quote = null;
    $("#fare-area").innerHTML = "";
    $("#btn-request").disabled = true;
    return;
  }
  fields.classList.remove("hidden");
  state.pickup = null;
  state.dropoff = null;
  state.airportCode = null;
  state.quote = null;
  state.flight = "";
  $("#input-pickup").value = "";
  $("#input-dropoff").value = "";
  $("#flight-number").value = "";
  $("#fare-area").innerHTML = "";
  $("#btn-request").disabled = true;
  state.when = "later";
  initPicker();
  applyBookLabels();
  fillAirportSelect();
  fillPaxBagsSelects();
  const other = mode === "other";
  const fromAirport = mode === "from_airport";
  $("#airport-field").classList.toggle("hidden", other);
  $("#flight-field").classList.toggle("hidden", !fromAirport);
  if (!state.maps.book) state.maps.book = initMap("map-book");
  else invalidateMaps();
  if (seed) {
    if (other) {
      state.pickup = { lat: 40.4862, lng: -74.4518, label: "New Brunswick, NJ" };
      $("#input-pickup").value = state.pickup.label;
      state.dropoff = { lat: 40.3166, lng: -74.6237, label: "Princeton Junction Station, NJ" };
      $("#input-dropoff").value = state.dropoff.label;
    } else if (fromAirport) {
      const ap = state.config.airports.EWR;
      state.airportCode = "EWR";
      state.pickup = { lat: ap.lat, lng: ap.lng, label: `${ap.code} · ${ap.name}` };
      $("#input-pickup").value = state.pickup.label;
      $("#airport-select").value = "EWR";
      state.dropoff = { lat: 40.4862, lng: -74.4518, label: "New Brunswick, NJ" };
      $("#input-dropoff").value = state.dropoff.label;
    } else {
      state.pickup = { lat: 40.4862, lng: -74.4518, label: "New Brunswick, NJ" };
      $("#input-pickup").value = state.pickup.label;
      const ap = state.config.airports.EWR;
      state.airportCode = "EWR";
      state.dropoff = { lat: ap.lat, lng: ap.lng, label: `${ap.code} · ${ap.name}` };
      $("#input-dropoff").value = state.dropoff.label;
      $("#airport-select").value = "EWR";
    }
  }
  updateBookMarkers();
  fetchQuote();
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function startLiveTrip() {
  showScreen("live");
  $("#live-fare").textContent = `$${state.quote.fare}`;
  if (!state.maps.live) state.maps.live = initMap("map-live");
  const map = state.maps.live;
  map.eachLayer((l) => {
    if (l instanceof L.Marker || l instanceof L.Polyline) map.removeLayer(l);
  });
  // re-add tiles if wiped — safer: just clear markers we track
  const A = state.pickup;
  const B = state.dropoff;
  L.marker([A.lat, A.lng], { icon: pinIcon("#111111", "P") })
    .addTo(map)
    .bindPopup(t("pickup"));
  L.marker([B.lat, B.lng], { icon: pinIcon("#b8901f", "D") })
    .addTo(map)
    .bindPopup(t("dropoff"));
  const line = L.polyline(
    [
      [A.lat, A.lng],
      [B.lat, B.lng],
    ],
    { color: "#9a7417", weight: 4 }
  ).addTo(map);
  map.fitBounds(line.getBounds(), { padding: [50, 50] });

  // Start car near pickup (simulating approach then trip)
  let tt = 0;
  const totalMs = 12000;
  const start = Date.now();
  if (state.carMarker) map.removeLayer(state.carMarker);
  state.carMarker = L.marker([A.lat, A.lng], { icon: carIcon() }).addTo(map);

  const phases = [
    { until: 0.25, key: "enRoute", etaBase: 4 },
    { until: 0.35, key: "arriving", etaBase: 1 },
    { until: 1, key: "onTrip", etaBase: null },
  ];

  clearInterval(state.liveTimer);
  state.liveTimer = setInterval(() => {
    const elapsed = Date.now() - start;
    tt = Math.min(1, elapsed / totalMs);
    // Approach then ride: first 30% circle near A, then A→B
    let lat, lng;
    if (tt < 0.3) {
      const ang = tt * 20;
      lat = A.lat + 0.008 * Math.cos(ang);
      lng = A.lng + 0.008 * Math.sin(ang);
      // ease toward A at end of approach
      const u = tt / 0.3;
      lat = lerp(lat, A.lat, u * u);
      lng = lerp(lng, A.lng, u * u);
    } else {
      const u = (tt - 0.3) / 0.7;
      lat = lerp(A.lat, B.lat, u);
      lng = lerp(A.lng, B.lng, u);
    }
    state.carMarker.setLatLng([lat, lng]);
    const phase = phases.find((p) => tt <= p.until) || phases[phases.length - 1];
    $("#live-phase").textContent = t(phase.key);
    const remainMin = Math.max(0, Math.ceil(((1 - tt) * totalMs) / 60000 * 8)); // theatrical ETA
    $("#live-eta").textContent = tt >= 0.99 ? `0 ${t("min")}` : `${Math.max(1, remainMin)} ${t("min")}`;
    if (tt >= 1) {
      clearInterval(state.liveTimer);
      saveTrip({ status: "completed" });
      setTimeout(() => showRating(), 600);
    }
  }, 100);
  saveTrip({ status: "in_progress" });
}

function showRating() {
  showScreen("rating");
  const stars = $("#stars");
  stars.innerHTML = [1, 2, 3, 4, 5]
    .map((n) => `<button type="button" class="star ${n <= state.rating ? "on" : ""}" data-n="${n}" aria-label="${n} stars">★</button>`)
    .join("");
  stars.onclick = (e) => {
    const b = e.target.closest(".star");
    if (!b) return;
    state.rating = Number(b.dataset.n);
    $$(".star", stars).forEach((s) => s.classList.toggle("on", Number(s.dataset.n) <= state.rating));
  };
  const tips = $("#tips");
  const amounts = [0, 3, 5, 8, 12];
  tips.innerHTML = amounts
    .map(
      (n) =>
        `<button type="button" class="tip-pill ${n === state.tip ? "active" : ""}" data-tip="${n}">${n === 0 ? t("noTip") : `<span class="price">$${n}</span>`}</button>`
    )
    .join("");
  tips.onclick = (e) => {
    const b = e.target.closest(".tip-pill");
    if (!b) return;
    state.tip = Number(b.dataset.tip);
    $$(".tip-pill", tips).forEach((x) => x.classList.toggle("active", Number(x.dataset.tip) === state.tip));
  };
}

/* Online payment removed: reservation shows the fare only. */

async function requestRide() {
  state.flight = ($("#flight-number").value || "").trim().toUpperCase();
  if (state.mode === "from_airport" && !state.flight) { toast(t("flightReq")); $("#flight-number").focus(); return; }
  if (!state.quote?.ok) return;
  if (!$("#agree-terms").checked) { toast(t("agreeReq")); $("#agree-terms").focus(); return; }
  const riderName = $("#rider-name").value.trim();
  const riderPhone = $("#rider-phone").value.trim();
  if (!riderName) { toast(t("nameReq")); $("#rider-name").focus(); return; }
  if (!/^[+()\d\s.-]{7,30}$/.test(riderPhone) || riderPhone.replace(/\D/g, "").length < 10) { toast(t("phoneReq")); $("#rider-phone").focus(); return; }
  const riderEmail = $("#rider-email").value.trim();
  if (riderEmail && !EMAIL_RE.test(riderEmail)) { toast(t("emailReq")); $("#rider-email").focus(); return; }
  const bags = Number($("#bags-select")?.value || state.bags || 0);
  state.bags = bags;
  const luggage = { bags, large: bags, carryOn: 0 };
  let pickupLocal = null;
  if (state.when === "later") {
    pickupLocal = $("#pickup-time").value;
    if (!pickupLocal) { toast(t("timeReq")); $("#pickup-time").focus(); return; }
    if (pickupLocal < nyLocalString(Date.now() + 2 * 3600e3 - 60e3)) { toast(t("tooSoon")); return; }
  }
  const btn = $("#btn-request");
  btn.disabled = true;
  let data;
  try {
    const res = await fetch("/api/oneway/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: state.mode,
        pickup: { lat: state.pickup.lat, lng: state.pickup.lng },
        dropoff: { lat: state.dropoff.lat, lng: state.dropoff.lng },
        pickupText: state.pickup.label || $("#input-pickup").value,
        dropoffText: state.dropoff.label || $("#input-dropoff").value,
        airportCode: state.airportCode,
        passengers: state.passengers,
        bags: state.bags,
        when: state.when,
        pickupLocal,
        flight: state.flight,
        riderName,
        riderPhone,
        riderEmail,
        luggage,
        agreedTerms: true,
        termsVersion: state.config?.terms?.version,
        lang: document.documentElement.lang.startsWith("zh") ? "zh" : "en",
      }),
    });
    data = await res.json();
  } catch (_) { data = { ok: false }; }
  btn.disabled = false;
  if (!data.ok) {
    toast(data.error === "email_invalid" ? t("emailReq") : data.error === "flight_required" ? t("flightReq") : data.error === "luggage_over_limit" ? t("lugOver", state.passengers) : data.error === "time_required" ? t("timeReq") : data.error === "terms_required" ? t("agreeReq") : data.error === "too_soon" ? t("tooSoon") : data.error === "phone_invalid" ? t("phoneReq") : data.error === "name_required" ? t("nameReq") : t("bookFail"));
    return;
  }
  state.bookingId = data.booking.id;
  state.riderToken = data.riderToken;
  state.pickupAt = data.booking.pickupAt;
  state.tripId = data.booking.id;
  state.driverNotify = data.notify || null;
  saveTrip({ status: "requested", bookingId: state.bookingId, pickupAt: state.pickupAt });
  showBooked();
  return;
  showScreen("matching");
  setTimeout(() => {
    saveTrip({ status: "matched", driver: { name: "Alex", car: "White SUV · OW-4821" } });
    startLiveTrip();
  }, 2800);
}

function wireEvents() {
  $("#mode-select").onchange = () => applyModeFromSelect($("#mode-select").value);
  $$("[data-go]").forEach((b) => (b.onclick = () => showScreen(b.dataset.go)));
  $("#btn-request").onclick = requestRide;
  if ($("#btn-skip-live")) $("#btn-skip-live").onclick = () => {
    clearInterval(state.liveTimer);
    saveTrip({ status: "completed" });
    showRating();
  };
  if ($("#btn-pay")) $("#btn-pay").onclick = handlePaymentAndReceipt;
  if ($("#btn-home-again")) $("#btn-home-again").onclick = () => {
    clearInterval(state.liveTimer);
    showScreen("home");
  };

  let geoTimer;
  const bindGeo = (inputId, which) => {
    const input = $(inputId);
    input.addEventListener("change", async () => {
      const q = input.value.trim();
      if (!q) return;
      try {
        toast(t("lookingUp"));
        const pt = await geocode(q + (/,?\s*NJ\b/i.test(q) ? "" : ", NJ"));
        state[which] = pt;
        input.value = pt.label;
        updateBookMarkers();
        fetchQuote();
      } catch {
        toast(t("notFound"));
      }
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.dispatchEvent(new Event("change"));
      }
    });
  };
  bindGeo("#input-pickup", "pickup");
  bindGeo("#input-dropoff", "dropoff");
}

const NY = "America/New_York";
function nyLocalString(ms) {
  const o = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: NY, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return `${o.year}-${o.month}-${o.day}T${o.hour}:${o.minute}`;
}
function fmtNy(iso) {
  return new Date(iso).toLocaleString(document.documentElement.lang, { timeZone: NY, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + " ET";
}
const usd = (n) => { const v = Number(n || 0); return "$" + (Number.isInteger(v) ? v : v.toFixed(2)); };
function receiptHref() {
  return `receipt/?id=${encodeURIComponent(state.bookingId || "")}&t=${encodeURIComponent(state.riderToken || "")}`;
}
function loyaltyHtml(q) {
  const L = q.loyalty;
  if (!L) return "";
  if (L.discount > 0)
    return `<div class="loyalty-line on"><span>${t("loyaltyNext", L.discountPct)}</span><span><s class="price">${usd(q.fareBase)}</s> −<span class="price">${usd(L.discount)}</span></span></div>`;
  if (L.completedRides > 0) {
    const n = L.stampsPerCard || 5;
    return `<div class="loyalty-line"><span>${t("stampProgress", L.stamps, n, n - L.stamps, state.config?.loyalty?.discountPct ?? 10)}</span></div>`;
  }
  return "";
}
let lookupTimer;
function setupWelcomeBack() {
  const inp = $("#rider-phone");
  const box = $("#welcome-back");
  const run = async () => {
    const phone = inp.value.trim();
    const digits = phone.replace(/\D/g, "");
    box.hidden = true;
    if (digits.length < 10) return;
    try {
      const r = await fetch("/api/oneway/customers/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const d = await r.json();
      if (d.ok && d.found && inp.value.trim() === phone) {
        state.welcome = d;
        box.innerHTML = `<div class="wb-title">${t("welcomeBack2")}</div>${stampCardHtml(d.stamps, d.stampsPerCard, state.config?.loyalty?.discountPct ?? 10)}`;
        box.hidden = false;
      }
    } catch (_) {}
    fetchQuote();
  };
  inp.addEventListener("input", () => { clearTimeout(lookupTimer); lookupTimer = setTimeout(run, 600); });
  inp.addEventListener("change", run);
}
const escHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const EMAIL_RE = /^[^\s@<>()",;:]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,24}$/;
function initPicker() {
  const min = nyLocalString(Date.now() + 2 * 3600e3 + 5 * 60e3);
  const inp = $("#pickup-time");
  inp.min = min;
  inp.max = nyLocalString(Date.now() + 89 * 864e5);
  if (!inp.value || inp.value < min) {
    const d = new Date(Date.now() + 2 * 3600e3 + 15 * 60e3);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    inp.value = nyLocalString(d.getTime());
  }
}
function updateLugNote() {
  const n = state.passengers || 1;
  const free = n * (state.config?.freeBagsPerPassenger || 2);
  const maxB = n * (state.config?.maxBagsPerPassenger || 2);
  $("#lug-note").textContent = t("lugNote", free, 0, maxB);
}
function updateLugWarn(q) {
  const w = $("#lug-warn");
  if (!w) return;
  if (q?.overCapacity) {
    w.textContent = t("lugWarn", q.bags, q.maxBags);
    w.classList.remove("hidden");
  } else {
    w.textContent = "";
    w.classList.add("hidden");
  }
}
function setupWhen() {
  return;
  const row = $("#when-row");
  row.onclick = (e) => {
    const b = e.target.closest(".when-pill");
    if (!b) return;
    state.when = b.dataset.when;
    $$(".when-pill", row).forEach((x) => x.classList.toggle("active", x === b));
    const later = state.when === "later";
    $("#when-field").hidden = !later;
    if (later) {
      const min = nyLocalString(Date.now() + 2 * 3600e3 + 5 * 60e3);
      const inp = $("#pickup-time");
      inp.min = min;
      inp.max = nyLocalString(Date.now() + 89 * 864e5);
      if (!inp.value || inp.value < min) {
        // round up to next 15 min
        const d = new Date(Date.now() + 2 * 3600e3 + 15 * 60e3);
        d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
        inp.value = nyLocalString(d.getTime());
      }
    }
  };
}
function showBooked() {
  $("#booked-id").textContent = `${t("bookingRef")} ${state.bookingId}`;
  const rows = [
    [t("pickupTime"), fmtNy(state.pickupAt)],
    [t("lugLabel"), String(state.bags ?? $("#bags-select")?.value ?? 0)],
    [t("route"), `${state.pickup?.label || ""} → ${state.dropoff?.label || ""}`],
    [t("paxLabel"), String(state.passengers)],
    [t("flight"), state.flight || "—"],
    [t("fare"), `<span class="price">$${state.quote?.fare ?? "—"}</span>`],
  ];
  $("#booked-receipt").href = receiptHref();
  $("#booked-rows").innerHTML = rows.map(([k, v]) => `<div class="receipt-row"><span>${k}</span><span class="amt">${v}</span></div>`).join("");
  const note = document.querySelector("#screen-booked [data-i18n=bookedNote], #screen-booked .pax-note");
  const n = state.driverNotify;
  let key = "bookedNote";
  if (n?.mocked || n?.mode === "mock") key = "bookedNoteMock";
  else if (n?.sent && n?.mode === "gas") key = "bookedNoteGas";
  else if (n?.skipped || n?.mode === "off") key = "bookedNoteOff";
  if (note) note.textContent = t(key);
  showScreen("booked");
}

function applyBookLabels() {
  const fromAirport = state.mode === "from_airport";
  if (state.mode === "other") {
    $("#label-a").textContent = t("pickup");
    $("#label-b").textContent = t("dropoff");
    return;
  }
  $("#label-a").textContent = fromAirport ? t("airportPickup") : t("pickup");
  $("#label-b").textContent = fromAirport ? t("dropoff") : t("airportDest");
}

async function boot() {
  initI18n();
  window.addEventListener("langchange", () => {
    if (!state.config) return;
    applyBookLabels();
    fillAirportSelect();
    fillPaxBagsSelects();
    if (state.quote) fetchQuote();
    if ($("#screen-booked").classList.contains("active")) showBooked();
  });
  await loadConfig();
  // Offline fallback luggage knobs
  state.config.freeBagsPerPassenger ||= 1;
  state.config.extraBagFeeUsd ||= 0;
  state.config.maxBagsPerPassenger ||= 2;
  wireEvents();
  setupWhen();
  setupWelcomeBack();
  $("#btn-booked-home").onclick = () => { $("#mode-select").value = ""; applyModeFromSelect(""); showScreen("home"); };
  showScreen("home");
}

boot();
