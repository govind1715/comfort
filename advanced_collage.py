import os, sys, subprocess, math, random

try:
    from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

base_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\5357d26c-4f45-4776-906e-122d32144aa2"

image_files = [
    "media__1778844801215.jpg", # 0 Top Left
    "media__1778844765077.jpg", # 1 Top Mid
    "media__1778844801240.jpg", # 2 Top Right
    "media__1778844765038.jpg", # 3 Mid Left
    "media__1778844765148.jpg", # 4 Mid Center
    "media__1778844765481.jpg", # 5 Mid Right
    "media__1778844765512.jpg", # 6 Bot Left
    "media__1778844801130.jpg", # 7 Bot Mid
    "media__1778844801452.jpg"  # 8 Bot Right
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
        images.append(Image.new('RGB', (600,600), color='white'))

bg_width = 2400
bg_height = 2850

canvas = Image.new('RGB', (bg_width, bg_height), color=(252, 238, 238))
draw = ImageDraw.Draw(canvas)

# Watercolor blobs
for _ in range(50):
    bx = random.randint(0, bg_width)
    by = random.randint(0, bg_height)
    br = random.randint(200, 600)
    bc = random.choice([(255,220,225), (245,225,235), (255,230,220), (240, 215, 215)])
    draw.ellipse((bx-br, by-br, bx+br, by+br), fill=bc)

canvas = canvas.filter(ImageFilter.GaussianBlur(radius=80))
draw = ImageDraw.Draw(canvas)

# Black Frame
frame_width = 60
draw.rectangle((0, 0, bg_width, bg_height), outline=(25, 25, 25), width=frame_width)

boxes = [
    (200, 200, 600, 850),     # Top Left
    (900, 200, 600, 550),     # Top Middle
    (1600, 200, 600, 850),    # Top Right
    
    (200, 1150, 600, 550),    # Mid Left
    (900, 900, 600, 850),     # Mid Middle
    (1600, 1150, 600, 850),   # Mid Right
    
    (200, 1800, 600, 550),    # Bot Left
    (900, 1850, 600, 550),    # Bot Middle
    (1600, 2100, 600, 550),   # Bot Right
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
    
    shadow_offset = 15
    shadowed = Image.new('RGBA', (bordered.width + shadow_offset*2, bordered.height + shadow_offset*2), (0,0,0,0))
    sdraw = ImageDraw.Draw(shadowed)
    sdraw.rectangle((shadow_offset, shadow_offset, bordered.width + shadow_offset, bordered.height + shadow_offset), fill=(0,0,0,60))
    shadowed = shadowed.filter(ImageFilter.GaussianBlur(10))
    
    final_img = Image.new('RGBA', shadowed.size, (0,0,0,0))
    final_img.paste(shadowed, (0,0), shadowed)
    final_img.paste(bordered, (shadow_offset//2, shadow_offset//2))
    
    return final_img

# Add photos
for i, img in enumerate(images):
    x, y, w, h = boxes[i]
    processed_img = crop_and_border(img, (w, h))
    angle = random.uniform(-1.5, 1.5)
    processed_img = processed_img.rotate(angle, expand=True, resample=Image.BICUBIC)
    canvas.paste(processed_img, (x, y), processed_img)

# Torn paper
def draw_torn_paper(canvas, tx, ty, tw, th, fill_color, shadow_opacity=0.3):
    points = []
    for px in range(tx, tx+tw, 15): points.append((px, ty + random.randint(-6,6)))
    for py in range(ty, ty+th, 15): points.append((tx+tw + random.randint(-6,6), py))
    for px in range(tx+tw, tx, -15): points.append((px, ty+th + random.randint(-6,6)))
    for py in range(ty+th, ty, -15): points.append((tx + random.randint(-6,6), py))

    overlay = Image.new('RGBA', canvas.size, (0,0,0,0))
    odraw = ImageDraw.Draw(overlay)
    odraw.polygon(points, fill=fill_color)
    
    shadow_paper = overlay.filter(ImageFilter.GaussianBlur(6))
    s_alpha = shadow_paper.split()[3].point(lambda p: p * shadow_opacity)
    shadow_paper.putalpha(s_alpha)
    canvas.paste(shadow_paper, (6, 6), shadow_paper)
    canvas.paste(overlay, (0,0), overlay)

try:
    font_tw = ImageFont.truetype("C:\\Windows\\Fonts\\consola.ttf", 45)
except:
    font_tw = ImageFont.load_default()

draw_torn_paper(canvas, 250, 1070, 650, 140, (245, 238, 225, 255))
draw = ImageDraw.Draw(canvas)
draw.text((280, 1090), "Can we always be this close", font=font_tw, fill=(40,40,40))
draw.text((360, 1140), "forever and ever?", font=font_tw, fill=(40,40,40))

# Clock
def draw_clock(canvas, cx, cy, r):
    layer = Image.new('RGBA', (r*3, r*3), (0,0,0,0))
    ldraw = ImageDraw.Draw(layer)
    ldraw.ellipse((r//2+10, r//2+10, r*2.5+10, r*2.5+10), fill=(0,0,0,60))
    layer = layer.filter(ImageFilter.GaussianBlur(8))
    
    cdraw = ImageDraw.Draw(layer)
    cdraw.ellipse((r//2, r//2, r*2.5, r*2.5), fill=(230, 220, 200, 255), outline=(120, 100, 80), width=15)
    cdraw.ellipse((r//2+20, r//2+20, r*2.5-20, r*2.5-20), outline=(160, 140, 120), width=3)
    
    cx_l, cy_l = r*1.5, r*1.5
    cdraw.line((cx_l, cy_l, cx_l+r//2.5, cy_l-r//2.5), fill=(60, 60, 60), width=8)
    cdraw.line((cx_l, cy_l, cx_l-r//3.5, cy_l-r//4.5), fill=(60, 60, 60), width=10)
    
    try:
        font_c = ImageFont.truetype("C:\\Windows\\Fonts\\timesbd.ttf", int(r/2.5))
        cdraw.text((cx_l-r//8, cy_l-r+30), "XII", font=font_c, fill=(60,60,60))
        cdraw.text((cx_l+r-50, cy_l-r//8), "III", font=font_c, fill=(60,60,60))
        cdraw.text((cx_l-r//8, cy_l+r-70), "VI", font=font_c, fill=(60,60,60))
        cdraw.text((cx_l-r+30, cy_l-r//8), "IX", font=font_c, fill=(60,60,60))
    except: pass
    
    canvas.paste(layer, (int(cx-r*1.5), int(cy-r*1.5)), layer)

draw_clock(canvas, 800, 850, 120)

# Flower
def draw_flower(canvas, cx, cy, size, color_type='pink'):
    flower = Image.new('RGBA', (size*2, size*2), (0,0,0,0))
    petal = Image.new('RGBA', (size, size), (0,0,0,0))
    pdraw = ImageDraw.Draw(petal)
    
    if color_type == 'pink':
        pcolor = (255, 180, 200, 200)
        ccolor = (255, 220, 150, 255)
    else:
        pcolor = (220, 50, 50, 220)
        ccolor = (50, 20, 20, 255)
        
    pdraw.ellipse((size//4, 0, size*3//4, size), fill=pcolor)
    
    for angle in range(0, 360, 45):
        rot_petal = petal.rotate(angle, expand=True)
        offset_x = size - rot_petal.width//2
        offset_y = size - rot_petal.height//2
        flower.paste(rot_petal, (offset_x, offset_y), rot_petal)
    
    fdraw = ImageDraw.Draw(flower)
    fdraw.ellipse((size-size//6, size-size//6, size+size//6, size+size//6), fill=ccolor)
    
    canvas.paste(flower, (int(cx-size), int(cy-size)), flower)

draw_flower(canvas, 2150, 950, 120, 'pink')
draw_flower(canvas, 300, 1750, 150, 'red')
draw_flower(canvas, 1600, 2400, 100, 'pink')

# Ransom note text
def draw_ransom_letter(canvas, letter, cx, cy, font):
    size = 140
    if letter == ' ': return size // 2
    
    txt_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    tdraw = ImageDraw.Draw(txt_img)
    bg = random.choice([(255,255,255,255), (245,240,230,255), (235,235,235,255)])
    
    points = []
    for px in range(10, size-10, 15): points.append((px, 10 + random.randint(-4,4)))
    for py in range(10, size-10, 15): points.append((size-10 + random.randint(-4,4), py))
    for px in range(size-10, 10, -15): points.append((px, size-10 + random.randint(-4,4)))
    for py in range(size-10, 10, -15): points.append((10 + random.randint(-4,4), py))
    
    tdraw.polygon(points, fill=bg)
    tdraw.line(points + [points[0]], fill=(120,120,120,255), width=2)
    
    bbox = tdraw.textbbox((0,0), letter, font=font)
    lw = bbox[2] - bbox[0]
    lh = bbox[3] - bbox[1]
    tc = random.choice([(20,20,20), (40,40,40), (50,20,20)])
    tdraw.text(((size-lw)/2, (size-lh)/2 - 15), letter, font=font, fill=tc)
    
    angle = random.uniform(-15, 15)
    txt_img = txt_img.rotate(angle, expand=True, resample=Image.BICUBIC)
    
    shadow = Image.new('RGBA', txt_img.size, (0,0,0,0))
    alpha = txt_img.split()[3]
    shadow_layer = Image.new('RGBA', txt_img.size, (0,0,0,100))
    shadow.paste(shadow_layer, (0,0), alpha)
    shadow = shadow.filter(ImageFilter.GaussianBlur(4))
    
    canvas.paste(shadow, (int(cx - txt_img.width//2 + 5), int(cy - txt_img.height//2 + 5)), shadow)
    canvas.paste(txt_img, (int(cx - txt_img.width//2), int(cy - txt_img.height//2)), txt_img)
    
    return size - 30

try:
    font_large = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", 90)
except:
    font_large = ImageFont.load_default()

x_offset = 650
for c in "HAPPY 23RD":
    w = draw_ransom_letter(canvas, c, x_offset, 1720, font_large)
    x_offset += w

x_offset = 550
for c in "ANNIVERSARY":
    w = draw_ransom_letter(canvas, c, x_offset, 1870, font_large)
    x_offset += w

try:
    font_serif = ImageFont.truetype("C:\\Windows\\Fonts\\georgiab.ttf", 150)
    font_italic = ImageFont.truetype("C:\\Windows\\Fonts\\georgiai.ttf", 100)
    font_cursive = ImageFont.truetype("C:\\Windows\\Fonts\\segoeprb.ttf", 120)
except:
    font_serif = font_large
    font_italic = font_large
    font_cursive = font_large

draw_torn_paper(canvas, 1300, 800, 850, 350, (250, 245, 235, 240))
draw = ImageDraw.Draw(canvas)
draw.text((1350, 830), "you are my", font=font_tw, fill=(50,50,50))
draw.text((1420, 880), "favorite", font=font_serif, fill=(30,30,30))
draw.text((1700, 1010), "person", font=font_cursive, fill=(50,50,50))

out_path = os.path.join(base_dir, "advanced_anniversary_collage.jpg")
canvas.save(out_path, quality=95)
print(f"Saved to {out_path}")
