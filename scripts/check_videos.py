#!/usr/bin/env python3
"""Check which videos in content/curriculum.json are still publicly available.

Run this on YOUR machine (the cloud sandbox cannot reach YouTube). No API key needed.

    python3 scripts/check_videos.py

Uses YouTube's public oEmbed endpoint: 200 = available, 401/403 = private or embedding
disabled, 404 = deleted or private. Paste the output back to Claude to replace dead videos.
"""
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MEANING = {401: "私享/不可嵌入", 403: "私享/不可嵌入", 404: "已删除或私享"}


def check(vid: str):
    watch = f"https://www.youtube.com/watch?v={vid}"
    url = "https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(watch, safe="")
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            j = json.load(r)
            return "OK", j.get("author_name", ""), j.get("title", "")
    except urllib.error.HTTPError as e:
        return MEANING.get(e.code, f"HTTP {e.code}"), "", ""
    except Exception as e:  # network problem: says nothing about the video
        return f"网络错误({type(e).__name__})", "", ""


def main() -> int:
    cur = json.loads((ROOT / "content" / "curriculum.json").read_text(encoding="utf-8"))
    bad = 0
    for i, v in enumerate(cur["videos"], 1):
        status, author, title = check(v["id"])
        bad += status != "OK"
        print(f"{i:>2}. {v['id']}  {status:<14} {author}  | {v['title'][:50]}")
    print(f"\n不可用/未确认: {bad} / {len(cur['videos'])}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
