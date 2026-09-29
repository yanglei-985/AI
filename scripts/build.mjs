#!/usr/bin/env node
// Validate content/ and compose it into site/data/ for the static site.
// Usage: node scripts/build.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");
const outDir = join(root, "site", "data");
const lessonsOut = join(outDir, "lessons");

const errors = [];
const fail = (msg) => errors.push(msg);

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(`${path}: invalid JSON (${e.message})`);
    return null;
  }
};

const LANGS = new Set(["zh", "en"]);
const LEVELS = new Set(["入门", "进阶", "高级"]);

function checkMeta(m, where) {
  for (const k of ["id", "title", "lang", "level", "topic", "reason"]) {
    if (!m[k]) fail(`${where}: missing "${k}"`);
  }
  if (m.lang && !LANGS.has(m.lang)) fail(`${where}: lang must be zh|en`);
  if (m.level && !LEVELS.has(m.level)) fail(`${where}: level must be 入门|进阶|高级`);
}

// ---- notes.md: "## 摘要 / 关键点 / 术语表 / 延伸阅读" ----
function parseNotes(text, where) {
  const sections = {};
  let cur = null;
  for (const line of text.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      cur = h[1];
      sections[cur] = [];
    } else if (cur) {
      sections[cur].push(line);
    }
  }
  const bullets = (name) =>
    (sections[name] || []).map((l) => l.match(/^\s*[-*]\s+(.*)$/)?.[1]).filter(Boolean);
  const summary = (sections["摘要"] || []).join("\n").trim();
  const keyPoints = bullets("关键点");
  const glossary = bullets("术语表").map((b) => {
    const m = b.match(/^\*\*(.+?)\*\*\s*[:：]\s*(.*)$/);
    if (!m) fail(`${where}: glossary line must look like "- **term**: definition" -> ${b}`);
    return m ? { term: m[1], def: m[2] } : null;
  }).filter(Boolean);
  const further = bullets("延伸阅读");
  if (!summary) fail(`${where}: notes.md needs a "## 摘要" section`);
  if (keyPoints.length === 0) fail(`${where}: notes.md needs a "## 关键点" list`);
  return { summary, keyPoints, glossary, further };
}

// ---- bilingual.md: blocks separated by blank lines; "> " lines are Chinese ----
function parseBilingual(text, where, lang) {
  const blocks = text.split(/\r?\n\s*\r?\n/).map((b) => b.trim()).filter(Boolean);
  const out = blocks.map((b) => {
    const en = [], zh = [];
    for (const line of b.split(/\r?\n/)) {
      if (line.startsWith(">")) zh.push(line.replace(/^>\s?/, ""));
      else en.push(line);
    }
    let body = en.join(" ").trim();
    let time = null;
    const t = body.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*/);
    if (t) {
      time = t[1];
      body = body.slice(t[0].length);
    }
    return { time, text: body, zh: zh.join(" ").trim() };
  });
  if (out.length === 0) fail(`${where}: bilingual.md is empty`);
  out.forEach((b, i) => {
    if (!b.text) fail(`${where}: block ${i + 1} has no transcript text`);
    if (!b.zh && lang !== "zh") fail(`${where}: block ${i + 1} has no Chinese ("> ...") line`);
  });
  return out;
}

function checkQuiz(quiz, where) {
  if (!Array.isArray(quiz) || quiz.length === 0) return fail(`${where}: quiz.json must be a non-empty array`);
  quiz.forEach((q, i) => {
    const w = `${where} Q${i + 1}`;
    if (!q.q) fail(`${w}: missing q`);
    if (!Array.isArray(q.options) || q.options.length < 2) fail(`${w}: needs >= 2 options`);
    else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      fail(`${w}: answer index ${q.answer} out of range`);
    if (!q.explain) fail(`${w}: missing explain`);
  });
}

// ---- main ----
const cur = readJson(join(contentDir, "curriculum.json"));
if (!cur) {
  console.error(errors.join("\n"));
  process.exit(1);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(cur.startDate || "")) fail("curriculum.json: startDate must be YYYY-MM-DD");

const entries = [...(cur.videos || [])];

rmSync(lessonsOut, { recursive: true, force: true });
mkdirSync(lessonsOut, { recursive: true });

const seen = new Set();
const index = [];
for (const m of entries) {
  const where = `video ${m.id ?? "?"}`;
  checkMeta(m, where);
  if (seen.has(m.id)) fail(`${where}: duplicate id`);
  seen.add(m.id);

  const dir = join(contentDir, m.id);
  const hasTranscript = ["transcript.txt", "transcript.srt", "bilingual.md"].some((f) => existsSync(join(dir, f)));
  const hasBilingual = existsSync(join(dir, "bilingual.md"));
  const hasNotes = existsSync(join(dir, "notes.md"));
  const hasQuiz = existsSync(join(dir, "quiz.json"));

  let status = "pending-transcript";
  if (hasTranscript) status = "needs-notes";
  if (hasBilingual && hasNotes && hasQuiz) status = "ready";

  const entry = {
    id: m.id, title: m.title, channel: m.channel ?? null, lang: m.lang, level: m.level,
    topic: m.topic, reason: m.reason, status,
    // ytId defaults to id; set "ytId": null when the real YouTube URL is unknown
    ytId: m.ytId === undefined ? m.id : m.ytId,
    url: (m.ytId === undefined ? m.id : m.ytId) ? `https://www.youtube.com/watch?v=${m.ytId === undefined ? m.id : m.ytId}` : null,
    minutes: m.minutes ?? null,
  };
  index.push(entry);

  if (status === "ready") {
    const lesson = {
      ...entry,
      notes: parseNotes(readFileSync(join(dir, "notes.md"), "utf8"), where),
      transcript: parseBilingual(readFileSync(join(dir, "bilingual.md"), "utf8"), where, m.lang),
      quiz: (() => { const q = readJson(join(dir, "quiz.json")); checkQuiz(q, where); return q; })(),
    };
    writeFileSync(join(lessonsOut, `${m.id}.json`), JSON.stringify(lesson));
  }
}

// content/<id>/ folders that are not in the curriculum are almost always typos.
for (const d of readdirSync(contentDir, { withFileTypes: true })) {
  if (d.isDirectory() && !seen.has(d.name)) fail(`content/${d.name}: not listed in curriculum.json`);
}

if (errors.length) {
  console.error(`Build failed with ${errors.length} error(s):\n- ` + errors.join("\n- "));
  process.exit(1);
}

writeFileSync(
  join(outDir, "curriculum.json"),
  JSON.stringify({ startDate: cur.startDate, note: cur.note ?? "", videos: index }, null, 2)
);
const ready = index.filter((v) => v.status === "ready").length;
console.log(`OK: ${index.length} videos (${ready} ready, ${index.length - ready} waiting for transcript/notes).`);
