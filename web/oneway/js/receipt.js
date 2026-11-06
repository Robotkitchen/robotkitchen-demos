import { t, initI18n } from "./i18n.js?v=20261106lang";
import { stampCardHtml } from "./stamps.js?v=20261105b";
initI18n();
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => `$${(Math.round(Number(n || 0) * 100) / 100).toFixed(2)}`;
const NY = "America/New_York";
const fmt = (iso) => new Date(iso).toLocaleString(document.documentElement.lang, { timeZone: NY, dateStyle: "medium", timeStyle: "short" }) + " ET";
let rc = null;
let sc = null;
function render() {
  if (!rc) return;
  const st = (t("st")[rc.status]) || rc.status;
  const lug = (rc.bags != null) ? String(rc.bags) : (rc.luggage ? String(rc.luggage.bags ?? rc.luggage.large ?? "—") : "—");
  const rows = [
    [t("bookingRef"), esc(rc.id)],
    [t("pickupTime"), esc(fmt(rc.pickupAt))],
    [t("route"), `${esc(rc.pickupText)} → ${esc(rc.dropoffText)}`],
    [t("paxLabel"), esc(rc.passengers)],
    [t("lugLabel"), esc(lug)],
    rc.flight ? [t("flight"), esc(rc.flight)] : null,
    rc.discount ? [t("rcFareBase"), `<span class="price">${money(rc.fareBase)}</span>`] : null,
    rc.discount ? [`${t("loyaltyLbl")} −${rc.discountPct}%`, `<span class="price">−${money(rc.discount)}</span>`] : null,
  ].filter(Boolean);
  $("#rc-body").innerHTML =
    `<div class="status-badge st-${esc(rc.status)}"><b>${t("statusLbl")}: ${esc(st)}</b><span>${esc((t("stHint") || {})[rc.status] || "")}</span></div>` +
    rows.map(([k, v]) => `<div class="receipt-row"><span>${k}</span><span class="amt">${v}</span></div>`).join("") +
    `<div class="receipt-row total"><span>${t("fare")}</span><span class="amt price price-lg">${money(rc.amountDue ?? rc.fare)}</span></div>
     ${sc ? stampCardHtml(sc.stamps, sc.stampsPerCard, sc.discountPct) : ""}
     <p class="pax-note" style="margin-top:10px">${t("rcFooter")} · <a href="../terms/">${t("termsLink")}</a></p>`;
}
const q = new URLSearchParams(location.search);
fetch(`/api/oneway/bookings/${encodeURIComponent(q.get("id") || "")}/receipt?t=${encodeURIComponent(q.get("t") || "")}`)
  .then((r) => r.json())
  .then((d) => { if (d.ok) { rc = d.receipt; sc = d.stampCard || null; render(); } else $("#rc-body").innerHTML = `<div class="fare-error">${t("rcNotFound")}</div>`; })
  .catch(() => ($("#rc-body").innerHTML = `<div class="fare-error">${t("rcNotFound")}</div>`));
$("#btn-print").onclick = () => window.print();
window.addEventListener("langchange", render);
