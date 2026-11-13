(function () {
  const engine = window.ScamEngine;
  const rules = window.OVPT_RULES;
  const model = window.OVPT_SPAM_MODEL;
  const output = document.getElementById("output");
  const status = document.getElementById("ocr-status");
  const textBtn = document.getElementById("text-size");

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

  function render(result) {
    output.replaceChildren();
    const heading = h("h2", { id: "results-heading", tabindex: "-1", text: "Result" });
    output.append(heading);
    if (!result.ok) {
      output.append(h("p", { text: "Paste a little more of the message. A few words are not enough to judge." }));
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
      output.append(h("p", { text: "None of the typed rules matched." }));
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
    heading.focus();
  }

  document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();
    render(engine.analyze(rules, model, document.getElementById("text").value));
  });

  document.getElementById("image").addEventListener("change", function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    status.textContent = "Reading the image on this device. The first run loads the local OCR files and can take a little while.";
    const base = new URL("vendor/tesseract/", window.location.href);
    window.Tesseract.createWorker("eng", 1, {
      workerPath: new URL("worker.min.js", base).href,
      corePath: new URL("core/", base).href,
      langPath: base.href,
      workerBlobURL: true,
      gzip: true,
      logger: function (message) {
        if (!message || !message.status) return;
        const pct = typeof message.progress === "number" ? " " + Math.round(message.progress * 100) + "%" : "";
        status.textContent = message.status + pct;
      },
    }).then(function (worker) {
      return worker.recognize(file).then(function (result) {
        return worker.terminate().then(function () { return result; });
      });
    }).then(function (result) {
      const text = (result && result.data && result.data.text) || "";
      document.getElementById("text").value = text.trim();
      status.textContent = text.trim()
        ? "Text from the image is in the box. Fix OCR mistakes, then analyze. The image was not uploaded."
        : "OCR finished without readable text. Try a clearer crop or type the message.";
    }).catch(function () {
      status.textContent = "Local OCR did not start. Opening the file directly (file://) often blocks the OCR worker. Serve this folder with a local web server, or paste the text instead. Analysis of pasted text still works with no server.";
    });
  });
})();
