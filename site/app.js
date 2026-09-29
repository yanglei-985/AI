"use strict";

// ---------- helpers ----------
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
};

const store = {
  key: "quant-progress-v1",
  read() {
    try { return JSON.parse(localStorage.getItem(this.key)) || { done: {} }; }
    catch { return { done: {} }; }
  },
  write(data) {
    try { localStorage.setItem(this.key, JSON.stringify(data)); } catch { /* storage unavailable */ }
  },
};

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const utcDay = (s) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const mod = (a, n) => ((a % n) + n) % n;

const params = new URLSearchParams(location.search);
const todayStr = /^\d{4}-\d{2}-\d{2}$/.test(params.get("date") || "") ? params.get("date") : ymd(new Date());

const $ = (id) => document.getElementById(id);
let data, progress, currentId, activeTab = "points";

// ---------- streak / stats ----------
function streak(done) {
  const days = new Set(Object.values(done).map((d) => d.date));
  let cursor = utcDay(todayStr);
  if (!days.has(dayStr(cursor))) cursor -= 1; // today not finished yet: count up to yesterday
  let n = 0;
  while (days.has(dayStr(cursor))) { n++; cursor -= 1; }
  return n;
}
const dayStr = (utcDays) => {
  const d = new Date(utcDays * 86400000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

function renderStats() {
  const real = data.videos;
  const doneCount = real.filter((v) => progress.done[v.id]).length;
  $("stats").replaceChildren(
    h("span", {}, `连续 ${streak(progress.done)} 天`),
    h("span", {}, `已学 ${doneCount}/${real.length}`)
  );
}

// ---------- today's pick ----------
function todaysVideo() {
  const real = data.videos;
  const days = utcDay(todayStr) - utcDay(data.startDate);
  return real[mod(days, real.length)];
}

const STATUS_TEXT = { ready: "学习包已就绪", "needs-notes": "字幕已收到，待生成学习包", "pending-transcript": "待补字幕" };

function renderToday(video) {
  const isToday = video.id === todaysVideo().id;
  const badges = h("div", { class: "badges" },
    h("span", { class: "badge" }, video.lang === "zh" ? "中文" : "English"),
    h("span", { class: "badge" }, video.level),
    h("span", { class: "badge" }, video.topic),
    video.channel && h("span", { class: "badge" }, video.channel),
    video.minutes && h("span", { class: "badge" }, `${video.minutes} 分钟`),
  );
  const playerSlot = h("div");
  const actions = h("div", { class: "actions" },
    video.ytId && !window.QUANT_NO_EMBED && h("button", {
      class: "primary",
      onclick: () => {
        playerSlot.replaceChildren(h("iframe", {
          class: "player",
          src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.ytId)}`,
          title: video.title,
          allow: "accelerometer; encrypted-media; picture-in-picture; fullscreen",
          allowfullscreen: true,
          referrerpolicy: "strict-origin-when-cross-origin",
        }));
      },
    }, "▶ 在此播放"),
    video.url && h("a", { class: "btn", href: video.url, target: "_blank", rel: "noopener" }, "在 YouTube 打开"),
  );
  $("today").replaceChildren(h("div", { class: "card" },
    h("div", { class: "eyebrow" }, `${isToday ? "今日推荐" : "正在学习"} · ${todayStr} · ${STATUS_TEXT[video.status]}`),
    h("h2", { class: "title" }, video.title),
    badges,
    h("p", { class: "reason" }, video.reason),
    actions, playerSlot,
  ));
}

// ---------- lesson ----------
async function renderLesson(video) {
  const root = $("lesson");
  if (video.status !== "ready") {
    root.replaceChildren(pendingBox(video));
    return;
  }
  root.replaceChildren(h("p", { class: "eyebrow" }, "加载中…"));
  let lesson;
  try {
    const res = await fetch(`data/lessons/${encodeURIComponent(video.id)}.json`);
    if (!res.ok) throw new Error(res.status);
    lesson = await res.json();
  } catch {
    root.replaceChildren(h("div", { class: "pending" }, "学习包加载失败，请刷新重试。"));
    return;
  }
  const tabs = [
    ["points", "关键点"], ["transcript", "字幕"], ["glossary", "术语"], ["quiz", "测验"],
  ];
  const panel = h("div", { class: "panel", role: "tabpanel" });
  const bar = h("div", { class: "tabs", role: "tablist" });
  const show = (key) => {
    activeTab = key;
    for (const b of bar.children) b.setAttribute("aria-selected", String(b.dataset.key === key));
    panel.replaceChildren(panels[key](lesson));
  };
  for (const [key, label] of tabs) {
    bar.append(h("button", { role: "tab", "data-key": key, onclick: () => show(key) }, label));
  }
  root.replaceChildren(bar, panel);
  show(activeTab);
}

const panels = {
  points: (l) => h("div", {},
    h("p", { class: "summary" }, l.notes.summary),
    h("ul", {}, l.notes.keyPoints.map((p) => h("li", {}, p))),
    l.notes.further.length > 0 && h("div", {}, h("h3", {}, "延伸阅读"), h("ul", {}, l.notes.further.map((p) => h("li", {}, p)))),
  ),
  transcript: (l) => {
    const box = h("div");
    const toggle = h("button", {
      onclick: () => { box.classList.toggle("hide-zh"); toggle.textContent = box.classList.contains("hide-zh") ? "显示中文解释" : "隐藏中文解释"; },
    }, "隐藏中文解释");
    const hasZh = l.transcript.some((s) => s.zh);
    box.append(
      h("div", { class: "toolbar" }, hasZh && toggle, h("span", {}, `${l.transcript.length} 段`)),
      ...l.transcript.map((s) => h("div", { class: "seg" },
        s.time && h("div", { class: "t" }, s.time),
        h("p", { class: "en", lang: l.lang }, s.text),
        s.zh && h("p", { class: "zh" }, s.zh),
      )),
    );
    return box;
  },
  glossary: (l) => l.notes.glossary.length === 0
    ? h("p", {}, "本视频暂无术语表。")
    : h("dl", { class: "gloss" }, l.notes.glossary.flatMap((g) => [h("dt", {}, g.term), h("dd", {}, g.def)])),
  quiz: (l) => quizView(l),
};

function quizView(lesson) {
  const box = h("div");
  const answered = new Map();
  const scoreEl = h("p", { class: "score" });
  const finish = () => {
    const score = [...answered.values()].filter(Boolean).length;
    scoreEl.textContent = `得分 ${score} / ${lesson.quiz.length}`;
    if (answered.size === lesson.quiz.length) {
      progress.done[lesson.id] = { date: todayStr, score, total: lesson.quiz.length };
      store.write(progress);
      renderStats(); renderPath();
    }
  };
  lesson.quiz.forEach((q, qi) => {
    const explain = h("p", { class: "explain", hidden: true });
    const opts = q.options.map((text, oi) => h("button", {
      class: "opt",
      onclick: () => {
        if (answered.has(qi)) return;
        answered.set(qi, oi === q.answer);
        opts.forEach((b, i) => {
          b.disabled = true;
          if (i === q.answer) b.classList.add("right");
          else if (i === oi) b.classList.add("wrong");
        });
        explain.textContent = `${oi === q.answer ? "✔ 正确。" : "✘ 答错了。"}${q.explain}`;
        explain.hidden = false;
        finish();
      },
    }, `${String.fromCharCode(65 + oi)}. ${text}`));
    box.append(h("div", { class: "q" }, h("p", {}, `${qi + 1}. ${q.q}`), opts, explain));
  });
  const prev = progress.done[lesson.id];
  scoreEl.textContent = prev ? `上次得分 ${prev.score} / ${prev.total}（${prev.date}）` : "";
  box.append(scoreEl, h("button", { onclick: () => { activeTab = "quiz"; renderLesson(byId(lesson.id)); } }, "重新作答"));
  return box;
}

function pendingBox(video) {
  const needsNotes = video.status === "needs-notes";
  return h("div", { class: "pending" },
    h("strong", {}, needsNotes ? "字幕已收到，学习包正在准备中" : "这个视频的字幕还没有导入"),
    needsNotes
      ? h("p", {}, "回到 Claude 会话让它生成关键点、术语和测验题，然后重新部署即可。")
      : h("div", {},
        h("p", {}, "云端环境无法访问 YouTube，所以字幕需要你在本机导出后放进仓库："),
        h("ol", {},
          h("li", {}, "打开视频页 → 描述区「显示转写文稿」→ 全选复制；或在本机运行下面的命令。"),
          h("li", {}, ["把文本保存为 ", h("code", {}, `content/${video.id}/transcript.txt`), "（GitHub 网页端「Add file」即可），或直接粘贴给 Claude。"]),
          h("li", {}, "让 Claude 生成关键点、双语字幕、术语表和测验题，提交后页面自动更新。"),
        ),
        h("pre", {}, `python3 scripts/fetch_transcript.py ${video.id}`),
      ),
  );
}

// ---------- path ----------
const byId = (id) => data.videos.find((v) => v.id === id);

function renderPath() {
  const real = data.videos;
  const list = $("path-list");
  list.replaceChildren(...real.map((v, i) => {
    const done = progress.done[v.id];
    const dot = done ? h("span", { class: "dot done" }, `已完成 ${done.score}/${done.total}`)
      : h("span", { class: `dot ${v.status === "ready" ? "ready" : ""}` }, STATUS_TEXT[v.status]);
    return h("li", { class: v.id === currentId ? "current" : "" },
      h("span", { class: "n" }, String(i + 1)),
      h("div", {},
        h("button", { onclick: () => select(v.id, true) }, v.title),
        h("div", { class: "meta" }, `${v.lang === "zh" ? "中文" : "EN"} · ${v.level} · ${v.topic}`),
      ),
      dot,
    );
  }));
}

function select(id, scroll) {
  currentId = id;
  activeTab = "points";
  const v = byId(id);
  renderToday(v);
  renderLesson(v);
  renderPath();
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- boot ----------
(async function main() {
  try {
    const res = await fetch("data/curriculum.json");
    data = await res.json();
  } catch {
    $("today").replaceChildren(h("div", { class: "pending" }, "无法加载课程数据。请先运行 node scripts/build.mjs 并通过 HTTP 访问。"));
    return;
  }
  progress = store.read();
  $("foot-note").textContent = data.note;
  renderStats();
  const requested = params.get("v");
  select(requested && byId(requested) ? requested : todaysVideo().id, false);
})();
