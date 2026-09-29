#!/usr/bin/env node
// Turn content/<id>/transcript.srt into the bilingual.md that build.mjs consumes.
//
//   node scripts/make_bilingual.mjs <id> --draft   print numbered English chunks (for translating)
//   node scripts/make_bilingual.mjs <id>           merge content/<id>/zh.txt into bilingual.md
//   node scripts/make_bilingual.mjs <id> --mono    original-language transcript only (Chinese videos)
//
// Chunking is deterministic, so chunk numbers in zh.txt stay valid as long as
// transcript.srt and fixes.json do not change. zh.txt has one line per chunk: "12: 中文解释".
// fixes.json (optional) is a list of ["regex", "replacement"] pairs for speech-to-text errors.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [id, flag] = process.argv.slice(2);
if (!id) {
  console.error("usage: make_bilingual.mjs <id> [--draft]");
  process.exit(1);
}
const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "content", id);

const TIME = /(\d+):(\d\d):(\d\d)[,.](\d+)\s*-->\s*(\d+):(\d\d):(\d\d)[,.](\d+)/;
const secs = (h, m, s, ms) => +h * 3600 + +m * 60 + +s + +ms / 1000;

function parseSrt(text) {
  const cues = [];
  for (const block of text.replace(/^﻿/, "").split(/\r?\n\s*\r?\n/)) {
    const lines = block.split(/\r?\n/).filter((l) => l.trim() !== "");
    const ti = lines.findIndex((l) => TIME.test(l));
    if (ti < 0) continue;
    const m = lines[ti].match(TIME);
    const body = lines.slice(ti + 1).join(" ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (body) cues.push({ start: secs(m[1], m[2], m[3], m[4]), end: secs(m[5], m[6], m[7], m[8]), text: body });
  }
  return cues;
}

const label = (t) => {
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60);
  const mm = String(m).padStart(2, "0"), ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const MIN = 30, MAX = 55; // seconds per chunk: close at a sentence end after MIN, or force at MAX
function chunk(cues, fixes) {
  const out = [];
  let cur = null;
  const close = () => {
    if (!cur) return;
    let en = cur.text;
    for (const [re, rep] of fixes) en = en.replace(new RegExp(re, "g"), rep);
    out.push({ n: out.length + 1, time: label(cur.start), en: en.replace(/\s+/g, " ").trim() });
    cur = null;
  };
  for (const c of cues) {
    if (!cur) cur = { start: c.start, text: "" };
    cur.text += (cur.text ? " " : "") + c.text;
    const len = c.end - cur.start;
    if ((len >= MIN && /[.?!]["')\]]?$/.test(c.text)) || len >= MAX) close();
  }
  close();
  return out;
}

const srtPath = join(dir, "transcript.srt");
if (!existsSync(srtPath)) {
  console.error(`missing ${srtPath}`);
  process.exit(1);
}
const fixesPath = join(dir, "fixes.json");
const fixes = existsSync(fixesPath) ? JSON.parse(readFileSync(fixesPath, "utf8")) : [];
const chunks = chunk(parseSrt(readFileSync(srtPath, "utf8")), fixes);

if (flag === "--draft") {
  for (const c of chunks) console.log(`${c.n} [${c.time}] ${c.en}`);
  console.error(`${chunks.length} chunks`);
  process.exit(0);
}

if (flag === "--mono") {
  writeFileSync(join(dir, "bilingual.md"), chunks.map((c) => `[${c.time}] ${c.en}`).join("\n\n") + "\n");
  console.log(`${id}: wrote bilingual.md (${chunks.length} chunks, no translation)`);
  process.exit(0);
}

const zhPath = join(dir, "zh.txt");
if (!existsSync(zhPath)) {
  console.error(`missing ${zhPath} (run with --draft first, then write "N: 中文" lines)`);
  process.exit(1);
}
const zh = new Map();
for (const line of readFileSync(zhPath, "utf8").split(/\r?\n/)) {
  if (!line.trim()) continue;
  const m = line.match(/^(\d+)\s*[:：|]\s*(.+)$/);
  if (!m) {
    console.error(`zh.txt: cannot parse line: ${line.slice(0, 60)}`);
    process.exit(1);
  }
  if (zh.has(+m[1])) {
    console.error(`zh.txt: duplicate chunk ${m[1]}`);
    process.exit(1);
  }
  zh.set(+m[1], m[2].trim());
}
const missing = chunks.filter((c) => !zh.has(c.n)).map((c) => c.n);
const extra = [...zh.keys()].filter((n) => n < 1 || n > chunks.length);
if (missing.length || extra.length) {
  if (missing.length) console.error(`zh.txt is missing chunks: ${missing.join(", ")}`);
  if (extra.length) console.error(`zh.txt has unknown chunks: ${extra.join(", ")}`);
  process.exit(1);
}
writeFileSync(
  join(dir, "bilingual.md"),
  chunks.map((c) => `[${c.time}] ${c.en}\n> ${zh.get(c.n)}`).join("\n\n") + "\n"
);
console.log(`${id}: wrote bilingual.md (${chunks.length} chunks)`);
