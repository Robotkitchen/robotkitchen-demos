(function () {
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  var dateInput = document.getElementById("field-date");
  if (dateInput) {
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var iso = tomorrow.toISOString().slice(0, 10);
    dateInput.min = iso;
    if (!dateInput.value) dateInput.value = iso;
  }

  var form = document.getElementById("reserve-form");
  var steps = document.getElementById("reserve-steps");
  var confirmScreen = document.getElementById("confirm-screen");
  var confirmSummary = document.getElementById("confirm-summary");
  var confirmRef = document.getElementById("confirm-ref");
  var reviewCard = document.getElementById("review-card");
  var resetBtn = document.getElementById("confirm-reset");
  var current = 1;
  var total = 4;

  function panel(n) {
    return form ? form.querySelector('[data-panel="' + n + '"]') : null;
  }

  function setStep(n) {
    current = n;
    for (var i = 1; i <= total; i++) {
      var p = panel(i);
      if (!p) continue;
      var active = i === n;
      p.hidden = !active;
      p.classList.toggle("is-active", active);
    }
    if (steps) {
      steps.querySelectorAll("li").forEach(function (li) {
        var s = Number(li.getAttribute("data-step"));
        li.classList.toggle("is-active", s === n);
        li.classList.toggle("is-done", s < n);
      });
    }
    if (n === 4) renderReview();
  }

  function readData() {
    var fd = new FormData(form);
    return {
      date: fd.get("date") || "",
      slot: fd.get("slot") || "",
      party: fd.get("party") || "",
      experience: fd.get("experience") || "",
      name: (fd.get("name") || "").trim(),
      email: (fd.get("email") || "").trim(),
      phone: (fd.get("phone") || "").trim(),
      notes: (fd.get("notes") || "").trim()
    };
  }

  function formatDate(isoDate) {
    if (!isoDate) return "—";
    var parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    try {
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return isoDate;
    }
  }

  function validatePanel(n) {
    var p = panel(n);
    if (!p) return true;
    var fields = p.querySelectorAll("input, select, textarea");
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      if (el.type === "radio") continue;
      if (!el.checkValidity()) {
        el.reportValidity();
        return false;
      }
    }
    if (n === 1) {
      var checked = p.querySelector('input[name="slot"]:checked');
      if (!checked) {
        var first = p.querySelector('input[name="slot"]');
        if (first) first.reportValidity();
        return false;
      }
    }
    return true;
  }

  function row(label, value) {
    return "<div><dt>" + label + "</dt><dd>" + (value || "—") + "</dd></div>";
  }

  function renderReview() {
    var d = readData();
    var notes = d.notes ? d.notes.replace(/</g, "&lt;") : "None";
    reviewCard.innerHTML =
      "<dl>" +
      row("Date", formatDate(d.date)) +
      row("Time", d.slot) +
      row("Party", d.party ? d.party + (d.party === "1" ? " guest" : " guests") : "") +
      row("Experience", d.experience) +
      row("Name", d.name.replace(/</g, "&lt;")) +
      row("Email", d.email.replace(/</g, "&lt;")) +
      row("Phone", d.phone.replace(/</g, "&lt;")) +
      row("Special requests", notes) +
      "</dl>";
  }

  if (form) {
    form.addEventListener("click", function (e) {
      var next = e.target.closest("[data-next]");
      var back = e.target.closest("[data-back]");
      if (next) {
        e.preventDefault();
        if (!validatePanel(current)) return;
        if (current < total) setStep(current + 1);
      }
      if (back) {
        e.preventDefault();
        if (current > 1) setStep(current - 1);
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validatePanel(3) || !validatePanel(4)) {
        setStep(3);
        return;
      }
      var d = readData();
      var ref = "MC-" + String(Date.now()).slice(-6);
      confirmSummary.innerHTML =
        row("Date", formatDate(d.date)) +
        row("Time", d.slot) +
        row("Party", d.party + (d.party === "1" ? " guest" : " guests")) +
        row("Experience", d.experience) +
        row("Name", d.name.replace(/</g, "&lt;")) +
        row("Email", d.email.replace(/</g, "&lt;")) +
        row("Phone", d.phone.replace(/</g, "&lt;")) +
        row("Special requests", d.notes ? d.notes.replace(/</g, "&lt;") : "None");
      confirmRef.textContent = ref;
      form.hidden = true;
      if (steps) steps.hidden = true;
      confirmScreen.hidden = false;
      confirmScreen.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      if (dateInput) {
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().slice(0, 10);
      }
      confirmScreen.hidden = true;
      form.hidden = false;
      if (steps) steps.hidden = false;
      setStep(1);
    });
  }

  var card = document.getElementById("rk-source-card");
  var closeBtn = document.getElementById("rk-source-close");
  try {
    if (card && !sessionStorage.getItem("rk_mc_source_dismissed")) {
      card.hidden = false;
    }
  } catch (err) {}
  if (closeBtn && card) {
    closeBtn.addEventListener("click", function () {
      card.hidden = true;
      try { sessionStorage.setItem("rk_mc_source_dismissed", "1"); } catch (err) {}
    });
  }
})();
