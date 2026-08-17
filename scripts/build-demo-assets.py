from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def fit_width(image: Image.Image, width: int) -> Image.Image:
    if image.width <= width:
        return image.copy()
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def sanitize_native_picker(image: Image.Image) -> Image.Image:
    """Remove machine-specific quick-access entries from the Windows picker."""
    result = image.copy()
    draw = ImageDraw.Draw(result)

    # Coordinates are relative to the maximized 1646 x 981 capture. The native
    # picker is intentionally left otherwise untouched; only its Quick Access
    # column is replaced so public screenshots never expose local shortcuts.
    draw.rectangle((5, 98, 164, 438), fill="#191919")
    draw.line((164, 98, 164, 438), fill="#343434", width=1)

    entries = (("Quick access", 125), ("Desktop", 176), ("Documents", 221))
    for label, y in entries:
        draw.rounded_rectangle((24, y - 7, 38, y + 7), radius=2, outline="#aeb4bd", width=2)
        draw.text((49, y - 10), label, font=font(14), fill="#d6d8dc")
    return result


def font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    return ImageFont.truetype(Path("C:/Windows/Fonts") / name, size)


def rounded_image(image: Image.Image, radius: int) -> Image.Image:
    result = image.convert("RGBA")
    mask = Image.new("L", result.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *result.size), radius=radius, fill=255)
    result.putalpha(mask)
    return result


def build_social_preview(home: Image.Image, output: Path) -> None:
    canvas = Image.new("RGB", (1280, 640), "#101216")
    draw = ImageDraw.Draw(canvas)

    for x in range(1280):
        amount = x / 1279
        color = (
            round(16 + 9 * amount),
            round(18 + 12 * amount),
            round(22 + 22 * amount),
        )
        draw.line((x, 0, x, 640), fill=color)

    clean_home = home.crop((0, 0, home.width, home.height - 36))
    screenshot = clean_home.resize((740, 467), Image.Resampling.LANCZOS)
    screenshot = rounded_image(screenshot, 18)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((502, 76, 1258, 559), radius=20, fill=(0, 0, 0, 145))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), shadow)
    canvas.alpha_composite(screenshot, (510, 84))

    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((58, 58, 202, 91), radius=16, fill="#25324a")
    draw.text((79, 65), "DSH PLUGIN", font=font(15, bold=True), fill="#a9c9ff")
    draw.text((58, 134), "dsh-projects", font=font(58, bold=True), fill="#f6f7fb")
    draw.text((60, 220), "Projects that stay", font=font(30, bold=True), fill="#dce4f2")
    draw.text((60, 259), "organized.", font=font(30, bold=True), fill="#8bb7ff")
    draw.multiline_text(
        (60, 330),
        "Searchable sessions\nNative folder picking\nA project-first sidebar",
        font=font(21),
        fill="#aeb7c5",
        spacing=17,
    )
    draw.rounded_rectangle((58, 534, 302, 582), radius=24, fill="#f1f4f8")
    draw.text((83, 545), "DeepSeek Harness", font=font(19, bold=True), fill="#171a20")
    canvas.convert("RGB").save(output, "PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build sanitized README demo assets.")
    parser.add_argument("home", type=Path)
    parser.add_argument("picker", type=Path)
    parser.add_argument("create", type=Path)
    parser.add_argument("native", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    source = {
        "home": load_rgb(args.home),
        "picker": load_rgb(args.picker),
        "create": load_rgb(args.create),
        "native": sanitize_native_picker(load_rgb(args.native)),
    }

    for name, image in source.items():
        fit_width(image, 1440).save(
            args.output / f"{name}.webp",
            "WEBP",
            quality=84,
            method=6,
        )

    build_social_preview(source["home"], args.output / "social-preview.png")

    sequence = [
        source["home"],
        source["picker"],
        source["create"],
        source["native"],
        source["create"],
        source["picker"],
    ]
    durations = [1100, 1700, 1700, 2800, 900, 900]
    gif_frames = [
        fit_width(frame, 1200).quantize(colors=160, method=Image.Quantize.MEDIANCUT)
        for frame in sequence
    ]
    gif_frames[0].save(
        args.output / "demo.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=durations,
        loop=0,
        optimize=True,
        disposal=2,
    )


if __name__ == "__main__":
    main()
