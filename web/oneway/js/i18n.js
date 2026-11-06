/** One Way — EN / 繁體中文 dictionary + toggle (Robot Kitchen demo) */
const LANG_KEY = "oneway_lang";
export const DICT = {
  en: {
    demoStrip: "<strong>Demo — no real charges.</strong> Invented brand · <a href=\"/\">Built by Robot Kitchen</a> · Stripe TEST",
    driverStrip: "<strong>Driver demo</strong> — loop math visible here only · Robot Kitchen",
    brandSub: "Airport rides", brandSubDriver: "Driver console",
    toDriver: "Driver", toRider: "Rider",
    heroTitle: "Where to?", heroSub: "Central NJ airport rides. One clear price for the driver’s full loop.",
    dropTitle: "Airport drop-off", dropHint: "Home → airport", pickTitle: "Airport pickup", otherTitle: "Other ride", pickHint: "Needs flight #",
    footerAirports: "Airports: EWR · JFK · LGA · or any destination",
    back: "← Back", setLocations: "Set locations", flightNumber: "Flight number", flightPh: "e.g. UA1234",
    pickup: "Pickup", dropoff: "Drop-off", airportPickup: "Airport pickup", airportDest: "Airport / destination",
    placePh: "Address or place", paxLabel: "Passengers", passengers: "Passengers (max 6)",
    paxNote: (b, m) => `1–${b} passengers: one price · ${b + 1}–${m} passengers: group price`,
    paxCount: (n) => `${n} passenger${n > 1 ? "s" : ""}`,
    other: "Other", estimating: "Estimating…", yourFare: "Your fare", riderLeg: "mi rider leg", min: "min",
    outside: "Outside service area", invalidPax: "Passengers must be 1–6", apiFail: "Could not reach fare API",
    request: "Request ride", finding: "Finding your driver…", matching: "Matching nearby",
    enRoute: "Driver en route", arriving: "Arriving for pickup", onTrip: "On trip", eta: "ETA",
    car: "White SUV · OW-4821", simulate: "Simulate arrival",
    tripComplete: "Trip complete", howWas: "How was your ride?", addTip: "Add a tip", noTip: "No tip",
    toReceipt: "Continue to receipt", stripeNote: "Payment uses Stripe <strong>TEST</strong> mode only.",
    receipt: "Receipt", route: "Route", flight: "Flight", fare: "Fare", tip: "Tip", rating: "Rating", total: "Total",
    trip: "Trip", newRide: "New ride", driverView: "Driver view", fictional: "One Way is a fictional brand · Robot Kitchen portfolio demo",
    payMock: "Mock test payment (no charge)", payReady: "Stripe TEST ready · session", payStays: "(demo stays in-app)",
    payMockKey: "Test payment · mock — no charge", payMockNet: "Test payment · mock (network) — no charge",
    paidToast: "Demo payment recorded (TEST / mock)", flightReq: "Flight number required",
    lookingUp: "Looking up…", notFound: "Place not found", rideItem: (n) => `One Way ride (${n} passenger${n > 1 ? "s" : ""})`,
    incoming: "Incoming requests", refresh: "Refresh", noRequests: "No open requests.<br />Request a ride from the <a href=\"../\">rider app</a>, or load a sample.",
    loadSample: "Load sample request", activeTrip: "Active trip", stAccepted: "Accepted", stEnRoute: "En route", stArrived: "Arrived",
    stOnTrip: "On trip", stDone: "Done", nextStatus: "Next status →", clear: "Clear",
    homeNote: "Home base coords stay server-side · never shown as a street address",
    modeDrop: "Airport drop-off", modePick: "Airport pickup", modeOther: "Other ride", status: "Status", accept: "Accept", decline: "Decline",
    driverMath: "Driver math (hidden from riders)", accepted: "Accepted", declined: "Declined",
    requestDeclined: "Request declined.<br /><a href=\"../\">Back to rider</a>", sampleLoaded: "Sample loaded", noMath: "No math",
    mHomePick: "home → pickup", mPickDrop: "pickup → drop-off", mDropHome: "drop-off → home", mLoop: "loop total",
    mVehicle: "vehicle cost", mTime: "time", mTolls: "tolls est.", mSubtotal: "subtotal", mMargin: "margin", mPax: "pax",
    mNote: "Loop priced from a fixed home base (coords not shown to riders).",
    termsSub: "Rider terms", receiptSub: "Receipt", backToBooking: "← Back to booking", loading: "Loading…",
    agreePre: "I agree to the", termsLink: "Terms", agreeReq: "Please agree to the Terms first",
    welcomeBack: (n, r) => `Welcome back, ${n}! ${r} completed ride${r === 1 ? "" : "s"}.`, useName: "Use my name",
    loyaltyLbl: "Repeat-rider discount", loyaltyNext: (p) => `Your ${p}% repeat-rider discount applies to this ride`,
    loyaltyProgress: (left, p) => `${left} more ride${left === 1 ? "" : "s"} to ${p}% off`,
    printable: "Printable receipt", rcDate: "Date", rcFareBase: "Base fare", rcPayment: "Payment", printPdf: "Print / Save PDF",
    rcTagline: "Airport rides", rcFooter: "One Way · independent private driver service · Thank you for riding.",
    rcNotFound: "Receipt not found", receiptLink: "Receipt", tabCustomers: "Customers", noCustomers: "No customers yet.",
    rides: "completed rides", bookingsN: "bookings", lastRoute: "Last route", nextDisc: "next ride discounted",
    flightOptional: "Flight number (optional)", whenLabel: "Pickup time", asap: "ASAP", schedule: "Schedule",
    leadNote: "Scheduled rides: at least 2 hours ahead · New York time (ET)", riderName: "Your name", riderNamePh: "Name",
    riderPhone: "Mobile phone", riderPhonePh: "e.g. 732-555-0100", nameReq: "Please enter your name", phoneReq: "Please enter a valid phone number",
    timeReq: "Please pick a pickup time", tooSoon: "Pick a time at least 2 hours from now", bookFail: "Booking failed — please try again",
    bookedTitle: "Ride scheduled", bookedNote: "Your driver will confirm. Demo: no real charge.", payNowTest: "Pay now (TEST)",
    pickupTime: "Pickup time", contact: "Contact", bookingRef: "Booking", asapNow: "ASAP",
    tabSchedule: "My schedule", tabLive: "Live demo", login: "Driver login", pinLabel: "Driver PIN", pinPh: "6-digit PIN", signIn: "Sign in",
    signOut: "Sign out", badPin: "Wrong PIN", locked: "Too many tries — wait 15 min", noBookings: "No upcoming bookings.",
    showPast: "Show past / closed", today: "Today", tomorrow: "Tomorrow",
    aAccept: "Accept", aDecline: "Decline", aPicked: "Picked up", aComplete: "Complete", aCancel: "Cancel",
    gcal: "Google Calendar", ics: ".ics", updated: "Updated", call: "Call", sms: "Text", unpaid: "unpaid", paidLbl: "paid",
    loadFail: "Could not load bookings",
    st: { requested: "requested", accepted: "accepted", declined: "declined", picked_up: "picked up", cancelled: "cancelled", en_route: "en route", arrived: "arrived", on_trip: "on trip", completed: "completed", matched: "matched", in_progress: "in progress", paid: "paid" },
  },
  zh: {
    demoStrip: "<strong>示範網站，不會實際扣款。</strong>虛構品牌 · <a href=\"/\">Robot Kitchen 製作</a> · Stripe 測試模式",
    driverStrip: "<strong>司機端示範</strong>：成本拆解只在這裡顯示 · Robot Kitchen",
    brandSub: "機場接送", brandSubDriver: "司機端",
    toDriver: "司機", toRider: "乘客",
    heroTitle: "想去哪裡？", heroSub: "中紐澤西機場接送，司機全程來回一口價。",
    dropTitle: "送機", dropHint: "家 → 機場", pickTitle: "接機", otherTitle: "其他", pickHint: "需填航班號",
    footerAirports: "機場：EWR · JFK · LGA，或任何目的地",
    back: "← 返回", setLocations: "設定地點", flightNumber: "航班號", flightPh: "例如 UA1234",
    pickup: "上車地點", dropoff: "下車地點", airportPickup: "機場上車", airportDest: "機場或目的地",
    placePh: "地址或地點", paxLabel: "人數", passengers: "乘客人數（最多 6 人）",
    paxNote: (b, m) => `${b} 人以內一個價，${b + 1}–${m} 人一個價`,
    paxCount: (n) => `${n} 人`,
    other: "其他", estimating: "計算中…", yourFare: "車資", riderLeg: "英里乘車距離", min: "分鐘",
    outside: "超出服務範圍", invalidPax: "人數須為 1–6 人", apiFail: "無法取得車資",
    request: "叫車", finding: "正在為您配對司機…", matching: "搜尋附近司機",
    enRoute: "司機前往中", arriving: "即將抵達上車點", onTrip: "行程中", eta: "預計",
    car: "白色休旅車 · OW-4821", simulate: "模擬抵達",
    tripComplete: "行程結束", howWas: "這趟乘車體驗如何？", addTip: "加點小費", noTip: "不給小費",
    toReceipt: "查看收據", stripeNote: "付款僅使用 Stripe <strong>測試</strong>模式。",
    receipt: "收據", route: "路線", flight: "航班", fare: "車資", tip: "小費", rating: "評分", total: "合計",
    trip: "行程", newRide: "再叫一台", driverView: "司機端", fictional: "One Way 為虛構品牌 · Robot Kitchen 作品示範",
    payMock: "模擬測試付款（不扣款）", payReady: "Stripe 測試已就緒 · 工作階段", payStays: "（示範停留在本頁）",
    payMockKey: "測試付款 · 模擬，不扣款", payMockNet: "測試付款 · 模擬（網路）不扣款",
    paidToast: "已記錄示範付款（測試 / 模擬）", flightReq: "請填寫航班號",
    lookingUp: "搜尋中…", notFound: "找不到地點", rideItem: (n) => `One Way 乘車（${n} 人）`,
    incoming: "新訂單", refresh: "重新整理", noRequests: "目前沒有訂單。<br />請從<a href=\"../\">乘客端</a>叫車，或載入範例。",
    loadSample: "載入範例訂單", activeTrip: "進行中的行程", stAccepted: "已接單", stEnRoute: "前往中", stArrived: "已抵達",
    stOnTrip: "行程中", stDone: "完成", nextStatus: "下一個狀態 →", clear: "清除",
    homeNote: "基地座標只存在伺服器端 · 不會顯示街道地址",
    modeDrop: "送機", modePick: "接機", modeOther: "其他", status: "狀態", accept: "接單", decline: "拒單",
    driverMath: "成本拆解（乘客看不到）", accepted: "已接單", declined: "已拒單",
    requestDeclined: "已拒絕此訂單。<br /><a href=\"../\">回乘客端</a>", sampleLoaded: "已載入範例", noMath: "無資料",
    mHomePick: "基地 → 上車點", mPickDrop: "上車點 → 下車點", mDropHome: "下車點 → 基地", mLoop: "來回總里程",
    mVehicle: "車輛成本", mTime: "時間", mTolls: "預估過路費", mSubtotal: "小計", mMargin: "利潤", mPax: "人",
    mNote: "以固定基地計算全程來回（座標不對乘客顯示）。",
    termsSub: "乘客條款", receiptSub: "收據", backToBooking: "← 返回預約", loading: "載入中…",
    agreePre: "我同意", termsLink: "服務條款", agreeReq: "請先勾選同意服務條款",
    welcomeBack: (n, r) => `歡迎回來，${n}！已完成 ${r} 趟。`, useName: "帶入我的姓名",
    loyaltyLbl: "回頭客優惠", loyaltyNext: (p) => `本趟享回頭客 ${p}% 折扣`,
    loyaltyProgress: (left, p) => `再搭 ${left} 趟享 ${p}% 折扣`,
    printable: "可列印收據", rcDate: "日期", rcFareBase: "基本車資", rcPayment: "付款狀態", printPdf: "列印 / 存成 PDF",
    rcTagline: "機場接送", rcFooter: "One Way · 獨立私人司機服務 · 感謝搭乘。",
    rcNotFound: "找不到收據", receiptLink: "收據", tabCustomers: "客戶", noCustomers: "目前沒有客戶。",
    rides: "趟已完成", bookingsN: "筆預約", lastRoute: "上次路線", nextDisc: "下一趟有折扣",
    flightOptional: "航班號（選填）", whenLabel: "上車時間", asap: "立即", schedule: "預約",
    leadNote: "預約需至少提前 2 小時 · 紐約時間（美東）", riderName: "姓名", riderNamePh: "姓名",
    riderPhone: "手機號碼", riderPhonePh: "例如 732-555-0100", nameReq: "請填寫姓名", phoneReq: "請填寫正確的手機號碼",
    timeReq: "請選擇上車時間", tooSoon: "請選擇 2 小時以後的時間", bookFail: "預約失敗，請再試一次",
    bookedTitle: "預約完成", bookedNote: "司機確認後會聯絡您。示範網站，不會實際扣款。", payNowTest: "立即付款（測試）",
    pickupTime: "上車時間", contact: "聯絡方式", bookingRef: "訂單", asapNow: "立即",
    tabSchedule: "我的行程", tabLive: "即時示範", login: "司機登入", pinLabel: "司機密碼", pinPh: "6 位數密碼", signIn: "登入",
    signOut: "登出", badPin: "密碼錯誤", locked: "嘗試次數過多，請 15 分鐘後再試", noBookings: "目前沒有預約。",
    showPast: "顯示過去 / 已結束", today: "今天", tomorrow: "明天",
    aAccept: "接單", aDecline: "拒單", aPicked: "已上車", aComplete: "完成", aCancel: "取消",
    gcal: "Google 日曆", ics: ".ics", updated: "已更新", call: "撥打", sms: "簡訊", unpaid: "未付款", paidLbl: "已付款（測試）",
    loadFail: "無法載入預約",
    st: { requested: "待接單", accepted: "已接單", declined: "已拒單", picked_up: "已上車", cancelled: "已取消", en_route: "前往中", arrived: "已抵達", on_trip: "行程中", completed: "已完成", matched: "已配對", in_progress: "進行中", paid: "已付款" },
  },
};

function langFromQuery() {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "zh") return q;
  } catch (_) {}
  return null;
}
function preferZhFromNavigator() {
  try {
    const list = [];
    if (Array.isArray(navigator.languages)) list.push(...navigator.languages);
    if (navigator.language) list.push(navigator.language);
    if (navigator.userLanguage) list.push(navigator.userLanguage);
    return list.some((l) => /^zh\b/i.test(String(l || "")));
  } catch (_) {
    return false;
  }
}
function detect() {
  // 1) ?lang= wins (Home Screen / shared links) and is persisted
  const fromQ = langFromQuery();
  if (fromQ) {
    try { localStorage.setItem(LANG_KEY, fromQ); } catch (_) {}
    return fromQ;
  }
  // 2) saved preference (standalone PWA has its own localStorage)
  try {
    const s = localStorage.getItem(LANG_KEY);
    if (s === "en" || s === "zh") return s;
  } catch (_) {}
  // 3) device languages — any zh* → 中文 (fixes empty standalone storage on iPhone)
  return preferZhFromNavigator() ? "zh" : "en";
}
function syncLangInUrl(l) {
  try {
    const u = new URL(location.href);
    if (u.searchParams.get("lang") === l) return;
    u.searchParams.set("lang", l);
    history.replaceState(null, "", u.pathname + u.search + u.hash);
  } catch (_) {}
}
/** Keep A2HS / installed PWA launching in the chosen language via start_url ?lang= */
function syncLangManifest(l) {
  try {
    const start = new URL(location.pathname.replace(/[^/]*$/, "") || "./", location.origin);
    // Prefer this document as start (rider / driver / receipt / terms)
    const startUrl = new URL(location.pathname, location.origin);
    startUrl.searchParams.set("lang", l);
    const isDriver = /\/driver\/?$/.test(location.pathname);
    const manifest = {
      name: "One Way",
      short_name: "One Way",
      description: "Central NJ airport rides — Robot Kitchen demo",
      start_url: startUrl.pathname + startUrl.search,
      scope: new URL(".", location.href).pathname,
      display: "standalone",
      background_color: "#0a0a0a",
      theme_color: "#0a0a0a",
      lang: l === "zh" ? "zh-Hant" : "en",
      icons: [
        { src: new URL(isDriver ? "../img/icon-192.png" : "img/icon-192.png", location.href).pathname, sizes: "192x192", type: "image/png" },
        { src: new URL(isDriver ? "../img/apple-touch-icon.png" : "img/apple-touch-icon.png", location.href).pathname, sizes: "180x180", type: "image/png" },
      ],
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
    const href = URL.createObjectURL(blob);
    let link = document.querySelector('link[rel="manifest"][data-oneway-lang]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      link.setAttribute("data-oneway-lang", "1");
      document.head.appendChild(link);
    } else if (link.href && link.href.startsWith("blob:")) {
      try { URL.revokeObjectURL(link.href); } catch (_) {}
    }
    link.href = href;
  } catch (_) {}
}
export let lang = detect();
export function t(key, ...args) {
  const v = (DICT[lang] && DICT[lang][key]) ?? DICT.en[key] ?? key;
  return typeof v === "function" ? v(...args) : v;
}
export function applyI18n(root = document) {
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  root.querySelectorAll("[data-i18n]").forEach((el) => (el.innerHTML = t(el.dataset.i18n)));
  root.querySelectorAll("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
  document.querySelectorAll(".lang-toggle button").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === lang);
    b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
  });
}
export function setLang(l) {
  lang = l === "zh" ? "zh" : "en";
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  syncLangInUrl(lang);
  syncLangManifest(lang);
  applyI18n();
  window.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
}
export function initI18n() {
  // Persist detect() result so empty standalone storage still remembers after first open
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  // URL + manifest start_url carry ?lang= for A2HS / installed PWA relaunch
  syncLangInUrl(lang);
  syncLangManifest(lang);
  applyI18n();
  document.querySelectorAll(".lang-toggle button").forEach((b) => (b.onclick = () => setLang(b.dataset.lang)));
}

/* ---- Booking-request app (no online payment) 2026-11-04 ---- */
Object.assign(DICT.en, {
  submitRequest: "Send booking request", whenLabel: "Pickup date & time (ET)",
  leadNote: "Book at least 2 hours ahead · New York time (ET)",
  lugLarge: "Large bags", lugCarry: "Carry-ons", lugLabel: "Luggage (large + carry-on)",
  lugNote: (n) => `Limit: ${n} large + ${n} carry-on (1 + 1 per passenger)`,
  lugOver: (n) => `Too much luggage for ${n} passenger${n > 1 ? "s" : ""}: max ${n} large + ${n} carry-on`,
  riderEmail: "Email", riderEmailPh: "you@example.com", emailReq: "Please enter a valid email",
  phoneReq: "Please enter a valid 10-digit phone number",
  bookedTitle: "Request received", bookedNote: "We'll confirm by email or text. Your ride is not confirmed until the driver accepts it.",
  statusLink: "View booking status", receiptSub: "Booking status", receipt: "Booking status", tripSummary: "Trip summary",
  paidLbl2: "Paid", payStatusLbl: "Payment:",
  statusLbl: "Status", stHint: { requested: "Waiting for the driver to confirm.", confirmed: "Confirmed — see you at pickup!", declined: "Sorry, the driver can't take this ride.", picked_up: "On the way.", completed: "Trip completed. Thank you!", cancelled: "This booking was cancelled." },
  rcFooter: "One Way · independent private driver service", rcTagline: "Airport rides",
  aConfirm: "Confirm", emailCustomer: "Email customer", textCustomer: "Text customer", unpaidBtn: "Unpaid",
  notified: "customer notified", notifyMock: "email queued (mock — not sent)", notifyOff: "email off — use Email/Text buttons", notifyFail: "email failed — use Email/Text buttons",
  toDriver: "Driver",
  stampProgress: (s, n, left, p) => `Ride card · ${s}/${n} — ${left} more ride${left === 1 ? "" : "s"} to ${p}% off`,
  stampFull: (p) => `Next ride ${p}% off!`, welcomeBack2: "Welcome back!", stampsLbl: "Ride card",
  st: { requested: "requested", confirmed: "confirmed", accepted: "confirmed", declined: "declined", picked_up: "picked up", completed: "completed", cancelled: "cancelled", en_route: "en route", arrived: "arrived", on_trip: "on trip", matched: "matched", in_progress: "in progress", paid: "paid" },
});
Object.assign(DICT.zh, {
  submitRequest: "送出預約申請", whenLabel: "上車日期與時間（美東）",
  leadNote: "請至少提前 2 小時預約 · 紐約時間（美東）",
  lugLarge: "大行李", lugCarry: "登機箱", lugLabel: "行李（大 + 登機箱）",
  lugNote: (n) => `上限：大行李 ${n} 件 + 登機箱 ${n} 件（每人 1 + 1）`,
  lugOver: (n) => `${n} 位乘客的行李超過上限：最多大行李 ${n} 件 + 登機箱 ${n} 件`,
  riderEmail: "電子郵件", riderEmailPh: "you@example.com", emailReq: "請填寫正確的電子郵件",
  phoneReq: "請填寫正確的 10 位數手機號碼",
  bookedTitle: "已收到您的預約申請", bookedNote: "我們會以電子郵件或簡訊確認。司機確認前，預約尚未成立。",
  statusLink: "查看預約狀態", receiptSub: "預約狀態", receipt: "預約狀態", tripSummary: "行程摘要",
  paidLbl2: "已付款", payStatusLbl: "付款：",
  statusLbl: "狀態", stHint: { requested: "等待司機確認。", confirmed: "已確認，上車時見！", declined: "很抱歉，司機無法接這趟。", picked_up: "行程中。", completed: "行程已完成，感謝搭乘！", cancelled: "此預約已取消。" },
  rcFooter: "One Way · 獨立私人司機服務", rcTagline: "機場接送",
  aConfirm: "確認接單", emailCustomer: "寄信給客人", textCustomer: "傳簡訊給客人", unpaidBtn: "未付款",
  notified: "已通知客人", notifyMock: "郵件已排入（模擬，未寄出）", notifyOff: "郵件未開啟，請用寄信/簡訊按鈕", notifyFail: "郵件寄送失敗，請用寄信/簡訊按鈕",
  toDriver: "司機",
  stampProgress: (s, n, left, p) => `集點卡 ${s}/${n}，再 ${left} 趟享${p === 10 ? "九折" : `${p}% 折扣`}`,
  stampFull: (p) => `下一趟${p === 10 ? "九折" : `享 ${p}% 折扣`}！`, welcomeBack2: "歡迎回來！", stampsLbl: "集點卡",
  st: { requested: "待確認", confirmed: "已確認", accepted: "已確認", declined: "已婉拒", picked_up: "已上車", completed: "已完成", cancelled: "已取消", en_route: "前往中", arrived: "已抵達", on_trip: "行程中", matched: "已配對", in_progress: "進行中", paid: "已付款" },
});

Object.assign(DICT.en, {
  tripType: "Trip type", tripTypePh: "Choose trip type",
  airportLabel: "Airport", bagsLabel: "Bags",
  riderEmailOpt: "Email (optional)",
  lugLabel: "Bags",
  lugNote: (free, fee, max) => `${free} bag${free===1?"":"s"} free · $${fee}/extra · soft max ${max}`,
  lugFeeLine: (n, usd) => `${n} extra bag${n===1?"":"s"} · ${usd}`,
  lugIncluded: (free) => `${free} bag${free===1?"":"s"} included`,
  lugWarn: (bags, max) => `That's a lot of bags (${bags}/${max}). One car only — oversized loads may not fit; tell the driver.`,
  lugOver: (n) => `Too many bags for ${n} passenger${n>1?"s":""}`,
  invalidBags: "Invalid bag count",
  a2hsHint: "Tip: on iPhone, tap Share → Add to Home Screen for a one-tap booking icon.",
  a2hsStep1: "① Tap the icon left of the address bar",
  a2hsStep2: "② Tap “Share”",
  a2hsStep3: "③ Tap “Add to Home Screen”",
  a2hsMenuTranslate: "Translate",
  a2hsMenuShare: "Share",
  a2hsMenuBookmark: "Add to Bookmarks",
  a2hsAddHome: "Add to Home Screen",
});

Object.assign(DICT.zh, {
  tripType: "行程類型", tripTypePh: "請選擇行程類型",
  airportLabel: "機場", bagsLabel: "行李件數",
  riderEmailOpt: "電子郵件（選填）",
  lugLabel: "行李",
  lugNote: (free, fee, max) => `免費 ${free} 件 · 超額每件 $${fee} · 建議上限 ${max} 件`,
  lugFeeLine: (n, usd) => `超額行李 ${n} 件 · ${usd}`,
  lugIncluded: (free) => `含 ${free} 件行李`,
  lugWarn: (bags, max) => `行李偏多（${bags}/${max}）。只有一台車，超大件可能裝不下，請先告知司機。`,
  lugOver: (n) => `${n} 人行李過多`,
  invalidBags: "行李件數無效",
  a2hsHint: "小提示：iPhone 可點「分享」→「加入主畫面」，之後一鍵開啟預約。",
  a2hsStep1: "①點網址列左邊圖示",
  a2hsStep2: "②點「分享」",
  a2hsStep3: "③點「加入主畫面」",
  a2hsMenuTranslate: "翻譯",
  a2hsMenuShare: "分享",
  a2hsMenuBookmark: "加入書籤",
  a2hsAddHome: "加入主畫面",
});

/* ---- 2026-11-05 email honesty + demo luggage fee labels ---- */
Object.assign(DICT.en, {
  bookedTitle: "Request received",
  bookedNote: "Your ride is not confirmed until the driver accepts it. Email is currently in demo/mock mode — no confirmation email was sent. We'll follow up when email is live, or by text/call.",
  bookedNoteMock: "Request saved. Email not sent (demo/mock mode).",
  bookedNoteGas: "Request saved. Driver was emailed. You'll get email only if you entered one, after the driver confirms.",
  bookedNoteOff: "Request saved. Email is off — the driver will follow up another way.",
  notifyMock: "email queued (mock — not sent)",
  notifyOff: "email off — not sent",
  notifyFail: "email failed — not sent",
  notifyGas: "email sent",
  notified: "customer emailed",
  lugNote: (free, fee, max) => `${free} bags free · $${fee}/extra (demo rate — not official) · soft max ${max}`,
  lugFeeLine: (n, usd) => `${n} extra bag${n===1?"":"s"} · ${usd} (demo rate)`,
  lugIncluded: (free) => `${free} bags included (demo allowance)`,
  lugFeeDemo: "Bag fee shown is a demo rate, not official ops pricing.",
});
Object.assign(DICT.zh, {
  bookedTitle: "已收到您的預約申請",
  bookedNote: "司機確認前，預約尚未成立。目前為示範／模擬模式，系統沒有寄出確認信。之後開通郵件，或以簡訊／電話聯絡您。",
  bookedNoteMock: "申請已儲存。郵件未寄出（示範／模擬模式）。",
  bookedNoteGas: "申請已儲存。已通知司機。若您有填電子郵件，司機會確認後再寄給您。",
  bookedNoteOff: "申請已儲存。郵件未開啟——司機會用其他方式聯絡。",
  notifyMock: "郵件已排入（模擬，未寄出）",
  notifyOff: "郵件未開啟，未寄出",
  notifyFail: "郵件寄送失敗，未寄出",
  notifyGas: "郵件已寄出",
  notified: "已寄信給客人",
  lugNote: (free, fee, max) => `免費 ${free} 件 · 超額每件 $${fee}（示範費率，非正式營運價）· 建議上限 ${max} 件`,
  lugFeeLine: (n, usd) => `超額行李 ${n} 件 · ${usd}（示範費率）`,
  lugIncluded: (free) => `含 ${free} 件行李（示範額度）`,
  lugFeeDemo: "顯示的行李費為示範費率，非正式營運價。",
});


/* ---- 2026-11-05: no per-bag fee (IJen) ---- */
Object.assign(DICT.en, {
  lugNote: (free, fee, max) => `${free} bags included per trip allowance · soft max ${max} (one car — oversized may not fit)`,
  lugFeeLine: (n, usd) => '',
  lugIncluded: (free) => `${free} bags included`,
  lugFeeDemo: '',
});
Object.assign(DICT.zh, {
  lugNote: (free, fee, max) => `含 ${free} 件行李額度 · 建議上限 ${max} 件（一台車，超大件可能裝不下）`,
  lugFeeLine: (n, usd) => '',
  lugIncluded: (free) => `含 ${free} 件行李`,
  lugFeeDemo: '',
});

/* ---- customer service mailto ---- */
Object.assign(DICT.en, {
  csContact: 'Questions? Email <a href="mailto:customerservice@robotkitchen.us">customerservice@robotkitchen.us</a>',
  csContactPlain: "customerservice@robotkitchen.us",
});
Object.assign(DICT.zh, {
  csContact: '如有問題請寄信至 <a href="mailto:customerservice@robotkitchen.us">customerservice@robotkitchen.us</a>',
  csContactPlain: "customerservice@robotkitchen.us",
});
