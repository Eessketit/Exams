import os
import numpy as np
from scipy.io import wavfile

INPUT = "original_audio.wav"
OUTPUT = "2_audio_compression.wav"

sample_rate, data = wavfile.read(INPUT)

# Reduce the sample rate by a factor of 2 (downsampling: keep every 2nd sample)
new_rate = sample_rate // 2
compressed = data[::2].astype(np.int16)  # stored as 16-bit PCM

wavfile.write(OUTPUT, new_rate, compressed)

original_size = os.path.getsize(INPUT)
compressed_size = os.path.getsize(OUTPUT)
compression_ratio = compressed_size / original_size
print(f"sample rate: {sample_rate} Hz -> {new_rate} Hz")
print(f"size: {original_size} -> {compressed_size} bytes")
print(f"compression_ratio = {compression_ratio:.3f} (must be < 0.7)")
