# Multimedia Computing: Midterm Sample 2

Lectures 2-12 (not 1, 8, 13) · 100 pts · Part 1: 10 x 2 = 20 · Part 2: 8 x 10 = 80 · Answer and explanation under each question

Coordinates are (row, col), 0-based, top-left = (0,0).

## Part 1: Multiple choice (10 x 2 = 20 pts)

**1.** An analog audio signal contains frequencies up to 12 kHz. Which sampling rate will cause aliasing?  
a) 48 kHz  
b) 30 kHz  
c) 25 kHz  
d) 20 kHz

> **Answer: d)** Need $f_s > 2f_{max} = 24$ kHz. 20 kHz is below that, so it undersamples and aliases; 25 kHz is (just) enough.  
> **Source:** L2 p.47 sample at more than twice the highest frequency · L2 p.51 undersampling causes aliasing  
> **Notes:** [Lecture 2 › Sampling theorem and Nyquist](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#13-sampling-theorem-and-nyquist-slides-45-50) · [Lecture 2 › Aliasing](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#14-aliasing-undersampling-spatial-and-temporal-slides-51-55)

**2.** How many MIDI channels are there, and where is the channel number stored in a channel message?  
a) 16 channels (0 to 15), in the four low-order bits of the status byte  
b) 16 channels (0 to 15), in the four most significant bits of the status byte  
c) 8 channels, in the three message bits of the status byte  
d) 128 channels, in the first data byte

> **Answer: a)** "16 channels, numbered from 0 to 15"; status byte = `1ttt nnnn`, channel = the four low-order bits. The 3 middle bits hold the message type, not the channel.  
> **Source:** L3 p.18 16 MIDI channels, 0 to 15 · L3 p.35 channel number in the four low-order bits of the status byte  
> **Notes:** [Lecture 3 › MIDI basics](../notes/03_Week2_Audio_SNR_MIDI_PCM.md#7-midi-basics-concepts-and-terminology-slides-15-24) · [Lecture 3 › Structure of MIDI messages](../notes/03_Week2_Audio_SNR_MIDI_PCM.md#10-structure-of-midi-messages-slides-35-39)

**3.** A source emits 8 different symbols. Its entropy is largest when ... , and the largest value is ...  
a) one symbol has probability close to 1; 3 bits/symbol  
b) all symbols are equally likely; 8 bits/symbol  
c) all symbols are equally likely; 3 bits/symbol  
d) all symbols are equally likely; 1 bit/symbol

> **Answer: c)** Entropy is largest when all symbols are equally likely: $\log_2 8 = 3$ bits/symbol. 8 is the number of symbols, not bits (8 bits needs 256 equally likely levels).  
> **Source:** L4 p.12 entropy formula · L4 p.13 a uniform distribution gives the maximum (log2 256 = 8)  
> **Notes:** [Lecture 4 › Entropy](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#5-entropy-basics-of-information-theory-slides-12-13)

**4.** Which statement about frequency masking, as used by MPEG audio (MP3), is true?  
a) A higher tone masks a lower tone better than the reverse  
b) A lower tone can mask a higher tone  
c) Two tones that are widely separated in frequency mask each other strongly  
d) The weaker the masking tone, the wider the range of frequencies it masks

> **Answer: b)** "A lower tone can mask a higher tone"; the reverse is not true. A stronger masker masks a wider range; widely separated tones give little masking.  
> **Source:** L5 p.14 frequency masking  
> **Notes:** [Lecture 5 › Psychoacoustics: masking](../notes/05_Week3_ArithmeticCoding_LossyCompression_MPEG.md#7-psychoacoustics-masking-and-threshold-of-hearing-slides-14-16-33-36)

**5.** When an image is resampled, bilinear interpolation computes each new pixel from how many nearest original pixels?  
a) 1  
b) 4  
c) 9  
d) 16

> **Answer: b)** Bilinear uses the 2x2 = 4 nearest pixels. Nearest neighbour uses 1, bicubic 16 (the slide only lists the methods; the counts are textbook context).  
> **Source:** L6 p.36 resampling and interpolation methods (pixel counts are textbook context)  
> **Notes:** [Lecture 6 › Image resampling and interpolation](../notes/06_Week3_Image_Basics_Perception_Resampling.md#12-image-resampling-and-interpolation-slide-36)

**6.** Why is m-adjacency (mixed adjacency) used?  
a) To eliminate the multiple path connections that arise with 8-adjacency  
b) To connect two pixels even when one of their values is not in V  
c) To make every diagonal neighbour adjacent, exactly as 8-adjacency does  
d) To measure the city-block (D4) distance between two pixels

> **Answer: a)** "m-connectivity eliminates the multiple path connections that arises in 8-connectivity." Both pixels must still be in V, and some diagonals are dropped, so b) and c) are wrong.  
> **Source:** L7 p.23 m-connectivity definition · L7 p.24 m-connectivity removes the multiple paths of 8-connectivity  
> **Notes:** [Lecture 7 › Connectivity and adjacency](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#5-connectivity-and-adjacency-4-8-and-m-slides-22-24-26)

**7.** A 3-bit image is passed through the look-up table (LUT) below. What does a pixel with value 5 become?

| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| Output | 1 | 2 | 3 | 3 | 4 | 6 | 7 | 7 |

a) 4  
b) 5  
c) 6  
d) 7

> **Answer: c)** The pixel value is the array index: LUT[5] = 6. a) is the 1-based slip (5th entry = 4).  
> **Source:** L9 p.9 LUT definition · L9 p.10-11 pixel value as the array index, 3-bit LUT  
> **Notes:** [Lecture 9 › Lookup tables](../notes/09_Week5_Intensity_Transforms_Histogram.md#3-lookup-tables-slides-9-12)

**8.** Morphological closing of a binary image with a small structuring element is:  
a) an erosion followed by a dilation; it removes small bright spots  
b) a dilation followed by an erosion; it removes thin protrusions and breaks narrow isthmuses  
c) an erosion followed by a dilation; it fills small holes  
d) a dilation followed by an erosion; it fills small holes (dark spots) and narrow gaps

> **Answer: d)** Closing = dilation followed by erosion; it "removes small dark spots", fills small holes and gaps. b) describes opening.  
> **Source:** L10 p.28 closing = dilation then erosion, removes small dark spots · L10 p.29 opening vs closing effects  
> **Notes:** [Lecture 10 › Opening and closing](../notes/10_Week5_Morphology.md#5-opening-and-closing-slides-26-35)

**9.** Which filter is best for removing salt-and-pepper (impulse) noise while preserving edges?  
a) 3x3 average (low-pass) filter  
b) Median filter  
c) Max filter  
d) Laplacian filter

> **Answer: b)** Median: "an effective method for removing impulse noise" that preserves sharp edges. Low-pass suits Gaussian noise; max removes only dark spikes, and min/max fail on mixed impulse noise.  
> **Source:** L11 p.53 median vs low-pass filter · L11 p.60 min/max filtering  
> **Notes:** [Lecture 11 › Median and color median filtering](../notes/11_Week6_Spatial_Filtering_Edges.md#13-median-and-color-median-filtering-slides-53-59) · [Lecture 11 › Minimum and maximum filtering](../notes/11_Week6_Spatial_Filtering_Edges.md#14-minimum-and-maximum-filtering-slide-60)

**10.** In a statistical pattern recognition system, the "reject class" is:  
a) the class with the largest number of training samples  
b) the set of pixels removed during segmentation  
c) a generic class for objects that are not in any of the designated known classes  
d) the cluster that unsupervised learning forms first

> **Answer: c)** Reject class: "a generic class for objects not in any of the designated known classes". The classifier assigns a class or "reject".  
> **Source:** L12 p.31 classifier assigns a class or "reject" · L12 p.36 reject class definition  
> **Notes:** [Lecture 12 › Learning, statistical and structural PR](../notes/12_Week7_Pattern_Recognition.md#6-learning-statistical-and-structural-pr-slides-28-31) · [Lecture 12 › Feature vectors and terminology](../notes/12_Week7_Pattern_Recognition.md#7-feature-vectors-character-features-and-terminology-slides-32-34-36)

## Part 2: Short questions (8 x 10 = 80 pts)

### Q1. Morphology: erosion (10 pts)

(a) What is erosion? Define the erosion of a binary image A by a structuring element B (set notation or words) and state the duality between erosion and dilation. (5 pts)

(b) Apply erosion on image A using the structuring element B. The origin of B is its centre pixel, marked [1]. Pixels outside the image are 0. (5 pts)

Image A (7x7):

```
1 1 1 0 0 0 0
1 1 1 1 0 0 0
1 1 1 1 1 0 0
0 1 1 1 1 1 0
0 1 1 1 1 1 0
0 0 1 1 1 1 0
0 0 0 0 0 0 1
```

Structuring element B (3x3):

```
1  1  1
1 [1] 1
1  1  1
```

**Answer**

**Source:** L10 p.3 morphology definition · L10 p.15-18 erosion effect and local minimum · L10 p.23-25 erosion definition and duality · L10 p.6 fit  
**Notes:** [Lecture 10 › Erosion](../notes/10_Week5_Morphology.md#4-erosion-slides-15-19-23-25) · [Lecture 10 › Basic concepts and structuring element](../notes/10_Week5_Morphology.md#1-basic-concepts-and-structuring-element-slides-2-6)

**(a) Write:**
- Morphology = "a collection of non-linear operations related to the shape or morphology of features in an image".
- Erosion "erodes away the boundaries of regions of foreground pixels": areas of foreground pixels shrink, and holes inside them become larger. It takes the **local minimum** over the SE area.
- Definition: $A\ominus B=\lbrace z \mid (B)_z\subseteq A\rbrace$, i.e. "the set of all points z such that B, translated by z, is contained in A" (the slide prints $(\hat B)_z$; the same for a symmetric B). In practice: output = 1 only where the SE **fits** (every 1 of B lies on a 1 of A).
- Duality: $(A\ominus B)^c=A^c\oplus\hat B$. Eroding the object = dilating the background with the reflected SE, then taking the complement.
  - Proof line: $(A\ominus B)^c=\lbrace z \mid (B)_z\subseteq A\rbrace^c=\lbrace z \mid (B)_z\cap A^c=\varnothing\rbrace^c=\lbrace z \mid (B)_z\cap A^c\neq\varnothing\rbrace=A^c\oplus\hat B$

**(b) Working.** Rule: (r,c) becomes 1 only if all 9 pixels of the 3x3 window centred at (r,c) are 1 (outside = 0).
- A 0 pixel can never become 1 (the window includes the centre).
- Row 0, row 6, column 0 and column 6: the window reaches outside the image (= 0), so all become 0. This removes the top-left 1s and the isolated pixel (6,6).
- Interior 1-pixels:

| Row | Pixels that stay 1 (window all 1) | Pixels that become 0 (a 0 in the window) |
|---|---|---|
| 1 | (1,1): rows 0-2, cols 0-2 all 1 | (1,2) and (1,3): (0,3) = 0 |
| 2 | (2,2): rows 1-3, cols 1-3 all 1 | (2,1): (3,0) = 0; (2,3), (2,4): (1,4) = 0 |
| 3 | (3,2), (3,3) | (3,1): (3,0) = 0; (3,4), (3,5): (2,5) = 0 |
| 4 | (4,3), (4,4) | (4,1): (3,0) = 0; (4,2): (5,1) = 0; (4,5): (3,6) = 0 |
| 5 | none | (5,2) to (5,5): row 6 below is 0 |

**Result $A\ominus B$ (27 ones become 6):**

```
0 0 0 0 0 0 0
0 1 0 0 0 0 0
0 0 1 0 0 0 0
0 0 1 1 0 0 0
0 0 0 1 1 0 0
0 0 0 0 0 0 0
0 0 0 0 0 0 0
```

- Check: dilating this result with B (= the opening $A\circ B$) gives back A without the isolated pixel (6,6). The opening removes only what is smaller than B.

---

### Q2. Filtering: sharpening (10 pts)

(a) What does sharpening do to an image? Why does a sharpening mask sum to 1, while a high-pass mask sums to 0? (4 pts)

(b) For the 8-bit image f below, apply the Laplacian mask L and the sharpening mask S at the pixel in row 2, column 2 (rows and columns are counted from 0; the pixel value is 180). Clip each result to 0..255. (6 pts)

Image f (5x5):

```
100 110 120 130 140
105  90 140  70 135
110 120 180 150 130
115  60 130 200 125
120 125 130 135 140
```

Laplacian L:

```
 0 -1  0
-1  4 -1
 0 -1  0
```

Sharpening S:

```
 0 -1  0
-1  5 -1
 0 -1  0
```

**Answer**

**Source:** L11 p.20 sharpening and sharpening masks · L11 p.21 high pass filter · L11 p.45 Laplacian masks · L11 p.14 applying a mask  
**Notes:** [Lecture 11 › Sharpening](../notes/11_Week6_Spatial_Filtering_Edges.md#5-sharpening-high-pass-unsharp-masking-high-boost-slides-20-26) · [Lecture 11 › Laplacian](../notes/11_Week6_Spatial_Filtering_Edges.md#10-second-order-operators-laplacian-and-zero-crossing-slides-45-47)

**(a) Write:**
- "Sharpening has the opposite affect of blurring." Also called **crispening**, it "emphasizes the details in an image" and **increases its contrast**.
- Sharpening mask `[0 -1 0; -1 5 -1; 0 -1 0]` sums to **1**: in a flat area the output equals the input, so brightness is kept and only the details (edges) are boosted. It equals identity + Laplacian.
- High-pass mask (1/9) x `[-1 -1 -1; -1 8 -1; -1 -1 -1]` sums to **0**: a flat area becomes 0. It "removes the low frequency components and shows only high detail", so the result is a black image with bright edges.
- Example: flat area of 90 gives 90 with the sharpening mask and 0 with the high-pass (or Laplacian) mask.

**(b) Working.** Pixel (2,2) = 180. Its 3x3 window:

```
 90 140  70
120 180 150
 60 130 200
```

- Only the centre and its 4-neighbours count: up 140, left 120, right 150, down 130, sum = 540. The corners (90, 70, 60, 200) are multiplied by 0.
- Laplacian: $4(180)-540=720-540=180$. It is inside 0..255, so **L = 180**.
- Sharpening: $5(180)-540=900-540=360$, clipped to **S = 255**.
- Check: sharpening = original + Laplacian = 180 + 180 = 360, then clipped to 255.

---

### Q3. Histogram equalization (10 pts)

A 3-bit image (L = 8 gray levels) of size 8x8 (64 pixels) has this histogram:

| $r_k$ | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| $n_k$ | 6 | 14 | 18 | 10 | 7 | 5 | 3 | 1 |

(a) Equalize the histogram. Give the full table: $r_k$, $n_k$, cumulative sum, normalized (scaled) sum, and the new level $s_k$. (7 pts)

(b) Give the histogram of the equalized image. Is it flat? Explain why or why not. (3 pts)

**Answer**

**Source:** L9 p.20 steps of H.E. · L9 p.26 effects · L9 p.27-28 mapping · L9 p.29-31 worked example (factor 7/16)  
**Notes:** [Lecture 9 › Histogram equalization, theory](../notes/09_Week5_Intensity_Transforms_Histogram.md#6-histogram-equalization-theory-slides-20-28) · [Lecture 9 › Histogram equalization, worked example](../notes/09_Week5_Intensity_Transforms_Histogram.md#7-histogram-equalization-worked-example-slides-29-31)

**Write:** Steps: 1. compute the histogram; 2. calculate the **normalized sum** of the histogram; 3. transform input to output with a LUT. Rule (slide convention, $L-1 = 7$, $MN = 64$ pixels):

$$s_k=\mathrm{round}\left(\frac{L-1}{MN}\sum_{j=0}^{k}n_j\right)=\mathrm{round}\left(\frac{7}{64}\times\text{cumulative sum}\right)$$

Round to the nearest integer (as on slides 30-31, where 4.81 becomes 5).

**(a) Table:**

| $r_k$ | $n_k$ | cumulative sum | 7 x sum | normalized sum = 7 x sum / 64 | $s_k$ |
|---|---|---|---|---|---|
| 0 | 6 | 6 | 42 | 0.656 | **1** |
| 1 | 14 | 20 | 140 | 2.188 | **2** |
| 2 | 18 | 38 | 266 | 4.156 | **4** |
| 3 | 10 | 48 | 336 | 5.250 | **5** |
| 4 | 7 | 55 | 385 | 6.016 | **6** |
| 5 | 5 | 60 | 420 | 6.563 | **7** |
| 6 | 3 | 63 | 441 | 6.891 | **7** |
| 7 | 1 | 64 | 448 | 7.000 | **7** |

LUT: **0→1, 1→2, 2→4, 3→5, 4→6, 5→7, 6→7, 7→7**.

**(b) New histogram** (add the $n_k$ that map to the same $s_k$):

| $s$ | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| $n_s$ | 0 | 6 | 14 | 0 | 18 | 10 | 7 | **9** (5+3+1) |

- Total is still 64. **Not flat**: levels 5, 6, 7 merge into 7, and levels 0 and 3 stay empty.
- Why: in the discrete case, H.E. moves whole levels; it cannot split one level into several. "The resulting histogram is not flat" (slide 26). It still spreads the dark image (most pixels at 0-3) over the range 1-7, so contrast improves (mean level 2.47 becomes 4.08).

---

### Q4. Pattern recognition: design cycle (10 pts)

(a) Draw the flow chart of the design cycle of a pattern recognition system, and explain each step in one line. (5 pts)

(b) Explain the difference between supervised and unsupervised learning, and between statistical and structural pattern recognition. (5 pts)

**Answer**

**Source:** L12 p.20-27 design cycle (flow chart on p.21) · L12 p.28 learning and adaptation · L12 p.29-30 statistical vs structural PR  
**Notes:** [Lecture 12 › The design cycle](../notes/12_Week7_Pattern_Recognition.md#5-the-design-cycle-slides-20-27) · [Lecture 12 › Learning, statistical and structural PR](../notes/12_Week7_Pattern_Recognition.md#6-learning-statistical-and-structural-pr-slides-28-31)

**(a) Draw** (slide 21):

```
                           start
                             |
                             v
                  +---------------------+
                  |    collect data     |<-------------+
                  +---------------------+              |
                             |                         |
                             v                         |
 prior knowledge  +---------------------+              |
 (e.g.,  -------->|   choose features   |<-------------+
 invariances)     +---------------------+              |
         \                   |                         |
          \                  v                         |
           \      +---------------------+              |
            ----->|    choose model     |<-------------+
                  +---------------------+              |
                             |                         |
                             v                         |
                  +---------------------+              |
                  |  train classifier   |<-------------+
                  +---------------------+              |
                             |                         |
                             v                         |
                  +---------------------+              |
                  | evaluate classifier |--------------+
                  +---------------------+
                             |
                             v
                            end
```

- Feedback: evaluation can send the designer back to any earlier step. Prior knowledge (e.g. invariances) feeds feature choice and model choice.
- One line per step (slides 22-27):
  - **Data collection**: is the set of examples "adequately large and representative" for training and testing?
  - **Feature choice**: depends on the problem domain; features should be "simple to extract, invariant to irrelevant transformation, insensitive to noise".
  - **Model choice**: if performance is unsatisfactory, "jump to another class of model".
  - **Training**: "use data to determine the classifier".
  - **Evaluation**: "measure the error rate (or performance)" and switch features or model if needed.
  - **Computational complexity**: "trade-off between computational ease and performance"; how the algorithm scales with the number of features, patterns or categories.

**(b) Write:**

| | Meaning (slide wording) | Example |
|---|---|---|
| Supervised learning | "A teacher provides a category label or cost for each pattern in the training set" | fish samples labelled salmon / sea bass |
| Unsupervised learning | "The system forms clusters or natural groupings of the input patterns" (no labels) | group unlabelled fish by length and lightness |
| Statistical PR | "The data is reduced to vectors of numbers and statistical techniques are used" | feature vector $X=[x_1,\dots,x_n]$, nearest class mean |
| Structural PR | "The data is converted to a discrete structure (such as a grammar or a graph)"; techniques are "parsing and graph matching" | a character described by its strokes and how they connect |

---

### Q5. Compression: LZW (10 pts)

(a) Encode the string `ABBABBBABBAB` with LZW. The initial dictionary is A = 1, B = 2. Show the table (s, c, output, code, string) and give the output code sequence. (6 pts)

(b) Decode the LZW code sequence `2 2 1 4 6 1` with the same initial dictionary (A = 1, B = 2). Show the dictionary as it is built and give the decoded string. (4 pts)

**Answer**

**Source:** L4 p.37-39 LZW idea and Algorithm 7.2 · L4 p.42-43 decoding (Algorithm 7.3) · L4 p.44 modified decoder with the exception  
**Notes:** [Lecture 4 › LZW dictionary coding](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#11-lzw-dictionary-coding-slides-37-45)

**Write:** LZW uses fixed-length codes for variable-length strings. Encoder: `s = next char; while not EOF { c = next char; if s+c in dict: s = s+c; else { output code(s); add s+c; s = c } } output code(s)`.

**(a) Encode `ABBABBBABBAB`:**

| s | c | output | code | string |
|---|---|---|---|---|
| A | B | 1 | 3 | AB |
| B | B | 2 | 4 | BB |
| B | A | 2 | 5 | BA |
| A | B | | | |
| AB | B | 3 | 6 | ABB |
| B | B | | | |
| BB | A | 4 | 7 | BBA |
| A | B | | | |
| AB | B | | | |
| ABB | A | 6 | 8 | ABBA |
| A | B | | | |
| AB | EOF | 3 | | |

**Output: 1 2 2 3 4 6 3** (12 characters in 7 codes, ratio 12/7 = 1.71 in symbols). Final dictionary: 3 AB, 4 BB, 5 BA, 6 ABB, 7 BBA, 8 ABBA.

**(b) Decode `2 2 1 4 6 1`:** each step outputs the entry and adds s + entry[0]. If the code is not in the dictionary yet, use entry = s + s[0] (Algorithm 7.4).

| s | k | entry / output | code | string |
|---|---|---|---|---|
| NIL | 2 | B | | |
| B | 2 | B | 3 | BB |
| B | 1 | A | 4 | BA |
| A | 4 | BA | 5 | AB |
| BA | 6 | **BAB** (6 not defined yet: BA + B) | 6 | BAB |
| BAB | 1 | A | 7 | BABA |

**Decoded string: BBABABABA** (9 characters). Check: encoding BBABABABA gives 2 2 1 4 6 1 again.

---

### Q6. Audio quality: SNR and SQNR (10 pts)

(a) A signal has a voltage of 5 V and the noise voltage is 0.25 V. Compute the SNR in dB. A second system has a signal power of 2 W and a noise power of 0.5 mW; compute its SNR in dB. Why is the factor 20 in the first case and 10 in the second? (4 pts)

(b) Using SQNR = 6.02N dB: (6 pts)
1. What is the SQNR of a 12-bit quantizer?
2. What is the minimum number of bits per sample for an SQNR of at least 50 dB? How many quantization levels does that give?
3. With that number of bits and an input range of 0 to 2 V, what are the quantization step and the maximum quantization error?

**Answer**

**Source:** L3 p.4-6 SNR · L3 p.7-9 SQNR and quantization noise · L2 p.29 quantization  
**Notes:** [Lecture 3 › SNR](../notes/03_Week2_Audio_SNR_MIDI_PCM.md#2-signal-to-noise-ratio-snr-slides-4-6) · [Lecture 3 › SQNR](../notes/03_Week2_Audio_SNR_MIDI_PCM.md#3-signal-to-quantization-noise-ratio-sqnr-slides-7-9) · [Lecture 2 › Quantization](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#7-quantization-slides-29-33)

**(a) Write:** SNR = "the ratio of the power of the correct signal to the noise", in dB.
- Voltages: $\mathrm{SNR}=20\log_{10}\frac{V_s}{V_n}=20\log_{10}\frac{5}{0.25}=20\log_{10}20=$ **26.02 dB**.
- Powers: $\mathrm{SNR}=10\log_{10}\frac{P_s}{P_n}=10\log_{10}\frac{2}{0.0005}=10\log_{10}4000=$ **36.02 dB**.
- Why: "the power in a signal is proportional to the square of the voltage", so $10\log_{10}\frac{V_s^2}{V_n^2}=20\log_{10}\frac{V_s}{V_n}$. Use 10 log for power ratios and 20 log for voltage ratios.

**(b) Write:** $SQNR=20\log_{10}\frac{2^{N-1}}{1/2}=20N\log_{10}2=6.02N$ dB, about 6 dB per bit. Quantization error is at most half of the interval.
1. 12 bits: $6.02\times12=$ **72.24 dB**.
2. $6.02N\ge50$ gives $N\ge50/6.02=8.31$, so **N = 9 bits** (8 bits give only 48.16 dB; 9 bits give 54.18 dB). Levels $2^9=$ **512**.
3. Step $=2\text{ V}/512=$ **0.0039 V (3.91 mV)**. Maximum error = half a step = **0.00195 V (1.95 mV)**.

---

### Q7. Pixel relationships (10 pts)

Image f (5x5). Coordinates are (row, column) with the origin (0,0) at the top-left. Use V = {1, 2}.

```
3 1 2 0 1
0 2 1 1 0
1 0 2 2 3
2 1 0 3 1
0 3 1 2 2
```

(a) List $N_4(p)$, $N_D(p)$ and $N_8(p)$ for p = (1,3). (3 pts)

(b) Compute the $D_4$ (city-block), $D_8$ (chessboard) and Euclidean distances between (4,0) and (1,2). (3 pts)

(c) For each pair, say whether the two pixels are 4-adjacent, 8-adjacent and m-adjacent, and justify the m-adjacency answers: (i) (2,2) and (2,3); (ii) (1,1) and (2,2); (iii) (3,1) and (4,2); (iv) (2,3) and (2,4). (4 pts)

**Answer**

**Source:** L7 p.21 neighbours of a pixel · L7 p.22-24 4-, 8- and m-connectivity · L7 p.30-33 distance measures  
**Notes:** [Lecture 7 › Neighbors of a pixel](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#4-neighbors-of-a-pixel-slide-21) · [Lecture 7 › Connectivity and adjacency](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#5-connectivity-and-adjacency-4-8-and-m-slides-22-24-26) · [Lecture 7 › Distance measures](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#7-distance-measures-slides-30-34)

**(a)** For p = (x, y) = (1,3):
- $N_4(p)=\lbrace(x+1,y),(x-1,y),(x,y+1),(x,y-1)\rbrace=$ **{(2,3), (0,3), (1,4), (1,2)}**
- $N_D(p)=\lbrace(x+1,y+1),(x+1,y-1),(x-1,y+1),(x-1,y-1)\rbrace=$ **{(2,4), (2,2), (0,4), (0,2)}**
- $N_8(p)=N_4(p)\cup N_D(p)=$ **all 8 pixels above**. Neighbours depend only on coordinates, not on values.

**(b)** p = (x, y) = (4,0), q = (s, t) = (1,2): |x - s| = 3, |y - t| = 2.
- $D_4=|x-s|+|y-t|=3+2=$ **5**
- $D_8=\max(|x-s|,|y-t|)=\max(3,2)=$ **3**
- $D_e=\sqrt{3^2+2^2}=\sqrt{13}=$ **3.61**
- Check: $D_8\le D_e\le D_4$.

**(c) Write the rule:** p, q with values in V are 4-adjacent if $q\in N_4(p)$, 8-adjacent if $q\in N_8(p)$, and m-adjacent if $q\in N_4(p)$, **or** $q\in N_D(p)$ and $N_4(p)\cap N_4(q)$ has no pixel whose value is in V.

| Pair | Values | 4-adj | 8-adj | m-adj | Reason |
|---|---|---|---|---|---|
| (i) (2,2)-(2,3) | 2, 2 | **yes** | **yes** | **yes** | horizontal 4-neighbours, both in V |
| (ii) (1,1)-(2,2) | 2, 2 | **no** | **yes** | **no** | diagonal; common 4-neighbours (1,2) = 1 and (2,1) = 0; (1,2) is in V, so the diagonal link is dropped (the path (1,1)-(1,2)-(2,2) already exists) |
| (iii) (3,1)-(4,2) | 1, 1 | **no** | **yes** | **yes** | diagonal; common 4-neighbours (3,2) = 0 and (4,1) = 3, neither in V |
| (iv) (2,3)-(2,4) | 2, 3 | **no** | **no** | **no** | 3 is not in V, so no adjacency at all |

---

### Q8. Color: CIE XYZ and chromaticity (10 pts)

(a) Why did the CIE define the XYZ color system instead of using CIE-RGB directly? What are chromaticity coordinates? (4 pts)

(b) Two colors have tristimulus values C1 = (X, Y, Z) = (48, 42, 30) and C2 = (19, 20, 25). Compute the chromaticity coordinates x, y, z of each color. Which color is closer to the D65 white point (x, y) = (0.3127, 0.3290)? Which color is brighter? (6 pts)

**Answer**

**Source:** L7 p.42-45 CIE XYZ and the CIE criteria · L7 p.47 meaning of X, Y, Z · L7 p.54 chromaticity coordinates · L7 p.58 illuminants (D65 values from the Lecture 7 notebook)  
**Notes:** [Lecture 7 › CIE XYZ color coordinate system](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#10-cie-xyz-color-coordinate-system-slides-42-53) · [Lecture 7 › CIE chromaticity diagram](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#11-cie-chromaticity-diagram-illuminants-and-gamut-slides-54-60)

**(a) Write:**
- CIE-RGB (monochromatic primaries 700, 546.1, 435.8 nm) has a color matching function $\bar r(\lambda)$ that goes **negative**, so some colors need a negative amount of a primary.
- In 1931 the CIE defined XYZ, a linear transformation of CIE-RGB, so that XYZ tristimulus values can describe **any visible color**. Criteria: the CMFs are **non-negative** (3 positive values for any color); **equal amounts give white**; $\bar y$ matches the eye's luminous efficiency, so **Y = luminance**; the primaries are as tight as possible around the visible colors.
- Chromaticity coordinates: $x=\frac{X}{X+Y+Z}$, $y=\frac{Y}{X+Y+Z}$, $z=\frac{Z}{X+Y+Z}$, with $x+y+z=1$. Only (x, y) is plotted (the chromaticity diagram). Chromaticity specifies the quality of a color (hue and saturation) "regardless of its luminance".

**(b) Working:**

| Color | X + Y + Z | x | y | z | distance to D65 $\sqrt{(x-0.3127)^2+(y-0.3290)^2}$ |
|---|---|---|---|---|---|
| C1 (48, 42, 30) | 120 | 48/120 = **0.4000** | 42/120 = **0.3500** | 30/120 = **0.2500** | $\sqrt{0.0873^2+0.0210^2}=$ 0.0898 |
| C2 (19, 20, 25) | 64 | 19/64 = **0.2969** | 20/64 = **0.3125** | 25/64 = **0.3906** | $\sqrt{0.0158^2+0.0165^2}=$ 0.0229 |

- **C2 is closer to D65 white** (0.023 vs 0.090): an almost neutral, slightly bluish white. C1 has a large x, so it is shifted towards red/orange.
- **C1 is brighter** (Y = 42 vs Y = 20). Brightness is Y, which chromaticity ignores: a dim color can still be near white.

---

## Score check

| Q | Max pts | What earns the points |
|---|---|---|
| Q1 | 10 | (a) definition in set form or "B translated by z is contained in A" plus the shrinking effect (3), duality formula (2); (b) the correct 6-pixel result with zero padding (5), about -1 per wrong pixel |
| Q2 | 10 | (a) crispening and more contrast (2), sum 1 keeps flat areas vs sum 0 sends them to 0 (2); (b) window and N4 sum 540 (2), L = 180 (2), S = 360 clipped to 255 (2) |
| Q3 | 10 | (a) cumulative sums (2), factor 7/64 (2), rounded $s_k$ = 1 2 4 5 6 7 7 7 (3); (b) new histogram 0 6 14 0 18 10 7 9 (2), "not flat, levels merge" (1) |
| Q4 | 10 | (a) 5 boxes in order (2), feedback loop and prior knowledge arrows (1), one line per step (2); (b) supervised vs unsupervised (2.5), statistical vs structural (2.5) |
| Q5 | 10 | (a) correct table (4) and output 1 2 2 3 4 6 3 (2); (b) special case entry = s + s[0] = BAB (2), output BBABABABA (2) |
| Q6 | 10 | (a) 26.02 dB (1.5), 36.02 dB (1.5), power ∝ V² (1); (b) 72.24 dB (2), 9 bits and 512 levels (2), step 3.91 mV and max error 1.95 mV (2) |
| Q7 | 10 | (a) N4, ND, N8 (3); (b) D4 = 5, D8 = 3, De = 3.61 (3); (c) four rows of the table, with the m-adjacency reason (4) |
| Q8 | 10 | (a) negative $\bar r$ and the XYZ criteria (2), chromaticity formula and "regardless of luminance" (2); (b) both x, y, z triples (3), C2 closer to white with distances (2), C1 brighter by Y (1) |
