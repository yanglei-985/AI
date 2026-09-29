#!/usr/bin/env python3
"""Export a YouTube video's subtitles to content/<video_id>/transcript.txt.

Run this on YOUR machine (the cloud sandbox cannot reach YouTube).

    pip install yt-dlp
    python3 scripts/fetch_transcript.py <video_id or url> [--lang en]

Uses manual subtitles when available, otherwise auto-generated ones.
Output is one line per caption: "[mm:ss] text".
"""
import argparse
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TS = re.compile(r"(\d+):(\d\d):(\d\d)[.,]\d+\s+-->")


def video_id(arg: str) -> str:
    m = re.search(r"(?:v=|youtu\.be/|shorts/)([\w-]{11})", arg)
    return m.group(1) if m else arg


def vtt_to_lines(text: str):
    lines, last, stamp = [], "", None
    for raw in text.splitlines():
        m = TS.match(raw)
        if m:
            h, mi, s = map(int, m.groups())
            total = h * 3600 + mi * 60 + s
            stamp = f"{total // 60:02d}:{total % 60:02d}"
            continue
        if not raw.strip() or raw.startswith(("WEBVTT", "Kind:", "Language:", "NOTE")) or "-->" in raw:
            continue
        clean = re.sub(r"<[^>]+>", "", raw).strip()
        # auto-captions repeat the previous line as they roll; skip duplicates
        if clean and clean != last and stamp:
            lines.append(f"[{stamp}] {clean}")
            last = clean
    return lines


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--lang", default="en", help="subtitle language, e.g. en, zh-Hans, zh-Hant")
    args = ap.parse_args()
    vid = video_id(args.video)

    with tempfile.TemporaryDirectory() as tmp:
        cmd = [
            "yt-dlp", "--skip-download", "--write-subs", "--write-auto-subs",
            "--sub-langs", f"{args.lang}.*,{args.lang}", "--sub-format", "vtt",
            "-o", f"{tmp}/%(id)s", f"https://www.youtube.com/watch?v={vid}",
        ]
        try:
            subprocess.run(cmd, check=True)
        except FileNotFoundError:
            print("yt-dlp not found. Install it with: pip install yt-dlp", file=sys.stderr)
            return 1
        except subprocess.CalledProcessError as e:
            print(f"yt-dlp failed ({e.returncode}).", file=sys.stderr)
            return 1
        files = sorted(Path(tmp).glob("*.vtt"))
        if not files:
            print(f"No '{args.lang}' subtitles found. Try --lang with another code.", file=sys.stderr)
            return 1
        lines = vtt_to_lines(files[0].read_text(encoding="utf-8"))

    out = ROOT / "content" / vid / "transcript.txt"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {out} ({len(lines)} lines)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
