import os
import urllib.request
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

def create_exterior_renovation_pair():
    os.makedirs('e:/rendvio/public/images', exist_ok=True)
    
    # 1. Download high-resolution modern house exterior architecture from Unsplash
    # Photo: Beautiful luxury modern home facade with wood paneling, large windows, dark accents
    url = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=90"
    raw_path = "e:/rendvio/scratch/modern_ext_raw.jpg"
    
    print("Downloading high-res modern house photo...")
    urllib.request.urlretrieve(url, raw_path)
    
    img_after = Image.open(raw_path).convert('RGB')
    target_w, target_h = 1200, 800
    img_after = img_after.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Save AFTER image
    after_path = "e:/rendvio/public/images/exterior-after.png"
    img_after.save(after_path, format="PNG", optimize=True)
    print("Saved exterior-after.png:", img_after.size)
    
    # 2. Create BEFORE image with identical structure, perspective, roofline, trees, windows
    # Convert facade elements to dated, pre-renovation state:
    # - Brick texture overlay on walls
    # - Desaturated weathered trim
    # - Subtle age/texture overlay
    # - Slightly softer vintage lighting
    
    img_arr = np.array(img_after, dtype=np.float32)
    
    # Generate a realistic brick/stucco texture matrix for the facade
    h, w, c = img_arr.shape
    
    # Create grid lines (representing old brick/block pattern)
    brick_mask = np.ones((h, w), dtype=np.float32)
    brick_h, brick_w = 16, 32
    for y in range(0, h, brick_h):
        brick_mask[y:min(y+2, h), :] *= 0.82
    for y in range(0, h, brick_h):
        offset = (brick_w // 2) if ((y // brick_h) % 2 == 1) else 0
        for x in range(offset, w, brick_w):
            brick_mask[y:min(y+brick_h, h), x:min(x+2, w)] *= 0.82
            
    # Apply brick pattern subtly to non-sky, non-window wall regions
    # Luminance mask: walls are typically mid-to-bright regions
    lum = 0.299 * img_arr[:, :, 0] + 0.587 * img_arr[:, :, 1] + 0.114 * img_arr[:, :, 2]
    wall_mask = ((lum > 60) & (lum < 220)).astype(np.float32)
    wall_mask = Image.fromarray((wall_mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
    wall_mask_arr = np.array(wall_mask, dtype=np.float32) / 255.0
    
    # Shift colors on walls to dated warm terracotta brick / faded yellowed beige
    before_arr = img_arr.copy()
    
    # Wall color shift towards aged brick/stucco (warmer red/brown tint)
    brick_tint = np.zeros_like(img_arr)
    brick_tint[:, :, 0] = img_arr[:, :, 0] * 1.05 + 15  # Red boost
    brick_tint[:, :, 1] = img_arr[:, :, 1] * 0.88 - 10  # Green reduction
    brick_tint[:, :, 2] = img_arr[:, :, 2] * 0.75 - 20  # Blue reduction
    
    # Apply brick texture pattern to brick tint
    for i in range(3):
        brick_tint[:, :, i] *= (0.7 + 0.3 * brick_mask)
        
    # Blend brick facade back into wall areas
    for i in range(3):
        before_arr[:, :, i] = before_arr[:, :, i] * (1.0 - wall_mask_arr * 0.65) + brick_tint[:, :, i] * (wall_mask_arr * 0.65)
        
    before_arr = np.clip(before_arr, 0, 255).astype(np.uint8)
    img_before = Image.fromarray(before_arr)
    
    # Slight age adjustments: reduce saturation slightly, add slight warmth, subtle age softness
    enh_color = ImageEnhance.Color(img_before)
    img_before = enh_color.enhance(0.75)
    
    enh_contrast = ImageEnhance.Contrast(img_before)
    img_before = enh_contrast.enhance(0.9)
    
    before_path = "e:/rendvio/public/images/exterior-before.png"
    img_before.save(before_path, format="PNG", optimize=True)
    print("Saved exterior-before.png:", img_before.size)

if __name__ == '__main__':
    create_exterior_renovation_pair()
