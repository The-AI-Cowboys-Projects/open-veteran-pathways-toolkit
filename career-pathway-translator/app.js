(function () {
  const engine = window.CareerEngine;
  const moc = window.OVPT_MOC;
  const occ = window.OVPT_OCC;
  const phrases = window.OVPT_PHRASES;
  const meta = window.OVPT_META;
  const output = document.getElementById("output");
  const form = document.getElementById("search-form");
  const textBtn = document.getElementById("text-size");

  if (textBtn && textBtn.getAttribute("data-bound") !== "shell") {
    function applyTextSize() {
      const on = localStorage.getItem("ovpt-large-text") === "1";
      document.documentElement.classList.toggle("large-text", on);
      textBtn.setAttribute("aria-pressed", on ? "true" : "false");
    }
    textBtn.addEventListener("click", function () {
      const next = localStorage.getItem("ovpt-large-text") === "1" ? "0" : "1";
      localStorage.setItem("ovpt-large-text", next);
      applyTextSize();
    });
    applyTextSize();
  }

  if (!engine || !moc || !occ || !phrases || !meta) {
    output.replaceChildren();
    const err = document.createElement("p");
    err.className = "state state-error";
    err.setAttribute("role", "alert");
    err.textContent = "The career files on this page did not load. Reload once while online. After that, the saved copy can open offline.";
    output.append(err);
    return;
  }
  const boot = document.getElementById("boot");
  if (boot) boot.remove();

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

  function p(text, className) {
    return h("p", { class: className || "", text: text });
  }

  function renderHistory() {
    const slot = document.getElementById("history");
    if (!slot) return;
    let history = [];
    try { history = JSON.parse(localStorage.getItem("ovpt-career-history") || "[]"); } catch (err) { history = []; }
    slot.replaceChildren();
    if (!history.length) {
      slot.append(p("No codes saved on this browser yet. A successful lookup is kept here, on this device only.", "state state-empty"));
      return;
    }
    const list = h("ul");
    history.forEach(function (item) {
      list.append(h("li", { text: (item.branch ? item.branch + " " : "") + item.code + " — " + item.title }));
    });
    slot.append(list);
  }

  function fillRanks() {
    const branch = document.getElementById("rank-branch");
    const grade = document.getElementById("rank-grade");
    const labels = {
      army: "Army",
      navy: "Navy",
      usaf: "Air Force",
      usmc: "Marine Corps",
      uscg: "Coast Guard",
      ussf: "Space Force",
    };
    const branches = [];
    (phrases.ranks || []).forEach(function (row) {
      if (branches.indexOf(row.branch) === -1) branches.push(row.branch);
    });
    branch.append(h("option", { value: "", text: "Choose a branch" }));
    branches.forEach(function (id) {
      branch.append(h("option", { value: id, text: labels[id] || id }));
    });
    branch.addEventListener("change", function () {
      grade.replaceChildren(h("option", { value: "", text: "Choose a pay grade" }));
      const seen = [];
      (phrases.ranks || []).forEach(function (row) {
        if (row.branch !== branch.value || seen.indexOf(row.paygrade) !== -1) return;
        seen.push(row.paygrade);
        grade.append(h("option", { value: row.paygrade, text: row.paygrade + " — " + row.rank }));
      });
    });
  }

  function remember(record) {
    try {
      const history = JSON.parse(localStorage.getItem("ovpt-career-history") || "[]");
      history.unshift({
        code: record.code,
        branch: record.branch,
        title: record.title,
        at: Date.now(),
      });
      localStorage.setItem("ovpt-career-history", JSON.stringify(history.slice(0, 8)));
      renderHistory();
    } catch (err) {
      /* Private mode can block storage. The translation still works. */
    }
  }

  function renderOccupation(code) {
    const record = engine.occupation(occ, code);
    const card = h("article", { class: "card" });
    const title = record ? code + " — " + record.t : code + " — not in the bundled O*NET 31.0 file";
    card.append(h("h3", { text: title }));
    if (!record) {
      card.append(p("This code was listed on the military crosswalk or in a Debriefed note, but it is not one of the 1,016 occupations in the O*NET 31.0 file shipped here. A few dictionary notes still cite older codes, including 29-2041.00, that O*NET has since updated."));
      return card;
    }
    if (engine.isMilitaryOccupation(code)) {
      card.append(h("p", { class: "warning", text: "This O*NET-SOC occupation is a military occupation. It describes the service job. It is not, by itself, a civilian job target." }));
    }
    card.append(p(record.d));
    if (record.z && occ.zones[record.z]) {
      const zone = occ.zones[record.z];
      card.append(p(zone.name + " " + zone.education));
    }
    if (record.s.length) card.append(p("Skills rated important in O*NET: " + record.s.join(", ") + "."));
    if (record.j.length) card.append(p("Sample reported job titles: " + record.j.join(", ") + "."));
    if (record.u) {
      const link = h("a", {
        href: record.u,
        text: "BLS Occupational Outlook Handbook page for this occupation",
        rel: "noopener noreferrer",
        referrerpolicy: "no-referrer",
      });
      link.target = "_blank";
      card.append(h("p", {}, [link]));
    }
    return card;
  }

  function renderRecord(record, dutyText) {
    const curated = engine.curatedFor(phrases, record.code, record.branch);
    const duty = dutyText ? engine.translateDuty(phrases, dutyText) : { replacements: [], rewritten: "" };
    const skills = [];
    curated.forEach(function (item) {
      (item.skills || []).forEach(function (skill) {
        if (skills.indexOf(skill) === -1) skills.push(skill);
      });
    });
    (record.onet || []).forEach(function (code) {
      const found = engine.occupation(occ, code);
      if (found) found.s.forEach(function (skill) {
        if (skills.indexOf(skill) === -1) skills.push(skill);
      });
    });
    const bullets = engine.suggestBullets(phrases, record.title + " " + curated.map(function (item) { return item.title; }).join(" "), skills, 3);
    const article = h("article", { class: "panel" });
    article.append(h("h2", { text: record.branchLabel + " " + record.code + " — " + record.title }));
    const badges = h("p", {});
    badges.append(h("span", { class: "badge", text: record.personnel }));
    badges.append(document.createTextNode(" "));
    badges.append(h("span", { class: record.active ? "badge" : "badge outline", text: record.active ? "Active code" : "Obsolete code" }));
    article.append(badges);
    article.append(h("h3", { text: "Official crosswalk" }));
    article.append(p("These O*NET-SOC links come from the Defense Manpower Data Center military occupational classification file milx0724 (July 2024)."));
    if (!record.onet.length) {
      article.append(p("This record has a military title and no O*NET-SOC code in that file."));
    }
    record.onet.forEach(function (code) { article.append(renderOccupation(code)); });

    article.append(h("h3", { text: "Dictionary suggestions" }));
    if (!curated.length) {
      article.append(p("The Debriefed dictionary does not have an extra civilian-title note for this exact code. Use the official occupation text and your own duty description. Do not invent duties you did not perform."));
    }
    curated.forEach(function (item) {
      const box = h("div", { class: "card" });
      box.append(p("Debriefed note for " + (item.branch || "this branch") + " " + item.code + (item.title ? " (" + item.title + ")" : "") + ". These are wording ideas from that MIT dictionary, not a finding that you qualify for the job."));
      if (item.description) box.append(p(item.description));
      if (item.civilian.length) box.append(p("Civilian titles in the dictionary: " + item.civilian.join("; ") + "."));
      if (item.skills.length) box.append(p("Skills named in the dictionary: " + item.skills.join("; ") + "."));
      if (item.industries.length) box.append(p("Industries named in the dictionary: " + item.industries.join("; ") + "."));
      if (item.onet.length) {
        box.append(p("O*NET codes stored with this dictionary note:"));
        item.onet.forEach(function (code) { box.append(renderOccupation(code)); });
      }
      article.append(box);
    });

    if (bullets.length) {
      article.append(h("h3", { text: "Resume examples to rewrite" }));
      article.append(p("These examples come from Debriefed bullet patterns that share words with this title. Replace the numbers with facts from your record. Delete any line that is not true."));
      const list = h("ul");
      bullets.forEach(function (bullet) {
        list.append(h("li", { text: bullet.text + " (" + bullet.category + ")" }));
      });
      article.append(list);
    }

    if (dutyText && duty.rewritten) {
      article.append(h("h3", { text: "Your duty wording" }));
      article.append(p("Substitutions use the Debriefed phrase, jargon, and acronym lists. Read the result. A longer civilian phrase is not automatically better."));
      article.append(h("p", { text: duty.rewritten }));
      if (duty.replacements.length) {
        const list = h("ul");
        duty.replacements.forEach(function (hit) {
          list.append(h("li", { text: hit.kind + ": " + hit.from + " → " + hit.to }));
        });
        article.append(list);
      }
    }

    const summary = engine.plainSummary(record, occ, curated, { rewritten: duty.rewritten, source: dutyText });
    const copy = h("button", { type: "button", class: "secondary", text: "Copy a plain-text summary" });
    copy.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summary).then(function () {
          copy.textContent = "Copied";
        }, function () {
          copy.textContent = "Copy failed — select the summary below";
        });
      }
    });
    article.append(copy);
    article.append(h("pre", { text: summary }));
    remember(record);
    return article;
  }

  function renderResults(found, dutyText) {
    output.replaceChildren();
    const heading = h("h2", { id: "results-heading", tabindex: "-1", text: "Results" });
    output.append(heading);
    if (!found.ok && found.reason === "short") {
      output.append(p("Enter at least two characters of a code or title.", "state state-empty"));
      heading.focus();
      return;
    }
    if (found.mode === "obsolete-hidden") {
      output.append(p("No active code matched. " + found.obsoleteHidden + " obsolete record(s) match. Turn on “Include obsolete codes” if you left service under an older code.", "state state-empty"));
      found.obsoletePreview.forEach(function (record) {
        output.append(p(record.branchLabel + " " + record.code + " — " + record.title));
      });
      heading.focus();
      return;
    }
    if (!found.results.length) {
      output.append(p("No military code or title in this offline file matched. Try the code without spaces, pick a branch, or describe the duty in the second box.", "state state-empty"));
      if (dutyText) output.append(renderDutyOnly(dutyText));
      heading.focus();
      return;
    }
    const note = found.mode === "family"
      ? "No exact code was on file. These are Air Force-style skill-level matches for a code that uses X as the skill-level placeholder."
      : found.mode === "title"
        ? "Matched military titles. Confirm the branch before you use the wording."
        : found.total > found.results.length
          ? "Showing the first " + found.results.length + " of " + found.total + " matches."
          : found.results.length + " match" + (found.results.length === 1 ? "" : "es") + ".";
    output.append(p(note));
    if (found.results.length === 1) {
      output.append(renderRecord(found.results[0], dutyText));
    } else {
      const list = h("div");
      found.results.forEach(function (record) {
        const button = h("button", {
          type: "button",
          class: "secondary",
          text: record.branchLabel + " · " + record.code + " · " + record.title + (record.active ? "" : " · obsolete"),
        });
        button.style.width = "100%";
        button.style.textAlign = "left";
        button.style.marginBottom = "0.5rem";
        button.setAttribute("aria-expanded", "false");
        const slot = h("div");
        button.addEventListener("click", function () {
          slot.replaceChildren(renderRecord(record, dutyText));
          button.setAttribute("aria-expanded", "true");
        });
        list.append(button, slot);
      });
      output.append(list);
    }
    heading.focus();
  }

  function renderDutyOnly(dutyText) {
    const duty = engine.translateDuty(phrases, dutyText);
    const box = h("article", { class: "panel" });
    box.append(h("h2", { text: "Duty wording" }));
    if (!duty.replacements.length) {
      box.append(p("None of the dictionary phrases, jargon, or acronyms matched this text."));
      return box;
    }
    box.append(h("p", { text: duty.rewritten }));
    const list = h("ul");
    duty.replacements.forEach(function (hit) {
      list.append(h("li", { text: hit.kind + ": " + hit.from + " → " + hit.to }));
    });
    box.append(list);
    return box;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const code = document.getElementById("code").value;
    const duty = document.getElementById("duty").value;
    const branch = document.getElementById("branch").value;
    const includeObsolete = document.getElementById("obsolete").checked;
    if (code.trim().length >= 2) {
      renderResults(engine.searchCodes(moc, code, { branch: branch, includeObsolete: includeObsolete }), duty.trim());
      return;
    }
    output.replaceChildren();
    if (duty.trim().length >= 3) {
      const heading = h("h2", { id: "results-heading", tabindex: "-1", text: "Results" });
      output.append(heading, renderDutyOnly(duty));
      heading.focus();
      return;
    }
    output.append(p("Enter a code, a title, or a duty description.", "state state-empty"));
  });

  document.getElementById("rank-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const slot = document.getElementById("rank-output");
    const found = engine.rankLookup(phrases, document.getElementById("rank-branch").value, document.getElementById("rank-grade").value);
    slot.replaceChildren();
    if (!found.length) {
      slot.append(p("Choose a branch and pay grade.", "state state-empty"));
      return;
    }
    found.forEach(function (row) {
      const box = h("div", { class: "card" });
      box.append(h("h3", { text: row.rank + " (" + row.paygrade + ")" }));
      box.append(p("Civilian wording in the Debriefed rank table: " + row.civilian + "."));
      box.append(p("Responsibility note: " + row.level + ". Typical team size in that table: " + row.team + ". Federal GS comparison in that table: " + row.gs + "."));
      box.append(p("Use this as a translation aid for scope. It is not a civil-service qualification and it is not a GS appointment."));
      slot.append(box);
    });
  });

  document.getElementById("clear-history").addEventListener("click", function () {
    localStorage.removeItem("ovpt-career-history");
    renderHistory();
  });

  const about = document.getElementById("about-counts");
  about.textContent = meta.mocRows + " military records (" + meta.mocActive + " active) from DMDC " + meta.mocFile + ", " + meta.occupations + " O*NET 31.0 occupations, and " + meta.debriefedShippedRows + " Debriefed dictionary rows converted for this page (the upstream manifest reports " + meta.debriefedReportedRows + "). Debriefed commit " + meta.debriefedCommit + ".";

  function renderFreeText(text) {
    const slot = document.getElementById("phrase-output");
    const result = engine.translateFreeText(phrases, text);
    slot.replaceChildren();
    if (!result.lines.length) {
      slot.append(p("Paste a line to translate. Nothing is uploaded.", "state state-empty"));
      return;
    }
    result.lines.forEach(function (line) {
      const box = h("article", { class: "card" });
      box.append(h("h3", { text: "Dictionary wording" }));
      box.append(p("Original: " + line.source));
      box.append(p(line.rewritten));
      if (!line.replacements.length) {
        box.append(p("No phrase, jargon, evaluation line, or acronym in the shipped dictionary matched this line. Leave your wording, or try a more specific military term."));
      } else {
        const list = h("ul");
        line.replacements.forEach(function (hit) {
          list.append(h("li", { text: hit.kind + ": " + hit.from + " → " + hit.to }));
        });
        box.append(list);
      }
      if (line.vague.length) {
        box.append(p("The dictionary flags this as vague and offers templates with blanks. Fill the blanks from your record. Do not invent a number."));
        line.vague.forEach(function (flag) {
          box.append(p(flag.phrase + ": " + flag.alternatives.join(" | ")));
        });
      }
      if (line.verb) {
        box.append(p("Verb suggestion from the dictionary, not applied automatically: “" + line.verb.current + "” is marked " + line.verb.strength + " under " + line.verb.category + ". One strong verb in that category is “" + line.verb.suggested + "”. Use it only if it is still true."));
      }
      slot.append(box);
    });
    if (result.keywords.length) {
      slot.append(p("Keyword lists in the dictionary already contain these words from your text: " + result.keywords.map(function (item) {
        return item.word + " (" + item.role + ")";
      }).join("; ") + ". That is not an applicant-tracking score."));
    }
    const example = engine.summaryExample(phrases, text);
    if (example) {
      const box = h("article", { class: "warning" });
      box.append(h("h3", { text: "Dictionary example, not your summary" }));
      box.append(p(example.role + " · " + example.industry));
      box.append(p(example.text));
      box.append(p("Numbers in that example were written by the dictionary author. Do not copy a year, a headcount, or a dollar figure you cannot document."));
      slot.append(box);
    }
    slot.append(p("Review every line before it goes on a résumé. This is not a job offer or a qualification finding."));
  }

  document.getElementById("phrase-form").addEventListener("submit", function (event) {
    event.preventDefault();
    renderFreeText(document.getElementById("phrase-text").value);
  });
  fillRanks();
  renderHistory();
})();
