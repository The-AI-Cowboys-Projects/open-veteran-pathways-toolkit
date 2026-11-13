import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
let failed = 0;

function check(name, cond, detail) {
  if (cond) {
    console.log("ok  " + name);
    return;
  }
  failed += 1;
  console.error("FAIL " + name + (detail ? " — " + detail : ""));
}

function loadAssign(file, names) {
  const sandbox = { self: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  const out = {};
  names.forEach(function (name) { out[name] = sandbox.self[name]; });
  return out;
}

const career = require(path.join(root, "career-pathway-translator/engine.js"));
const scam = require(path.join(root, "scam-guardian/engine.js"));
const data = loadAssign(path.join(root, "career-pathway-translator/data/moc.js"), ["OVPT_MOC"]);
const occ = loadAssign(path.join(root, "career-pathway-translator/data/occupations.js"), ["OVPT_OCC"]);
const phrases = loadAssign(path.join(root, "career-pathway-translator/data/phrases.js"), ["OVPT_PHRASES"]);
const meta = loadAssign(path.join(root, "career-pathway-translator/data/meta.js"), ["OVPT_META"]);
const rules = loadAssign(path.join(root, "scam-guardian/data/rules.js"), ["OVPT_RULES"]);
const model = loadAssign(path.join(root, "scam-guardian/data/model.js"), ["OVPT_SPAM_MODEL"]);

check("moc rows", meta.OVPT_META.mocRows > 20000, String(meta.OVPT_META.mocRows));
check("occupations", meta.OVPT_META.occupations === 1016);
check("debriefed notes", meta.OVPT_META.curated === 493);

const army11 = career.searchCodes(data.OVPT_MOC, "11B", { branch: "army" });
check("11B army hit", army11.results.some(function (row) { return row.code === "11B" && row.title === "Infantryman" && row.onet.indexOf("55-3016.00") !== -1; }));
check("11B hides obsolete by default", army11.results.every(function (row) { return row.active; }));
const withOld = career.searchCodes(data.OVPT_MOC, "11B", { branch: "army", includeObsolete: true });
check("11B obsolete available", withOld.results.some(function (row) { return !row.active; }));

const medic = career.searchCodes(data.OVPT_MOC, "68W", { branch: "army" });
const medicRow = medic.results.find(function (row) { return row.code === "68W"; });
check("68W paramedic crosswalk", Boolean(medicRow && medicRow.onet.indexOf("29-2043.00") !== -1));
const paramedic = career.occupation(occ.OVPT_OCC, "29-2043.00");
check("paramedic skills", Boolean(paramedic && paramedic.s.length >= 3 && paramedic.d && paramedic.u.indexOf("bls.gov") !== -1));

const hm = career.searchCodes(data.OVPT_MOC, "HM", { branch: "navy" });
check("HM corpsman", hm.results.some(function (row) { return row.code === "HM" && row.onet.indexOf("31-9092.00") !== -1; }));

const marine = career.searchCodes(data.OVPT_MOC, "0311", { branch: "usmc" });
check("0311 rifleman", marine.results.some(function (row) { return row.title === "Rifleman"; }));

const afsc = career.searchCodes(data.OVPT_MOC, "2A5X1", { branch: "usaf" });
check("2A5X1 family", afsc.mode === "family" && afsc.results.some(function (row) { return row.onet.indexOf("49-3011.00") !== -1 || row.onet.indexOf("49-1011.00") !== -1; }));

const title = career.searchCodes(data.OVPT_MOC, "combat medic", { branch: "army" });
check("title search", title.mode === "title" && title.results.some(function (row) { return row.code === "68W"; }));

const curated = career.curatedFor(phrases.OVPT_PHRASES, "11B", "army");
check("debriefed 11B titles", curated.some(function (row) { return row.civilian.indexOf("Security Manager") !== -1; }));
const duty = career.translateDuty(phrases.OVPT_PHRASES, "I briefed flag officers and supervised personnel.");
check("phrase translation", duty.rewritten.toLowerCase().indexOf("c-suite") !== -1 || duty.rewritten.toLowerCase().indexOf("presented") !== -1);
check("jargon translation", duty.replacements.some(function (hit) { return hit.from.toLowerCase() === "personnel"; }));
const rank = career.rankLookup(phrases.OVPT_PHRASES, "usaf", "E-7");
check("rank table", rank.some(function (row) { return row.rank === "Master Sergeant"; }));

const benign = scam.analyze(rules.OVPT_RULES, model.OVPT_SPAM_MODEL, "Reminder: Your VA clinic appointment is Tuesday at 10 a.m. Bring a photo ID. This message is from your clinic, not a request for payment.");
check("benign appointment stays low", benign.level === "low" && benign.hits.length === 0, benign.hits.map(function (hit) { return hit.id; }).join(","));

const high = scam.analyze(rules.OVPT_RULES, model.OVPT_SPAM_MODEL, "This is the Department of Veterans Affairs. Your benefits are suspended. Call immediately and confirm your Social Security number. Pay the processing fee with a gift card.");
check("benefits scam rates high", high.level === "high" && high.hits.length >= 3, high.level + " " + high.hits.map(function (hit) { return hit.id; }).join(","));

const pension = scam.analyze(rules.OVPT_RULES, model.OVPT_SPAM_MODEL, "We can hide your assets in an annuity so you qualify for VA pension. Our fee is a percent of the benefit.");
check("pension poaching fires", pension.hits.some(function (hit) { return hit.id === "pension-poaching"; }) && pension.level !== "low");

const officialLink = scam.analyze(rules.OVPT_RULES, model.OVPT_SPAM_MODEL, "Read https://www.va.gov/pension/ and https://www.vaoig.gov/ before you file.");
check("official links are not lookalikes", !officialLink.hits.some(function (hit) { return hit.id === "suspicious-link"; }), officialLink.hits.map(function (hit) { return hit.id; }).join(","));
const lookalike = scam.analyze(rules.OVPT_RULES, model.OVPT_SPAM_MODEL, "Verify your account at https://va-benefits-secure.example.com today.");
check("lookalike link fires", lookalike.hits.some(function (hit) { return hit.id === "suspicious-link"; }));

const spamLike = scam.modelScore(model.OVPT_SPAM_MODEL, "FREE prize winner claim now txt WIN to 87066");
const ordinary = scam.modelScore(model.OVPT_SPAM_MODEL, "See you at the clinic on Tuesday and bring your ID");
check("sms model separates classic spam wording", spamLike.probability > ordinary.probability && spamLike.flagged);

const tutor = loadAssign(path.join(root, "ai-tutor/data/content.js"), ["OVPT_TUTOR"]);
check("glossary size", tutor.OVPT_TUTOR.glossary.length >= 30);
check("lessons and quizzes", tutor.OVPT_TUTOR.lessons.length >= 6 && tutor.OVPT_TUTOR.lessons.every(function (lesson) {
  return lesson.quiz.length >= 3 && lesson.quiz.every(function (item) {
    return item.answer >= 0 && item.answer < item.choices.length && item.why;
  });
}));

const plan = loadAssign(path.join(root, "transition-companion/data/plan.js"), ["OVPT_PLAN"]);
const ids = [];
plan.OVPT_PLAN.phases.forEach(function (phase) {
  phase.items.forEach(function (item) { ids.push(item.id); });
});
check("checklist size", ids.length >= 24);
check("unique checklist ids", new Set(ids).size === ids.length);
check("before and after separation", plan.OVPT_PLAN.phases.some(function (phase) { return phase.when === "before"; }) && plan.OVPT_PLAN.phases.some(function (phase) { return phase.when === "after"; }));

const runtimeFiles = [
  "career-pathway-translator/app.js",
  "career-pathway-translator/engine.js",
  "scam-guardian/app.js",
  "scam-guardian/engine.js",
  "ai-tutor/app.js",
  "transition-companion/app.js",
];
runtimeFiles.forEach(function (rel) {
  const text = fs.readFileSync(path.join(root, rel), "utf8");
  check(rel + " has no remote fetch", !/fetch\s*\(|XMLHttpRequest|sendBeacon|jsdelivr|unpkg|cdnjs|googletag|google-analytics|www\.google/.test(text));
});

["career-pathway-translator", "scam-guardian", "ai-tutor", "transition-companion"].forEach(function (dir) {
  const html = fs.readFileSync(path.join(root, dir, "index.html"), "utf8");
  check(dir + " disclaimer", html.indexOf("not affiliated") !== -1 && html.indexOf("classified") !== -1);
  check(dir + " large text", html.indexOf("text-size") !== -1);
  check(dir + " local css", html.indexOf('href="styles.css"') !== -1);
  const css = fs.readFileSync(path.join(root, dir, "styles.css"), "utf8");
  const shared = fs.readFileSync(path.join(root, "shared/styles.css"), "utf8");
  check(dir + " styles match shared", css === shared);
});

const scamHtml = fs.readFileSync(path.join(root, "scam-guardian/index.html"), "utf8");
check("no deepfake claim in title", !/deepfake/i.test(scamHtml.split("</title>")[0]));
check("ocr is local", scamHtml.indexOf("vendor/tesseract/tesseract.min.js") !== -1);
["tesseract.min.js", "worker.min.js", "eng.traineddata.gz", "core/tesseract-core-lstm.wasm.js", "core/tesseract-core-simd-lstm.wasm.js", "core/tesseract-core-relaxedsimd-lstm.wasm.js"].forEach(function (file) {
  check("vendor " + file, fs.existsSync(path.join(root, "scam-guardian/vendor/tesseract", file)));
});
check("debriefed license file", fs.readFileSync(path.join(root, "career-pathway-translator/vendor/debriefed/LICENSE"), "utf8").indexOf("Chris Simser") !== -1);

if (failed) {
  console.error(failed + " checks failed");
  process.exit(1);
}
console.log("all checks passed");
