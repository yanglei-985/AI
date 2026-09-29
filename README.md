# 每日量化 · YouTube 学习站

每天推荐一个量化 YouTube 视频（中/英文），配套双语字幕整理、关键点、术语表和测验题。纯静态网页，部署在 GitHub Pages。

## 怎么用

1. **打开网页**：首页显示「今日推荐」（按日期在学习路径中轮换），可点击「在此播放」或跳转 YouTube；下方是关键点 / 字幕 / 术语 / 测验四个标签。
2. **补字幕**：云端环境访问不了 YouTube，字幕由你导出。任选一种：
   - 视频页 → 描述区「显示转写文稿」→ 复制，保存为 `content/<视频ID>/transcript.txt`；
   - 本机运行 `pip install yt-dlp && python3 scripts/fetch_transcript.py <视频ID> --lang en`（中文视频用 `--lang zh-Hans`）。
3. **生成学习包**：把字幕交给 Claude（粘贴，或说「处理 `<视频ID>`」），它会产出 `bilingual.md`（英文原文 + 中文解释）、`notes.md`（摘要/关键点/术语/延伸阅读）、`quiz.json`（测验题）。
4. **发布**：`node scripts/build.mjs` 校验并生成 `site/data/`，推送到 `main` 后由 GitHub Actions 自动部署。
   首次需要在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

## 目录

| 路径 | 说明 |
| --- | --- |
| `content/curriculum.json` | 学习路径：起始日期 + 有序视频列表（含推荐理由） |
| `content/<id>/transcript.txt` | 你导出的原始字幕 |
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
