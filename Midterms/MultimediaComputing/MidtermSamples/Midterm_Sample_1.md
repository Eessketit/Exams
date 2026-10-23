# Multimedia Computing: Midterm Sample 1

Lectures 2-12 (not 1, 8, 13) · 100 pts · Part 1: 10 x 2 = 20 · Part 2: 8 x 10 = 80 · Answer and explanation under each question

## Part 1: Multiple choice (10 x 2 = 20 pts)

**1.** A 50 Hz sine wave is shifted by a phase of 90 degrees. By how much time is the wave shifted?  
a) 2.5 ms  
b) 5 ms  
c) 10 ms  
d) 20 ms

> **Answer: b)** T = 1/f = 1/50 = 20 ms. 90 degrees = pi/2 rad = a shift of T/4 = 5 ms. (10 ms is 180 degrees = T/2; 20 ms is a full period.)  
> **Source:** L2 p.16 amplitude, frequency, period T = 1/f, phase · L2 p.21 period and frequency are inverses · L2 p.24 same wave at different phases  
> **Notes:** [Lecture 2 › Sine Wave Parameters: Amplitude, Frequency, Period, Phase, Wavelength](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#4-sine-wave-parameters-amplitude-frequency-period-phase-wavelength-slides-16-18-21-26)

**2.** An audio signal contains frequencies up to 12 kHz. What is the Nyquist sampling frequency for this signal (the frequency the sampling rate must be greater than)?  
a) 6 kHz  
b) 12 kHz  
c) 24 kHz  
d) 48 kHz

> **Answer: c)** Sample at more than twice the maximum frequency. The slide calls 2 x f_max = 2 x 12 = 24 kHz the "Nyquist sampling frequency". 6 kHz is the f_s/2 mix-up.  
> **Source:** L2 p.47 sample at more than twice the highest frequency · L2 p.48 2 x f_max is the "Nyquist sampling frequency"  
> **Notes:** [Lecture 2 › Sampling Theorem and Nyquist](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#13-sampling-theorem-and-nyquist-slides-45-50)

**3.** The signal voltage is 100 times the noise voltage. The SNR is:  
a) 40 dB  
b) 20 dB  
c) 100 dB  
d) 2 dB

> **Answer: a)** Voltages use 20 log10: 20 log10(100) = 40 dB. 20 dB comes from wrongly using 10 log10, which is the power form.  
> **Source:** L3 p.6 SNR = 20 log10 of the voltage ratio  
> **Notes:** [Lecture 3 › Signal to Noise Ratio (SNR)](../notes/03_Week2_Audio_SNR_MIDI_PCM.md#2-signal-to-noise-ratio-snr-slides-4-6)

**4.** Which property of Huffman codes makes it possible to decode a bitstream without any ambiguity, with no separators between codewords?  
a) The two least frequent symbols have codes of the same length  
b) The average code length is strictly less than the entropy + 1  
c) More frequent symbols get shorter codes  
d) No codeword is a prefix of any other codeword

> **Answer: d)** Unique prefix property: "no Huffman code is a prefix of any other ... precludes any ambiguity in decoding". a, b and c are true optimality properties, but they are not what makes decoding unambiguous.  
> **Source:** L4 p.30 unique prefix property and optimality properties  
> **Notes:** [Lecture 4 › Properties of Huffman Coding and Extended Huffman](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#9-properties-of-huffman-coding-and-extended-huffman-slides-30-32)  
> **Video:** [Huffman coding step-by-step example (Pizzey Technology)](https://www.youtube.com/watch?v=iEm1NRyEe5c)

**5.** Why does arithmetic coding usually outperform Huffman coding?  
a) It is lossy, so it can drop rarely used symbols  
b) Huffman gives every symbol a codeword with an integral number of bits, while arithmetic coding treats the whole message as one unit, an interval [a, b)  
c) It builds a dictionary of repeated strings and sends a fixed-length code for each string  
d) It codes each run of identical symbols as a count followed by the symbol

> **Answer: b)** Slide wording: Huffman uses an integral bit length per symbol, while arithmetic coding treats the whole message as one unit, an interval [a, b). Arithmetic coding is lossless; c is LZW and d is RLE.  
> **Source:** L5 p.3 integral bit length per symbol vs the whole message as one interval  
> **Notes:** [Lecture 5 › Arithmetic Coding Basics](../notes/05_Week3_ArithmeticCoding_LossyCompression_MPEG.md#1-arithmetic-coding-basics-slides-3-4)

**6.** Which statement about the two receptors in the retina is correct?  
a) Rods are located in the fovea and are highly sensitive to color  
b) Cones dominate scotopic (low illumination) vision, so dim scenes appear black and white  
c) Cones are located in the fovea and are highly sensitive to color; rods are insensitive to color but sensitive to low levels of illumination  
d) Rods dominate photopic vision and provide color

> **Answer: c)** Cones sit in the fovea and see color. Rods are insensitive to color and sensitive to low illumination. Scotopic vision is rod-dominant (b and d swap rods and cones).  
> **Source:** L6 p.4 rods and cones in the retina · L6 p.5 scotopic (rods) vs photopic (cones) vision  
> **Notes:** [Lecture 6 › Human Eye Structure](../notes/06_Week3_Image_Basics_Perception_Resampling.md#1-human-eye-structure-slides-3-4) · [Lecture 6 › Brightness Adaptation and Weber Ratio](../notes/06_Week3_Image_Basics_Perception_Resampling.md#2-brightness-adaptation-and-weber-ratio-slides-5-7)

**7.** Two pixels are p = (1, 2) and q = (6, 4). The chessboard distance D8(p, q) is:  
a) 2  
b) 5.39  
c) 7  
d) 5

> **Answer: d)** D8 = max(|1-6|, |2-4|) = max(5, 2) = 5. 7 is D4 (city block) and 5.39 is the Euclidean distance.  
> **Source:** L7 p.31 Euclidean distance · L7 p.32 city-block distance D4 · L7 p.33 chessboard distance D8  
> **Notes:** [Lecture 7 › Distance Measures](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#7-distance-measures-slides-30-34)

**8.** The goal of histogram equalization is to:  
a) obtain a uniform histogram for the output image, by mapping gray level r to s so that s is uniformly distributed  
b) shift the histogram to the right by adding a constant to every pixel  
c) make the output histogram match a desired histogram given by the user  
d) reduce the number of gray levels so that the image needs less storage

> **Answer: a)** The goal on slide 20 is a uniform output histogram. c is histogram specification, b is brightness addition, d is posterizing.  
> **Source:** L9 p.20 goal: a uniform output histogram · L9 p.40 histogram specification  
> **Notes:** [Lecture 9 › Histogram Equalization, Theory](../notes/09_Week5_Intensity_Transforms_Histogram.md#6-histogram-equalization-theory-slides-20-28) · [Lecture 9 › Histogram Specification](../notes/09_Week5_Intensity_Transforms_Histogram.md#9-histogram-specification-slides-40-45)

**9.** Morphological opening of image A by structuring element B is:  
a) a dilation followed by an erosion  
b) the difference between the dilation and the erosion  
c) an erosion followed by a dilation  
d) an erosion followed by a second erosion

> **Answer: c)** Opening = erosion followed by dilation. a is closing; b is the morphological gradient.  
> **Source:** L10 p.26 opening = erosion then dilation · L10 p.28 closing = dilation then erosion · L10 p.55 morphological gradient  
> **Notes:** [Lecture 10 › Opening and Closing](../notes/10_Week5_Morphology.md#5-opening-and-closing-slides-26-35) · [Lecture 10 › Gray Scale Morphology, Gradient, Top Hat](../notes/10_Week5_Morphology.md#11-gray-scale-morphology-gradient-top-hat-slides-52-56)

**10.** In pattern recognition, unsupervised learning means that:  
a) a teacher provides a category label or cost for each pattern in the training set  
b) the system forms clusters or "natural groupings" of the input patterns  
c) every pattern is put in the reject class until a teacher labels it  
d) each pattern is compared with a stored template of every class

> **Answer: b)** Unsupervised learning = the system forms clusters or "natural groupings". a is supervised learning.  
> **Source:** L12 p.28 supervised vs unsupervised learning  
> **Notes:** [Lecture 12 › Learning, Statistical and Structural PR](../notes/12_Week7_Pattern_Recognition.md#6-learning-statistical-and-structural-pr-slides-28-31)

## Part 2: Short questions (8 x 10 = 80 pts)

### Q1. Morphology (10 pts)

(a) What is image morphology? Define the dilation operation. (5 pts)

(b) Apply dilation on image A using the structuring element B. Pixels outside the image are 0. Give the result on the same 7 x 7 grid. (5 pts)

Image A (7 x 7):

```
0 0 0 0 0 0 0
0 1 1 0 0 0 0
0 1 0 0 0 1 0
0 0 0 0 0 1 0
0 0 0 1 0 0 0
0 0 0 1 1 0 0
0 0 0 0 0 0 0
```

Structuring element B (3 x 3 cross, origin = the centre pixel, in brackets):

```
0  1  0
1 [1] 1
0  1  0
```

**Answer**

**Source:** L10 p.3 definition · L10 p.4-5 structuring element · L10 p.10-11 binary images, erosion and dilation · L10 p.12-13 dilation = local maximum · L10 p.20 set definition of dilation · L10 p.22 cross SE example  
**Notes:** [Lecture 10 › Basic Concepts and Structuring Element](../notes/10_Week5_Morphology.md#1-basic-concepts-and-structuring-element-slides-2-6) · [Lecture 10 › Dilation](../notes/10_Week5_Morphology.md#3-dilation-slides-12-14-20-22)

**(a) Write:**
- "Morphological image processing is a collection of **non-linear** operations related to the shape or morphology of features in an image." It relies only on the relative ordering of pixel values, so it is especially suited to binary images. The two basic operations are **erosion and dilation**; opening and closing are built from them.
- The operations use a **structuring element (SE)**: "a small binary image, i.e. a small matrix of pixels, each with a value of zero or one". Its matrix size is its size, its pattern of 1s is its shape, and its origin is usually the centre. It plays the same role as a convolution kernel.
- **Dilation**: $A\oplus B=\lbrace z \mid (\hat B)_z\cap A\neq\varnothing\rbrace$, "the set of all displacements z such that $\hat B$ and A overlap by at least one element". In words, every pixel takes the **maximum** over the SE neighbourhood, so bright (foreground) regions grow and small gaps are joined.

**(b) Method.** The cross is symmetric, so $\hat B = B$. An output pixel is 1 if the cross centred on it hits at least one 1 of A, i.e. if the pixel itself or one of its 4-neighbours (up, down, left, right) is 1. Equivalently, stamp a cross on every 1 of A. A has 8 ones, and nothing reaches beyond the 7 x 7 grid.

Working grid (`#` = 1 already in A, `+` = 1 added by the dilation, `0` = stays 0):

```
0 + + 0 0 0 0
+ # # + 0 + 0
+ # + 0 + # +
0 + 0 + + # +
0 0 + # + + 0
0 0 + # # + 0
0 0 0 + + 0 0
```

**Result $A\oplus B$ (28 ones):**

```
0 1 1 0 0 0 0
1 1 1 1 0 1 0
1 1 1 0 1 1 1
0 1 0 1 1 1 1
0 0 1 1 1 1 0
0 0 1 1 1 1 0
0 0 0 1 1 0 0
```

- Check (row, col from 0): (3,4) gets a 1 from (3,5) and (4,4) gets one from (4,3), so the vertical bar and the bottom shape are joined into one region ("broken segments were joined", slide 22).

---

### Q2. Filtering (10 pts)

(a) Compare blurring (low-pass averaging) and median filtering. Which kind of noise does each one handle better, and what happens to edges? (4 pts)

(b) The 5 x 5 gray image below contains one salt-noise pixel (255). Rows and columns are numbered from 0, so the noisy pixel is (2, 2). At pixel (2, 2) apply (i) the 3 x 3 average (blurring) mask with all coefficients 1/9 and (ii) the 3 x 3 median filter. Round to the nearest integer and say which output is better. (6 pts)

```
52 55 58 60 61
54 57 59 62 63
55 58 255 63 64
57 60 62 65 66
58 61 64 66 68
```

**Answer**

**Source:** L11 p.14 applying a mask (weighted sum at the centre) · L11 p.16 blurring, 1/9 mask · L11 p.53 median vs low-pass filter · L11 p.55 median method  
**Notes:** [Lecture 11 › Blurring: Average and Gaussian Masks](../notes/11_Week6_Spatial_Filtering_Edges.md#4-blurring-average-and-gaussian-masks-slides-16-19) · [Lecture 11 › Median and Color Median Filtering](../notes/11_Week6_Spatial_Filtering_Edges.md#13-median-and-color-median-filtering-slides-53-59)

**(a) Write:**
- **Blurring** = low-pass spatial filtering. It "removes the finer details of an image" and is done by convolution. In the common blurring mask "all convolution coefficients are equal" (3 x 3: 1/9 each); "the bigger the mask, the greater the blurring effect". It is linear: the output is the mean of the window. A low-pass filter is "suited for removing **Gaussian noise**, but not impulse noise", and it also blurs edges.
- **Median filter**: sort the pixels in the window and replace the centre with the middle value. It is non-linear. It is "an effective method for removing **impulse noise**" (salt and pepper) and it "preserves sharp edges and detail". "Median filter is superior to lowpass filter when dealing with edges."
- So use averaging for Gaussian noise, and use the median for salt and pepper noise or when edges must stay sharp.

**(b)** (2, 2) is an interior pixel, so the full 3 x 3 window is available and no border rule is needed. Window:

```
57  59  62
58 255  63
60  62  65
```

- (i) Average: 57 + 59 + 62 + 58 + 255 + 63 + 60 + 62 + 65 = 741, and 741 / 9 = 82.33, so the output is **82**.
- (ii) Median: sorted 57, 58, 59, 60, **62**, 62, 63, 65, 255. The 5th of 9 values gives **62**.
- The 8 clean neighbours are about 61 (mean 60.75). The median (62) removes the salt pixel completely. The average (82) is still about 21 too bright because the 255 alone contributes 255/9 = 28.3 to the mean, so the noise is smeared rather than removed. **The median filter is better here.**

---

### Q3. Histogram equalization (10 pts)

A 3-bit image (L = 8, gray levels 0 to 7) of size 4 x 4:

```
1 2 2 3
2 1 3 3
2 2 4 3
1 2 3 6
```

(a) Calculate the histogram n_k for k = 0, ..., 7. (3 pts)

(b) Calculate the cumulative sum and the normalized sum of the histogram. (3 pts)

(c) Perform histogram equalization: give the mapping r_k -> s_k, the output image and the output histogram. (4 pts)

**Answer**

**Source:** L9 p.14 histogram definition · L9 p.20 goal and the 3 steps · L9 p.26 the result is not flat · L9 p.27-28 T(r) = (M/N^2) x integral of h · L9 p.29-31 worked example (factor 7/16, round to nearest)  
**Notes:** [Lecture 9 › Histogram](../notes/09_Week5_Intensity_Transforms_Histogram.md#5-histogram-slides-14-19) · [Lecture 9 › Histogram Equalization, Theory](../notes/09_Week5_Intensity_Transforms_Histogram.md#6-histogram-equalization-theory-slides-20-28) · [Lecture 9 › Histogram Equalization, Worked Example](../notes/09_Week5_Intensity_Transforms_Histogram.md#7-histogram-equalization-worked-example-slides-29-31)

**Write:**
- A histogram is "a simple bar graph that stands for pixel intensities": intensity on the x-axis and number of occurrences on the y-axis.
- HE steps: 1. compute the histogram; 2. calculate the normalized sum of the histogram; 3. transform the input image to the output image (LUT).
- Professor's convention: $s_k=\mathrm{round}\left(\frac{L-1}{N^2}\sum_{j=0}^{k}n_j\right)$ = round(cumulative sum x 7/16), rounded to the **nearest** integer. Here L - 1 = 7 and N^2 = 16.

| $r_k$ | (a) $n_k$ | $p_r=n_k/16$ | (b) cumulative sum | (b) normalized sum = cum x 7/16 | (c) $s_k$ |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |
| 1 | 3 | 0.1875 | 3 | 1.3125 | 1 |
| 2 | 6 | 0.375 | 9 | 3.9375 | 4 |
| 3 | 5 | 0.3125 | 14 | 6.125 | 6 |
| 4 | 1 | 0.0625 | 15 | 6.5625 | 7 |
| 5 | 0 | 0 | 15 | 6.5625 | 7 |
| 6 | 1 | 0.0625 | 16 | 7.0 | 7 |
| 7 | 0 | 0 | 16 | 7.0 | 7 |

- Check: the n_k add up to 16 pixels.
- **(c) Mapping (LUT for r = 0 to 7): `0 1 4 6 7 7 7 7`**

**Output image:**

```
1 4 4 6
4 1 6 6
4 4 7 6
1 4 6 7
```

- **Output histogram: n_1 = 3, n_4 = 6, n_6 = 5, n_7 = 2** (all other levels 0).
- Comment: the peak levels 2 and 3 move apart (to 4 and 6), so contrast is stretched near the histogram maxima. Input levels 4 and 6 both map to 7. The result is not flat (slide 26): with discrete levels HE can only move levels apart or merge them, never split one level into several.

---

### Q4. Pattern recognition system (10 pts)

(a) Draw the flow chart of a pattern recognition system, from the input to the decision. (6 pts)

(b) Explain each stage of the system in one line. (4 pts)

**Answer**

**Source:** L12 p.17 sensing, segmentation and grouping · L12 p.18 flowchart · L12 p.19 feature extraction, classification, post-processing · L12 p.20-21 design cycle  
**Notes:** [Lecture 12 › Pattern Recognition System Flowchart](../notes/12_Week7_Pattern_Recognition.md#4-pattern-recognition-system-flowchart-slides-17-19) · [Lecture 12 › The Design Cycle](../notes/12_Week7_Pattern_Recognition.md#5-the-design-cycle-slides-20-27)

**(a) Draw (slide 18, read bottom to top):**

```
                       decision
                           ^
                           |
              +------------------------+
              |    post-processing     |<------------- costs
              +------------------------+<---+
                  ^                :        |
                  |                v        +--------- adjustments for
              +========================+    |          context
              |     classification     |<---+
              +========================+<------------- adjustments for
                  ^                :                   missing features
                  |                v
              +------------------------+
              |   feature extraction   |
              +------------------------+
                  ^                :
                  |                v
              +------------------------+
              |      segmentation      |
              +------------------------+
                  ^                :
                  |                v
              +------------------------+
              |        sensing         |
              +------------------------+
                           ^
                           |
                         input
```

- The solid `^` arrows (black on the slide) are the data flowing up. The dotted `: v` arrows (gray on the slide) point down from each stage to the stage below it.
- Side inputs: **costs** go into post-processing; **adjustments for context** go into post-processing and classification; **adjustments for missing features** go into classification.

**(b) One line per stage (slide wording):**
- **Sensing**: "use of a transducer (camera or microphone)"; the system depends on the transducer's bandwidth, resolution, sensitivity and distortion.
- **Segmentation and grouping**: isolate each pattern from the others and from the background; "patterns should be well separated and should not overlap".
- **Feature extraction**: measure "discriminative features" that are "invariant with respect to translation, rotation and scale" (fish example: length, lightness, width).
- **Classification**: "use a feature vector provided by a feature extractor to assign the object to a category".
- **Post-processing**: "exploit context input dependent information other than from the target pattern itself to improve performance" (it uses the costs of errors and the context), and then outputs the decision.

If the question asks for the **design cycle** (slide 21) instead: collect data -> choose features -> choose model -> train classifier -> evaluate classifier. Evaluation feeds back to the earlier steps, and "prior knowledge (e.g., invariances)" feeds into choosing features and choosing the model.

---

### Q5. Huffman coding (10 pts)

A source emits 5 symbols with these probabilities:

| Symbol | A | B | C | D | E |
|---|---|---|---|---|---|
| Probability | 0.40 | 0.25 | 0.15 | 0.12 | 0.08 |

(a) Build the Huffman tree and give the code of each symbol. (4 pts)

(b) Compute the average code length. (2 pts)

(c) Compute the entropy of the source. (2 pts)

(d) Compute the coding efficiency and compare it with a fixed-length code. (2 pts)

**Answer**

**Source:** L4 p.24-27 Huffman outline and Algorithm 7.1 (bottom-up) · L4 p.12 entropy · L4 p.26 average length and efficiency table · L4 p.30 properties ($\eta\le\bar l<\eta+1$)  
**Notes:** [Lecture 4 › Huffman Coding](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#8-huffman-coding-slides-24-29) · [Lecture 4 › Entropy: Basics of Information Theory](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#5-entropy-basics-of-information-theory-slides-12-13)  
**Video:** [Huffman coding step-by-step example (Pizzey Technology)](https://www.youtube.com/watch?v=iEm1NRyEe5c)

**Rules used:**
- Always merge the two smallest probabilities. This source has no ties.
- Labelling rule: at each merge the smaller node goes left = 0 and the larger goes right = 1.
- Any consistent 0/1 labelling gives the same code lengths, so it earns full marks.

**(a) Merge steps:**

| Step | Merge (smaller + larger) | New node | List after the step |
|---|---|---|---|
| 1 | E 0.08 + D 0.12 | ED 0.20 | A 0.40, B 0.25, ED 0.20, C 0.15 |
| 2 | C 0.15 + ED 0.20 | CED 0.35 | A 0.40, CED 0.35, B 0.25 |
| 3 | B 0.25 + CED 0.35 | BCED 0.60 | BCED 0.60, A 0.40 |
| 4 | A 0.40 + BCED 0.60 | root 1.00 | |

```
            (1.00)
           0/    \1
       A 0.40   (0.60)
               0/    \1
           B 0.25   (0.35)
                   0/    \1
               C 0.15   (0.20)
                       0/    \1
                   E 0.08   D 0.12
```

| Symbol | p | Code | Length |
|---|---|---|---|
| A | 0.40 | **0** | 1 |
| B | 0.25 | **10** | 2 |
| C | 0.15 | **110** | 3 |
| D | 0.12 | **1111** | 4 |
| E | 0.08 | **1110** | 4 |

- No code is a prefix of another. The two least frequent symbols (D, E) have the same length and differ only in the last bit.

**(b)** $\bar l=\sum p_i l_i$ = 0.40(1) + 0.25(2) + 0.15(3) + 0.12(4) + 0.08(4) = 0.40 + 0.50 + 0.45 + 0.48 + 0.32 = **2.15 bits/symbol**.

**(c)** $\eta=\sum p_i\log_2\frac{1}{p_i}$ (use $\log_2 x=\log_{10}x/0.30103$):

| Symbol | p | $\log_2(1/p)$ | $p\log_2(1/p)$ |
|---|---|---|---|
| A | 0.40 | 1.3219 | 0.5288 |
| B | 0.25 | 2.0000 | 0.5000 |
| C | 0.15 | 2.7370 | 0.4105 |
| D | 0.12 | 3.0589 | 0.3671 |
| E | 0.08 | 3.6439 | 0.2915 |
| | | sum | **2.0979 bits/symbol** |

- Bound check: $\eta\le\bar l<\eta+1$, i.e. 2.098 <= 2.15 < 3.098.

**(d)** Efficiency = $\eta/\bar l$ = 2.0979 / 2.15 = **0.9758 (97.6%)**.
- A fixed-length code for 5 symbols needs 3 bits (2^2 = 4 < 5 <= 8 = 2^3). Its efficiency is 2.0979 / 3 = 0.699 (69.9%).
- Huffman is 3 / 2.15 = 1.40 times shorter than the fixed-length code.

---

### Q6. Audio digitization (10 pts)

(a) Explain sampling and quantization. What is the difference between them? (4 pts)

(b) A stereo song is recorded at a sampling rate of 32 kHz with 16 bits per sample. It lasts 2 minutes.
- (i) Using the Nyquist theorem, what is the highest frequency this recording can represent? Is that enough for the full range of human hearing (up to 20 kHz)? (2 pts)
- (ii) Compute the bit rate. (2 pts)
- (iii) Compute the uncompressed file size in MB (1 MB = 10^6 bytes). (2 pts)

**Answer**

**Source:** L2 p.12 sampling definition · L2 p.14 sampling (time) vs quantization (amplitude) · L2 p.15 A/D and D/A · L2 p.29 quantization, 2^b levels · L2 p.34-35 bit rate · L2 p.47-48 Nyquist · L3 p.11 stereo doubles the data rate  
**Notes:** [Lecture 2 › Building Complex Signals and the Digitization Process](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#3-building-complex-signals-and-the-digitization-process-slides-12-15) · [Lecture 2 › Quantization](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#7-quantization-slides-29-33) · [Lecture 2 › Bit Rate](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#8-bit-rate-slides-34-35) · [Lecture 2 › Sampling Theorem and Nyquist](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#13-sampling-theorem-and-nyquist-slides-45-50)

**(a) Write:**
- **Sampling**: "using measurements only at evenly spaced time intervals"; the rate is the sampling frequency $f_s=1/T$, and the samples are $x_s(n)=x(nT)$. It digitizes the **time** axis.
- **Quantization**: "encoding the signal value at every sampled location with a predefined precision, defined by a number of levels".
  - b bits give $2^b$ levels with step $\delta=R/2^b$.
  - Q rounds each sample to the nearest level, so it always introduces an error (quantization noise, at most half a step).
  - It digitizes the **amplitude** axis.
- Difference: sampling makes the time axis discrete; quantization makes the amplitude axis discrete. A/D = sampling + quantization; D/A = interpolation.

**(b)**
- (i) Nyquist: $f_s>2f_{max}$, so $f_{max}<f_s/2$ = 32/2 = **16 kHz**.
  - This is **not** enough for hearing up to 20 kHz, which needs $f_s$ > 40 kHz (CD uses 44.1 kHz).
  - Content above 16 kHz would alias.
- (ii) Bit rate = $f_s$ x bits x channels = 32,000 x 16 x 2 = **1,024,000 bit/s = 1,024 kbps** (about 1.02 Mbps).
- (iii) 2 min = 120 s. 1,024,000 x 120 = 122,880,000 bits, and / 8 = 15,360,000 bytes = **15.36 MB**. (That is 14.65 MiB if 1 MiB = 2^20 bytes.)

---

### Q7. Digital image representation (10 pts)

(a) Define spatial resolution and intensity resolution. (4 pts)

(b) A gray scale image has 1024 x 768 pixels and 256 gray levels. How many bits per pixel (k) are needed, what is the range of gray values, and how much storage does the image need in bits and in bytes? (3 pts)

(c) The same image is re-quantized to 16 gray levels. Give the new k and the storage in bytes. What artifact appears in smooth regions, and why? (3 pts)

**Answer**

**Source:** L6 p.24 sampling (coordinates) vs quantization (amplitude) · L6 p.26 $0\le f\le L-1$, $L=2^k$ · L6 p.27-28 $b=M\times N\times k$ · L6 p.29 spatial resolution · L6 p.30 intensity resolution and false contouring  
**Notes:** [Lecture 6 › Sampling, Quantization and Dynamic Range](../notes/06_Week3_Image_Basics_Perception_Resampling.md#8-sampling-quantization-and-dynamic-range-slides-24-26) · [Lecture 6 › Representing and Storing a Digital Image](../notes/06_Week3_Image_Basics_Perception_Resampling.md#9-representing-and-storing-a-digital-image-slides-27-28) · [Lecture 6 › Spatial and Intensity Resolution, Isopreference Curves](../notes/06_Week3_Image_Basics_Perception_Resampling.md#10-spatial-and-intensity-resolution-isopreference-curves-slides-29-31)

**(a) Write:**
- **Spatial resolution** = the "smallest discernible detail" in an image.
  - It is measured in line pairs per unit distance or dots (pixels) per unit distance, e.g. dpi.
  - It is set by sampling (M x N). "Large image size itself does not mean high spatial resolution."
- **Intensity resolution** = the "smallest discernible change in intensity level".
  - It is given by the number of intensity levels, $L=2^k$, so it is set by quantization.

**(b)**
- 256 levels: $L=2^k$, so k = log2 256 = **8 bits/pixel**.
- Gray values run from **0 to 255** ($0\le f\le L-1$).
- Storage: $b=M\times N\times k$ = 1024 x 768 x 8 = **6,291,456 bits = 786,432 bytes** (768 KiB).

**(c)**
- 16 levels: k = log2 16 = **4**.
- Storage: b = 1024 x 768 x 4 = 3,145,728 bits = **393,216 bytes**, half of the 8-bit image.
- Artifact: **false contouring (banding)**. With only 16 levels, smooth gradual shading is forced into a few flat bands of constant gray, with visible false edges (contours) between them (slide 30 skull at 16 and 8 levels). Spatial resolution is unchanged; only intensity resolution drops.

---

### Q8. Edge detection (10 pts)

Sobel masks:

```
Mx:            My:
-1  0  1       -1 -2 -1
-2  0  2        0  0  0
-1  0  1        1  2  1
```

Image (5 x 5), rows and columns numbered from 0:

```
10 10 10 40 40
10 10 40 40 40
10 10 40 40 90
10 40 40 90 90
40 40 90 90 90
```

(a) Apply Mx and My at pixel (2, 2) to get Gx and Gy. (4 pts)

(b) Compute the gradient magnitude in both forms (square root form and absolute sum form) and the gradient direction. (4 pts)

(c) Why does the Sobel operator also smooth the image while it differentiates? (2 pts)

**Answer**

**Source:** L11 p.14 applying a mask · L11 p.43 Sobel definition and masks · L11 p.37 magnitude and direction formulas · L11 p.38 Roberts, Sobel and Prewitt properties · L11 p.44 Sobel advantages and limitations  
**Notes:** [Lecture 11 › First Order Derivative Operators: Roberts, Prewitt, Sobel, Frei Chen](../notes/11_Week6_Spatial_Filtering_Edges.md#8-first-order-derivative-operators-roberts-prewitt-sobel-frei-chen-slides-37-40-43-44)

Rule (slide 14): place the mask on the 3 x 3 window centred on (2, 2), multiply the matching positions and add (no flip). Window:

```
10 40 40
10 40 40
40 40 90
```

**(a)**
- $G_x$ (Mx) = (-10 + 40) + 2(-10 + 40) + (-40 + 90) = 30 + 60 + 50 = **140**.
- $G_y$ (My) = (40 + 2·40 + 90) - (10 + 2·40 + 40) = 210 - 130 = **80**.

**(b)**
- Square root form: $|G|=\sqrt{140^2+80^2}=\sqrt{19600+6400}=\sqrt{26000}$ = **161.25**.
- Absolute sum form: $|G_x|+|G_y|$ = 140 + 80 = **220**.
- Direction: $\theta=\tan^{-1}(G_y/G_x)=\tan^{-1}(80/140)=\tan^{-1}(0.5714)$ = **29.74 degrees**. This is the gradient direction, pointing toward the brighter pixels (down and right); the edge runs perpendicular to it.
- Sign check: with slide 37's $H_r$ = [1 0 -1; 2 0 -2; 1 0 -1], $G_x$ = -140 and θ = -29.74 degrees. With true (flipped) convolution both signs flip ($G_x$ = -140, $G_y$ = -80), so $\tan^{-1}(G_y/G_x)$ is again 29.74 degrees. The magnitude does not change.

**(c)**
- (textbook context) Each Sobel mask is a smoothing filter times a difference filter: Mx = [1 2 1]^T x [-1 0 1].
  - It takes a central difference across the edge.
  - At the same time it takes a weighted average [1 2 1] of three rows along the edge, with the centre row weighted 2.
- This built-in averaging (low-pass) reduces noise. The 2 x 2 Roberts operator has a "smaller effective area" and is "more susceptible to noise" (slide 38).
- Sobel is still listed as "highly sensitive to noise" (slide 44) compared with detectors that smooth first, such as LoG.

---

## Score check

| Q | Max pts | What earns the points |
|---|---|---|
| 1 | 10 | (a) 5: non-linear shape-based definition, SE (size, shape, origin), dilation formula or "overlap by at least one element" / local max. (b) 5: the correct 7 x 7 result with 28 ones. |
| 2 | 10 | (a) 4: low-pass suits Gaussian noise and blurs edges; median suits impulse noise and keeps edges. (b) 6: window, 741/9 = 82, sorted list with median 62, median is better. |
| 3 | 10 | (a) 3: n_k = 0 3 6 5 1 0 1 0. (b) 3: cumulative 0 3 9 14 15 15 16 16 and x 7/16 values. (c) 4: LUT 0 1 4 6 7 7 7 7, output image, output histogram. |
| 4 | 10 | (a) 6: five boxes in order from input to decision, arrows, and the three side inputs. (b) 4: one correct line for each of the five stages. |
| 5 | 10 | (a) 4: merge order, tree, codes 0 / 10 / 110 / 1111 / 1110. (b) 2: 2.15. (c) 2: 2.098. (d) 2: 97.6% vs 69.9% for 3-bit fixed. |
| 6 | 10 | (a) 4: sampling = time, quantization = amplitude with 2^b levels, A/D = both. (b) 6: < 16 kHz and not enough; 1,024 kbps; 15.36 MB. |
| 7 | 10 | (a) 4: both definitions with their units (dpi / number of levels). (b) 3: k = 8, 0-255, 6,291,456 bits = 786,432 bytes. (c) 3: k = 4, 393,216 bytes, false contouring explained. |
| 8 | 10 | (a) 4: Gx = 140, Gy = 80. (b) 4: 161.25, 220, 29.74 degrees. (c) 2: [1 2 1] averaging x difference, less noise than Roberts. |
