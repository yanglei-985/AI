# 每日量化 · YouTube 学习站

每天推荐一个量化 YouTube 视频（中/英文），配套双语字幕整理、关键点、术语表和测验题。纯静态网页，部署在 GitHub Pages。

## 怎么用

1. **打开网页**：首页显示「今日推荐」（按日期在学习路径中轮换，16 个视频循环），可点击「在此播放」或跳转 YouTube；下方是关键点 / 字幕 / 术语 / 测验四个标签。英文视频的字幕下方有中文解释（可隐藏）；中文视频只有原文字幕。
2. **视频固定在页面上方**，字幕在下面随鼠标滚动：播放时当前字幕行会高亮，点击字幕前的时间可以跳到视频对应位置；可以在卡片里关闭「固定视频」或打开「字幕跟随播放」。
3. **做完测验**才会记为「已学」，进度和连续学习天数保存在你自己的浏览器里。
4. **添加新视频**：见下面「添加新视频」。
5. **发布**：推送到 `main`（或当前开发分支）后，GitHub Actions 会运行 `node scripts/build.mjs` 并部署 `site/`。首次需要在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**，然后在 Actions 页面手动运行一次 *Deploy site to GitHub Pages*。网址通常是 `https://<用户名>.github.io/<仓库名>/`。

## 目录

| 路径 | 说明 |
| --- | --- |
| `content/curriculum.json` | 学习路径：起始日期 + 有序视频列表（含推荐理由） |
| `content/<id>/transcript.srt` | 你导出的原始字幕（SRT） |
| `content/<id>/fixes.json` | 字幕里的语音识别错误修正（正则 → 替换） |
| `content/<id>/zh.txt` | 英文视频的中文解释，每行 `序号: 中文` |
| `content/<id>/bilingual.md` | 双语字幕：英文段落 + 以 `> ` 开头的中文解释，段落以空行分隔，可选 `[mm:ss]` 开头 |
| `content/<id>/notes.md` | `## 摘要` / `## 关键点` / `## 术语表`（`- **术语**: 释义`）/ `## 延伸阅读` |
| `content/<id>/quiz.json` | `[{"q","options":[…],"answer":下标,"explain"}]` |
| `site/` | 静态网页；`site/data/` 由 build 生成 |

## 本地预览

```sh
node scripts/build.mjs
python3 -m http.server -d site 8000   # 打开 http://localhost:8000
```

调试参数：`?date=2026-10-05` 模拟某一天的推荐，`?v=<视频ID>` 直接打开某个视频。

## 关于视频列表

`content/curriculum.json` 是学习路径（顺序 = 推荐顺序）。里面的视频都有你提供的字幕文件（`content/<id>/transcript.srt`）。字幕来自 YouTube，含语音识别错误；英文字幕的术语错误在 `content/<id>/fixes.json` 里修正。

### 添加新视频

1. 把字幕存为 `content/<视频ID>/transcript.srt`，并在 `curriculum.json` 里加一项（`id` 就是 YouTube 视频 ID）。
2. 英文视频：`node scripts/make_bilingual.mjs <id> --draft` 查看分段；写 `zh.txt`（每行 `序号: 中文解释`）后运行 `node scripts/make_bilingual.mjs <id>`。中文视频：`... --mono`。
3. 写 `notes.md`、`quiz.json`（格式见上表），运行 `node scripts/build.mjs`。
4. 不知道 YouTube 链接的视频，在 `curriculum.json` 里设 `"ytId": null`（页面就不显示播放按钮）。

检查视频是否仍可用（在你自己的电脑上运行）：`python3 scripts/check_videos.py`。
