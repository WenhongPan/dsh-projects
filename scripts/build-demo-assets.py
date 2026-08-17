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


def font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    return ImageFont.truetype(Path("C:/Windows/Fonts") / name, size)


def rounded_image(image: Image.Image, radius: int) -> Image.Image:
    result = image.convert("RGBA")
    mask = Image.new("L", result.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *result.size), radius=radius, fill=255)
    result.putalpha(mask)
    return result


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    scale = max(size[0] / image.width, size[1] / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - size[0]) // 2
    top = (resized.height - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def build_social_preview(
    picker: Image.Image,
    output: Path,
    background: Image.Image | None = None,
) -> None:
    if background is None:
        canvas = Image.new("RGB", (1280, 640), "#0d1119")
    else:
        canvas = cover(background, (1280, 640)).convert("RGB")

    # Keep the product proof honest: the right-hand side is an unaltered,
    # maximized DSH Desktop capture rather than a reconstructed UI mockup.
    screenshot = picker.resize((730, 435), Image.Resampling.LANCZOS)
    screenshot = rounded_image(screenshot, 14)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((505, 87, 1251, 538), radius=18, fill=(0, 0, 0, 175))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), shadow)
    canvas.alpha_composite(screenshot, (512, 94))

    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((58, 58, 188, 91), radius=16, fill=(36, 52, 79, 235))
    draw.text((79, 65), "DSH PLUGIN", font=font(15, bold=True), fill="#b7d1ff")
    draw.text((58, 132), "dsh-projects", font=font(52, bold=True), fill="#f7f9fc")
    draw.text((60, 214), "Projects that stay", font=font(29, bold=True), fill="#e3e9f3")
    draw.text((60, 252), "organized.", font=font(29, bold=True), fill="#8bb7ff")
    draw.multiline_text(
        (60, 323),
        "Searchable sessions\nNative folder picking\nA project-first sidebar",
        font=font(20),
        fill="#b8c2d1",
        spacing=16,
    )
    draw.line((60, 485, 448, 485), fill=(132, 156, 194, 80), width=1)
    draw.text((60, 513), "Built for DeepSeek Harness", font=font(18, bold=True), fill="#d6deeb")
    draw.rounded_rectangle((510, 92, 1244, 531), radius=16, outline=(139, 183, 255, 105), width=2)
    canvas.convert("RGB").save(output, "PNG", optimize=True)


def smoothstep(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


def camera_box(frame_index: int) -> tuple[int, int, int, int]:
    """Use an editorial zoom while the real Windows picker is on screen."""
    full = (0, 0, 1440, 850)
    picker = (0, 0, 840, 496)
    if frame_index < 360 or frame_index > 590:
        return full
    if frame_index <= 395:
        progress = smoothstep((frame_index - 360) / 35)
    elif frame_index < 555:
        progress = 1.0
    else:
        progress = 1.0 - smoothstep((frame_index - 555) / 35)
    return tuple(
        round(start + (end - start) * progress)
        for start, end in zip(full, picker)
    )


def build_real_demo(recording_frames: Path, output: Path) -> None:
    """Render the final GIF from continuous, unmodified screen-capture frames."""
    paths = sorted(recording_frames.glob("frame-*.jpg"))
    if len(paths) < 706:
        raise ValueError(f"expected at least 706 recording frames, found {len(paths)}")

    selected_indices = list(range(145, 706, 4))
    rendered: list[Image.Image] = []
    for frame_index in selected_indices:
        frame = load_rgb(paths[frame_index])
        frame = frame.crop(camera_box(frame_index))
        rendered.append(frame.resize((1000, 590), Image.Resampling.LANCZOS))

    palette_sources = rendered[::12]
    palette_strip = Image.new("RGB", (1000, 590 * len(palette_sources)))
    for index, frame in enumerate(palette_sources):
        palette_strip.paste(frame, (0, index * 590))
    palette = palette_strip.quantize(colors=112, method=Image.Quantize.MEDIANCUT)
    gif_frames = [
        frame.quantize(palette=palette, dither=Image.Dither.NONE)
        for frame in rendered
    ]
    durations = [80] * len(gif_frames)
    durations[0] = 650
    durations[-1] = 1100
    gif_frames[0].save(
        output,
        save_all=True,
        append_images=gif_frames[1:],
        duration=durations,
        loop=0,
        optimize=True,
        disposal=1,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Build README demo assets from real captures.")
    parser.add_argument("home", type=Path)
    parser.add_argument("picker", type=Path)
    parser.add_argument("create", type=Path)
    parser.add_argument("native", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--background", type=Path)
    parser.add_argument("--recording-frames", type=Path)
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    source = {
        "home": load_rgb(args.home),
        "picker": load_rgb(args.picker),
        "create": load_rgb(args.create),
        "native": load_rgb(args.native),
    }

    for name, image in source.items():
        fit_width(image, 1440).save(
            args.output / f"{name}.webp",
            "WEBP",
            quality=84,
            method=6,
        )

    background = load_rgb(args.background) if args.background else None
    build_social_preview(
        source["picker"],
        args.output / "social-preview.png",
        background,
    )

    if args.recording_frames:
        build_real_demo(args.recording_frames, args.output / "demo.gif")


if __name__ == "__main__":
    main()
