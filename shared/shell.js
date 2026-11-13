(function () {
  var script = document.currentScript;
  var root = new URL("../", script && script.src ? script.src : window.location.href);

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
  }
  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* Private mode can block storage. */ }
  }

  function systemDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme(mode) {
    if (mode === "dark" || mode === "light") document.documentElement.setAttribute("data-theme", mode);
    else document.documentElement.removeAttribute("data-theme");
    var dark = mode === "dark" || (mode !== "light" && systemDark());
    var btn = document.getElementById("theme");
    if (btn) {
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      btn.textContent = dark ? "Light theme" : "Dark theme";
    }
  }

  var savedTheme = storageGet("ovpt-theme");
  applyTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : "system");
  var themeBtn = document.getElementById("theme");
  if (themeBtn) {
    themeBtn.setAttribute("data-bound", "shell");
    themeBtn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var dark = current === "dark" || (current !== "light" && systemDark());
      var next = dark ? "light" : "dark";
      storageSet("ovpt-theme", next);
      applyTheme(next);
    });
  }
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (storageGet("ovpt-theme") !== "dark" && storageGet("ovpt-theme") !== "light") applyTheme("system");
    });
  }

  function applyTextSize() {
    var on = storageGet("ovpt-large-text") === "1";
    document.documentElement.classList.toggle("large-text", on);
    var btn = document.getElementById("text-size");
    if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false");
  }
  var textBtn = document.getElementById("text-size");
  if (textBtn) {
    textBtn.setAttribute("data-bound", "shell");
    textBtn.addEventListener("click", function () {
      storageSet("ovpt-large-text", storageGet("ovpt-large-text") === "1" ? "0" : "1");
      applyTextSize();
    });
  }
  applyTextSize();

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "class") node.className = attrs[key];
      else if (key === "text") node.textContent = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) { if (child) node.append(child); });
    return node;
  }

  var banner = el("div", { id: "update-banner", class: "update-banner", hidden: "hidden", role: "status" });
  var bannerInner = el("div", { class: "wrap" });
  bannerInner.append(el("p", { text: "An update is available for these files." }));
  var updateBtn = el("button", { type: "button", text: "Load the update" });
  bannerInner.append(updateBtn);
  banner.append(bannerInner);
  document.body.insertBefore(banner, document.body.firstChild);

  var main = document.getElementById("main");
  if (main) {
    var panel = el("section", { class: "panel install-panel", id: "install-panel" });
    panel.append(el("h2", { text: "Install on this device" }));
    panel.append(el("p", { text: "Chrome and Edge can show an Install button when this site is opened over HTTPS, or on localhost. The button uses that browser’s own install prompt. iPhone and iPad do not use that button. In Safari, tap Share, then Add to Home Screen, then open the icon you added." }));
    panel.append(el("p", { text: "The tools can open again without a network connection after the files have loaded once on this device. A shared or public computer keeps the same copies for the next person who uses that browser, so use a device you trust." }));
    var installed = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    if (installed || (navigator.standalone === true)) {
      panel.append(el("p", { class: "callout", text: "You are using the installed toolkit." }));
    }
    main.append(panel);
  }

  var installBtn = document.getElementById("install");
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (event) {
    if (!installBtn) return;
    event.preventDefault();
    deferredPrompt = event;
    installBtn.hidden = false;
  });
  if (installBtn) {
    installBtn.addEventListener("click", function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        installBtn.hidden = true;
      });
    });
  }
  window.addEventListener("appinstalled", function () {
    if (installBtn) installBtn.hidden = true;
  });

  if (!("serviceWorker" in navigator)) return;
  var registration = null;
  var hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (!hadController) {
      hadController = true;
      return;
    }
    window.location.reload();
  });

  function watch(reg) {
    registration = reg;
    var pendingWorker = null;
    updateBtn.addEventListener("click", function () {
      if (pendingWorker) pendingWorker.postMessage({ type: "skip-waiting" });
    });
    function offer(worker) {
      if (!worker || !navigator.serviceWorker.controller) return;
      pendingWorker = worker;
      banner.hidden = false;
    }
    if (reg.waiting) offer(reg.waiting);
    reg.addEventListener("updatefound", function () {
      var worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", function () {
        if (worker.state === "installed") offer(worker);
      });
    });
  }

  navigator.serviceWorker.register(new URL("sw.js", root).href, { scope: new URL("./", root).href })
    .then(watch)
    .catch(function () { /* A copied single folder has no service worker. The tool still runs. */ });
})();
