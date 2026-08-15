import sys
try:
    from PIL import Image, ImageEnhance, ImageFilter
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageEnhance, ImageFilter

input_path = "e:/rendvio/public/images/exterior-after.png"
output_path = "e:/rendvio/public/images/exterior-before.png"

img = Image.open(input_path).convert('RGB')

# 1. Blur slightly to simulate older camera/worse quality
img = img.filter(ImageFilter.GaussianBlur(radius=1.2))

# 2. Desaturate heavily
color = ImageEnhance.Color(img)
img = color.enhance(0.3)

# 3. Add warm/dirty tint (sepia-ish)
tint = Image.new('RGB', img.size, (100, 70, 30))
img = Image.blend(img, tint, 0.25)

# 4. Decrease contrast to make it look faded
contrast = ImageEnhance.Contrast(img)
img = contrast.enhance(0.7)

# 5. Decrease brightness
brightness = ImageEnhance.Brightness(img)
img = brightness.enhance(0.8)

img.save(output_path)
print("Exterior before image created successfully.")
