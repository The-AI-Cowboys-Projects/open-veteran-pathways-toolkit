(function () {
  const data = window.OVPT_TUTOR;
  const textBtn = document.getElementById("text-size");
  const search = document.getElementById("q");
  const glossary = document.getElementById("glossary");
  const lessons = document.getElementById("lessons");
  const reader = document.getElementById("reader");
  const summary = document.getElementById("progress-summary");
  const meter = document.getElementById("progress-meter");
  const meterBar = document.getElementById("progress-bar");

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

  function sourceLink(href, name) {
    if (!href) return null;
    const link = h("a", {
      href: href,
      text: name || href,
      rel: "noopener noreferrer",
      referrerpolicy: "no-referrer",
    });
    link.target = "_blank";
    return link;
  }

  function sourceLine(item) {
    const links = [];
    if (item.source) links.push(sourceLink(item.source, item.sourceName));
    if (item.source2) links.push(sourceLink(item.source2, item.sourceName2));
    (item.sources || []).forEach(function (source) {
      links.push(sourceLink(source.href, source.name));
    });
    if (!links.length) return null;
    const line = h("p");
    line.append(document.createTextNode("Source: "));
    links.forEach(function (link, index) {
      if (index) line.append(document.createTextNode("; "));
      if (link) line.append(link);
    });
    return line;
  }

  function showError(node, message) {
    node.replaceChildren(h("p", { class: "state state-error", role: "alert", text: message }));
  }

  if (!data || !data.glossary || !data.lessons) {
    showError(glossary, "The glossary file did not load. Reload once while online. After that, the saved copy can open offline.");
    showError(lessons, "The lessons file did not load. Reload once while online.");
    if (summary) {
      summary.className = "state state-error";
      summary.textContent = "Progress cannot be shown until the lesson file loads.";
    }
    return;
  }

  function progress() {
    try {
      return JSON.parse(localStorage.getItem("ovpt-tutor-progress") || "{}");
    } catch (err) {
      return {};
    }
  }
  function save(next) {
    next.updatedAt = new Date().toISOString();
    localStorage.setItem("ovpt-tutor-progress", JSON.stringify(next));
    renderProgress();
  }

  function quizTotal() {
    return data.lessons.reduce(function (sum, lesson) { return sum + lesson.quiz.length; }, 0);
  }

  function renderProgress() {
    const state = progress();
    const readCount = data.lessons.filter(function (lesson) {
      return state.read && state.read[lesson.id];
    }).length;
    const scored = data.lessons.filter(function (lesson) {
      return state.scores && state.scores[lesson.id];
    }).length;
    summary.className = readCount ? "state" : "state state-empty";
    summary.textContent = readCount
      ? readCount + " of " + data.lessons.length + " lessons marked read on this browser. Quizzes saved for " + scored + " lesson" + (scored === 1 ? "" : "s") + "."
      : "No lessons marked read on this browser yet. Open a lesson when you are ready. Nothing is sent to a server.";
    if (meter && meterBar) {
      const pct = Math.round((readCount / data.lessons.length) * 100);
      meter.hidden = false;
      meterBar.style.width = pct + "%";
      meterBar.setAttribute("aria-valuenow", String(pct));
    }
    const counts = document.getElementById("tutor-counts");
    if (counts) {
      counts.textContent = "There are " + data.glossary.length + " glossary entries, " + data.lessons.length + " lessons, and " + quizTotal() + " quiz questions. A quiz score means you matched this answer key. It is not a certificate.";
    }
  }

  function renderGlossary() {
    const q = search.value.trim().toLowerCase();
    const items = data.glossary.filter(function (item) {
      if (!q) return true;
      return (item.term + " " + item.plain + " " + item.example).toLowerCase().indexOf(q) !== -1;
    });
    glossary.replaceChildren();
    if (!items.length) {
      glossary.append(h("p", { class: "state state-empty", role: "status", text: "No glossary entry contains that word. Try prompt, hallucination, privacy, or phishing." }));
      return;
    }
    items.forEach(function (item) {
      const card = h("article", { class: "card" });
      card.append(h("h3", { text: item.term }));
      card.append(h("p", { text: item.plain }));
      card.append(h("p", { text: "Example: " + item.example }));
      const sources = sourceLine(item);
      if (sources) card.append(sources);
      glossary.append(card);
    });
  }

  function renderLessons() {
    const state = progress();
    lessons.replaceChildren();
    data.lessons.forEach(function (lesson, index) {
      const card = h("article", { class: "card" });
      const score = state.scores && state.scores[lesson.id];
      const best = state.best && state.best[lesson.id];
      const read = state.read && state.read[lesson.id];
      card.append(h("h3", { text: (index + 1) + ". " + lesson.title }));
      let line = lesson.when + " · about " + lesson.minutes + " minutes";
      if (read) line += " · marked read";
      if (score) line += " · last quiz " + score.correct + "/" + score.total;
      if (best) line += " · best " + best.correct + "/" + best.total;
      card.append(h("p", { text: line }));
      const open = h("button", { type: "button", text: "Open lesson" });
      open.addEventListener("click", function () { renderLesson(lesson); });
      card.append(open);
      lessons.append(card);
    });
  }

  function renderLesson(lesson) {
    reader.replaceChildren();
    const article = h("article", { class: "panel" });
    const heading = h("h2", { id: "lesson-heading", tabindex: "-1", text: lesson.title });
    article.append(heading);
    lesson.body.forEach(function (paragraph) { article.append(h("p", { text: paragraph })); });
    const sources = sourceLine(lesson);
    if (sources) article.append(sources);
    const mark = h("button", { type: "button", class: "secondary", text: "Mark lesson as read on this browser" });
    mark.addEventListener("click", function () {
      const state = progress();
      state.read = state.read || {};
      state.read[lesson.id] = true;
      save(state);
      mark.textContent = "Saved on this browser";
      renderLessons();
    });
    article.append(mark);
    article.append(h("h3", { text: "Check yourself" }));
    const form = h("form");
    lesson.quiz.forEach(function (item, qIndex) {
      const field = h("fieldset", { class: "card" });
      field.append(h("legend", { text: (qIndex + 1) + ". " + item.q }));
      item.choices.forEach(function (choice, cIndex) {
        const id = lesson.id + "-" + qIndex + "-" + cIndex;
        const label = h("label", { class: "check", for: id });
        const input = h("input", { id: id, type: "radio", name: lesson.id + "-" + qIndex, value: String(cIndex) });
        label.append(input, document.createTextNode(choice));
        field.append(label);
      });
      form.append(field);
    });
    const submit = h("button", { type: "submit", text: "Score this quiz" });
    const result = h("div", { "aria-live": "polite" });
    form.append(submit, result);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      let correct = 0;
      let unanswered = 0;
      const review = h("div");
      lesson.quiz.forEach(function (item, qIndex) {
        const chosen = form.querySelector('input[name="' + lesson.id + "-" + qIndex + '"]:checked');
        const picked = chosen ? Number(chosen.value) : -1;
        if (picked < 0) unanswered += 1;
        const good = picked === item.answer;
        if (good) correct += 1;
        const block = h("div", { class: good ? "callout" : "warning" });
        block.append(h("p", { text: (qIndex + 1) + ". " + (picked < 0 ? "Not answered. " : good ? "Correct. " : "Not the best answer. ") + item.why }));
        const whySource = sourceLine(item);
        if (whySource) block.append(whySource);
        review.append(block);
      });
      const lead = unanswered
        ? correct + " of " + lesson.quiz.length + " matched the answer key. " + unanswered + " question" + (unanswered === 1 ? " was" : "s were") + " left blank."
        : correct + " of " + lesson.quiz.length + " matched the answer key.";
      result.replaceChildren(h("p", { text: lead }), review);
      const state = progress();
      state.scores = state.scores || {};
      state.scores[lesson.id] = { correct: correct, total: lesson.quiz.length, at: new Date().toISOString() };
      state.best = state.best || {};
      const prev = state.best[lesson.id];
      if (!prev || correct > prev.correct) {
        state.best[lesson.id] = { correct: correct, total: lesson.quiz.length, at: new Date().toISOString() };
      }
      state.read = state.read || {};
      state.read[lesson.id] = true;
      save(state);
      renderLessons();
    });
    article.append(form);
    reader.append(article);
    heading.focus();
  }

  document.getElementById("clear-progress").addEventListener("click", function () {
    localStorage.removeItem("ovpt-tutor-progress");
    renderLessons();
    renderProgress();
    reader.replaceChildren(h("p", { class: "state state-empty", text: "Lesson progress on this browser was cleared. The lessons themselves are still in the page." }));
  });

  document.getElementById("export-progress").addEventListener("click", function () {
    const state = progress();
    const payload = {
      app: "Plain-English AI Tutor",
      exportedAt: new Date().toISOString(),
      storageKey: "ovpt-tutor-progress",
      lessonCount: data.lessons.length,
      glossaryCount: data.glossary.length,
      quizCount: quizTotal(),
      read: state.read || {},
      scores: state.scores || {},
      best: state.best || {},
      lessons: data.lessons.map(function (lesson) {
        const score = state.scores && state.scores[lesson.id];
        const best = state.best && state.best[lesson.id];
        return {
          id: lesson.id,
          title: lesson.title,
          read: Boolean(state.read && state.read[lesson.id]),
          lastQuiz: score || null,
          bestQuiz: best || null,
        };
      }),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = h("a", { href: url });
    link.download = "ai-tutor-progress.json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  search.addEventListener("input", renderGlossary);
  renderGlossary();
  renderLessons();
  renderProgress();

  let lastPassages = [];
  let localGenerate = null;
  const askForm = document.getElementById("ask-form");
  const askOutput = document.getElementById("ask-output");
  const askModel = document.getElementById("ask-model");
  const modelAnswer = document.getElementById("model-answer");
  if (window.LocalModel) {
    window.LocalModel.mount(document.getElementById("model-panel"), {
      purpose: "tutor",
      onReady: function (result) {
        localGenerate = result.generate;
        if (askModel) askModel.disabled = false;
      },
    });
  }
  function renderPassages(passages) {
    askOutput.replaceChildren();
    if (!passages.length) {
      askOutput.append(h("p", { class: "state state-empty", text: "No lesson or glossary passage matched those words. Try a term from the glossary." }));
      return;
    }
    passages.forEach(function (item) {
      const card = h("article", { class: "card" });
      card.append(h("h3", { text: item.title }));
      card.append(h("p", { text: item.text }));
      card.append(h("p", { text: "Passage " + item.id }));
      const line = sourceLine({ source: item.source, sourceName: item.sourceName });
      if (line) card.append(line);
      askOutput.append(card);
    });
  }
  if (askForm && window.TutorRetrieve) {
    askForm.addEventListener("submit", function (event) {
      event.preventDefault();
      lastPassages = window.TutorRetrieve.retrieve(data, document.getElementById("ask").value, 4);
      renderPassages(lastPassages);
    });
  }
  if (askModel) {
    askModel.addEventListener("click", function () {
      modelAnswer.replaceChildren();
      if (!localGenerate) {
        modelAnswer.append(h("p", { class: "state state-empty", text: "The model is not on this device. The passages above are the answer source. Read those." }));
        return;
      }
      const question = document.getElementById("ask").value.trim();
      if (!lastPassages.length) {
        modelAnswer.append(h("p", { class: "state state-empty", text: "Find sourced passages first. The model is limited to those passages." }));
        return;
      }
      modelAnswer.append(h("p", { class: "state state-loading", text: "The model is phrasing an answer from the passages on this device." }));
      const prompt = window.TutorRetrieve.tutorPrompt(question, lastPassages);
      localGenerate(prompt).then(function (raw) {
        const cited = lastPassages.some(function (item) { return String(raw || "").indexOf(item.id) !== -1; });
        modelAnswer.replaceChildren();
        const box = h("div", { class: "warning" });
        box.append(h("h3", { text: "Model suggestion for human review" }));
        box.append(h("p", { text: String(raw || "").trim() || "The model returned no text." }));
        box.append(h("p", { text: cited
          ? "The suggestion names a passage id from the list above. Check that the sentence matches that passage."
          : "The suggestion did not name a passage id from the list above. Do not use it." }));
        lastPassages.forEach(function (item) {
          const line = sourceLine({ source: item.source, sourceName: item.sourceName || item.id });
          if (line) box.append(line);
        });
        modelAnswer.append(box);
      }).catch(function () {
        modelAnswer.replaceChildren(h("p", { class: "state state-error", role: "alert", text: "The model did not finish. The passages above are unchanged." }));
      });
    });
  }
})();
