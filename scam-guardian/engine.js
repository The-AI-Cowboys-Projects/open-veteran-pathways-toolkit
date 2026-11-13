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

  const OFFICIAL_HOSTS = {
    "va.gov": true,
    "www.va.gov": true,
    "benefits.va.gov": true,
    "www.benefits.va.gov": true,
    "www.vaoig.gov": true,
    "reportfraud.ftc.gov": true,
    "www.ftc.gov": true,
    "consumer.ftc.gov": true,
    "www.ic3.gov": true,
    "www.irs.gov": true,
    "www.ssa.gov": true,
  };

  function hostsIn(text) {
    const found = [];
    const re = /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi;
    let match;
    while ((match = re.exec(String(text || "")))) {
      let host = match[0].toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "www.");
      host = host.replace(/^https?:\/\//, "");
      found.push(host.replace(/^www\.(?=www\.)/, ""));
    }
    return found;
  }

  function hostKey(host) {
    return String(host || "").toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
  }

  function isOfficial(host) {
    const key = hostKey(host).replace(/^www\./, "");
    if (OFFICIAL_HOSTS[key] || OFFICIAL_HOSTS["www." + key]) return true;
    return key.endsWith(".va.gov") || key.endsWith(".mil") && key.indexOf("va") !== -1;
  }

  function messageRubric(text, category) {
    const source = String(text || "");
    const lower = source.toLowerCase();
    const kind = category === "email" || category === "other" ? category : "messaging";
    const hits = [];
    function add(id, points, label) {
      hits.push({ id: id, points: points, label: label });
    }
    const withoutProtective = source.replace(/\bdo not share\b/ig, " ");
    const personal = /\b(password|social security|\bssn\b|bank account|routing number|credit card|debit card)\b/i.test(source)
      || /\b(send|share|provide|confirm|enter|tell|reply|give)\b[\s\S]{0,48}\b(password|passcode|one[- ]time|otp|\bpin\b|social security|\bssn\b)\b/i.test(withoutProtective);
    const clickCall = /\b(click|tap|call|dial)\b[\s\S]{0,40}\b(link|here|number|now|immediately)\b/i.test(source) || /\bhttps?:\/\//i.test(source);
    const pressure = /\b(act now|immediately|urgent|final notice|account suspended|legal action|last warning|within 24 hours)\b/i.test(source);
    const payment = /\b(gift cards?|bitcoin|crypto|wire transfer|western union|moneygram)\b/i.test(source);
    const shorteners = /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly)\b/i.test(lower);
    const hosts = hostsIn(source);
    const unrelated = shorteners || hosts.some(function (host) { return !isOfficial(host); });
    const official = hosts.some(function (host) { return isOfficial(host); });
    const doNotShare = /\bdo not share\b/i.test(source);
    const otpLike = /\b(otp|one[- ]time|passcode|verification code)\b/i.test(source);
    const asksAction = clickCall || personal || payment;
    const informational = /\b(appointment|missed call|reminder|your package|delivery)\b/i.test(source) && !asksAction && !pressure;

    if (kind === "email") {
      if (personal) add("personal", 1, "Asks for personal or financial information");
      if (pressure) add("pressure", 1, "Urgency, fear, or a legal threat");
      if (/\b(you have won|prize|invoice|job offer|congratulations)\b/i.test(source)) add("reward", 1, "Reward, job offer, or invoice lure");
      if (unrelated || /\b(dear customer|verify your account)\b/i.test(source)) add("mismatch", 1, "Brand-mismatch or shady-link pattern from the email rubric");
      const yes = hits.length;
      return {
        category: "email",
        points: yes,
        threshold: 2,
        label: yes >= 2 ? "scam" : "not_scam",
        hits: hits,
        note: "Email checklist stored with this page. Two or more matches follow that checklist’s decision rule. It does not change the written-rule level on this page.",
      };
    }

    if (personal) add("personal", 2, "Asks for personal or financial information");
    if (clickCall) add("click-call", 2, "Asks to click a link or call a number");
    if (pressure) add("pressure", 1, "Threat, penalty, or urgency");
    if (unrelated && hosts.length) add("unrelated", 1, "Link or shortener that is not a clearly official domain");
    if (payment) add("payment", 1, "Payment, gift card, or crypto request");
    if (otpLike && doNotShare && !asksAction) add("otp-protective", -2, "Verification code that says not to share it and does not ask for a click, a call, or more information");
    if (informational) add("informational", -1, "Informational notice with no request to act");
    if (official && !unrelated) add("official", -1, "Link uses a clearly official domain");
    const points = hits.reduce(function (sum, hit) { return sum + hit.points; }, 0);
    return {
      category: kind,
      points: points,
      threshold: 3,
      label: points >= 3 ? "scam" : "not_scam",
      hits: hits,
      note: kind === "other"
        ? "General scam and phishing checklist stored with this page. A point total is the messaging rubric, shown for a person to read. It does not change the written-rule level."
        : "Messaging rubric stored with this page (3 or more points follows that rubric’s decision rule). It does not change the written-rule level on this page.",
    };
  }

  function messagePrompt(category, text) {
    const kind = category === "email" || category === "other" ? category : "messaging";
    const clipped = String(text || "").slice(0, 4000);
    const shared = [
      "You suggest a reading for a person. You do not decide.",
      "Scope: scam and phishing text only. Do not discuss deepfakes, faces, voices, or video.",
      "Work only from the text below. If the evidence is thin, use not_scam.",
      "Do not invent a probability or a percentage.",
      "Reply with JSON only: {\"label\":\"scam\" or \"not_scam\",\"reason\":\"one or two sentences\"}.",
    ];
    if (kind === "email") {
      return shared.concat([
        "The text is an email, which may have come from OCR. Grammar mistakes alone are not a scam.",
        "Use this email checklist: sensitive-information request; urgency or threat; reward, job, or fake invoice; mismatched sender or shady link.",
        "If two or more apply, label scam. Otherwise not_scam.",
        "Email:",
        clipped,
      ]).join("\n");
    }
    if (kind === "other") {
      return shared.concat([
        "Look only for personal or financial requests, urgent pressure, too-good-to-be-true offers, threats, suspicious links, or fake organization impersonation.",
        "Text:",
        clipped,
      ]).join("\n");
    }
    return shared.concat([
      "The text is a message, which may have come from OCR. Grammar mistakes alone are not a scam.",
      "Use this rubric and no other topic:",
      "+2 asks for personal or financial information, including a password, card, or one-time code.",
      "+2 asks the reader to click a link or call a number to fix, pay, or verify.",
      "+1 threat, penalty, or urgency.",
      "+1 link looks unrelated to the claimed organization, or is a shortener.",
      "+1 payment, gift card, or crypto request.",
      "-2 a verification code that says not to share it and does not ask for a click, a call, or more information.",
      "-1 an informational notice with no request to act.",
      "-1 a link on a clearly official domain of the organization named.",
      "If the total is 3 or more, label scam. Otherwise not_scam.",
      "Message:",
      clipped,
    ]).join("\n");
  }

  function parseModelSuggestion(raw) {
    const text = String(raw || "");
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    let label = "unknown";
    let reason = "";
    if (start >= 0 && end > start) {
      const slice = text.slice(start, end + 1);
      try {
        const parsed = JSON.parse(slice);
        const value = String(parsed.label || "").toLowerCase().replace(/[\s-]+/g, "_");
        if (value === "not_scam" || value === "safe" || value === "legitimate") label = "not_scam";
        else if (value === "scam" || value === "phishing" || value === "fraud" || value === "suspicious") label = "scam";
        reason = String(parsed.reason || "").trim();
      } catch (err) {
        label = "unknown";
      }
    }
    if (label === "unknown") {
      const lower = text.toLowerCase();
      if (lower.indexOf("not_scam") !== -1 || lower.indexOf("not scam") !== -1) label = "not_scam";
      else if (/\b(scam|phishing|fraud)\b/.test(lower)) label = "scam";
    }
    if (!reason) reason = text.replace(/\s+/g, " ").trim().slice(0, 280);
    return {
      label: label,
      reason: reason,
      measured: false,
      scope: "scam-phishing",
    };
  }

  return {
    analyze: analyze,
    levelFor: levelFor,
    modelScore: modelScore,
    messageRubric: messageRubric,
    messagePrompt: messagePrompt,
    parseModelSuggestion: parseModelSuggestion,
  };
});
