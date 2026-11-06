/** One Way — ride stamp card (gold car stamps) */
import { t } from "./i18n.js?v=20261106lang";
const CAR = '<svg viewBox="0 0 48 28" aria-hidden="true"><path d="M6 18l3-7c1-2.5 3-4 5.5-4h17c2.5 0 4.6 1.4 5.8 3.6L41 18h1.5c1.4 0 2.5 1.1 2.5 2.5V23h-4.2a4.8 4.8 0 0 1-9.4 0H16.6a4.8 4.8 0 0 1-9.4 0H3v-2.5C3 19.1 4.1 18 5.5 18H6zm6.2 0h11.3V10.5h-8.2c-1 0-1.8.6-2.2 1.5L12.2 18zm14.3 0h11.2l-2.6-6c-.4-.9-1.3-1.5-2.3-1.5h-6.3V18z"/><circle cx="11.9" cy="23" r="2.6"/><circle cx="36.1" cy="23" r="2.6"/></svg>';
export function stampCardHtml(stamps, n = 5, pct = 10) {
  const full = stamps >= n;
  const slots = Array.from({ length: n }, (_, i) =>
    `<span class="stamp ${i < stamps ? "on" : ""}" aria-label="${i < stamps ? "stamped" : "empty"}">${CAR}</span>`).join("");
  const msg = full ? t("stampFull", pct) : t("stampProgress", stamps, n, n - stamps, pct);
  return `<div class="stamp-card ${full ? "full" : ""}" role="img" aria-label="${msg}">
    <div class="stamp-row">${slots}</div>
    <div class="stamp-msg">${msg}</div>
  </div>`;
}
