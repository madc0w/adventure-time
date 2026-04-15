from PIL import Image, ImageDraw
import math, os

OUT = os.path.join('img', 'charactes')
W, H = 300, 300
BG = (0, 0, 0, 0)

def new_img():
    return Image.new('RGBA', (W, H), BG)

def draw_body(draw, cx, cy, rx, ry, color=(30, 10, 40), outline=(80, 0, 120), width=3):
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=color, outline=outline, width=width)

def draw_eyes(draw, cx, cy, spread=30, size=14, glow=(180, 0, 255)):
    # menacing glowing eyes
    for ox in [-spread, spread]:
        ex, ey = cx + ox, cy - 10
        # outer glow
        draw.ellipse([ex - size - 4, ey - size - 4, ex + size + 4, ey + size + 4], fill=(glow[0]//3, glow[1]//3, glow[2]//3, 120))
        # eye
        draw.ellipse([ex - size, ey - size, ex + size, ey + size], fill=glow, outline=(255, 255, 255, 200), width=2)
        # pupil
        draw.ellipse([ex - 5, ey - 5, ex + 5, ey + 5], fill=(0, 0, 0))

def draw_mouth(draw, cx, cy, frame=0):
    # jagged mouth
    y = cy + 30
    points = []
    teeth = 6
    w = 50
    for i in range(teeth * 2 + 1):
        x = cx - w + i * (w * 2) / (teeth * 2)
        if i % 2 == 0:
            points.append((x, y))
        else:
            points.append((x, y + 12 + (frame % 2) * 4))
    draw.line(points, fill=(180, 0, 255), width=3)

def draw_tendrils(draw, cx, cy, frame=0):
    # wispy tendrils at bottom
    for i in range(5):
        angle = math.pi * 0.3 + i * math.pi * 0.1
        wobble = math.sin(frame * 1.2 + i) * 15
        length = 60 + i * 10
        x1 = cx + (i - 2) * 25
        y1 = cy + 50
        x2 = x1 + math.cos(angle) * length + wobble
        y2 = y1 + math.sin(angle) * length
        xm = (x1 + x2) / 2 + wobble * 0.5
        ym = (y1 + y2) / 2
        for t in range(20):
            tt = t / 19
            px = (1 - tt)**2 * x1 + 2 * (1 - tt) * tt * xm + tt**2 * x2
            py = (1 - tt)**2 * y1 + 2 * (1 - tt) * tt * ym + tt**2 * y2
            alpha = int(200 * (1 - tt))
            r = int(4 * (1 - tt)) + 1
            draw.ellipse([px - r, py - r, px + r, py + r], fill=(60, 0, 90, alpha))

def draw_horns(draw, cx, cy, spread=55):
    for side in [-1, 1]:
        hx = cx + side * spread
        hy = cy - 60
        points = [
            (hx, hy + 30),
            (hx + side * 15, hy - 20),
            (hx + side * 5, hy - 50),
        ]
        draw.polygon(points, fill=(60, 0, 90), outline=(120, 0, 180), width=2)

def draw_aura(draw, cx, cy, frame=0):
    # dark aura around the body
    for i in range(3):
        r = 85 + i * 12 + math.sin(frame + i) * 5
        alpha = 40 - i * 12
        draw.ellipse([cx - r, cy - r + 10, cx + r, cy + r + 10], fill=(40, 0, 60, max(alpha, 0)))

def draw_void_wraith(frame=0, attack=False, dead=False, prep=False):
    img = new_img()
    draw = ImageDraw.Draw(img)
    cx, cy = W // 2, H // 2 - 10

    if dead:
        # collapsed, fading wraith
        draw_aura(draw, cx, cy + 30, frame)
        # flattened body
        ry = 25 - frame * 5
        if ry < 8:
            ry = 8
        draw_body(draw, cx, cy + 40, 80, max(ry, 8), color=(20, 5, 25, 150), outline=(50, 0, 70, 100))
        # dimmed eyes
        if frame < 2:
            alpha = 150 - frame * 60
            for ox in [-30, 30]:
                draw.ellipse([cx + ox - 8, cy + 30 - 8, cx + ox + 8, cy + 30 + 8], fill=(100, 0, 140, alpha))
        return img

    if prep:
        # charging up - brighter aura
        for i in range(5):
            r = 90 + i * 15
            draw.ellipse([cx - r, cy - r + 10, cx + r, cy + r + 10], fill=(80, 0, 120, 30))
        draw_body(draw, cx, cy, 70, 60, color=(50, 15, 65))
        draw_horns(draw, cx, cy)
        draw_eyes(draw, cx, cy, glow=(220, 50, 255))
        draw_mouth(draw, cx, cy, 1)
        draw_tendrils(draw, cx, cy, frame)
        return img

    if attack:
        # lunging forward, mouth open wider
        draw_aura(draw, cx, cy, frame)
        # shift body forward
        oy = -5 * (1 if frame % 2 == 0 else -1)
        draw_body(draw, cx, cy + oy, 75, 65, color=(45, 10, 55), outline=(120, 0, 180))
        draw_horns(draw, cx, cy + oy, spread=60)
        draw_eyes(draw, cx, cy + oy, glow=(255, 50, 50))  # red eyes during attack
        # wider mouth
        y = cy + 30 + oy
        points = [(cx - 40, y), (cx - 20, y + 20), (cx, y + 5), (cx + 20, y + 20), (cx + 40, y)]
        draw.polygon(points, fill=(120, 0, 0), outline=(255, 50, 50), width=2)
        draw_tendrils(draw, cx, cy + oy, frame * 3)
        # slash effect
        if frame == 0 or frame == 2:
            for i in range(3):
                sx = cx - 40 + i * 30
                draw.line([(sx, cy - 60), (sx + 30, cy + 60)], fill=(180, 0, 255, 180), width=3)
        return img

    # normal idle
    draw_aura(draw, cx, cy, frame)
    bob = math.sin(frame * 1.5) * 5
    draw_body(draw, cx, cy + bob, 70, 60)
    draw_horns(draw, cx, cy + bob)
    draw_eyes(draw, cx, cy + bob)
    draw_mouth(draw, cx, cy + bob, frame)
    draw_tendrils(draw, cx, cy + bob, frame)
    return img


# Generate idle frames
for i in range(3):
    img = draw_void_wraith(frame=i)
    img.save(os.path.join(OUT, f'void wraith 0{i+1}.png'))
    print(f'Created void wraith 0{i+1}.png')

# Generate dead frames
for i in range(3):
    img = draw_void_wraith(frame=i, dead=True)
    img.save(os.path.join(OUT, f'void wraith dead 0{i+1}.png'))
    print(f'Created void wraith dead 0{i+1}.png')

# Generate attack frames
for i in range(3):
    img = draw_void_wraith(frame=i, attack=True)
    img.save(os.path.join(OUT, f'void wraith attack 0{i+1}.png'))
    print(f'Created void wraith attack 0{i+1}.png')

# Generate attack prep frame
img = draw_void_wraith(frame=0, prep=True)
img.save(os.path.join(OUT, 'void wraith attack-prep 01.png'))
print('Created void wraith attack-prep 01.png')

print('\nAll void wraith sprites generated!')
