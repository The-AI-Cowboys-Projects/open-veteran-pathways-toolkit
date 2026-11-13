(function () {
  const engine = window.ScamEngine;
  const rules = window.OVPT_RULES;
  const model = window.OVPT_SPAM_MODEL;
  const output = document.getElementById("output");
  const status = document.getElementById("ocr-status");
  const progress = document.getElementById("ocr-progress");
  const bar = document.getElementById("ocr-bar");
  const ocrError = document.getElementById("ocr-error");
  const textBtn = document.getElementById("text-size");
  const imageInput = document.getElementById("image");
  let ocrBusy = false;

  if (textBtn && textBtn.getAttribute("data-bound") !== "shell") {
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

  function showOcrError(message) {
    ocrBusy = false;
    if (imageInput) imageInput.disabled = false;
    if (progress) progress.hidden = true;
    status.className = "state state-empty";
    status.textContent = "Screenshot reading stopped before it finished.";
    if (!ocrError) return;
    ocrError.hidden = false;
    ocrError.textContent = message;
  }

  function render(result) {
    output.replaceChildren();
    const heading = h("h2", { id: "results-heading", tabindex: "-1", text: "Result" });
    output.append(heading);
    if (!result.ok) {
      output.append(h("p", { class: "state state-empty", text: "Paste a little more of the message. A few words are not enough to judge." }));
      heading.focus();
      return;
    }
    const banner = h("div", { class: "panel risk-" + result.level });
    const label = result.level === "high" ? "High concern" : result.level === "medium" ? "Some concern" : "Low concern";
    banner.append(h("p", {}, [h("span", { class: "badge", text: label })]));
    banner.append(h("p", { text: result.summary }));
    banner.append(h("p", { text: "Rule score " + result.score + ". This is an aid, not a guarantee. A careful scam can score low, and a clumsy real message can score higher." }));
    output.append(banner);
    if (!result.hits.length) {
      output.append(h("p", { class: "state state-empty", text: "None of the typed rules matched. That is not a clearance." }));
    }
    result.hits.forEach(function (hit) {
      const box = h("article", { class: "hit" });
      box.append(h("h3", { text: hit.title }));
      box.append(h("p", { text: "Matched text: “" + hit.excerpt + "”" }));
      box.append(h("p", { text: hit.why }));
      box.append(h("p", { text: hit.action }));
      const link = h("a", {
        href: hit.source,
        text: hit.sourceName,
        rel: "noopener noreferrer",
        referrerpolicy: "no-referrer",
      });
      link.target = "_blank";
      box.append(h("p", {}, [document.createTextNode("Public source: "), link]));
      output.append(box);
    });
    if (result.model) {
      const pct = Math.round(result.model.probability * 100);
      const note = h("div", { class: "callout" });
      note.append(h("h3", { text: "Separate SMS-spam hint" }));
      if (result.model.flagged) {
        note.append(h("p", { text: "A small model trained on the 2011 SMS Spam Collection also leans toward spam (" + pct + "% at a cutoff of " + Math.round(result.model.threshold * 100) + "%). On a held-out slice of that collection, this cutoff had about 88% precision and still marked some ordinary texts as spam. The collection is old promotional SMS, not VA benefits mail. Read the rules above for the reason this page cares." }));
      } else {
        note.append(h("p", { text: "The 2011 SMS model did not reach its cutoff (" + pct + "%). That does not clear the message. The model never saw pension poaching or a VA impersonation script when it was trained." }));
      }
      if (result.model.matched.length) {
        note.append(h("p", { text: "Words from that model’s list: " + result.model.matched.join(", ") + "." }));
      }
      output.append(note);
    }
    const channel = document.getElementById("channel");
    const rubric = engine.messageRubric(document.getElementById("text").value, channel ? channel.value : "messaging");
    const rubricBox = h("div", { class: "callout", id: "message-rubric" });
    rubricBox.append(h("h3", { text: "Message rubric suggestion" }));
    rubricBox.append(h("p", { text: rubric.note }));
    rubricBox.append(h("p", { text: "Score " + rubric.points + " (the prompt’s cutoff is " + rubric.threshold + "). Label from that rule: " + rubric.label + ". This is not a measured probability and it does not change the concern level above." }));
    if (!rubric.hits.length) rubricBox.append(h("p", { text: "None of the rubric lines matched." }));
    rubric.hits.forEach(function (hit) {
      rubricBox.append(h("p", { text: (hit.points > 0 ? "+" : "") + hit.points + " " + hit.label }));
    });
    output.append(rubricBox);
    heading.focus();
  }

  if (!engine || !rules || !model) {
    output.replaceChildren();
    const err = h("p", {
      class: "state state-error",
      role: "alert",
      text: "The scam rules or the SMS model did not load. Reload once while online. After that, the saved copy can open offline.",
    });
    output.append(err);
    return;
  }

  document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();
    render(engine.analyze(rules, model, document.getElementById("text").value));
  });

  let localGenerate = null;
  const modelPanel = document.getElementById("model-panel");
  if (window.LocalModel && modelPanel) {
    window.LocalModel.mount(modelPanel, {
      purpose: "scam",
      onReady: function (result) { localGenerate = result.generate; },
    });
    const ask = h("button", { type: "button", id: "model-ask", text: "Ask the on-device model about the text above" });
    modelPanel.append(ask);
    const suggestion = h("div", { id: "model-suggestion", "aria-live": "polite" });
    modelPanel.append(suggestion);
    ask.addEventListener("click", function () {
      suggestion.replaceChildren();
      if (!localGenerate) {
        suggestion.append(h("p", { class: "state state-empty", text: "The model is not on this device. The rules and the rubric above still ran without it." }));
        return;
      }
      const text = document.getElementById("text").value.trim();
      if (text.length < 8) {
        suggestion.append(h("p", { class: "state state-empty", text: "Paste a message first. The model is optional." }));
        return;
      }
      suggestion.append(h("p", { class: "state state-loading", text: "The model is reading the text on this device." }));
      const channel = document.getElementById("channel");
      localGenerate(engine.messagePrompt(channel ? channel.value : "messaging", text)).then(function (raw) {
        const parsed = engine.parseModelSuggestion(raw);
        suggestion.replaceChildren();
        const box = h("div", { class: "warning" });
        box.append(h("h3", { text: "Model suggestion for human review" }));
        box.append(h("p", { text: "Label: " + parsed.label + ". " + parsed.reason }));
        box.append(h("p", { text: "This is not a measured probability, not a clearance, and not a decision. Scope: scam and phishing text only." }));
        suggestion.append(box);
      }).catch(function () {
        suggestion.replaceChildren(h("p", { class: "state state-error", role: "alert", text: "The model did not finish. The rules above are unchanged." }));
      });
    });
  }

  imageInput.addEventListener("change", function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file || ocrBusy) return;
    if (!window.Tesseract || !window.Tesseract.createWorker) {
      showOcrError("Local OCR did not load. Paste the text instead. Analysis of pasted text still works.");
      return;
    }
    ocrBusy = true;
    imageInput.disabled = true;
    if (ocrError) ocrError.hidden = true;
    status.className = "state state-loading";
    status.textContent = "Reading the image on this device. The first run loads the local OCR files and can take a little while.";
    if (progress) progress.hidden = false;
    if (bar) {
      bar.style.width = "0%";
      bar.setAttribute("aria-valuenow", "0");
    }
    const base = new URL("vendor/tesseract/", window.location.href);
    window.Tesseract.createWorker("eng", 1, {
      workerPath: new URL("worker.min.js", base).href,
      corePath: new URL("core/", base).href,
      langPath: base.href,
      workerBlobURL: true,
      gzip: true,
      logger: function (message) {
        if (!message || !message.status) return;
        const fraction = typeof message.progress === "number" ? message.progress : null;
        const pct = fraction === null ? "" : " " + Math.round(fraction * 100) + "%";
        status.textContent = "Reading the screenshot on this device: " + message.status + pct;
        if (bar && fraction !== null) {
          const n = Math.max(0, Math.min(100, Math.round(fraction * 100)));
          bar.style.width = n + "%";
          bar.setAttribute("aria-valuenow", String(n));
        }
      },
    }).then(function (worker) {
      return worker.recognize(file).then(function (result) {
        return worker.terminate().then(function () { return result; });
      });
    }).then(function (result) {
      ocrBusy = false;
      imageInput.disabled = false;
      if (progress) progress.hidden = true;
      const text = (result && result.data && result.data.text) || "";
      document.getElementById("text").value = text.trim();
      status.className = "state state-empty";
      status.textContent = text.trim()
        ? "Text from the image is in the box. Fix OCR mistakes, then analyze. The image was not uploaded."
        : "OCR finished without readable text. Try a clearer crop, or type the message.";
    }).catch(function () {
      showOcrError("Local OCR did not start. Opening the file directly (file://) often blocks the OCR worker. Serve this folder with a local web server, or paste the text instead. Analysis of pasted text still works with no server.");
    });
  });
})();
