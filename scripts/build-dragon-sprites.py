from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
FRAMES = ROOT / "public" / "assets" / "dragon-frames"
OUT = ROOT / "public" / "sprites" / "dragon"
OUT.mkdir(parents=True, exist_ok=True)

SIZE = 444
STATES = {
    "idle": ["idle-a.png", "idle-a.png", "idle-a.png", "idle-a.png"],
    "blink": ["idle-a.png", "blink.png", "idle-a.png", "idle-a.png"],
    "happy-bounce": ["happy.png", "celebrate-a.png", "happy.png", "celebrate-b.png"],
    "eat-crunch": ["ready.png", "chew.png", "ready.png", "chew.png"],
    "funky-dance": [
        {"source": "celebrate-a.png", "dx": -4, "dy": 0, "angle": -2.2, "scale": 0.985, "fire": 0.72},
        {"source": "celebrate-a.png", "dx": -8, "dy": -5, "angle": -4.8, "scale": 1.0, "scale_x": 1.01, "scale_y": 0.995, "fire": 0.82},
        {"source": "happy.png", "dx": -4, "dy": -11, "angle": -1.0, "scale": 1.035, "fire": 0.64},
        {"source": "celebrate-b.png", "dx": 5, "dy": -6, "angle": 3.4, "scale": 1.0, "fire": 0.88},
        {"source": "celebrate-b.png", "dx": 9, "dy": 0, "angle": 5.8, "scale": 0.992, "fire": 0.76},
        {"source": "happy.png", "dx": 4, "dy": -12, "angle": 1.4, "scale": 1.04, "fire": 0.66},
        {"source": "celebrate-a.png", "dx": -2, "dy": -2, "angle": -1.6, "scale": 0.995, "fire": 0.78},
        {"source": "celebrate-b.png", "dx": -7, "dy": -4, "angle": -4.2, "scale": 1.0, "fire": 0.9},
        {"source": "happy.png", "dx": 0, "dy": -14, "angle": 0.0, "scale": 1.05, "fire": 0.62},
        {"source": "celebrate-a.png", "dx": 8, "dy": -3, "angle": 4.0, "scale": 1.0, "fire": 0.8},
        {"source": "celebrate-b.png", "dx": -6, "dy": 1, "angle": -3.8, "scale": 0.99, "fire": 0.72},
        {"source": "happy.png", "dx": 0, "dy": -7, "angle": 0.8, "scale": 1.025, "fire": 0.68},
    ],
    "fire-breath": ["celebrate-b.png", "celebrate-b.png", "celebrate-a.png", "happy.png"],
}


def load_frame(name: str) -> Image.Image:
    image = Image.open(FRAMES / name).convert("RGBA")
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    x = (SIZE - image.width) // 2
    y = (SIZE - image.height) // 2
    canvas.alpha_composite(image, (x, y))
    return canvas


def normalize_spec(frame_spec):
    if isinstance(frame_spec, str):
        return {"source": frame_spec}
    return frame_spec


def transform_frame(
    frame: Image.Image,
    dx: float = 0,
    dy: float = 0,
    angle: float = 0,
    scale: float = 1,
    scale_x: float = 1,
    scale_y: float = 1,
) -> Image.Image:
    width = max(1, int(round(SIZE * scale * scale_x)))
    height = max(1, int(round(SIZE * scale * scale_y)))
    transformed = frame.resize((width, height), Image.LANCZOS)
    if abs(angle) > 0.01:
      transformed = transformed.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)

    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    x = int(round((SIZE - transformed.width) / 2 + dx))
    y = int(round((SIZE - transformed.height) / 2 + dy))
    canvas.alpha_composite(transformed, (x, y))
    return canvas


def draw_fire(frame: Image.Image, strength: float) -> Image.Image:
    image = frame.copy()
    if strength <= 0.02:
        return image

    scale = 4
    canvas_size = (SIZE * scale, SIZE * scale)
    flame = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    glow = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(flame, "RGBA")
    glow_draw = ImageDraw.Draw(glow, "RGBA")

    def s(value: float) -> int:
        return int(round(value * scale))

    mouth = (s(264), s(185))
    length = s(74 + 58 * strength)
    height = s(34 + 24 * strength)
    lift = s(8 + 12 * strength)

    def plume_points(
        origin: tuple[int, int],
        plume_length: int,
        plume_height: int,
        plume_lift: int,
        wave: float,
        upper_weight: float = 0.58,
        lower_weight: float = 0.46,
    ) -> list[tuple[float, float]]:
        top = []
        bottom = []
        steps = 28
        for step in range(steps + 1):
            p = step / steps
            taper = math.sin(math.pi * p) ** 0.72
            taper *= 1 - 0.18 * p
            cx = origin[0] + plume_length * p
            cy = origin[1] - plume_lift * p
            cy += math.sin(p * math.pi * 2.35 + wave) * plume_height * 0.055
            top_wave = 1 + 0.16 * math.sin(p * math.pi * 3.1 + wave)
            bottom_wave = 1 + 0.12 * math.cos(p * math.pi * 2.4 + wave)
            top.append((cx, cy - plume_height * taper * upper_weight * top_wave))
            bottom.append((cx, cy + plume_height * taper * lower_weight * bottom_wave))
        return top + list(reversed(bottom))

    outer = plume_points(mouth, length, height, lift, 0.2)
    middle = plume_points(
        (mouth[0] + s(7), mouth[1] - s(1)),
        int(length * 0.78),
        int(height * 0.68),
        int(lift * 0.78),
        1.1,
        0.6,
        0.42,
    )
    inner = plume_points(
        (mouth[0] + s(12), mouth[1]),
        int(length * 0.52),
        int(height * 0.42),
        int(lift * 0.55),
        2.0,
        0.54,
        0.36,
    )
    upper_tongue = plume_points(
        (mouth[0] + s(20), mouth[1] - s(5)),
        int(length * 0.56),
        int(height * 0.34),
        int(lift * 1.8 + s(10)),
        2.55,
        0.78,
        0.24,
    )
    lower_tongue = plume_points(
        (mouth[0] + s(18), mouth[1] + s(8)),
        int(length * 0.48),
        int(height * 0.28),
        -s(5 + 6 * strength),
        1.65,
        0.28,
        0.72,
    )

    glow_draw.polygon(outer, fill=(255, 82, 24, int(88 * strength)))
    glow_draw.polygon(middle, fill=(255, 176, 51, int(72 * strength)))
    glow_draw.polygon(upper_tongue, fill=(255, 138, 34, int(54 * strength)))
    glow_draw.polygon(lower_tongue, fill=(255, 91, 31, int(50 * strength)))
    glow = glow.filter(ImageFilter.GaussianBlur(s(7)))

    draw.polygon(outer, fill=(246, 74, 31, int(220 * strength)))
    draw.polygon(upper_tongue, fill=(255, 118, 34, int(208 * strength)))
    draw.polygon(lower_tongue, fill=(235, 64, 33, int(178 * strength)))
    draw.polygon(middle, fill=(255, 151, 39, int(232 * strength)))
    draw.polygon(inner, fill=(255, 232, 103, int(238 * strength)))

    core = plume_points(
        (mouth[0] + s(17), mouth[1] + s(1)),
        int(length * 0.32),
        int(height * 0.23),
        int(lift * 0.32),
        2.7,
        0.5,
        0.3,
    )
    draw.polygon(core, fill=(255, 255, 207, int(185 * strength)))

    ignition_r = s(5 + 3 * strength)
    draw.ellipse(
        (
            mouth[0] - ignition_r,
            mouth[1] - ignition_r,
            mouth[0] + ignition_r,
            mouth[1] + ignition_r,
        ),
        fill=(255, 246, 151, int(210 * strength)),
    )

    embers = [
        (0.48, -0.38, 5.5, (255, 218, 83, 165)),
        (0.64, 0.34, 4.8, (255, 127, 43, 145)),
        (0.78, -0.08, 4.2, (255, 197, 58, 135)),
        (0.92, 0.18, 3.5, (255, 88, 35, 105)),
    ]
    for p, offset, radius, color in embers:
        px = mouth[0] + length * p
        py = mouth[1] - lift * p + height * offset
        r = s(radius * strength)
        draw.ellipse((px - r, py - r, px + r, py + r), fill=color)

    fire_layer = Image.alpha_composite(glow, flame)
    fire_layer = fire_layer.resize((SIZE, SIZE), Image.LANCZOS)
    image.alpha_composite(fire_layer)
    return image


def make_sheet(state: str, frame_names: list[str]) -> None:
    frames = []
    for index, frame_spec in enumerate(frame_names):
        spec = normalize_spec(frame_spec)
        frame = load_frame(spec["source"])
        if state == "funky-dance":
            frame = draw_fire(frame, spec.get("fire", 0.72))
        frame = transform_frame(
            frame,
            dx=spec.get("dx", 0),
            dy=spec.get("dy", 0),
            angle=spec.get("angle", 0),
            scale=spec.get("scale", 1),
            scale_x=spec.get("scale_x", 1),
            scale_y=spec.get("scale_y", 1),
        )
        if state == "fire-breath":
            frame = draw_fire(frame, [0.0, 0.74, 1.0, 0.42][index])
        frames.append(frame)
        if state == "funky-dance":
            frame.save(FRAMES / f"dance-{index + 1:02d}.png")

    sheet = Image.new("RGBA", (SIZE * len(frames), SIZE), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, (index * SIZE, 0))
    sheet.save(OUT / f"{state}.png")


def make_contact_sheet() -> None:
    cell_w = 300
    cell_h = 360
    columns = 3
    rows = 2
    sheet = Image.new("RGBA", (columns * cell_w, rows * cell_h), (245, 248, 240, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("Arial.ttf", 22)
    except Exception:
        font = ImageFont.load_default()

    for index, state in enumerate(STATES):
        row = index // columns
        col = index % columns
        x = col * cell_w
        y = row * cell_h
        draw.rounded_rectangle((x + 12, y + 12, x + cell_w - 12, y + cell_h - 12), radius=18, fill=(255, 255, 250, 255), outline=(126, 150, 132, 255), width=2)
        draw.text((x + 24, y + 24), state, fill=(20, 44, 38, 255), font=font)
        sprite = Image.open(OUT / f"{state}.png").convert("RGBA")
        preview_index = 1 if state == "fire-breath" else 0
        preview = sprite.crop((preview_index * SIZE, 0, (preview_index + 1) * SIZE, SIZE))
        preview.thumbnail((220, 220), Image.LANCZOS)
        sheet.alpha_composite(preview, (x + (cell_w - preview.width) // 2, y + 78))
        draw.text((x + 24, y + 314), f"{len(STATES[state])} frames", fill=(72, 92, 82, 255), font=font)
    sheet.save(OUT / "contact-sheet.png")


def write_preview() -> None:
    cards = "\n".join(
        f'''      <article class="card">
        <h2>{state}</h2>
        <img src="./{state}.png" alt="{state} sprite sheet">
        <p>{len(frames)} frames, {SIZE}x{SIZE} each</p>
      </article>'''
        for state, frames in STATES.items()
    )
    html = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dragon Sprite Preview</title>
    <style>
      body {{ margin: 0; font-family: Arial, sans-serif; background: #eef5ee; color: #17302a; }}
      main {{ max-width: 1120px; margin: 0 auto; padding: 24px; }}
      h1 {{ margin: 0 0 16px; }}
      .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }}
      .card {{ padding: 14px; border: 1px solid #a8b9a9; border-radius: 8px; background: #fffffa; }}
      h2 {{ margin: 0 0 10px; font-size: 20px; }}
      img {{ width: 100%; image-rendering: auto; background: linear-gradient(45deg, #dce7dc 25%, transparent 25% 75%, #dce7dc 75%), linear-gradient(45deg, #dce7dc 25%, transparent 25% 75%, #dce7dc 75%); background-size: 24px 24px; background-position: 0 0, 12px 12px; }}
      p {{ margin: 10px 0 0; font-weight: 700; }}
    </style>
  </head>
  <body>
    <main>
      <h1>Dragon Sprite Preview</h1>
      <img src="./contact-sheet.png" alt="Dragon sprite contact sheet">
      <div class="grid">
{cards}
      </div>
    </main>
  </body>
</html>
"""
    (OUT / "preview.html").write_text(html)


for state, frame_names in STATES.items():
    make_sheet(state, frame_names)
make_contact_sheet()
write_preview()
