import numpy as np
import cv2

INPUT = "original_image.png"
OUTPUT = "2_image_sobel_edges.png"

# 1) Read the RGB image (BGR in OpenCV) and convert to grayscale
img = cv2.imread(INPUT, cv2.IMREAD_COLOR)
if img is None:
    raise SystemExit(f"Cannot read {INPUT}")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float64)

# 2) Sobel kernels exactly as given in the assignment
Gx_kernel = np.array([[-1, 0, 1],
                      [-2, 0, 2],
                      [-1, 0, 1]], dtype=np.float64)
Gy_kernel = np.array([[-1, -2, -1],
                      [ 0,  0,  0],
                      [ 1,  2,  1]], dtype=np.float64)

Gx = cv2.filter2D(gray, cv2.CV_64F, Gx_kernel)
Gy = cv2.filter2D(gray, cv2.CV_64F, Gy_kernel)

# 3) Gradient magnitude G = sqrt(Gx^2 + Gy^2)
G = np.sqrt(Gx ** 2 + Gy ** 2)

# 4) Keep the values in the valid 8-bit range (0..255) and save as PNG
result = np.clip(G, 0, 255).astype(np.uint8)
cv2.imwrite(OUTPUT, result)
print(f"gradient range {G.min():.1f}..{G.max():.1f} (clipped to 0..255), saved {OUTPUT}")
