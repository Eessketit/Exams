import numpy as np
import matplotlib
matplotlib.use("Agg")  # save to file, no window
import matplotlib.pyplot as plt
from scipy.io import wavfile

INPUT = "original_audio.wav"
OUTPUT = "1_audio_waveform.png"

sample_rate, data = wavfile.read(INPUT)
time = np.arange(data.shape[0]) / sample_rate  # seconds

plt.figure(figsize=(10, 4))
if data.ndim == 1:
    plt.plot(time, data, linewidth=0.5)
else:  # stereo: one line per channel
    for ch in range(data.shape[1]):
        plt.plot(time, data[:, ch], linewidth=0.5, label=f"Channel {ch + 1}")
    plt.legend(loc="upper right")
plt.title("Waveform of original_audio.wav")
plt.xlabel("Time (s)")
plt.ylabel("Amplitude")
plt.tight_layout()
plt.savefig(OUTPUT)
plt.close()
print(f"sample rate = {sample_rate} Hz, samples = {data.shape[0]}, saved {OUTPUT}")
