import cv2

INPUT = "original_video.mp4"
OUTPUT = "2_video_blur.mp4"

cap = cv2.VideoCapture(INPUT)
if not cap.isOpened():
    raise SystemExit(f"Cannot open {INPUT}")

fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

fourcc = cv2.VideoWriter_fourcc(*"mp4v")
out = cv2.VideoWriter(OUTPUT, fourcc, fps, (width, height))

while True:
    ret, frame = cap.read()
    if not ret:
        break
    # Gaussian blur: 15x15 kernel, sigma = 0 (OpenCV derives sigma from the kernel size)
    blurred = cv2.GaussianBlur(frame, (15, 15), 0)
    out.write(blurred)

cap.release()
out.release()
print(f"{width}x{height} at {fps} fps, saved {OUTPUT}")
