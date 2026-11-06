import { initI18n } from "./i18n.js?v=20261106lang";
initI18n();
const get = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
fetch("/api/oneway/config").then((r) => r.json()).then(({ config }) => {
  document.querySelectorAll("[data-cfg]").forEach((el) => {
    const v = get(config, el.dataset.cfg);
    if (v != null) el.textContent = v;
  });
}).catch(() => {});
