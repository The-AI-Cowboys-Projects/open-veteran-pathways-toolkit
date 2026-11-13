(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CareerEngine = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function norm(value) {
    return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function escapeReg(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function looksLikeCode(value) {
    return /^[A-Za-z0-9][A-Za-z0-9X-]{0,11}$/.test(String(value || "").trim());
  }

  function codeScore(code, query) {
    if (!code || !query) return 0;
    if (code === query) return 100;
    if (query.indexOf("X") !== -1 && query.length === code.length) {
      for (let i = 0; i < query.length; i += 1) {
        if (query[i] !== "X" && query[i] !== code[i]) return 0;
      }
      return 92;
    }
    if (/^\d[A-Z0-9]\dX[A-Z0-9]$/.test(query) && code.length >= 5) {
      if (code.slice(0, 3) === query.slice(0, 3) && code[4] === query[4]) return 84;
    }
    if (query.length >= 3 && code.startsWith(query)) return 60;
    return 0;
  }

  function sameFamily(left, right) {
    if (left === right) return true;
    const pattern = left.indexOf("X") !== -1 ? left : right;
    const other = pattern === left ? right : left;
    if (pattern.indexOf("X") === -1) return false;
    if (/^\d[A-Z0-9]\dX[A-Z0-9]$/.test(pattern) && other.length >= 5) {
      return other.slice(0, 3) === pattern.slice(0, 3) && other[4] === pattern[4];
    }
    return false;
  }

  function allowedSvc(moc, branch) {
    if (!branch || branch === "all") return null;
    const meta = moc.branches[branch];
    return meta ? new Set(meta.svc) : null;
  }

  function pack(moc, hit) {
    const row = hit.row;
    return {
      svc: row[0],
      branch: moc.svcBranch[row[0]] || "",
      branchLabel: (moc.branches[moc.svcBranch[row[0]]] || {}).label || row[0],
      personnel: moc.mpc[row[1]] || row[1],
      personnelCode: row[1],
      code: row[2],
      title: row[3],
      onet: row[4],
      status: row[5],
      active: row[5] === "A",
      score: hit.score,
    };
  }

  function searchCodes(moc, query, options) {
    const opts = options || {};
    const raw = String(query || "").trim();
    if (raw.length < 2) return { ok: false, reason: "short" };
    const parts = raw.split(/\s+/);
    const codeQuery = parts.length > 1 && looksLikeCode(parts[0]) ? parts[0] : raw;
    const q = norm(codeQuery);
    if (q.length < 2) return { ok: false, reason: "short" };
    const allowed = allowedSvc(moc, opts.branch || "all");
    const includeObsolete = Boolean(opts.includeObsolete);
    const exact = [];
    const family = [];
    const prefix = [];
    const obsolete = [];

    moc.rows.forEach(function (row, index) {
      if (allowed && !allowed.has(row[0])) return;
      const score = codeScore(norm(row[2]), q);
      if (!score) return;
      const hit = { index: index, score: score, row: row };
      if (row[5] !== "A") {
        obsolete.push(hit);
        if (!includeObsolete) return;
      }
      if (score >= 100) exact.push(hit);
      else if (score >= 80) family.push(hit);
      else prefix.push(hit);
    });

    let mode = "none";
    let chosen = [];
    if (exact.length) {
      mode = "exact";
      chosen = exact;
    } else if (family.length) {
      mode = "family";
      chosen = family;
    } else if (q.length >= 3 && prefix.length) {
      mode = "prefix";
      chosen = prefix;
    } else {
      const tokens = raw.toLowerCase().split(/[^a-z0-9]+/).filter(function (token) {
        return token.length >= 4;
      });
      if (tokens.length) {
        mode = "title";
        moc.rows.forEach(function (row, index) {
          if (allowed && !allowed.has(row[0])) return;
          if (!includeObsolete && row[5] !== "A") return;
          const title = row[3].toLowerCase();
          if (!tokens.every(function (token) { return title.indexOf(token) !== -1; })) return;
          chosen.push({ index: index, score: 40 + tokens.length, row: row });
        });
      }
    }

    if (!chosen.length && !includeObsolete && obsolete.length) {
      return {
        ok: true,
        mode: "obsolete-hidden",
        total: 0,
        results: [],
        obsoleteHidden: obsolete.length,
        obsoletePreview: obsolete.slice(0, 3).map(function (hit) { return pack(moc, hit); }),
      };
    }

    chosen.sort(function (a, b) {
      return b.score - a.score || a.row[2].length - b.row[2].length || a.row[3].localeCompare(b.row[3]);
    });
    return {
      ok: true,
      mode: chosen.length ? mode : "none",
      total: chosen.length,
      results: chosen.slice(0, 40).map(function (hit) { return pack(moc, hit); }),
      obsoleteHidden: 0,
    };
  }

  function occupation(occData, code) {
    if (!occData || !occData.occ) return null;
    return occData.occ[code] || null;
  }

  function curatedFor(bundle, code, branch) {
    const target = norm(code);
    return (bundle.curated || []).filter(function (item) {
      const itemCode = norm(item.code);
      if (!sameFamily(itemCode, target)) return false;
      if (branch && branch !== "all" && item.branch && item.branch !== branch) return false;
      return true;
    });
  }

  function suggestBullets(bundle, title, skills, limit) {
    const hay = (String(title || "") + " " + (skills || []).join(" ")).toLowerCase();
    const ranked = [];
    (bundle.bullets || []).forEach(function (bullet) {
      let score = 0;
      const category = String(bullet.c || "").toLowerCase();
      if (category && hay.indexOf(category) !== -1) score += 3;
      (bullet.k || []).forEach(function (token) {
        if (hay.indexOf(String(token).toLowerCase()) !== -1) score += 1;
      });
      if (score > 0) ranked.push({ score: score, text: bullet.o, category: bullet.c });
    });
    ranked.sort(function (a, b) { return b.score - a.score; });
    const out = [];
    const seen = new Set();
    ranked.forEach(function (item) {
      if (seen.has(item.text) || out.length >= (limit || 3)) return;
      seen.add(item.text);
      out.push(item);
    });
    return out;
  }

  function collectPairs(bundle) {
    const pairs = [];
    (bundle.phrases || []).forEach(function (row) {
      if (row[0] && row[0].length >= 8) pairs.push([row[0], row[1], "phrase", "i"]);
    });
    (bundle.evals || []).forEach(function (row) {
      if (row[0] && row[0].length >= 8) pairs.push([row[0], row[1], "eval", "i"]);
    });
    (bundle.jargon || []).forEach(function (row) {
      if (!row[0]) return;
      if (row[0].length >= 4) pairs.push([row[0], row[1], "jargon", "i"]);
      else if (row[0].length >= 2 && row[0].toLowerCase() !== "bow" && row[0].toLowerCase() !== "log") {
        pairs.push([row[0], row[1], "jargon", ""]);
      }
    });
    (bundle.acronyms || []).forEach(function (row) {
      if (row[0] && row[0].length >= 3) {
        const expansion = row[2] && row[2] !== row[1] ? row[1] + " (" + row[2] + ")" : row[1];
        pairs.push([row[0], expansion, "acronym", ""]);
      }
    });
    pairs.sort(function (a, b) { return b[0].length - a[0].length; });
    return pairs;
  }

  function firstOption(text) {
    return String(text || "").split(" / ")[0].trim();
  }

  function matchCase(original, replacement) {
    if (!original || !replacement) return replacement;
    if (original === original.toUpperCase() && original.length > 1) return replacement.toUpperCase();
    if (original[0] === original[0].toUpperCase() && original.slice(1) !== original.slice(1).toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    if (original === original.toLowerCase()) return replacement.toLowerCase();
    return replacement;
  }

  function postProcess(text) {
    let out = String(text || "");
    out = out.replace(/  +/g, " ");
    out = out.replace(/\ba (a|e|i|o|u)/gi, function (full, vowel) {
      return (full[0] === "A" ? "An " : "an ") + vowel;
    });
    out = out.replace(/\ban ([bcdfghjklmnpqrstvwxyz])/gi, function (full, consonant) {
      return (full[0] === "A" ? "A " : "a ") + consonant;
    });
    out = out.replace(/ 's\b/g, "'s");
    out = out.replace(/,\s*,/g, ",");
    out = out.replace(/\.\s*\./g, ".");
    out = out.replace(/\s+([.,;:!?])/g, "$1");
    return out.trim();
  }

  function translateDuty(bundle, text, options) {
    const source = String(text || "");
    const useFirst = Boolean(options && options.firstOption);
    if (source.trim().length < 3) return { replacements: [], rewritten: "" };
    const found = [];
    collectPairs(bundle).forEach(function (pair) {
      const flags = pair[3] === "i" ? "ig" : "g";
      const re = new RegExp("\\b" + escapeReg(pair[0]) + "\\b", flags);
      let match;
      while ((match = re.exec(source))) {
        const full = pair[1];
        const shown = useFirst ? matchCase(match[0], firstOption(full)) : full;
        found.push({
          start: match.index,
          end: match.index + match[0].length,
          from: match[0],
          to: shown,
          full: full,
          kind: pair[2],
        });
        if (match.index === re.lastIndex) re.lastIndex += 1;
      }
    });
    found.sort(function (a, b) {
      return a.start - b.start || (b.end - b.start) - (a.end - a.start);
    });
    const kept = [];
    let cursor = 0;
    found.forEach(function (hit) {
      if (hit.start < cursor) return;
      kept.push(hit);
      cursor = hit.end;
    });
    let rewritten = "";
    let pos = 0;
    kept.forEach(function (hit) {
      rewritten += source.slice(pos, hit.start) + hit.to;
      pos = hit.end;
    });
    rewritten += source.slice(pos);
    if (useFirst) rewritten = postProcess(rewritten);
    return { replacements: kept.slice(0, 40), rewritten: rewritten };
  }

  function vagueFlags(bundle, text) {
    const hay = String(text || "").toLowerCase();
    const found = [];
    (bundle.vague || []).forEach(function (row) {
      const phrase = String(row[0] || "");
      if (phrase.length < 4 || hay.indexOf(phrase.toLowerCase()) === -1) return;
      found.push({ phrase: phrase, alternatives: row[1] || [], category: row[2] || "" });
    });
    return found.slice(0, 6);
  }

  function verbHint(bundle, text) {
    const match = String(text || "").trim().match(/^[A-Za-z]+/);
    if (!match) return null;
    const word = match[0].toLowerCase();
    const rows = bundle.verbRows || [];
    const current = rows.find(function (row) { return String(row[0] || "").toLowerCase() === word; });
    if (!current || current[2] === "strong") return null;
    const stronger = rows.find(function (row) {
      return row[1] === current[1] && row[2] === "strong" && String(row[0]).toLowerCase() !== word;
    });
    if (!stronger) return null;
    return { current: match[0], suggested: stronger[0], category: current[1], strength: current[2] };
  }

  function keywordHits(bundle, text) {
    const hay = " " + String(text || "").toLowerCase() + " ";
    const found = [];
    (bundle.ats || []).forEach(function (row) {
      (row.words || []).forEach(function (word) {
        const token = String(word || "").toLowerCase();
        if (token.length < 4 || hay.indexOf(token) === -1) return;
        found.push({ word: word, industry: row.industry, role: row.role });
      });
    });
    const unique = [];
    const seen = {};
    found.forEach(function (item) {
      const key = item.word.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      unique.push(item);
    });
    return unique.slice(0, 8);
  }

  function translateFreeText(bundle, text) {
    const raw = String(text || "").replace(/\r/g, "");
    const pieces = raw.split(/\n+/).map(function (line) { return line.trim(); }).filter(Boolean);
    const lines = (pieces.length ? pieces : [raw.trim()]).filter(Boolean).slice(0, 40).map(function (line) {
      const duty = translateDuty(bundle, line, { firstOption: true });
      return {
        source: line,
        rewritten: duty.rewritten || line,
        replacements: duty.replacements,
        vague: vagueFlags(bundle, line),
        verb: verbHint(bundle, line),
      };
    });
    return { lines: lines, keywords: keywordHits(bundle, raw) };
  }

  function summaryExample(bundle, query) {
    const tokens = String(query || "").toLowerCase().split(/[^a-z0-9]+/).filter(function (token) {
      return token.length >= 4;
    });
    if (!tokens.length) return null;
    let best = null;
    let bestScore = 0;
    (bundle.summaries || []).forEach(function (row) {
      const hay = (row.role + " " + row.industry + " " + row.tier).toLowerCase();
      let score = 0;
      tokens.forEach(function (token) { if (hay.indexOf(token) !== -1) score += 1; });
      if (score > bestScore) {
        bestScore = score;
        best = row;
      }
    });
    return bestScore ? best : null;
  }

  function rankLookup(bundle, branch, paygrade) {
    const grade = String(paygrade || "").toUpperCase().replace(/\s+/g, "");
    return (bundle.ranks || []).filter(function (row) {
      return row.branch === branch && String(row.paygrade || "").toUpperCase().replace(/\s+/g, "") === grade;
    });
  }

  function plainSummary(record, occData, curated, duty) {
    const lines = [];
    lines.push(record.branchLabel + " " + record.code + " — " + record.title + (record.active ? " (active)" : " (obsolete)"));
    lines.push("Personnel category: " + record.personnel);
    lines.push("");
    lines.push("Official DMDC crosswalk to O*NET-SOC:");
    (record.onet || []).forEach(function (code) {
      const occ = occupation(occData, code);
      lines.push("- " + code + (occ ? " " + occ.t : " (not in the bundled O*NET 31.0 occupation file)"));
      if (occ && occ.j && occ.j.length) lines.push("  Reported titles: " + occ.j.join("; "));
      if (occ && occ.s && occ.s.length) lines.push("  Important skills: " + occ.s.join("; "));
    });
    if (!record.onet || !record.onet.length) lines.push("- No O*NET-SOC code is listed on this DMDC record.");
    if (curated && curated.length) {
      lines.push("");
      lines.push("Debriefed dictionary suggestions (not an official eligibility finding):");
      curated.forEach(function (item) {
        if (item.civilian && item.civilian.length) lines.push("- Civilian titles: " + item.civilian.join("; "));
        if (item.skills && item.skills.length) lines.push("- Skills noted in the dictionary: " + item.skills.join("; "));
      });
    }
    if (duty && duty.rewritten && duty.rewritten !== duty.source) {
      lines.push("");
      lines.push("Duty wording with dictionary substitutions:");
      lines.push(duty.rewritten);
    }
    lines.push("");
    lines.push("Review every line before it goes on a resume. This is not a job offer, a VA determination, or proof of qualification.");
    return lines.join("\n");
  }

  return {
    norm: norm,
    searchCodes: searchCodes,
    occupation: occupation,
    curatedFor: curatedFor,
    suggestBullets: suggestBullets,
    translateDuty: translateDuty,
    translateFreeText: translateFreeText,
    vagueFlags: vagueFlags,
    summaryExample: summaryExample,
    rankLookup: rankLookup,
    plainSummary: plainSummary,
    isMilitaryOccupation: function (code) { return String(code || "").indexOf("55-") === 0; },
  };
});
