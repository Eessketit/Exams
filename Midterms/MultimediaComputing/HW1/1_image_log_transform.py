import numpy as np
import cv2

INPUT = "original_image.png"
OUTPUT = "1_image_log_transform.png"

# 1) Read the RGB image (OpenCV loads it in BGR order) and convert to grayscale
img = cv2.imread(INPUT, cv2.IMREAD_COLOR)
if img is None:
    raise SystemExit(f"Cannot read {INPUT}")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 2) Normalize intensities to [0, 1]
I_old = gray.astype(np.float64) / 255.0

# 3) Log transform: I_new = c * log(1 + I_old),  c = 255 / log(1 + max(I_old))
c = 255.0 / np.log(1.0 + np.max(I_old))
I_new = c * np.log(1.0 + I_old)

# 4) Back to 8-bit (uint8 cast, as in the lecture's gamma example) and save
result = np.clip(I_new, 0, 255).astype(np.uint8)
cv2.imwrite(OUTPUT, result)
print(f"c = {c:.4f}, output range {result.min()}..{result.max()}, saved {OUTPUT}")
