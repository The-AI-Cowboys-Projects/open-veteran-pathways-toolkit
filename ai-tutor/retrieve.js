/* Retrieval over the tutor's own lessons. No network. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TutorRetrieve = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function tokens(text) {
    return String(text || "").toLowerCase().split(/[^a-z0-9]+/).filter(function (token) {
      return token.length >= 4;
    });
  }

  function score(hay, queryTokens) {
    if (!queryTokens.length) return 0;
    var points = 0;
    queryTokens.forEach(function (token) {
      if (hay.indexOf(token) !== -1) points += 1;
    });
    return points;
  }

  function clip(text) {
    var clean = String(text || "").replace(/\s+/g, " ").trim();
    return clean.length > 420 ? clean.slice(0, 417) + "..." : clean;
  }

  function retrieve(data, query, limit) {
    var queryTokens = tokens(query);
    var rows = [];
    (data.glossary || []).forEach(function (item) {
      rows.push({
        id: "glossary-" + item.term.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: item.term,
        text: item.plain + " Example: " + item.example,
        source: item.source,
        sourceName: item.sourceName || item.source,
      });
    });
    (data.lessons || []).forEach(function (lesson) {
      (lesson.body || []).forEach(function (paragraph, index) {
        var source = (lesson.sources && lesson.sources[0]) || {};
        rows.push({
          id: lesson.id + "-p" + (index + 1),
          title: lesson.title,
          text: paragraph,
          source: source.href || "",
          sourceName: source.name || "",
        });
      });
      (lesson.quiz || []).forEach(function (item, index) {
        rows.push({
          id: lesson.id + "-q" + (index + 1),
          title: lesson.title + " quiz note",
          text: item.why,
          source: item.source || "",
          sourceName: item.sourceName || "",
        });
      });
    });
    var ranked = rows.map(function (row) {
      return { row: row, score: score((row.title + " " + row.text).toLowerCase(), queryTokens) };
    }).filter(function (item) { return item.score > 0; });
    ranked.sort(function (a, b) { return b.score - a.score || a.row.id.localeCompare(b.row.id); });
    return ranked.slice(0, limit || 4).map(function (item) {
      return {
        id: item.row.id,
        title: item.row.title,
        text: clip(item.row.text),
        source: item.row.source,
        sourceName: item.row.sourceName,
        score: item.score,
      };
    });
  }

  function tutorPrompt(question, passages) {
    var lines = [
      "You answer only from the passages below. They are the Plain-English AI Tutor's own text.",
      "If the passages do not contain the answer, say that the lessons do not cover it.",
      "Cite the passage id in brackets, such as [glossary-phishing].",
      "Do not add facts from outside the passages. Do not give legal, medical, financial, or benefits advice.",
      "Do not take an action. A person will review your wording.",
      "Question: " + String(question || "").slice(0, 500),
      "Passages:",
    ];
    if (!passages || !passages.length) {
      lines.push("(none)");
    } else {
      passages.forEach(function (item) {
        lines.push("[" + item.id + "] " + item.title + ": " + item.text + " Source: " + (item.source || "none"));
      });
    }
    return lines.join("\n");
  }

  return { retrieve: retrieve, tutorPrompt: tutorPrompt };
});
