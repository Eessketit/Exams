# Lecture 5 (Week 3): Arithmetic Coding, Lossy Compression and MPEG Audio (MP3, MP4)

What this lecture is about: finishing lossless coding with arithmetic coding (encoder, codeword, decoder, worked example `CAEE$`), then lossy compression (rate-distortion, quantization, psychoacoustics) and MPEG audio: MPEG-1 Layers I-III (MP3), the MPEG audio encoder, MPEG-4 Audio (AAC) and MP4. Reference: Li, Drew, Liu, *Fundamentals of Multimedia* 2nd ed., Chapter 8 (slide 54); the arithmetic coding slides are Algorithm 7.5, Procedure 7.2, Algorithm 7.6, Fig. 7.8, Table 7.5.

## 1. Arithmetic Coding Basics (slides 3-4)

- "A more modern coding method that usually **out-performs Huffman coding**" (slide 3).
- Huffman gives each symbol a codeword with an **integral bit length**; arithmetic coding treats the **whole message as one unit**.
- A message is represented by a **half-open interval $[a, b)$**, $0 \le a < b \le 1$. Start with $[0, 1)$. Longer message: interval shrinks, number of bits needed grows.
- Algorithm 7.5 (encoder), slide 4:

```
low = 0.0; high = 1.0; range = 1.0;
while (symbol != terminator) {
    get(symbol);
    low  = low + range * Range_low(symbol);
    high = low + range * Range_high(symbol);
    range = high - low;
}
output a code so that low <= code < high;
```

- Update rule (both bounds from the **old** low):
$$low' = low + range \cdot R_{low}(s), \qquad high' = low + range \cdot R_{high}(s), \qquad range' = high' - low'$$
- Note: the slide pseudocode updates `low` first and then uses it for `high`. Read literally this gives $[0.3, 0.8)$ after `C`, not the slide's $[0.3, 0.5)$. The worked table (slide 7) uses the old low, so do that (verified in Python).
- A terminator symbol (`$`) ends the message, so the decoder knows when to stop.

## 2. Encoding Example CAEE with Terminator (slides 5-7)

Symbol table (slide 5, Fig. 7.8a). The slide labels the last row **G**, but Fig. 7.8(b) (slide 6) and the tables (slides 7, 10) use it as the terminator **`$`** with range $[0.9, 1.0)$.

| Symbol | Probability | Range |
|---|---|---|
| A | 0.2 | [0, 0.2) |
| B | 0.1 | [0.2, 0.3) |
| C | 0.2 | [0.3, 0.5) |
| D | 0.05 | [0.5, 0.55) |
| E | 0.3 | [0.55, 0.85) |
| F | 0.05 | [0.85, 0.9) |
| `$` (slide shows G) | 0.1 | [0.9, 1.0) |

Encoding `CAEE$` (slide 7, Fig. 7.8c). All values verified in Python:

| Step | Symbol | low (new) | high (new) | range |
|---|---|---|---|---|
| 0 | start | 0 | 1.0 | 1.0 |
| 1 | C | $0 + 1.0(0.3) = 0.3$ | $0 + 1.0(0.5) = 0.5$ | 0.2 |
| 2 | A | $0.3 + 0.2(0) = 0.30$ | $0.3 + 0.2(0.2) = 0.34$ | 0.04 |
| 3 | E | $0.3 + 0.04(0.55) = 0.322$ | $0.3 + 0.04(0.85) = 0.334$ | 0.012 |
| 4 | E | $0.322 + 0.012(0.55) = 0.3286$ | $0.322 + 0.012(0.85) = 0.3322$ | 0.0036 |
| 5 | `$` | $0.3286 + 0.0036(0.9) = 0.33184$ | $0.3286 + 0.0036(1.0) = 0.3322$ | 0.00036 |

- Final interval: $[0.33184,\ 0.3322)$. The slide-7 cells wrap as "0.3318 / 4" and "0.0003 / 6"; read them as 0.33184 and 0.00036.
- Fig. 7.8(b) (slide 6): each column re-scales the current interval to the full A..`$` scale. Column tops/bottoms: 1.0/0, 0.5/0.3, 0.34/0.3, 0.334/0.322, 0.3322/0.3286, 0.3322/0.33184.
- Final range = product of symbol probabilities: $0.2 \cdot 0.2 \cdot 0.3 \cdot 0.3 \cdot 0.1 = 0.00036$.

## 3. Generating the Codeword (slide 8)

Procedure 7.2:

```
code = 0; k = 1;
while (value(code) < low) {
    assign 1 to the kth binary fraction bit
    if (value(code) > high) replace the kth bit by 0
    k = k + 1;
}
```

- Professor's wording: "The final step ... calls for the generation of a number that falls within the range [low, high). The above algorithm will ensure that the **shortest binary codeword** is found."
- Binary fraction: $0.b_1 b_2 b_3\ldots = \sum_k b_k 2^{-k}$.

Codeword for $[0.33184, 0.3322)$:

| k | try bit 1: value | vs high 0.3322 | bit kept | code | value(code) < low? |
|---|---|---|---|---|---|
| 1 | 0.5 | > high | 0 | 0.0 | yes |
| 2 | 0.25 | ok | 1 | 0.01 | yes (0.25) |
| 3 | 0.375 | > high | 0 | 0.010 | yes |
| 4 | 0.3125 | ok | 1 | 0.0101 | yes |
| 5 | 0.34375 | > high | 0 | 0.01010 | yes |
| 6 | 0.328125 | ok | 1 | 0.010101 | yes |
| 7 | 0.3359375 | > high | 0 | 0.0101010 | yes |
| 8 | 0.33203125 | ok | 1 | 0.01010101 | no, stop |

- Result: **code = 0.01010101 (binary) = 0.33203125**, 8 bits. This is the first "Value" on slide 10.
- (textbook context) Worst-case length is $\lceil \log_2(1/range) \rceil = \lceil \log_2(1/\prod P_i) \rceil$; here $\lceil 11.44 \rceil = 12$ bits. The actual codeword (8 bits) can be shorter.

## 4. Decoder (slides 9-10)

Algorithm 7.6: convert the binary code to a decimal value, then repeat until the terminator:
find $s$ with $R_{low}(s) \le value < R_{high}(s)$, output $s$, then
$$value \leftarrow \frac{value - R_{low}(s)}{R_{high}(s) - R_{low}(s)}$$

Table 7.5, decoding `CAEE$` (slide 10, verified):

| Value | Output symbol | Low | High | Range | Next value |
|---|---|---|---|---|---|
| 0.33203125 | C | 0.3 | 0.5 | 0.2 | (0.33203125 - 0.3)/0.2 = 0.16015625 |
| 0.16015625 | A | 0.0 | 0.2 | 0.2 | 0.16015625/0.2 = 0.80078125 |
| 0.80078125 | E | 0.55 | 0.85 | 0.3 | (0.80078125 - 0.55)/0.3 = 0.8359375 |
| 0.8359375 | E | 0.55 | 0.85 | 0.3 | (0.8359375 - 0.55)/0.3 = 0.953125 |
| 0.953125 | `$` | 0.9 | 1.0 | 0.1 | terminator, stop |

- Slide 10's first cell wraps as "0.3320312 / 5" = 0.33203125.

## 5. Scaling and Incremental Coding (slide 2 only)

Listed on the Contents slide (slide 2) but no slide covers it. Minimal (textbook context):
- Basic arithmetic coding needs ever-higher precision as the interval shrinks. Fix: output bits **incrementally** and **rescale** the interval.
- If $[low, high) \subset [0, 0.5)$: output 0 and map $x \to 2x$. If $\subset [0.5, 1)$: output 1 and map $x \to 2x - 1$. If it straddles 0.5 inside $[0.25, 0.75)$: map $x \to 2x - 0.5$ and remember a pending opposite bit.
- The interval stays large, so fixed-precision (integer) arithmetic works and bits are sent before the message ends.

## 6. Lossy Compression, Rate Distortion and Quantization (slides 11-13)

- Lossy compression (slide 11): "The compressed data is not the same as the original data but a **close approximation** of it." It "yields a much **higher compression ratio** than that of lossless compression."
- **Rate-distortion theory** (slide 12): "Provides a framework for the study of **tradeoffs between Rate and Distortion**." Fig. 8.1, typical $R(D)$:
  - At $D = 0$ (no loss), $R(D) = H$, the source entropy (lossless limit).
  - $R(D)$ decreases as allowed distortion grows; $R = 0$ at $D = D_{max}$.
- (textbook context) Distortion measures: MSE $\sigma_d^2 = \frac{1}{N}\sum_{n=1}^{N}(x_n - y_n)^2$; SNR (see Lecture 3); PSNR $= 10\log_{10}\frac{x_{peak}^2}{\sigma_d^2}$ dB.
- **Quantization** (slide 13): "Reduce the number of output values to a much smaller set." "**Main source of the loss** in lossy compression."
  - **Uniform**: quantization levels are uniformly spaced.
  - **Nonuniform**: levels unequal, "mostly the relation between them is **logarithmic**."

## 7. Psychoacoustics: Masking and Threshold of Hearing (slides 14-16, 33-36)

Frequency masking (slide 14, "Frequence Masking" on the slide). Lossy audio methods such as MPEG/Audio "remove some sounds which are masked anyway". The four rules:
1. A **lower tone can mask a higher tone**.
2. The reverse is not true: a higher tone does not mask a lower tone well.
3. The greater the power of the masking tone, the wider its influence (broader range of masked frequencies).
4. So if two tones are widely separated in frequency, little masking occurs.

Threshold of hearing (slides 15-16, Fig. 14.2): a sound above the curve's dB level is audible; turning a tone up to equal or pass the curve makes it distinguishable. Approximate formula (Eq. 14.1), $f$ in Hz:
$$\text{Threshold}(f) = 3.64\,(f/1000)^{-0.8} - 6.5\,e^{-0.6\,(f/1000 - 3.3)^2} + 10^{-3}\,(f/1000)^4$$
- Units are **dB**. The origin (0,0) is pinned at **2,000 Hz**: Threshold = 0 at $f = 2$ kHz (the formula gives -0.25 dB, i.e. about 0).
- Python: 100 Hz: 22.95 dB; 1 kHz: 3.37 dB; minimum about -4.98 dB near 3.3 kHz (most sensitive region); 10 kHz: 10.58 dB.
- Slide 33 ("Perceived Human Hearing", 15.6 Hz to 16 kHz): about 80 dB needed at 15.6 Hz, about 0 dB near 1 kHz, a dip below 0 near 4 kHz, rising again above 8 kHz.

Loudness and pitch (slide 34):
- Most sensitive to loudness at **mid frequencies, [500 Hz, 5000 Hz]**. Human hearing range **[20 Hz, 20000 Hz]**.
- Perceived loudness depends on frequency: the **basilar membrane** reacts more to intermediate frequencies.

Masking effects (slide 35):
- Frequency masking curves: masking tones at 0.25, 1, 4, 8 kHz (60 dB). Higher maskers spread wider, mostly toward higher frequencies.
- **Temporal masking**: pre-masking **about 20 ms**, simultaneous masking while the masker is on (**about 200 ms** in the figure), post-masking **about 150 ms**.

Slide 36: a strong tonal signal creates a region where weaker signals are masked; masking curves are plotted against **critical band rate**. "MPEG/audio divides audio signal into frequency sub-bands that **approximate critical bands**. Then we quantize each sub-band according to the audibility of quantization noise within the band."

## 8. Why Audio Compression, Formats, Lossless vs Lossy (slides 17-20, 43-45)

- Why (slide 17): "to reduce the span between the softest and loudest parts of an audio signal".
- **Data rate = sampling rate x quantization bits x channels (+ control information).**
- Example 44100 Hz, 16 bits, 2 channels: $44100 \cdot 16 \cdot 2 = 1{,}411{,}200$ bit/s, about **1.4 Mbit/s**, 84.7 Mbit/min, 5.08 Gbit/h. The slide's "1.4M per second; 84M per minute; 5G per hour" are **bits**. In bytes it is 176,400 B/s (about 635 MB/h).
- **Audio coding format** (slide 18): content representation format for storage or transmission of digital audio (e.g. MP3, AAC, Vorbis, FLAC, Opus). **Audio codec**: a software or hardware implementation that compresses and decompresses to/from a specific format.
- Lossless (slide 19): FLAC, Apple Lossless, "at the cost of larger files".
- Lossy (slide 20): MP3 and **AAC**, both based on **MDCT** (modified discrete cosine transform) and **perceptual coding**.
- **Disadvantages** (slide 20): permanent loss of some original data; lower quality, noticeable in some scenarios; not suitable for high-end audio (music production, audiophiles).
- How it works (slide 43): **perceptual coding**, "only keep audio data that humans can hear"; remove redundant or less important sounds; e.g. high-frequency sounds.
- **Advantages** (slide 44): small files (storage); faster transmission (streaming, downloading); fine for consumer audio where perfect fidelity is not needed.
- Applications (slide 45): music streaming (Spotify, Apple Music), podcasts, audiobooks, online video (YouTube), video conferencing (Zoom, Skype).

## 9. MPEG Audio History and MPEG1 Layers I, II, III (slides 21-28, 42)

- History (slide 21): first psychoacoustic masking code 1979, AT&T Bell Labs, Murray Hill. MP3 is based on **OCF** (optimum coding in frequency domain) and **PXFM** (perceptual transform coding). MPEG-1 Audio Layer III public release **1993**; MPEG-2 Audio III **1995**.
- Slide 22: ISO's MPEG group began standardizing in the late 1980s (TV broadcasting, audio on CD-ROM, later DVD). **MPEG-1 Audio 1992, MPEG-2 Audio 1994** (standard dates, versus the public-release dates on slide 21). MPEG-1 Audio has Layers I, II, III.
- MPEG-1 Audio encoding characteristics (slide 23): precision **16 bits**; sampling **32, 44.1, 48 kHz**; three layers:

| Layer | Bit-rate range | Target |
|---|---|---|
| Layer 1 | 32-448 kbps | 192 kbps |
| Layer 2 (MP2) | 32-384 kbps | 128 kbps |
| Layer 3 (MP3) | 32-320 kbps | 64 kbps |

- Slide 25 says the MP3 "goal to compress to **128 kbps**", but slide 23 gives a target of 64 kbps. (textbook context) The targets are per channel, so 128 kbps stereo = 64 kbps per channel.
- **Layer II = MP2** (slide 24): the dominant standard for audio broadcasting (**DAB** digital radio, **DVB** digital TV). It came out of **MUSICAM** codecs (64-196 kbps; MUSICAM is the basis of MPEG-1 and MPEG-2 audio). Sampling 32, 44.1, 48 kHz; bit rates 32, 48, 56, 64, 80, 96 ... 384 kbps; mono, stereo, dual channel. "MP2: sub-band audio encoder in **time domain**".
- **Layer III = MP3** (slide 25): popular for Internet use; uses **psychoacoustics** ("scientific study of sound perception").
- MPEG (slide 26): Motion Pictures Experts Group, a working group formed from the existing JPEG (Joint Photographic Experts Group) work. In 1992 the audio+video standard **MPEG-1** was devised.
- Layers (slide 27): "MP3 stands for MPEG-1 Layer 3." Layer 1 has the lowest complexity. Layer 2 is more complex and removes more redundancy. Layer 3 is the most complex and "further reduces **redundancy and relevance**". The layers are **backwards-compatible**: a Layer 3 decoder can also decode Layers 1 and 2.
- Open standard (slide 28): the specification is public, no single company owns it, public example source code exists. Adoption was helped by fast computers and Internet access.
- Slide 42: 1997 mp3.com (free MP3s from independent artists); 1999 Napster peer-to-peer; problem: copyright infringement; authorized services: Amazon.com, Rhapsody, Juno Records.

## 10. MPEG Audio Encoder: Filter Bank, Psychoacoustic Model, Bit Allocation (slides 29-32, 37)

Encoding steps (slide 29 diagram):
1. Uncompressed audio goes to the **Filter Bank** (transformation from **time to frequency domain**, **32 sub-bands**) and, in parallel, to the **Psychoacoustic Model**.
2. **Quantization, bit/noise allocation**: "If noise level is high => rough quantization; if noise level is low => finer quantization is applied."
3. **Multiplexer / Entropy coder** (**Huffman coding**) gives the compressed data.

- Filter bank (slide 31): "divides input into multiple sub-bands (**32 equal frequency sub-bands**)". (textbook context) Each sub-band is $\frac{f_s/2}{32}$ wide: 689 Hz at 44.1 kHz, 750 Hz at 48 kHz.
- Slide 30, Figure 5 "**Aliasing**: pure sinusoid input can produce nonzero output for two subbands". A polyphase filter bank gives 8x32 sub-band output samples, and a single tone shows up in two adjacent sub-bands because the bands overlap. The caption names sub-bands 3 and 4; the drawing shows the rows labelled 2 and 3.
- Psychoacoustic model (slide 32): "Compresses by **removing acoustically irrelevant parts** of audio signals"; it uses the human auditory system's "inability to hear quantization noise under **auditory masking**".
  - **Auditory masking**: "occurs whenever the presence of a strong audio signal makes a temporal or spectral neighborhood of weaker audio signals imperceptible."
- **Bit allocation** (slide 37): decides the number of code bits for each sub-band from the psychoacoustic model's output. Algorithm:
  1. Compute the **mask-to-noise ratio**: $\text{MNR} = \text{SNR} - \text{SMR}$ (dB). The standard provides tables of the SNR obtained for a given number of quantizer levels.
  2. Get the MNR of each sub-band.
  3. Find the sub-band with the **lowest MNR**.
  4. Allocate code bits to it. If it gets more bits than appropriate, look up a new SNR estimate and repeat from step 1.
- (textbook context) SMR = signal-to-mask ratio, from the psychoacoustic model.

## 11. Audio Quality, MP3 Format and MPEG Audio Comments (slides 38-41)

- Audio quality (slide 38):
  - Too low a **bitrate** gives compression artifacts: **ringing** and **pre-echo**. Pre-echo is "sound heard before it occurs", most noticeable on impulsive percussion such as cymbals, and occurs in **transform-based** algorithms.
  - Quality also depends on the encoder and its parameters: **constant bit rate (CBR)** vs **variable bit rate (VBR)** encoding.
- MP3 (slide 39): "A **psychoacoustic model** refers to an analysis of an audio signal that determines the **amount of noise masking available based on frequency and loudness**." It eliminates sounds humans cannot hear, focuses bits on the most important frequencies, and gives a high compression ratio for music and voice at moderate to high quality.
- MP3 file format (slide 40): a sequence of **frames**, each = **MP3 header + MP3 data**, possibly wrapped in an **ID3 tag** (ID3v2 metadata first). Example 32-bit header **FFFBA040** (bits verified):

| Bits | Field | Example value |
|---|---|---|
| 1-12 | Sync word | 1111 1111 1111 (FFF) |
| 13 | Version | 1 = MPEG |
| 14-15 | Layer | 01 = Layer 3 |
| 16 | Error protection | 1 = No |
| 17-20 | Bit rate (table index) | 1010 = 160 kbps |
| 21-22 | Frequency | 00 = 44100 Hz |
| 23 | Padding bit | 0 = frame not padded |
| 24 | Private bit | unknown (0) |
| 25-26 | Mode | 01 = Joint Stereo |
| 27-28 | Mode extension | 0 = intensity stereo off, 0 = MS stereo off |
| 29 / 30 | Copyright / Original | 0 = not copyrighted / 0 = copy of original media |
| 31-32 | Emphasis | 00 = none |

- MPEG audio comments (slide 41):
  - 16 bits per sample are needed for a good SNR. The noise is **quantization noise** from digitization.
  - **Each added bit gives about 6 dB better SNR** ($20\log_{10}2 = 6.02$ dB; 16 bits: 96.3 dB; see Lecture 3 for SQNR).
  - The **masking effect** lets us **raise the noise floor** around a strong sound, because the noise is masked.
  - "Raising noise floor is the same as using **less bits**, and using less bits is the same as **compression**."

## 12. Criteria for a Good Standard (slide 46)

- Two models: **implement first, then standardize** or **standardize first, then implement** (the two text boxes overlap on the slide).
- Criteria: achieve the desired outcome; be comprehensible; allow efficient implementation; support competition; give benchmark tests; be supported by industry; be good for end users.

## 13. MPEG4 Audio, AAC and MP4 (slides 47-53)

- **AAC (Advanced Audio Coding)**, the successor of MP3, now part of MPEG-4 Audio (slide 47): up to **48 full-bandwidth channels**; default audio format for iPhone, iPad, Nintendo, PlayStation, Nokia, Android, BlackBerry. **Introduced 1997 as MPEG-2 Part 7**; updated and included in MPEG-4 in **1999**.
- MPEG-4 Audio (slide 48): bit rate **2-64 kbps**, scalable. It defines a set of coders:

| Coder | Bit rate | Sampling |
|---|---|---|
| Parametric coding | 2-6 kbps (low) | 8 kHz |
| CELP (code excited linear prediction) | 6-24 kbps (medium) | 8 and 16 kHz |
| Time-frequency techniques | 16 kbps and higher (high quality) | above 7 kHz |

- AAC improvements over MP3 (slide 49): more sampling frequencies (**8-96 kHz**); **arbitrary bit rates** and variable frame length; higher efficiency and a simpler filterbank, using **pure MDCT**. Also used in Windows Media Audio.
- Applications (slide 50): general audio, speech, synthetic audio, synthesized speech (structured audio).
- **MPEG-4 Audio Part 3** (slide 51): lossy speech coding (CELP, code-excited linear prediction), general audio coding (AAC), lossless audio coding, Text-to-Speech interface, Structured Audio (e.g. MIDI, see Lecture 3).
- **MPEG-4 Part 14 = MP4** (slide 52): extension **.mp4**, a multimedia **container (wrapper) format** that stores digital video and audio streams and allows Internet streaming. "Meta-file format whose spec describes how different data elements and metadata coexist in a computer file."
- Conclusion (slide 53): MPEG Audio is an integral part of the MPEG standard, considered together with video; MPEG-4 Audio is a major extension of MPEG-1 Audio's capabilities.

## Exam focus

1. **Arithmetic encoding with the slide table.** Encode `EC$`:

| Symbol | low | high | range |
|---|---|---|---|
| start | 0 | 1 | 1 |
| E | 0.55 | 0.85 | 0.3 |
| C | $0.55 + 0.3(0.3) = 0.64$ | $0.55 + 0.3(0.5) = 0.70$ | 0.06 |
| `$` | $0.64 + 0.06(0.9) = 0.694$ | $0.64 + 0.06(1.0) = 0.70$ | 0.006 |

   Range check: $0.3 \cdot 0.2 \cdot 0.1 = 0.006$. For `CAEE$` the final interval is $[0.33184, 0.3322)$ with range 0.00036.
2. **Codeword (Procedure 7.2)** for $[0.694, 0.7)$. Try a 1 at each k and keep it unless the value exceeds high: k1 0.5 keep; k2 0.75 drop; k3 0.625 keep; k4 0.6875 keep; k5 0.71875 drop; k6 0.703125 drop; k7 0.6953125 keep and stop. **Code 0.1011001 = 0.6953125 (7 bits)**. For `CAEE$`: 0.01010101 = 0.33203125 (8 bits).
3. **Decoding:** 0.6953125 gives E, then $(0.6953125 - 0.55)/0.3 = 0.484375$ gives C, then $(0.484375 - 0.3)/0.2 = 0.921875$ gives `$`, stop. Output `EC$`. For `CAEE$`, reproduce the section 4 table.
4. **Why arithmetic beats Huffman:** Huffman uses integral bit lengths per symbol; arithmetic coding codes the whole message as one interval. Bit bound (textbook context): $\lceil \log_2(1/range) \rceil$, which is 12 for `CAEE$` and 8 for `EC$`.
5. **Data rate and compression ratio:** CD audio $44100 \cdot 16 \cdot 2 = 1{,}411{,}200$ bit/s. To MP3 at 128 kbps: $1411.2/128 = 11.025{:}1$. At 64 kbps: 22.05:1.
6. **6 dB per bit:** 8 bits about 48 dB, 16 bits about 96 dB ($N \cdot 6.02$ dB). Raising the noise floor means fewer bits, which means compression.
7. **Bit allocation with MNR = SNR - SMR:** sub-bands a, b, c with SNR 30, 20, 25 dB and SMR 10, 15, 5 dB give MNR 20, 5, 20, so the next bits go to sub-band b (lowest MNR). Repeat after updating its SNR. (illustrative numbers)
8. **Masking:** the four frequency-masking rules (a low tone masks a high tone, not the reverse; a stronger masker masks a wider range; tones far apart mask little). Temporal masking: about 20 ms pre, about 150 ms post. Threshold of hearing is pinned at 0 dB at 2 kHz and is most sensitive near 3-4 kHz (Threshold(1 kHz) = 3.37 dB).
9. **MPEG audio encoder pipeline:** filter bank (32 equal sub-bands, time to frequency) plus psychoacoustic model, then quantization and bit allocation, then Huffman entropy coding. MPEG-1 layer bit rates and targets (192, 128, 64 kbps for Layers 1, 2, 3). MP2 is used for DAB/DVB broadcasting; MP3 for the Internet.
10. **Definitions likely asked:** lossy vs lossless; uniform vs nonuniform (logarithmic) quantization; quantization is the main source of loss; the rate-distortion curve ($R = H$ at $D = 0$, $R = 0$ at $D_{max}$); audio format vs codec; pre-echo; CBR vs VBR; AAC (MPEG-2 Part 7, 1997, then MPEG-4 in 1999, pure MDCT, 8-96 kHz); MP4 = MPEG-4 Part 14 container format.
11. **MP3 header decode** (FFFBA040): sync FFF, MPEG-1, Layer 3, no CRC, 160 kbps, 44.1 kHz, joint stereo.
