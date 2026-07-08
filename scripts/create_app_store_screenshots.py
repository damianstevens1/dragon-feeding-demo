from pathlib import Path
import shutil
import zipfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "app-store/screenshots/iphone-6.9"
OUT_65 = ROOT / "app-store/screenshots/iphone-6.5"
UPLOAD_65 = ROOT / "app-store/screenshots/UPLOAD_THESE_IPHONE_6_5"
SOURCE_OUT = ROOT / "app-store/screenshots/source"
OUT.mkdir(parents=True, exist_ok=True)
OUT_65.mkdir(parents=True, exist_ok=True)
SOURCE_OUT.mkdir(parents=True, exist_ok=True)
if UPLOAD_65.exists():
    shutil.rmtree(UPLOAD_65)
UPLOAD_65.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT = 1290, 2796

BACKGROUND = Image.open(ROOT / "public/assets/higgsfield/dragon-bg-vertical.jpg").convert("RGB")
DRAGON_HAPPY = Image.open(ROOT / "public/assets/dragon-frames/happy.png").convert("RGBA")
DRAGON_IDLE = Image.open(ROOT / "public/assets/dragon-frames/idle-a.png").convert("RGBA")
TRAY = Image.open(ROOT / "public/assets/higgsfield/food-tray-platform.png").convert("RGBA")
YES_NO_IMAGE = Image.open(ROOT / "public/assets/images/yes-no-3d/donut.jpg").convert("RGB")
SNACK_NAMES = [
    "apple",
    "banana",
    "cookie",
    "cupcake-remade",
    "donut-remade",
    "orange",
    "pretzel",
    "strawberry",
    "watermelon",
    "pizza",
]
SNACKS = [
    Image.open(ROOT / f"public/assets/images/snacks/{name}.png").convert("RGBA")
    for name in SNACK_NAMES
]


def font(size):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            try:
                return ImageFont.truetype(candidate, size)
            except OSError:
                pass
    return ImageFont.load_default()


BOLD_42 = font(42)
BOLD_56 = font(56)
BOLD_72 = font(72)
BOLD_96 = font(96)


def cover(image, size):
    width, height = image.size
    target_width, target_height = size
    scale = max(target_width / width, target_height / height)
    resized = image.resize(
        (round(width * scale), round(height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - target_width) // 2
    top = (resized.height - target_height) // 2
    return resized.crop((left, top, left + target_width, top + target_height))


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def center_text(draw, box, text, text_font, fill):
    bounds = draw.textbbox((0, 0), text, font=text_font)
    text_width = bounds[2] - bounds[0]
    text_height = bounds[3] - bounds[1]
    x = box[0] + (box[2] - box[0] - text_width) / 2
    y = box[1] + (box[3] - box[1] - text_height) / 2 - bounds[1]
    draw.text((x, y), text, font=text_font, fill=fill)


def base_scene(dim=False):
    image = cover(BACKGROUND, (WIDTH, HEIGHT)).convert("RGBA")
    image = Image.alpha_composite(image, Image.new("RGBA", (WIDTH, HEIGHT), (255, 238, 190, 26)))
    if dim:
        image = Image.alpha_composite(image, Image.new("RGBA", (WIDTH, HEIGHT), (11, 39, 35, 130)))
    return image


def paste_dragon(image, pose="idle", y=1210, size=870):
    dragon = DRAGON_HAPPY if pose == "happy" else DRAGON_IDLE
    dragon = dragon.resize((size, size), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.ellipse(
        (WIDTH // 2 - 390, y + size - 110, WIDTH // 2 + 390, y + size + 50),
        fill=(22, 39, 34, 82),
    )
    image.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(34)))
    image.alpha_composite(dragon, ((WIDTH - size) // 2, y))


def paste_tray(image, y=2150):
    tray_width = 1210
    tray_height = round(tray_width * TRAY.height / TRAY.width)
    tray_image = TRAY.resize((tray_width, tray_height), Image.Resampling.LANCZOS)
    x = (WIDTH - tray_width) // 2
    image.alpha_composite(tray_image, (x, y))

    positions = [
        (125, 82), (310, 84), (498, 78), (690, 80), (882, 82),
        (154, 250), (342, 248), (532, 244), (720, 248), (916, 244),
    ]
    for snack, (sx, sy) in zip(SNACKS, positions):
        image.alpha_composite(snack.resize((128, 128), Image.Resampling.LANCZOS), (x + sx, y + sy))


def draw_hud(draw):
    rounded(draw, (54, 54, 492, 174), 24, (255, 255, 248, 232), (255, 255, 255, 180), 3)
    center_text(draw, (54, 54, 492, 174), "Card 1 of 20", BOLD_56, (23, 35, 31, 255))
    rounded(draw, (54, 198, 492, 318), 24, (255, 255, 248, 232), (255, 255, 255, 180), 3)
    center_text(draw, (54, 198, 492, 318), "0 stars", BOLD_56, (129, 92, 22, 255))
    rounded(draw, (54, 354, 260, 462), 20, (255, 255, 248, 224))
    center_text(draw, (54, 354, 260, 462), "Previous", BOLD_42, (82, 102, 91, 255))
    rounded(draw, (282, 354, 502, 462), 20, (255, 255, 248, 238))
    center_text(draw, (282, 354, 502, 462), "Next", BOLD_42, (22, 62, 54, 255))


def start_screen():
    image = base_scene()
    draw = ImageDraw.Draw(image)
    dragon = DRAGON_HAPPY.resize((900, 900), Image.Resampling.LANCZOS)
    image.alpha_composite(dragon, ((WIDTH - 900) // 2, 1910))
    rounded(draw, (54, 890, WIDTH - 54, 1288), 24, (255, 255, 248, 235), (255, 255, 255, 210), 3)
    center_text(draw, (54, 935, WIDTH - 54, 1015), "OBJECT FUNCTION PRACTICE", BOLD_42, (29, 126, 102, 255))
    center_text(draw, (54, 1014, WIDTH - 54, 1134), "Dragon Feeding Game", BOLD_96, (23, 35, 31, 255))
    center_text(draw, (54, 1140, WIDTH - 54, 1228), "Choose what we use.", BOLD_56, (83, 101, 94, 255))
    rounded(draw, (378, 1368, WIDTH - 378, 1538), 28, (31, 190, 160, 245))
    center_text(draw, (378, 1368, WIDTH - 378, 1538), "Play", BOLD_72, (255, 255, 255, 255))
    return image.convert("RGB")


def feeding_screen():
    image = base_scene()
    paste_dragon(image, "idle", y=1220, size=820)
    paste_tray(image, y=2165)
    draw_hud(ImageDraw.Draw(image))
    return image.convert("RGB")


def question_screen():
    image = base_scene(dim=True)
    paste_dragon(image, "idle", y=1230, size=800)
    paste_tray(image, y=2185)
    image = Image.alpha_composite(image, Image.new("RGBA", (WIDTH, HEIGHT), (18, 39, 35, 125)))
    draw = ImageDraw.Draw(image)
    rounded(draw, (66, 348, WIDTH - 66, 2160), 30, (255, 255, 248, 242), (255, 255, 255, 220), 3)
    center_text(draw, (120, 430, WIDTH - 120, 570), "Is this a donut?", BOLD_72, (23, 35, 31, 255))

    card = Image.new("RGBA", (900, 900), (255, 255, 255, 255))
    card_image = cover(YES_NO_IMAGE, (820, 680)).convert("RGBA")
    card.alpha_composite(card_image, (40, 54))
    image.alpha_composite(card, ((WIDTH - 900) // 2, 650))

    rounded(draw, (170, 1710, 560, 1900), 28, (31, 190, 160, 255))
    center_text(draw, (170, 1710, 560, 1900), "Yes", BOLD_72, (255, 255, 255, 255))
    rounded(draw, (730, 1710, 1120, 1900), 28, (255, 255, 255, 255), (31, 190, 160, 150), 4)
    center_text(draw, (730, 1710, 1120, 1900), "No", BOLD_72, (22, 62, 54, 255))
    return image.convert("RGB")


SCREENSHOTS = [
    ("01-start.png", start_screen()),
    ("02-feeding-tray.png", feeding_screen()),
    ("03-yes-no-question.png", question_screen()),
]

for filename, screenshot in SCREENSHOTS:
    screenshot.save(OUT / filename, quality=95)
    screenshot.resize((430, 932), Image.Resampling.LANCZOS).save(SOURCE_OUT / filename)

    accepted = screenshot.resize((1284, 2778), Image.Resampling.LANCZOS)
    accepted_name = Path(filename).with_suffix(".jpg").name
    upload_name = f"{Path(filename).stem}-1284x2778.jpg"
    accepted.save(OUT_65 / accepted_name, quality=95)
    accepted.save(UPLOAD_65 / upload_name, quality=95)

zip_path = ROOT / "app-store/screenshots/UPLOAD_THESE_IPHONE_6_5.zip"
if zip_path.exists():
    zip_path.unlink()
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
    for screenshot_path in sorted(UPLOAD_65.iterdir()):
        archive.write(screenshot_path, screenshot_path.relative_to(UPLOAD_65.parent))

print("Generated App Store screenshot drafts")
print("Upload these for iPhone 6.5 Display:", UPLOAD_65)
