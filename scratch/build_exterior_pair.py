import os
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageDraw
import numpy as np

def process_exterior():
    input_path = 'e:/rendvio/scratch/modern_house_1.jpg'
    img = Image.open(input_path).convert('RGB')
    width, height = 1200, 800
    img = img.resize((width, height), Image.Resampling.LANCZOS)
    
    # Save After as high quality modern exterior image
    after_path = 'e:/rendvio/public/images/exterior-after.png'
    img.save(after_path, quality=95)
    print("Saved exterior-after.png:", img.size)

if __name__ == '__main__':
    process_exterior()
