import os
import urllib.request
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

def build_pair(url, out_before_name, out_after_name, brick_intensity=0.7, color_shift_red=18):
    os.makedirs('e:/rendvio/public/images', exist_ok=True)
    temp_path = f"e:/rendvio/scratch/temp_{out_after_name}.jpg"
    
    print(f"Downloading photo for {out_after_name}...")
    urllib.request.urlretrieve(url, temp_path)
    
    img_after = Image.open(temp_path).convert('RGB')
    target_w, target_h = 1200, 800
    img_after = img_after.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    after_path = f"e:/rendvio/public/images/{out_after_name}"
    img_after.save(after_path, format="PNG", optimize=True)
    
    img_arr = np.array(img_after, dtype=np.float32)
    h, w, c = img_arr.shape
    
    # Grid pattern for unrenovated wall texture
    brick_mask = np.ones((h, w), dtype=np.float32)
    brick_h, brick_w = 18, 36
    for y in range(0, h, brick_h):
        brick_mask[y:min(y+2, h), :] *= 0.8
    for y in range(0, h, brick_h):
        offset = (brick_w // 2) if ((y // brick_h) % 2 == 1) else 0
        for x in range(offset, w, brick_w):
            brick_mask[y:min(y+brick_h, h), x:min(x+2, w)] *= 0.8
            
    # Wall detection luminance
    lum = 0.299 * img_arr[:, :, 0] + 0.587 * img_arr[:, :, 1] + 0.114 * img_arr[:, :, 2]
    wall_mask = ((lum > 50) & (lum < 230)).astype(np.float32)
    wall_mask = Image.fromarray((wall_mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))
    wall_mask_arr = np.array(wall_mask, dtype=np.float32) / 255.0
    
    # Pre-renovation facade colors
    before_arr = img_arr.copy()
    brick_tint = np.zeros_like(img_arr)
    brick_tint[:, :, 0] = img_arr[:, :, 0] * 1.08 + color_shift_red
    brick_tint[:, :, 1] = img_arr[:, :, 1] * 0.85 - 12
    brick_tint[:, :, 2] = img_arr[:, :, 2] * 0.70 - 25
    
    for i in range(3):
        brick_tint[:, :, i] *= (0.75 + 0.25 * brick_mask)
        
    for i in range(3):
        before_arr[:, :, i] = before_arr[:, :, i] * (1.0 - wall_mask_arr * brick_intensity) + brick_tint[:, :, i] * (wall_mask_arr * brick_intensity)
        
    before_arr = np.clip(before_arr, 0, 255).astype(np.uint8)
    img_before = Image.fromarray(before_arr)
    
    enh_color = ImageEnhance.Color(img_before)
    img_before = enh_color.enhance(0.8)
    
    before_path = f"e:/rendvio/public/images/{out_before_name}"
    img_before.save(before_path, format="PNG", optimize=True)
    print(f"Successfully generated pair: {out_before_name} & {out_after_name}")

def main():
    pairs = [
        {
            "url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=90",
            "before": "exterior-before-2.png",
            "after": "exterior-after-2.png",
            "intensity": 0.65,
            "red_shift": 15
        },
        {
            "url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=90",
            "before": "exterior-before-3.png",
            "after": "exterior-after-3.png",
            "intensity": 0.70,
            "red_shift": 20
        }
    ]
    for p in pairs:
        build_pair(p["url"], p["before"], p["after"], p["intensity"], p["red_shift"])

if __name__ == '__main__':
    main()
