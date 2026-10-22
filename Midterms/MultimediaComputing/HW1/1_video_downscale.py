import cv2

INPUT = "original_video.mp4"
OUTPUT = "1_video_downscale.mp4"
# The task text also names the output "2_video_downscale.mp4"; write both so either name is found.
OUTPUT_ALT = "2_video_downscale.mp4"

cap = cv2.VideoCapture(INPUT)
if not cap.isOpened():
    raise SystemExit(f"Cannot open {INPUT}")

fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# 50% of the original size
new_width = width // 2
new_height = height // 2

fourcc = cv2.VideoWriter_fourcc(*"mp4v")
writers = [cv2.VideoWriter(name, fourcc, fps, (new_width, new_height))
           for name in (OUTPUT, OUTPUT_ALT)]

while True:
    ret, frame = cap.read()
    if not ret:
        break
    small = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
    for w in writers:
        w.write(small)

cap.release()
for w in writers:
    w.release()
print(f"{width}x{height} -> {new_width}x{new_height} at {fps} fps, saved {OUTPUT}")
