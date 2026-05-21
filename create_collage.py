import os
import sys
import subprocess

try:
    from PIL import Image, ImageDraw, ImageFont, ImageOps
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageDraw, ImageFont, ImageOps

base_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\5357d26c-4f45-4776-906e-122d32144aa2"
image_files = [
    "media__1778844765038.jpg",
    "media__1778844765077.jpg",
    "media__1778844765148.jpg",
    "media__1778844765481.jpg",
    "media__1778844765512.jpg",
    "media__1778844801130.jpg",
    "media__1778844801215.jpg",
    "media__1778844801240.jpg",
    "media__1778844801452.jpg"
]

images = []
for file in image_files:
    img_path = os.path.join(base_dir, file)
    try:
        img = Image.open(img_path)
        img = ImageOps.exif_transpose(img)
        images.append(img)
    except Exception as e:
        print(f"Error loading {file}: {e}")

if len(images) < 9:
    print("Not enough images.")
    exit(1)

bg_width = 2400
bg_height = 3400
bg_color = (242, 230, 230) # soft blush pink

canvas = Image.new('RGB', (bg_width, bg_height), color=bg_color)
draw = ImageDraw.Draw(canvas)

boxes = [
    (100, 150, 700, 950),     # Top Left
    (850, 100, 700, 750),     # Top Middle
    (1600, 150, 700, 950),    # Top Right
    
    (100, 1150, 700, 750),    # Mid Left
    (850, 900, 700, 950),     # Mid Middle
    (1600, 1150, 700, 950),   # Mid Right
    
    (100, 1950, 700, 800),    # Bot Left
    (850, 1900, 700, 850),    # Bot Middle
    (1600, 2150, 700, 750),   # Bot Right
]

def crop_and_border(img, target_size, border=25):
    target_w, target_h = target_size
    img_w, img_h = img.size
    
    img_ratio = img_w / img_h
    target_ratio = target_w / target_h
    
    if img_ratio > target_ratio:
        new_w = int(target_ratio * img_h)
        offset = (img_w - new_w) // 2
        img = img.crop((offset, 0, offset + new_w, img_h))
    else:
        new_h = int(img_w / target_ratio)
        offset = (img_h - new_h) // 2
        img = img.crop((0, offset, img_w, offset + new_h))
        
    img = img.resize(target_size, Image.LANCZOS)
    
    bordered = Image.new('RGB', (target_w + border*2, target_h + border*2), color='white')
    bordered.paste(img, (border, border))
    
    bordered_with_outline = Image.new('RGB', (bordered.width + 2, bordered.height + 2), color=(200, 200, 200))
    bordered_with_outline.paste(bordered, (1, 1))
    
    return bordered_with_outline

for i, img in enumerate(images):
    x, y, w, h = boxes[i]
    processed_img = crop_and_border(img, (w, h))
    canvas.paste(processed_img, (x, y))

# Get fonts
try:
    font_large = ImageFont.truetype("C:\\Windows\\Fonts\\segoeprb.ttf", 150)
except:
    font_large = ImageFont.load_default()

try:
    font_serif = ImageFont.truetype("C:\\Windows\\Fonts\\georgiab.ttf", 110)
    font_italic = ImageFont.truetype("C:\\Windows\\Fonts\\georgiai.ttf", 90)
except:
    font_serif = font_large
    font_italic = font_large

def draw_cutout_text(draw_obj, text, position, font, padding=30):
    bbox = draw_obj.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x, y = position
    # Draw white cutout with slight shadow
    draw_obj.rectangle([x - padding + 5, y - padding + 5, x + w + padding + 5, y + h + padding + 5], fill=(200,200,200))
    draw_obj.rectangle([x - padding, y - padding, x + w + padding, y + h + padding], fill="white", outline=(150,150,150), width=2)
    draw_obj.text((x, y - bbox[1]), text, font=font, fill=(40,40,40))

center_x = bg_width // 2

t1 = "Happy 23rd"
t2 = "Anniversary"

bbox1 = draw.textbbox((0, 0), t1, font=font_large)
w1 = bbox1[2] - bbox1[0]
t1_x = center_x - w1 // 2 - 80
t1_y = 2850

bbox2 = draw.textbbox((0, 0), t2, font=font_large)
w2 = bbox2[2] - bbox2[0]
t2_x = center_x - w2 // 2 + 80
t2_y = 3050

draw_cutout_text(draw, t1, (t1_x, t1_y), font_large)
draw_cutout_text(draw, t2, (t2_x, t2_y), font_large)

# Top right text
fav_text = "you are my"
fav_text2 = "favorite"
fav_text3 = "person"

draw.text((1550, 950), fav_text, font=font_italic, fill=(60,60,60))
draw.text((1650, 1040), fav_text2, font=font_serif, fill=(60,60,60))
draw.text((1850, 1150), fav_text3, font=font_italic, fill=(60,60,60))

out_path = os.path.join(base_dir, "anniversary_collage.jpg")
canvas.save(out_path, quality=95)
print(f"Saved to {out_path}")
