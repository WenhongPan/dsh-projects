"""Capture a real Windows desktop interaction as sequential JPEG frames.

This helper intentionally performs no UI reconstruction or redaction.  It is
used with a dedicated, privacy-safe demo workspace and stops when the sentinel
file passed on the command line appears.
"""

from __future__ import annotations

import argparse
import time
from pathlib import Path

from PIL import Image, ImageGrab


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--stop-file", type=Path, required=True)
    parser.add_argument("--fps", type=float, default=12.0)
    parser.add_argument("--width", type=int, default=1440)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    frame_interval = 1.0 / args.fps
    frame_index = 0
    started = time.perf_counter()
    next_frame = started

    print(f"capture-ready output={args.output}", flush=True)
    try:
        while not args.stop_file.exists():
            now = time.perf_counter()
            if now < next_frame:
                time.sleep(min(next_frame - now, 0.01))
                continue

            frame = ImageGrab.grab(all_screens=False).convert("RGB")
            target_height = round(frame.height * args.width / frame.width)
            if frame.width != args.width:
                frame = frame.resize(
                    (args.width, target_height), Image.Resampling.LANCZOS
                )
            frame.save(
                args.output / f"frame-{frame_index:05d}.jpg",
                format="JPEG",
                quality=90,
                optimize=True,
                subsampling=0,
            )
            frame_index += 1
            next_frame = started + frame_index * frame_interval
    finally:
        elapsed = time.perf_counter() - started
        print(
            f"capture-finished frames={frame_index} elapsed={elapsed:.2f}s",
            flush=True,
        )


if __name__ == "__main__":
    main()
