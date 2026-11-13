(function () {
  const data = window.OVPT_TUTOR;
  const textBtn = document.getElementById("text-size");
  const search = document.getElementById("q");
  const glossary = document.getElementById("glossary");
  const lessons = document.getElementById("lessons");
  const reader = document.getElementById("reader");

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

  function progress() {
    try {
      return JSON.parse(localStorage.getItem("ovpt-tutor-progress") || "{}");
    } catch (err) {
      return {};
    }
  }
  function save(next) {
    localStorage.setItem("ovpt-tutor-progress", JSON.stringify(next));
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

  function renderGlossary() {
    const q = search.value.trim().toLowerCase();
    const items = data.glossary.filter(function (item) {
      if (!q) return true;
      return (item.term + " " + item.plain + " " + item.example).toLowerCase().indexOf(q) !== -1;
    });
    glossary.replaceChildren();
    if (!items.length) {
      glossary.append(h("p", { text: "No glossary entry contains that word. Try prompt, hallucination, privacy, or phishing." }));
      return;
    }
    items.forEach(function (item) {
      const card = h("article", { class: "card" });
      card.append(h("h3", { text: item.term }));
      card.append(h("p", { text: item.plain }));
      card.append(h("p", { text: "Example: " + item.example }));
      glossary.append(card);
    });
  }

  function renderLessons() {
    const state = progress();
    lessons.replaceChildren();
    data.lessons.forEach(function (lesson, index) {
      const card = h("article", { class: "card" });
      const score = state.scores && state.scores[lesson.id];
      const read = state.read && state.read[lesson.id];
      card.append(h("h3", { text: (index + 1) + ". " + lesson.title }));
      card.append(h("p", { text: lesson.when + " · about " + lesson.minutes + " minutes" + (read ? " · marked read" : "") + (score ? " · last quiz " + score.correct + "/" + score.total : "") }));
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
      const review = h("div");
      lesson.quiz.forEach(function (item, qIndex) {
        const chosen = form.querySelector('input[name="' + lesson.id + "-" + qIndex + '"]:checked');
        const picked = chosen ? Number(chosen.value) : -1;
        const good = picked === item.answer;
        if (good) correct += 1;
        review.append(h("p", { text: (qIndex + 1) + ". " + (good ? "Correct. " : "Not the best answer. ") + item.why }));
      });
      result.replaceChildren(h("p", { text: correct + " of " + lesson.quiz.length + " matched the answer key." }), review);
      const state = progress();
      state.scores = state.scores || {};
      state.scores[lesson.id] = { correct: correct, total: lesson.quiz.length };
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
  });
  search.addEventListener("input", renderGlossary);
  renderGlossary();
  renderLessons();
})();
