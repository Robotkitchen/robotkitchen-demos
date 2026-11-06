import { t, initI18n } from "./i18n.js?v=20261106lang";
import { initSchedule, loadCustomers } from "./schedule.js?v=20261105b";

const STORAGE_KEY = "oneway_demo_trip_v1";
const STATUS_FLOW = ["accepted", "en_route", "arrived", "on_trip", "completed"];

const $ = (s, el = document) => el.querySelector(s);

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(() => t.classList.remove("show"), 2200);
}

function readTrip() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function writeTrip(trip) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
  try {
    new BroadcastChannel("oneway_demo").postMessage({ type: "trip", payload: trip });
  } catch (_) {}
}

async function quoteWithMath(pickup, dropoff, passengers, airportCode) {
  const res = await fetch("/api/oneway/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pickup,
      dropoff,
      passengers: passengers || 1,
      airportCode,
      role: "driver",
      driverMath: true,
    }),
  });
  return res.json();
}

function mathHtml(m) {
  if (!m) return `<div>${t("noMath")}</div>`;
  return `
    <div><span>${t("mHomePick")}</span><span>${m.legs.homeToPickup} mi</span></div>
    <div><span>${t("mPickDrop")}</span><span>${m.legs.pickupToDropoff} mi</span></div>
    <div><span>${t("mDropHome")}</span><span>${m.legs.dropoffToHome} mi</span></div>
    <div><span>${t("mLoop")}</span><span>${m.loopMiles} mi</span></div>
    <div><span>${t("mVehicle")}</span><span class="price">$${m.vehicleCost}</span></div>
    <div><span>${t("mTime")} (${m.timeHours} h)</span><span class="price">$${m.timeCost}</span></div>
    <div><span>${t("mTolls")}</span><span class="price">$${m.tolls}</span></div>
    <div><span>${t("mSubtotal")}</span><span class="price">$${m.subtotal}</span></div>
    <div><span>${t("mMargin")} ${(m.marginPct * 100).toFixed(0)}%</span><span class="price">$${m.withMargin}</span></div>
    <div><span>${m.passengers} ${t("mPax")} ×${m.passengerMultiplier}</span><span>→ ${t("fare")}</span></div>
    <div style="margin-top:6px;font-style:italic;color:var(--muted)">${t("mNote")}</div>
  `;
}

function renderRequest(trip, quote) {
  const area = $("#request-area");
  const fare = quote?.fare ?? trip.quote?.fare ?? "—";
  area.innerHTML = `
    <div class="request-card" id="req-card">
      <h3>${trip.mode === "from_airport" ? t("modePick") : trip.mode === "other" ? t("modeOther") : t("modeDrop")}</h3>
      <div class="route-line"><strong>A</strong> ${trip.pickup?.label || t("pickup")}</div>
      <div class="route-line"><strong>B</strong> ${trip.dropoff?.label || t("dropoff")}</div>
      ${trip.flight ? `<div class="route-line">${t("flight")} · ${trip.flight}</div>` : ""}
      <div class="route-line">${t("paxLabel")} · ${trip.passengers || 1} · ${t("status")}: <strong>${(t("st")[trip.status || "requested"]) || trip.status}</strong></div>
      <div class="fare-big price price-xl">$${fare}</div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" id="btn-accept">${t("accept")}</button>
        <button type="button" class="btn btn-danger" id="btn-decline">${t("decline")}</button>
      </div>
      <details class="math-panel" id="math-panel">
        <summary>${t("driverMath")}</summary>
        <div class="math-body">${mathHtml(quote?.driverMath)}</div>
      </details>
    </div>
  `;
  $("#btn-accept").onclick = () => {
    trip.status = "accepted";
    trip.driverStatus = "accepted";
    writeTrip(trip);
    toast(t("accepted"));
    showActive(trip);
  };
  $("#btn-decline").onclick = () => {
    trip.status = "declined";
    writeTrip(trip);
    toast(t("declined"));
    area.innerHTML = `<div class="empty-state">${t("requestDeclined")}</div>`;
    $("#active-area").classList.add("hidden");
  };
}

function showActive(trip) {
  $("#active-area").classList.remove("hidden");
  const cur = trip.driverStatus || trip.status || "accepted";
  $$pill(cur);
  let idx = Math.max(0, STATUS_FLOW.indexOf(cur));
  $("#btn-next-status").onclick = () => {
    idx = Math.min(STATUS_FLOW.length - 1, idx + 1);
    trip.driverStatus = STATUS_FLOW[idx];
    trip.status = trip.driverStatus;
    writeTrip(trip);
    $$pill(trip.driverStatus);
    toast(t("st")[trip.driverStatus] || trip.driverStatus);
  };
  $("#btn-clear").onclick = () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  };
}

function $$pill(cur) {
  document.querySelectorAll("#status-pills .status-pill").forEach((p) => {
    p.classList.toggle("on", p.dataset.s === cur);
  });
}

async function loadFromStorage() {
  const trip = readTrip();
  if (!trip || !trip.pickup || !trip.dropoff) {
    $("#request-area").innerHTML = `<div class="empty-state" id="empty">${t("noRequests")}</div>`;
    $("#active-area").classList.add("hidden");
    return;
  }
  const quote = await quoteWithMath(trip.pickup, trip.dropoff, trip.passengers, trip.airportCode);
  if (["accepted", "en_route", "arrived", "on_trip", "matched", "in_progress", "completed"].includes(trip.status)) {
    renderRequest(trip, quote);
    showActive(trip);
  } else {
    renderRequest(trip, quote);
  }
}

async function loadSample() {
  const pickup = { lat: 40.4862, lng: -74.4518, label: "New Brunswick, NJ" };
  const dropoff = { lat: 40.6895, lng: -74.1745, label: "EWR · Newark Liberty" };
  const trip = {
    id: "OW-SAMPLE",
    mode: "to_airport",
    pickup,
    dropoff,
    airportCode: "EWR",
    passengers: 3,
    flight: "",
    status: "requested",
    updatedAt: Date.now(),
  };
  const quote = await quoteWithMath(pickup, dropoff, 3, "EWR");
  trip.quote = quote;
  writeTrip(trip);
  renderRequest(trip, quote);
  toast(t("sampleLoaded"));
}

$("#btn-refresh").onclick = () => initI18n();
document.querySelectorAll(".drv-tab").forEach((b) => (b.onclick = () => {
  document.querySelectorAll(".drv-tab").forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", x === b ? "true" : "false"); });
  document.getElementById("tab-schedule").hidden = b.dataset.tab !== "schedule";
  document.getElementById("tab-live").hidden = b.dataset.tab !== "live";
  document.getElementById("tab-customers").hidden = b.dataset.tab !== "customers";
  if (b.dataset.tab === "customers") loadCustomers();
}));
initSchedule();
window.addEventListener("langchange", () => loadFromStorage());
loadFromStorage();
$("#btn-sample").onclick = () => loadSample();

try {
  const bc = new BroadcastChannel("oneway_demo");
  bc.onmessage = () => initI18n();
document.querySelectorAll(".drv-tab").forEach((b) => (b.onclick = () => {
  document.querySelectorAll(".drv-tab").forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", x === b ? "true" : "false"); });
  document.getElementById("tab-schedule").hidden = b.dataset.tab !== "schedule";
  document.getElementById("tab-live").hidden = b.dataset.tab !== "live";
  document.getElementById("tab-customers").hidden = b.dataset.tab !== "customers";
  if (b.dataset.tab === "customers") loadCustomers();
}));
initSchedule();
window.addEventListener("langchange", () => loadFromStorage());
loadFromStorage();
} catch (_) {}

initI18n();
document.querySelectorAll(".drv-tab").forEach((b) => (b.onclick = () => {
  document.querySelectorAll(".drv-tab").forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", x === b ? "true" : "false"); });
  document.getElementById("tab-schedule").hidden = b.dataset.tab !== "schedule";
  document.getElementById("tab-live").hidden = b.dataset.tab !== "live";
  document.getElementById("tab-customers").hidden = b.dataset.tab !== "customers";
  if (b.dataset.tab === "customers") loadCustomers();
}));
initSchedule();
window.addEventListener("langchange", () => loadFromStorage());
loadFromStorage();
