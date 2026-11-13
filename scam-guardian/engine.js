(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ScamEngine = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function excerpt(text, match) {
    const start = Math.max(0, match.index - 40);
    const end = Math.min(text.length, match.index + match[0].length + 40);
    return text.slice(start, end).replace(/\s+/g, " ").trim();
  }

  function ruleHits(rules, text) {
    const hits = [];
    rules.forEach(function (rule) {
      const re = new RegExp(rule.pattern, "i");
      const match = re.exec(text);
      if (!match) return;
      hits.push({
        id: rule.id,
        title: rule.title,
        weight: rule.weight,
        excerpt: excerpt(text, match),
        why: rule.why,
        action: rule.action,
        source: rule.source,
        sourceName: rule.sourceName,
      });
    });
    return hits;
  }

  function levelFor(score, hits) {
    const strong = hits.some(function (hit) { return hit.weight >= 3; });
    if (score >= 6 || (strong && hits.length >= 2)) return "high";
    if (score >= 3 || strong) return "medium";
    return "low";
  }

  function summaryFor(level) {
    if (level === "high") {
      return "High concern. Several documented scam tactics showed up. Do not pay, click, or share personal information. Check the story using a phone number or website you look up yourself.";
    }
    if (level === "medium") {
      return "Some concern. At least one common scam tactic showed up. Pause before you reply, pay, or share information, and verify it through an official channel you already trust.";
    }
    return "Low concern from these rules. A low result is not proof that a message is safe. If something feels off, stop and verify it yourself.";
  }

  function modelScore(model, text) {
    if (!model || !model.words) return null;
    const tokens = String(text || "").toLowerCase().match(/[a-z0-9']+/g) || [];
    let logOdds = model.priorLogOdds || 0;
    const matched = [];
    const seen = new Set();
    tokens.forEach(function (token) {
      if (seen.has(token)) return;
      seen.add(token);
      if (Object.prototype.hasOwnProperty.call(model.words, token)) {
        logOdds += model.words[token];
        matched.push(token);
      }
    });
    let prob = 0.5;
    if (logOdds > 30) prob = 1;
    else if (logOdds < -30) prob = 0;
    else prob = 1 / (1 + Math.exp(-logOdds));
    return {
      probability: prob,
      flagged: prob >= (model.threshold || 0.9),
      matched: matched.slice(0, 12),
      threshold: model.threshold || 0.9,
    };
  }

  function analyze(rules, model, text) {
    const clean = String(text || "").trim();
    if (clean.length < 8) return { ok: false, reason: "short" };
    const hits = ruleHits(rules, clean);
    const score = hits.reduce(function (sum, hit) { return sum + hit.weight; }, 0);
    const level = levelFor(score, hits);
    return {
      ok: true,
      level: level,
      score: score,
      summary: summaryFor(level),
      hits: hits,
      model: modelScore(model, clean),
    };
  }

  return { analyze: analyze, levelFor: levelFor, modelScore: modelScore };
});
