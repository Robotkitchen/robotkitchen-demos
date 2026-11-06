/** One Way — driver "My schedule" (PIN login, HttpOnly session cookie set by the Worker) */
import { t } from "./i18n.js?v=20261106lang";
import { stampCardHtml } from "./stamps.js?v=20261105b";

const $ = (s, el = document) => el.querySelector(s);
const NY = "America/New_York";
const API = "/api/oneway/admin";
let bookings = [];

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const loc = () => document.documentElement.lang || "en";

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(() => el.classList.remove("show"), 2200);
}
function nyDayKey(iso) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: NY, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}
function dayLabel(key, iso) {
  const today = nyDayKey(new Date().toISOString());
  const tmr = nyDayKey(new Date(Date.now() + 864e5).toISOString());
  const base = new Date(iso).toLocaleDateString(loc(), { timeZone: NY, weekday: "long", month: "long", day: "numeric" });
  if (key === today) return `${t("today")} · ${base}`;
  if (key === tmr) return `${t("tomorrow")} · ${base}`;
  return base;
}
const timeOf = (iso) => new Date(iso).toLocaleTimeString(loc(), { timeZone: NY, hour: "numeric", minute: "2-digit" });
const utcStamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function calDetails(b) {
  return [
    `${t("bookingRef")}: ${b.id}`,
    `${t("paxLabel")}: ${b.passengers}`,
    `${t("fare")}: $${b.fare}`,
    `${t("contact")}: ${b.rider?.name || ""} ${b.rider?.phone || ""}`,
    b.flight ? `${t("flight")}: ${b.flight}` : "",
    `${b.pickup?.text || ""} → ${b.dropoff?.text || ""}`,
  ].filter(Boolean).join("\n");
}
function calTimes(b) {
  const start = new Date(b.pickupAt).getTime();
  const end = start + Math.max(30, (b.etaMinutes || 45) + 15) * 60e3;
  return [start, end];
}
function gcalUrl(b) {
  const [s, e] = calTimes(b);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `One Way · ${b.rider?.name || ""} · ${b.passengers} pax`,
    dates: `${utcStamp(s)}/${utcStamp(e)}`,
    details: calDetails(b),
    location: b.pickup?.text || "",
    ctz: NY,
  });
  return "https://calendar.google.com/calendar/render?" + p.toString();
}
function icsText(b) {
  const [s, e] = calTimes(b);
  const ics = (v) => String(v).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Robot Kitchen//One Way demo//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.id}@oneway.robotkitchen.us`,
    `DTSTAMP:${utcStamp(Date.now())}`,
    `DTSTART:${utcStamp(s)}`,
    `DTEND:${utcStamp(e)}`,
    `SUMMARY:${ics(`One Way · ${b.rider?.name || ""} · ${b.passengers} pax`)}`,
    `LOCATION:${ics(b.pickup?.text || "")}`,
    `DESCRIPTION:${ics(calDetails(b))}`,
    "BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY", "DESCRIPTION:One Way pickup", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR", "",
  ].join("\r\n");
}
function downloadIcs(b) {
  const blob = new Blob([icsText(b)], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `oneway-${b.id}.ics`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

const ACTIONS = [
  ["confirmed", "aConfirm", "btn-primary", ["requested"]],
  ["declined", "aDecline", "btn-danger", ["requested"]],
  ["picked_up", "aPicked", "btn-primary", ["confirmed", "accepted"]],
  ["completed", "aComplete", "btn-primary", ["picked_up"]],
  ["cancelled", "aCancel", "btn-danger", ["requested", "confirmed", "accepted"]],
];
const CLOSED = ["declined", "completed", "cancelled"];

const isPaid = (b) => b.payStatus === "paid" || /^paid_/.test(b.payStatus || "");
function payLabel(b) {
  return `${b.payStatus === "paid" || /^paid_/.test(b.payStatus || "") ? t("paidLbl2") : t("unpaidBtn")} · $${b.fare}`;
}
function notifyLine(b) {
  const n = (b.notifications || []).filter((x) => x.to && x.to === b.rider?.email).pop();
  if (!n) return "";
  const msg = n.ok && n.mocked ? t("notifyMock") : n.ok && n.sent ? t("notifyGas") : n.ok ? t("notified") : n.skipped ? t("notifyOff") : t("notifyFail");
  return `<div class="pax-note">✉ ${esc(msg)}</div>`;
}
function msgText(b) {
  const zh = b.lang === "zh";
  const st = b.status === "confirmed" ? (zh ? "已確認" : "confirmed") : b.status === "declined" ? (zh ? "無法接單" : "declined") : (zh ? "已收到" : "received");
  const when = new Date(b.pickupAt).toLocaleString(zh ? "zh-TW" : "en-US", { timeZone: NY, dateStyle: "medium", timeStyle: "short" }) + " ET";
  const url = location.origin + (b.receiptUrl || "");
  return zh
    ? `${b.rider?.name || ""} 您好，One Way 預約 ${b.id} ${st}。上車時間：${when}。${b.pickup?.text || ""} → ${b.dropoff?.text || ""}。${b.passengers} 人，車資 $${b.fare}。狀態：${url}`
    : `Hi ${b.rider?.name || ""}, your One Way booking ${b.id} is ${st}. Pickup: ${when}. ${b.pickup?.text || ""} → ${b.dropoff?.text || ""}. ${b.passengers} pax, fare $${b.fare}. Status: ${url}`;
}
function mailtoHref(b) {
  const zh = b.lang === "zh";
  const subj = zh ? `One Way 預約 ${b.id}` : `One Way booking ${b.id}`;
  return `mailto:${b.rider.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(msgText(b))}`;
}
function smsHref(b, tel) {
  return `sms:${tel}?&body=${encodeURIComponent(msgText(b))}`;
}
function card(b) {
  const st = (t("st")[b.status]) || b.status;
  const acts = ACTIONS.filter(([, , , from]) => from.includes(b.status))
    .map(([s, k, cls]) => `<button type="button" class="btn ${cls} btn-sm" data-act="${s}" data-id="${esc(b.id)}">${t(k)}</button>`).join("");
  const tel = esc(String(b.rider?.phone || "").replace(/[^\d+]/g, ""));
  return `
  <article class="bk-card st-${esc(b.status)}">
    <div class="bk-top">
      <div class="bk-time">${b.asap ? `${t("asapNow")} · ` : ""}${esc(timeOf(b.pickupAt))}</div>
      <span class="bk-status">${esc(st)}</span>
    </div>
    <div class="route-line"><strong>A</strong> ${esc(b.pickup?.text || "—")}</div>
    <div class="route-line"><strong>B</strong> ${esc(b.dropoff?.text || "—")}</div>
    <div class="bk-meta">
      <span>${esc(t("paxCount", b.passengers))}</span>
      ${b.flight ? `<span>✈ ${esc(b.flight)}</span>` : ""}
      ${b.loyalty?.discount ? `<span class="bk-loyal">−${esc(b.loyalty.discountPct)}%</span>` : ""}
      <span class="price bk-fare">$${esc(b.fare)}</span>
    </div>
    <div class="bk-contact">${esc(b.rider?.name || "")} · <a href="tel:${tel}">${esc(b.rider?.phone || "")}</a>${b.rider?.email ? ` · <a href="mailto:${esc(b.rider.email)}">${esc(b.rider.email)}</a>` : ""}</div>
    <div class="bk-meta"><span>🧳 ${esc(b.bags ?? b.luggage?.bags ?? b.luggage?.large ?? 0)}</span><span class="pax-note">${esc(payLabel(b))}</span></div>
    ${notifyLine(b)}
    <div class="bk-actions">
      ${b.rider?.email ? `<a class="btn btn-ghost btn-sm" href="${esc(mailtoHref(b))}">✉ ${t("emailCustomer")}</a>` : ""}
      <a class="btn btn-ghost btn-sm" href="${esc(smsHref(b, tel))}">💬 ${t("textCustomer")}</a>
    </div>
    <div class="bk-actions">${acts}</div>
    <div class="bk-cal">
      <a class="btn btn-ghost btn-sm" href="${esc(gcalUrl(b))}" target="_blank" rel="noopener">📅 ${t("gcal")}</a>
      <button type="button" class="btn btn-ghost btn-sm" data-ics="${esc(b.id)}">⬇ ${t("ics")}</button>
      ${b.receiptUrl ? `<a class="btn btn-ghost btn-sm" href="${esc(b.receiptUrl)}" target="_blank" rel="noopener">🧾 ${t("tripSummary")}</a>` : ""}
    </div>
    <div class="bk-paid"><span class="pax-note">${t("payStatusLbl")}</span>
      <button type="button" class="pay-tg ${isPaid(b) ? "on" : ""}" data-paid="1" data-id="${esc(b.id)}">${t("paidLbl2")}</button>
      <button type="button" class="pay-tg ${isPaid(b) ? "" : "on"}" data-paid="" data-id="${esc(b.id)}">${t("unpaidBtn")}</button>
    </div>
    <div class="rid">${esc(b.id)}</div>
  </article>`;
}

function render() {
  const showPast = $("#show-past").checked;
  const cutoff = Date.now() - 6 * 3600e3;
  const list = bookings.filter((b) => showPast || (!CLOSED.includes(b.status) && new Date(b.pickupAt).getTime() >= cutoff));
  const el = $("#sched-list");
  if (!list.length) { el.innerHTML = `<div class="empty-state">${t("noBookings")}</div>`; return; }
  const groups = new Map();
  list.forEach((b) => {
    const k = nyDayKey(b.pickupAt);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(b);
  });
  el.innerHTML = [...groups.entries()].map(([k, arr]) =>
    `<section class="bk-day"><h3 class="bk-day-h">${esc(dayLabel(k, arr[0].pickupAt))}</h3>${arr.map(card).join("")}</section>`).join("");
}

async function api(path, opts = {}) {
  const res = await fetch(API + path, { credentials: "same-origin", headers: { "Content-Type": "application/json" }, ...opts });
  let data = {};
  try { data = await res.json(); } catch (_) {}
  return { status: res.status, data };
}

function showLogin(on) {
  $("#login-card").hidden = !on;
  $("#sched-area").hidden = on;
}

export async function loadSchedule() {
  const { status, data } = await api("/bookings");
  if (status === 401) { showLogin(true); return; }
  if (!data.ok) { showLogin(false); $("#sched-list").innerHTML = `<div class="fare-error">${t("loadFail")}</div>`; return; }
  showLogin(false);
  bookings = data.bookings || [];
  render();
}

export function initSchedule() {
  $("#login-card").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pin = $("#pin").value.trim();
    const { status, data } = await api("/login", { method: "POST", body: JSON.stringify({ pin }) });
    const err = $("#login-err");
    if (data.ok) { err.hidden = true; $("#pin").value = ""; loadSchedule(); return; }
    err.hidden = false;
    err.textContent = status === 429 ? t("locked") : t("badPin");
  });
  $("#btn-logout").onclick = async () => { await api("/logout", { method: "POST" }); bookings = []; showLogin(true); };
  $("#btn-sched-refresh").onclick = loadSchedule;
  $("#show-past").onchange = render;
  $("#sched-list").addEventListener("click", async (e) => {
    const ics = e.target.closest("[data-ics]");
    if (ics) { const b = bookings.find((x) => x.id === ics.dataset.ics); if (b) downloadIcs(b); return; }
    const pd = e.target.closest("[data-paid]");
    if (pd) {
      pd.disabled = true;
      const { data } = await api(`/bookings/${encodeURIComponent(pd.dataset.id)}`, { method: "PATCH", body: JSON.stringify({ paid: !!pd.dataset.paid }) });
      if (data.ok) { bookings = bookings.map((b) => (b.id === data.booking.id ? data.booking : b)); toast(`${t("updated")} · ${payLabel(data.booking)}`); render(); }
      else { pd.disabled = false; toast(t("loadFail")); }
      return;
    }
    const act = e.target.closest("[data-act]");
    if (!act) return;
    act.disabled = true;
    const { data } = await api(`/bookings/${encodeURIComponent(act.dataset.id)}`, { method: "PATCH", body: JSON.stringify({ status: act.dataset.act }) });
    if (data.ok) {
      bookings = bookings.map((b) => (b.id === data.booking.id ? data.booking : b));
      toast(`${t("updated")} · ${t("st")[data.booking.status] || data.booking.status}`);
      render();
    } else { act.disabled = false; toast(t("loadFail")); }
  });
  window.addEventListener("langchange", () => { if (!$("#sched-area").hidden) render(); });
  loadSchedule();
}

let customers = [];
let custLoyalty = {};
function renderCustomers() {
  const el = $("#cust-list");
  if (!el) return;
  if (!customers.length) { el.innerHTML = `<div class="empty-state">${t("noCustomers")}</div>`; return; }
  el.innerHTML = customers.map((c) => {
    const tel = esc(String(c.phone || "").replace(/[^\d+]/g, ""));
    return `<article class="bk-card cust-card">
      <div class="bk-top"><div class="bk-time">${esc(c.name || "—")}</div><span class="bk-status">${esc(c.completedRides || 0)} ${t("rides")}</span></div>
      <div class="bk-contact"><a href="tel:${tel}">${esc(c.phone || "")}</a> · ${esc(c.bookings || 0)} ${t("bookingsN")}${c.nextDisc ? ` · <b>${t("nextDisc")}</b>` : ""}</div>
      ${stampCardHtml(c.stamps ?? 0, custLoyalty.stampsPerCard || 5, custLoyalty.discountPct || 10)}
      <div class="route-line pax-note">${t("lastRoute")}: ${esc(c.lastPickup || "—")} → ${esc(c.lastDropoff || "—")}</div>
    </article>`;
  }).join("");
}
export async function loadCustomers() {
  const { status, data } = await api("/customers");
  if (status === 401) {
    document.querySelector('.drv-tab[data-tab="schedule"]').click();
    showLogin(true);
    return;
  }
  custLoyalty = data.loyalty || {};
  const n = custLoyalty.stampsPerCard || 5;
  customers = (data.customers || []).map((c) => ({ ...c, nextDisc: (c.stamps ?? 0) >= n }));
  renderCustomers();
}
document.getElementById("btn-cust-refresh")?.addEventListener("click", loadCustomers);
window.addEventListener("langchange", () => { if (!document.getElementById("tab-customers")?.hidden) renderCustomers(); });
