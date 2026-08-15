import sys
try:
    from PIL import Image, ImageFilter, ImageOps
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageFilter, ImageOps

input_path = "e:/rendvio/public/images/exterior-after.png"
output_path = "e:/rendvio/public/images/sketch-before.png"

# Load image
img = Image.open(input_path).convert("L")

# Apply edge detection (like a sketch)
edges = img.filter(ImageFilter.FIND_EDGES)
# Find_edges makes edges white on black, we want black on white
edges = ImageOps.invert(edges)

# Save as sketch-before.png
edges.save(output_path)

# Copy exterior-after.png to sketch-after.png so they match exactly
import shutil
shutil.copyfile("e:/rendvio/public/images/exterior-after.png", "e:/rendvio/public/images/sketch-after.png")
print("Done")
