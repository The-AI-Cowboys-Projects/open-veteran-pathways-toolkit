(function () {
  const plan = window.OVPT_PLAN;
  const list = document.getElementById("list");
  const summary = document.getElementById("summary");
  const dateInput = document.getElementById("separation-date");
  const textBtn = document.getElementById("text-size");
  const KEY = "ovpt-companion-v1";

  function applyTextSize() {
    const on = localStorage.getItem("ovpt-large-text") === "1";
    document.documentElement.classList.toggle("large-text", on);
    textBtn.setAttribute("aria-pressed", on ? "true" : "false");
  }
  textBtn.addEventListener("click", function () {
    localStorage.setItem("ovpt-large-text", localStorage.getItem("ovpt-large-text") === "1" ? "0" : "1");
    applyTextSize();
  });
  applyTextSize();

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      return { date: saved.date || "", checks: saved.checks || {} };
    } catch (err) {
      return { date: "", checks: {} };
    }
  }
  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function monthsUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr + "T00:00:00");
    if (Number.isNaN(target.getTime())) return null;
    const now = new Date();
    return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  }

  function h(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "class") node.className = attrs[key];
      else if (key === "text") node.textContent = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      if (child) node.append(child);
    });
    return node;
  }

  function render() {
    const state = load();
    dateInput.value = state.date;
    const months = monthsUntil(state.date);
    const items = [];
    plan.phases.forEach(function (phase) {
      phase.items.forEach(function (item) { items.push(item.id); });
    });
    const done = items.filter(function (id) { return state.checks[id]; }).length;
    summary.textContent = done + " of " + items.length + " steps checked on this browser."
      + (months === null ? " Add a separation date if you want the current window highlighted." : " About " + months + " month(s) until the date you entered (negative means that date has passed).");

    list.replaceChildren();
    plan.phases.forEach(function (phase) {
      const current = months !== null && months >= phase.window[0] && months < phase.window[1];
      const section = h("section", { class: "panel" + (current ? " callout" : "") });
      section.append(h("h2", { text: phase.title + (current ? " — closest to the date you entered" : "") }));
      phase.items.forEach(function (item) {
        const id = "step-" + item.id;
        const label = h("label", { class: "check", for: id });
        const input = h("input", { id: id, type: "checkbox" });
        input.checked = Boolean(state.checks[item.id]);
        input.addEventListener("change", function () {
          const next = load();
          next.checks[item.id] = input.checked;
          save(next);
          render();
        });
        const text = h("span");
        text.append(document.createTextNode(item.text));
        if (item.tool) {
          text.append(document.createTextNode(" "));
          text.append(h("a", { href: item.tool, text: item.toolLabel }));
        }
        if (item.href) {
          text.append(document.createTextNode(" "));
          const link = h("a", {
            href: item.href,
            text: item.hrefLabel,
            rel: "noopener noreferrer",
            referrerpolicy: "no-referrer",
          });
          link.target = "_blank";
          text.append(link);
        }
        label.append(input, text);
        section.append(label);
      });
      list.append(section);
    });
  }

  dateInput.addEventListener("change", function () {
    const state = load();
    state.date = dateInput.value;
    save(state);
    render();
  });

  document.getElementById("export").addEventListener("click", function () {
    const blob = new Blob([JSON.stringify(load(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = h("a", { href: url });
    link.download = "transition-checklist.json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  document.getElementById("import").addEventListener("change", function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        if (!parsed || typeof parsed !== "object" || typeof parsed.checks !== "object") {
          summary.textContent = "That file is not a checklist backup from this page.";
          return;
        }
        save({ date: typeof parsed.date === "string" ? parsed.date : "", checks: parsed.checks });
        render();
      } catch (err) {
        summary.textContent = "Could not read that file as JSON.";
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("reset").addEventListener("click", function () {
    localStorage.removeItem(KEY);
    render();
  });

  render();
})();
