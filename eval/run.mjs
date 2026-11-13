import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const engine = require(path.join(root, "scam-guardian/engine.js"));

function loadAssign(file, name) {
  const sandbox = { self: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  return sandbox.self[name];
}

function round4(value) {
  if (value === null || Number.isNaN(value)) return null;
  return Math.round(value * 10000) / 10000;
}

function metricsOf(rows, predicted) {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  rows.forEach(function (row) {
    const expected = row.label === "scam";
    const hit = predicted(row);
    if (expected && hit) tp += 1;
    else if (!expected && hit) fp += 1;
    else if (!expected && !hit) tn += 1;
    else fn += 1;
  });
  const precision = tp + fp ? tp / (tp + fp) : null;
  const recall = tp + fn ? tp / (tp + fn) : null;
  const f1 = precision !== null && recall !== null && precision + recall ? (2 * precision * recall) / (precision + recall) : null;
  return {
    n: rows.length,
    tp: tp,
    fp: fp,
    tn: tn,
    fn: fn,
    precision: round4(precision),
    recall: round4(recall),
    f1: round4(f1),
  };
}

function stamp(name, metrics) {
  return name + " n=" + metrics.n
    + " tp=" + metrics.tp
    + " fp=" + metrics.fp
    + " tn=" + metrics.tn
    + " fn=" + metrics.fn
    + " precision=" + metrics.precision
    + " recall=" + metrics.recall
    + " f1=" + metrics.f1;
}

export function evaluate() {
  const fixture = JSON.parse(fs.readFileSync(path.join(root, "eval/fixtures.json"), "utf8"));
  const rules = loadAssign(path.join(root, "scam-guardian/data/rules.js"), "OVPT_RULES");
  const model = loadAssign(path.join(root, "scam-guardian/data/model.js"), "OVPT_SPAM_MODEL");
  const items = fixture.items.map(function (item) {
    const result = engine.analyze(rules, model, item.text);
    const rubric = engine.messageRubric(item.text, item.channel);
    return {
      id: item.id,
      label: item.label,
      channel: item.channel,
      ok: result.ok,
      level: result.ok ? result.level : "unscored",
      score: result.ok ? result.score : null,
      hits: result.ok ? result.hits.map(function (hit) { return hit.id; }) : [],
      rubricLabel: rubric.label,
      rubricPoints: rubric.points,
      smsFlagged: result.model ? result.model.flagged : null,
      smsProbability: result.model ? round4(result.model.probability) : null,
    };
  });
  const rulesMetrics = metricsOf(items, function (row) { return row.level === "high" || row.level === "medium"; });
  const rubricMetrics = metricsOf(items, function (row) { return row.rubricLabel === "scam"; });
  const smsMetrics = metricsOf(items, function (row) { return row.smsFlagged === true; });
  return {
    synthetic: fixture.synthetic === true,
    decision: "A rule-engine positive is level high or medium. Low is negative. The rubric and the 2011 SMS model are scored separately and do not change the rule level.",
    rules: rulesMetrics,
    rubric: rubricMetrics,
    sms: smsMetrics,
    gemma: "not-run",
    stamps: {
      rules: stamp("rules", rulesMetrics),
      rubric: stamp("rubric", rubricMetrics),
      sms: stamp("sms", smsMetrics),
    },
    items: items,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = evaluate();
  console.log(JSON.stringify(report, null, 2));
}
