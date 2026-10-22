# Multimedia Computing: Midterm Sample 3

Lectures 2-12 (not 1, 8, 13) · 100 pts · Part 1: 10 x 2 = 20 · Part 2: 8 x 10 = 80 · Answer and explanation under each question

## Part 1: Multiple choice (10 x 2 = 20 pts)

**1.** A signal with range R = 4 V is quantized with b = 5 bits. How many quantization levels are there, and what is the quantization step?  
a) 5 levels, step 0.8 V  
b) 10 levels, step 0.4 V  
c) 32 levels, step 0.125 V  
d) 25 levels, step 0.16 V

> **Answer: c)** b bits give 2^b = 2^5 = 32 levels; step δ = R/2^b = 4/32 = 0.125 V. (a) uses b instead of 2^b.  
> Source: L2 p.29-30

**2.** Using SQNR = 6.02N dB, going from 8-bit to 12-bit audio samples raises the maximum SQNR by about:  
a) 4 dB  
b) 12 dB  
c) 48 dB  
d) 24 dB

> **Answer: d)** Each bit adds about 6 dB: 6.02 x 12 - 6.02 x 8 = 72.24 - 48.16 = 24.08 dB. (c) 48 dB is the 8-bit SQNR itself, not the gain.  
> Source: L3 p.9

**3.** LZW starts with the dictionary 1 = A, 2 = B. What is the output for the input string BABAA?  
a) 2 1 3 1  
b) 2 1 2 1 1  
c) 2 1 3 5  
d) 2 1 4 1

> **Answer: a)** (B,A) out 2, add 3 = BA; (A,B) out 1, add 4 = AB; (BA,A) out 3, add 5 = BAA; A at EOF, out 1. (c) wrongly emits the code that was only just added.  
> Source: L4 p.39-41

**4.** In lossy compression, the main source of the loss is:  
a) entropy coding (e.g. Huffman)  
b) quantization  
c) the transformation stage (e.g. prediction)  
d) run-length coding

> **Answer: b)** "Quantization ... main source of the loss in lossy compression." Huffman and run-length coding are lossless; the transformation is reversible.  
> Source: L5 p.13

**5.** On a background of intensity I = 200, the just noticeable difference is ΔIc = 4. The Weber ratio and its meaning are:  
a) 0.02, poor brightness discrimination  
b) 50, good brightness discrimination  
c) 0.02, good brightness discrimination  
d) 0.2, poor brightness discrimination

> **Answer: c)** Weber ratio = ΔIc/I = 4/200 = 0.02; a small ratio means good brightness discrimination. (b) inverts the ratio.  
> Source: L6 p.6-7

**6.** A color has tristimulus values X = 30, Y = 45, Z = 75. Its chromaticity coordinates are:  
a) x = 0.40, y = 0.60 (z is not used)  
b) x = 0.20, y = 0.30, z = 0.50, so x + y + z = 1  
c) x = 0.67, y = 1.00, z = 1.67  
d) x = 0.30, y = 0.45, z = 0.75, so x + y + z = 1.5

> **Answer: b)** x = X/(X+Y+Z) = 30/150 = 0.2, y = 45/150 = 0.3, z = 75/150 = 0.5; x + y + z = 1 always. (a) leaves Z out of the sum.  
> Source: L7 p.54

**7.** In histogram specification, T is the equalization of the input image and G is the equalization of the desired histogram. The output level z for an input level r is:  
a) z = G⁻¹[T(r)]  
b) z = T⁻¹[G(r)]  
c) z = G[T(r)]  
d) z = T[G⁻¹(r)]

> **Answer: a)** (1) s = T(r), (2) v = G(z), (3) z = G⁻¹(s) = G⁻¹[T(r)].  
> Source: L9 p.42

**8.** Which expression is the dilation of A by the structuring element B?  
a) {z | (B)z ⊆ A}  
b) (A ⊖ B) ⊕ B  
c) {z | (B̂)z ∩ A = ∅}  
d) {z | (B̂)z ∩ A ≠ ∅}

> **Answer: d)** Dilation = all z where the reflected, shifted B̂ and A overlap by at least one element. (a) is erosion, (b) is opening.  
> Source: L10 p.20

**9.** According to the lecture, the Sobel operator is:  
a) more sensitive to vertical and horizontal edges than to diagonal edges  
b) more sensitive to diagonal edges than to vertical and horizontal edges  
c) a second-order operator that produces double edges  
d) the operator with the smallest effective area, most susceptible to noise

> **Answer: b)** Slide: Sobel is "more sensitive to diagonal edges than vertical and horizontal edges". (a) is Prewitt, (c) the Laplacian, (d) Roberts.  
> Source: L11 p.38

**10.** In the pattern recognition system flow chart, which stage receives "costs" as an input and exploits context (input-dependent information other than from the target pattern itself) to improve performance?  
a) Segmentation  
b) Feature extraction  
c) Classification  
d) Post-processing

> **Answer: d)** Post-processing: "exploit context input dependent information other than from the target pattern itself to improve performance"; the "costs" arrow enters it. Classification gets context and missing-feature adjustments, not costs.  
> Source: L12 p.18-19

## Part 2: Short questions (8 x 10 = 80 pts)

### Q1. Morphology: opening (10 pts)

(a) What is morphological opening? Write its formula and state what it removes from a binary image. (4 pts)

(b) Apply opening to the 7x7 binary image A using the 3x3 structuring element B. Show the intermediate result and the final result. Rows and columns are numbered 0-6 from the top-left; pixels outside the image are 0. (6 pts)

```
A =
0 0 0 0 0 0 0
0 1 1 1 1 0 0
0 1 1 1 1 1 1
0 1 1 1 1 0 0
0 1 1 1 1 0 0
0 0 0 0 0 0 1
0 0 0 0 0 0 0
```

```
B =        (origin = centre, in brackets)
1  1  1
1 [1] 1
1  1  1
```

**Answer**

**Source:** L10 p.26 opening definition · L10 p.29 opening effects and formula · L10 p.23 erosion · L10 p.20 dilation · L10 p.35 3x3 SE as noise filter  
**Notes:** [Lecture 10 › Opening and closing](../notes/10_Week5_Morphology.md#5-opening-and-closing-slides-26-35) · [Lecture 10 › Erosion](../notes/10_Week5_Morphology.md#4-erosion-slides-15-19-23-25) · [Lecture 10 › Dilation](../notes/10_Week5_Morphology.md#3-dilation-slides-12-14-20-22)

**(a) Write:**
- Opening "is obtained by the **erosion** of an image followed by a **dilation**" (same SE B):
  A ∘ B = (A ⊖ B) ⊕ B = ∪{(B)z | (B)z ⊆ A}, i.e. the union of all translates of B that fit inside A.
- Like erosion, it removes foreground pixels from the edges of regions, but the dilation restores the size of everything that survived.
- "Opening can **remove small bright spots** and connect small dark cracks." It "smooth[s] the contour of an object, **breaks narrow isthmuses**, and **eliminates thin protrusions**." Anything the SE cannot fit into (isolated noise pixels, 1-pixel-wide lines) disappears.

**(b) Step 1: erosion A ⊖ B.** A pixel stays 1 only if the whole 3x3 window around it is 1 (B fits; outside = 0).
- (2,2), (2,3), (3,2), (3,3): window all 1, so 1.
- (2,4): window `110 / 111 / 110` has (1,5) = 0 and (3,5) = 0, so 0.
- (1,1): its top row is row 0 (all 0), so 0. All other edge pixels of the block fail the same way.
- Protrusion (2,5), (2,6) and noise (5,6): their windows contain 0s, so 0.

```
A ⊖ B =
0 0 0 0 0 0 0
0 0 0 0 0 0 0
0 0 1 1 0 0 0
0 0 1 1 0 0 0
0 0 0 0 0 0 0
0 0 0 0 0 0 0
0 0 0 0 0 0 0
```

**Step 2: dilation of the result by B.** A pixel becomes 1 if its 3x3 window hits at least one 1 of A ⊖ B, so each of the 4 pixels grows into a 3x3 square; their union is rows 1-4, cols 1-4.

```
A ∘ B = (A ⊖ B) ⊕ B =
0 0 0 0 0 0 0
0 1 1 1 1 0 0
0 1 1 1 1 0 0
0 1 1 1 1 0 0
0 1 1 1 1 0 0
0 0 0 0 0 0 0
0 0 0 0 0 0 0
```

**Result: the 4x4 block (rows 1-4, cols 1-4) is restored exactly; the thin protrusion (2,5), (2,6) and the isolated noise pixel (5,6) are removed.** Pixel count 19, then 4, then 16; A ∘ B ⊆ A as it must be.

---

### Q2. Order-statistic filters: median, max, min (10 pts)

(a) Explain how the median, max and min filters work. Which one removes salt (white, 255) noise, which removes pepper (black, 0) noise, and which one handles both? (4 pts)

(b) The 5x5 image I below has salt and pepper noise. Apply a 3x3 median, max and min filter at pixel P1 = (1,1) and at pixel P2 = (2,3) (row, column; (0,0) is the top-left). For each pixel give the sorted window and the three outputs, and comment on the results. (6 pts)

```
I =
 50  52  55  58  60
 51 255  57  60  62
 53  56  58   0  64
 54  58  61  63 255
 56  60  62  65  68
```

**Answer**

**Source:** L11 p.53 median removes impulse noise · L11 p.55 median method · L11 p.60 min/max filtering  
**Notes:** [Lecture 11 › Median and color median filtering](../notes/11_Week6_Spatial_Filtering_Edges.md#13-median-and-color-median-filtering-slides-53-59) · [Lecture 11 › Minimum and maximum filtering](../notes/11_Week6_Spatial_Filtering_Edges.md#14-minimum-and-maximum-filtering-slide-60)

**(a) Write:**
- All three are nonlinear filters: sort the pixels of the 3x3 window and replace the centre pixel by one of them.
- **Median** = the middle value (5th of 9). "An effective method for removing impulse noise", it preserves "sharp edges ... and detail". It removes **both salt and pepper**.
- **Min** = the smallest value. "Min filter: removes white spikes; overall intensity will be reduced." White spikes = **salt**.
- **Max** = the largest value. "Max: removes dark spikes; overall intensity is increased." Dark spikes = **pepper**.
- "Both the min and max filters fail in removing mixed impulse noises"; only a cascade of max/min filters, or the median, removes salt and pepper together.

**(b)** P1 = (1,1) and P2 = (2,3) are interior pixels, so no border rule is needed.

| Pixel | 3x3 window | Sorted (median = 5th) | Median | Max | Min |
|---|---|---|---|---|---|
| P1 (1,1) | `50 52 55 / 51 255 57 / 53 56 58` | 50 51 52 53 **55** 56 57 58 255 | **55** | **255** | **50** |
| P2 (2,3) | `57 60 62 / 58 0 64 / 61 63 255` | 0 57 58 60 **61** 62 63 64 255 | **61** | **255** | **0** |

- P1's window has only salt: min removes it (50, slightly darker than its neighbours), max keeps the 255, median 55 is clean.
- P2's window has pepper (the centre) and salt (corner (3,4)): max gives 255 and min gives 0, so **both fail on mixed noise**; median 61 is clean.
- (A 3x3 mean would give 76.33 and 75.56: the noise is smeared in.)

---

### Q3. Histogram specification (10 pts)

A 3-bit image A (L = 8, 4x4 pixels) and a desired histogram are given.

```
A =
1 2 2 3
2 3 4 5
2 3 4 4
1 2 3 5
```

| z | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| desired count n_z | 0 | 0 | 0 | 3 | 4 | 5 | 2 | 2 |

(a) Compute the histogram of A and the equalization mapping s = T(r) using the normalized sum. (3 pts)

(b) Compute G(z) for the desired histogram. (2 pts)

(c) Build the look-up table z = G⁻¹(T(r)). (3 pts)

(d) Apply it to A and write the output image and its histogram. (2 pts)

**Answer**

**Source:** L9 p.40-41 purpose and steps · L9 p.42 z = G⁻¹[T(r)] · L9 p.43 block diagram · L9 p.44 desired histogram and inverse LUT · L9 p.28-31 equalization factor (L-1)/N² and rounding  
**Notes:** [Lecture 9 › Histogram specification](../notes/09_Week5_Intensity_Transforms_Histogram.md#9-histogram-specification-slides-40-45) · [Lecture 9 › Histogram equalization, worked example](../notes/09_Week5_Intensity_Transforms_Histogram.md#7-histogram-equalization-worked-example-slides-29-31)

**Write:** Histogram specification "requires both a desired histogram and the image as input". Steps: (1) equalize the original image, s = T(r); (2) equalize the desired histogram, v = G(z); (3) apply the inverse transform, z = G⁻¹(s) = G⁻¹[T(r)].
Convention (slides 29-31 and 44): normalized sum = cumulative count x (L-1)/N² = x 7/16; s is rounded to the nearest integer; G(z) is kept unrounded and each s goes to the z whose G(z) is closest (equal G values: smallest z).

**(a) Histogram of A and T(r):**

| r | n_r | cumulative | cum x 7/16 | s = T(r) |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |
| 1 | 2 | 2 | 0.875 | 1 |
| 2 | 5 | 7 | 3.0625 | 3 |
| 3 | 4 | 11 | 4.8125 | 5 |
| 4 | 3 | 14 | 6.125 | 6 |
| 5 | 2 | 16 | 7.0 | 7 |
| 6 | 0 | 16 | 7.0 | 7 |
| 7 | 0 | 16 | 7.0 | 7 |

**(b) G(z) of the desired histogram:**

| z | n_z | cumulative | G(z) = cum x 7/16 |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 1 | 0 | 0 | 0 |
| 2 | 0 | 0 | 0 |
| 3 | 3 | 3 | 1.3125 |
| 4 | 4 | 7 | 3.0625 |
| 5 | 5 | 12 | 5.25 |
| 6 | 2 | 14 | 6.125 |
| 7 | 2 | 16 | 7.0 |

**(c) Inverse LUT s to z (closest G(z)):**

| s | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| closest G(z) | 0 | 1.3125 | 1.3125 | 3.0625 | 3.0625 | 5.25 | 6.125 | 7.0 |
| z = G⁻¹(s) | 0 | 3 | 3 | 4 | 4 | 5 | 6 | 7 |

- Example s = 1: |1 - 0| = 1 and |1 - 1.3125| = 0.3125, so z = 3. Example s = 4: |4 - 3.0625| = 0.9375 < |4 - 5.25| = 1.25, so z = 4.
- Combined LUT for the levels in A:

| r | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| s = T(r) | 1 | 3 | 5 | 6 | 7 |
| z = G⁻¹(T(r)) | 3 | 4 | 5 | 6 | 7 |

**LUT r to z: 1→3, 2→4, 3→5, 4→6, 5→7** (unused: 0→0, 6→7, 7→7). s = 2 and s = 4 never occur, so the rule "smallest z with G(z) ≥ s" gives the same output here.

**(d) Output image:**

```
3 4 4 5
4 5 6 7
4 5 6 6
3 4 5 7
```

**Output histogram n3..n7 = 2, 5, 4, 3, 2** against the desired 3, 4, 5, 2, 2: close to the target shape but not exact (discrete levels).

---

### Q4. Pattern recognition: flow chart and nearest class mean (10 pts)

(a) Draw the flow chart of a pattern recognition system from input to decision, including the side inputs, and state in one line what each stage does. (5 pts)

(b) Fish on a conveyor are described by the feature vector x = [lightness, width]. Training samples:

| Class | Samples [lightness, width] |
|---|---|
| Salmon | [3, 15], [4, 17], [5, 16] |
| Sea bass | [7, 20], [9, 21], [8, 22] |

Use the nearest class mean classifier with Euclidean distance. A fish is put in the reject class if its distance to the nearest mean is greater than 4. Compute the two class means and classify x1 = [6, 18] and x2 = [11, 15]. (5 pts)

**Answer**

**Source:** L12 p.17-19 PR system stages · L12 p.18 flow chart · L12 p.12 fish features lightness and width · L12 p.31, p.36 classifier and reject class · L12 p.38 nearest class mean  
**Notes:** [Lecture 12 › Pattern recognition system flowchart](../notes/12_Week7_Pattern_Recognition.md#4-pattern-recognition-system-flowchart-slides-17-19) · [Lecture 12 › Nearest class mean](../notes/12_Week7_Pattern_Recognition.md#10-nearest-class-mean-and-scaling-by-std-dev-slides-38-40-43-47)

**(a) Flow chart (slide 18, read bottom to top):**

```
                       decision
                           ^
                           |
              +------------------------+
              |    post-processing     |<------------- costs
              +------------------------+<---+
                  ^                :        |
                  |                v        +--------- adjustments for
              +------------------------+    |          context
              |     classification     |<---+
              +------------------------+<------------- adjustments for
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

- Solid `^` = data flowing up (black on the slide); dotted `: v` = gray arrows going back down to the stage below.
- **Sensing**: "Use of a transducer (camera or microphone)".
- **Segmentation (and grouping)**: "Patterns should be well separated and should not overlap".
- **Feature extraction**: "Discriminative features"; "Invariant features with respect to translation, rotation and scale".
- **Classification**: "Use a feature vector provided by a feature extractor to assign the object to a category".
- **Post-processing**: "Exploit context input dependent information other than from the target pattern itself to improve performance".

**(b) Nearest class mean.** Rule (slide 38): compute the Euclidean distance from x to each class mean; choose the closest class if it is close enough, otherwise reject.

| Class | Mean [lightness, width] |
|---|---|
| Salmon | [(3+4+5)/3, (15+17+16)/3] = **[4, 16]** |
| Sea bass | [(7+9+8)/3, (20+21+22)/3] = **[8, 21]** |

| Sample | d to salmon mean | d to sea bass mean | Nearest | ≤ 4? | Decision |
|---|---|---|---|---|---|
| x1 = [6, 18] | √((6-4)² + (18-16)²) = √8 = 2.83 | √((6-8)² + (18-21)²) = √13 = 3.61 | salmon | yes | **salmon** |
| x2 = [11, 15] | √(7² + 1²) = √50 = 7.07 | √(3² + 6²) = √45 = 6.71 | sea bass | no | **reject class** |

---

### Q5. Compression: lossy vs lossless, arithmetic coding (10 pts)

(a) What is the difference between lossless and lossy compression? Classify JPEG, PNG and MP3. (3 pts)

(b) Encode the message BAB$ ($ is the terminator) with arithmetic coding using the table below. Show low, high and range after each symbol, give the final interval, and generate the shortest binary codeword inside it. (7 pts)

| Symbol | A | B | C | $ |
|---|---|---|---|---|
| Probability | 0.4 | 0.3 | 0.2 | 0.1 |
| Range | [0, 0.4) | [0.4, 0.7) | [0.7, 0.9) | [0.9, 1.0) |

**Answer**

**Source:** L4 p.10 lossless vs lossy definition · L5 p.11 lossy compression · L5 p.13 quantization is the main loss · L5 p.19-20 FLAC vs MP3/AAC · L5 p.3-4 arithmetic encoder · L5 p.8 codeword procedure · JPG lossy / PNG lossless from the class board  
**Notes:** [Lecture 4 › Compression, lossless vs lossy](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#4-compression-lossless-vs-lossy-compression-ratio-slides-10-11) · [Lecture 5 › Arithmetic coding basics](../notes/05_Week3_ArithmeticCoding_LossyCompression_MPEG.md#1-arithmetic-coding-basics-slides-3-4) · [Lecture 5 › Generating the codeword](../notes/05_Week3_ArithmeticCoding_LossyCompression_MPEG.md#3-generating-the-codeword-slide-8)

**(a) Write:**
- "If the compression and decompression processes induce no information loss, then the compression scheme is **lossless**; otherwise, it is **lossy**."
- Lossless: the decoded data equals the original exactly; lower compression ratio. Examples: PNG (images), FLAC and Apple Lossless (audio, "at the cost of larger files"), Huffman, LZW, RLE.
- Lossy: "The compressed data is not the same as the original data but a close approximation of it"; "a much higher compression ratio"; quantization is the main source of the loss. Examples: JPEG (images), MP3 and AAC (audio, perceptual coding).
- **JPEG → lossy, PNG → lossless, MP3 → lossy.**

**(b) Encoding.** Both bounds use the old low: low' = low + range x R_low(s), high' = low + range x R_high(s), range' = high' - low'.

| Step | Symbol | low | high | range |
|---|---|---|---|---|
| 0 | start | 0 | 1 | 1 |
| 1 | B | 0 + 1(0.4) = 0.4 | 0 + 1(0.7) = 0.7 | 0.3 |
| 2 | A | 0.4 + 0.3(0) = 0.4 | 0.4 + 0.3(0.4) = 0.52 | 0.12 |
| 3 | B | 0.4 + 0.12(0.4) = 0.448 | 0.4 + 0.12(0.7) = 0.484 | 0.036 |
| 4 | $ | 0.448 + 0.036(0.9) = 0.4804 | 0.448 + 0.036(1.0) = 0.484 | 0.0036 |

**Final interval [0.4804, 0.484)**. Check: range = 0.3 x 0.4 x 0.3 x 0.1 = 0.0036.

**Codeword (Procedure 7.2):** for k = 1, 2, ... set bit k to 1; if the value exceeds high, set it back to 0; stop as soon as value ≥ low.

| k | try | value | vs high 0.484 | bit k | code so far | value < low 0.4804? |
|---|---|---|---|---|---|---|
| 1 | 0.1 | 0.5 | > high | 0 | 0.0 | yes (0) |
| 2 | 0.01 | 0.25 | ok | 1 | 0.01 | yes |
| 3 | 0.011 | 0.375 | ok | 1 | 0.011 | yes |
| 4 | 0.0111 | 0.4375 | ok | 1 | 0.0111 | yes |
| 5 | 0.01111 | 0.46875 | ok | 1 | 0.01111 | yes |
| 6 | 0.011111 | 0.484375 | > high | 0 | 0.011110 | yes (0.46875) |
| 7 | 0.0111101 | 0.4765625 | ok | 1 | 0.0111101 | yes |
| 8 | 0.01111011 | 0.48046875 | ok | 1 | 0.01111011 | no, stop |

**Codeword = 0.01111011 (binary) = 0.48046875, 8 bits**, and 0.4804 ≤ 0.48046875 < 0.484.
Decoding check: 0.48046875 → B, (0.48046875 - 0.4)/0.3 = 0.2682 → A, 0.2682/0.4 = 0.6706 → B, (0.6706 - 0.4)/0.3 = 0.9019 → $, stop.

---

### Q6. Psychoacoustics and MPEG audio (10 pts)

(a) Explain frequency masking and temporal masking. (3 pts)

(b) Draw the block diagram of the MPEG audio (MP3) encoder and say what each block does. (3 pts)

(c) Bit allocation. Three sub-bands have the following SNR and SMR (in dB). Compute MNR = SNR - SMR for each sub-band and say which sub-band gets the next bit. Then allocate 3 bits one at a time, assuming each bit raises that sub-band's SNR by 6 dB. Give the final MNR of each sub-band. (4 pts)

| Sub-band | 1 | 2 | 3 |
|---|---|---|---|
| SNR (dB) | 28 | 22 | 35 |
| SMR (dB) | 12 | 18 | 20 |

**Answer**

**Source:** L5 p.14 frequency masking rules · L5 p.35 masking effects (temporal ~20, ~200, ~150 ms) · L5 p.32 auditory masking · L5 p.29 encoding steps · L5 p.31 filter bank, 32 sub-bands · L5 p.37 bit allocation · L5 p.41 6 dB per bit  
**Notes:** [Lecture 5 › Psychoacoustics: masking](../notes/05_Week3_ArithmeticCoding_LossyCompression_MPEG.md#7-psychoacoustics-masking-and-threshold-of-hearing-slides-14-16-33-36) · [Lecture 5 › MPEG audio encoder](../notes/05_Week3_ArithmeticCoding_LossyCompression_MPEG.md#10-mpeg-audio-encoder-filter-bank-psychoacoustic-model-bit-allocation-slides-29-32-37)

**(a) Write:** Auditory masking "occurs whenever the presence of a strong audio signal makes a temporal or spectral neighborhood of weaker audio signals imperceptible." MPEG audio removes "sounds which are masked anyway".
- **Frequency masking** (a loud tone hides weaker tones at nearby frequencies):
  1. A lower tone can effectively mask a higher tone.
  2. The reverse is not true: a higher tone does not mask a lower tone well.
  3. The greater the power of the masking tone, the wider its influence (broader range of masked frequencies).
  4. So if two tones are widely separated in frequency, little masking occurs.
- **Temporal masking** (a loud sound hides weaker sounds close to it in time): pre-masking about 20 ms before the masker, simultaneous masking while the masker is on (about 200 ms in the figure), post-masking about 150 ms after it.

**(b) MPEG audio encoder (slide 29):**

```
              uncompressed audio stream
                  |               |
                  v               v
     +---------------------+  +---------------------+
     | psychoacoustic      |  | filter bank         |   time -> frequency
     | model               |  |                     |   domain
     +---------------------+  +---------------------+
                  |               |  32 sub-bands
                  |               v
                  |   +-------------------------------+
                  +-->| quantization, bit/noise       |   noise high -> rough quantization
                      | allocation                    |   noise low  -> finer quantization
                      +-------------------------------+
                                  |
                                  v
                      +-------------------------------+
                      | multiplexer, entropy coder    |   Huffman coding
                      +-------------------------------+
                                  |
                                  v
                           compressed data
```

- Filter bank: "divides input into multiple sub-bands (32 equal frequency sub-bands)", time to frequency domain.
- Psychoacoustic model: "removing acoustically irrelevant parts", using the ear's "inability to hear quantization noise under auditory masking"; (textbook) it gives the SMR of each sub-band.
- Quantization, bit/noise allocation: "If noise level is high => rough quantization; if noise level is low => finer quantization is applied."
- Multiplexer / entropy coder: Huffman coding of the quantized values into the bitstream.

**(c) Bit allocation** (slide 37: compute MNR = SNR - SMR, find the sub-band with the lowest MNR, give it bits, update its SNR, repeat; +6 dB per bit, slide 41):

| Round | SNR (1, 2, 3) | MNR = SNR - SMR (1, 2, 3) | Lowest MNR, bit goes to |
|---|---|---|---|
| start | 28, 22, 35 | 16, 4, 15 | sub-band 2 |
| after bit 1 | 28, 28, 35 | 16, 10, 15 | sub-band 2 |
| after bit 2 | 28, 34, 35 | 16, 16, 15 | sub-band 3 |
| after bit 3 | 28, 34, 41 | **16, 16, 21** | (done) |

**The next bit goes to sub-band 2 (MNR 4 dB). After 3 bits: sub-band 2 gets 2 bits, sub-band 3 gets 1, sub-band 1 gets 0; final MNR = 16, 16, 21 dB.**

---

### Q7. Image resampling and interpolation (10 pts)

(a) When do we need to resample an image? Compare nearest neighbour, bilinear and bicubic interpolation. (3 pts)

(b) Four neighbouring pixels of an image are given as f(row, col). Find the value at the point (row 2.7, col 4.25) using bilinear interpolation, and using nearest neighbour interpolation. (5 pts)

| | col 4 | col 5 |
|---|---|---|
| row 2 | 40 | 80 |
| row 3 | 60 | 120 |

(c) A 640 x 480 RGB image (24 bits per pixel) is downscaled by 50% in each direction. Give the new size and the storage before and after, in bytes. (2 pts)

**Answer**

**Source:** L6 p.36 resampling and interpolation methods · L6 p.27 b = M x N x k · the bilinear formula is textbook context (the slide gives none)  
**Notes:** [Lecture 6 › Image resampling and interpolation](../notes/06_Week3_Image_Basics_Perception_Resampling.md#12-image-resampling-and-interpolation-slide-36) · [Lecture 6 › Representing and storing a digital image](../notes/06_Week3_Image_Basics_Perception_Resampling.md#9-representing-and-storing-a-digital-image-slides-27-28)

**(a) Write:** We need to resample the image when: rescaling; applying a geometrical transformation; the output image coordinates are not discrete.

| Method | Pixels used | Properties |
|---|---|---|
| Nearest neighbour | the 1 closest pixel | "Fast and simple"; "loss of sharpness"; "artifacts (checkerboard)" |
| Bilinear | 4 nearest pixels, weighted by distance | smoother than nearest neighbour, medium speed (textbook) |
| Bicubic | 16 nearest pixels (4x4) (textbook) | "Images are sharpest"; "fine details are preserved"; "slow" |

**(b)** Offsets: a = 4.25 - 4 = 0.25 (column), b = 2.7 - 2 = 0.7 (row).

| Step | Computation | Result |
|---|---|---|
| Along row 2 | 40 + 0.25(80 - 40) | 50 |
| Along row 3 | 60 + 0.25(120 - 60) | 75 |
| Between the rows | 50 + 0.7(75 - 50) | 67.5 |
| Check with weights | 0.225(40) + 0.075(80) + 0.525(60) + 0.175(120) = 9 + 6 + 31.5 + 21 | 67.5 |

Formula: f = (1-a)(1-b) f(2,4) + a(1-b) f(2,5) + (1-a)b f(3,4) + ab f(3,5).
**Bilinear = 67.5 (68 as an integer pixel). Nearest neighbour: row 2.7 → 3, col 4.25 → 4, so f(3,4) = 60.**

**(c)** **New size 320 x 240.** Storage b = M x N x k: before 640 x 480 x 3 bytes = **921,600 bytes**; after 320 x 240 x 3 = **230,400 bytes**, i.e. 1/4 (each new pixel stands for a 2x2 block).

---

### Q8. Intensity transformations (10 pts)

An 8-bit image (L = 256) has the pixel values r = 31, 63, 127 and 200. For each value compute:

(a) the image negative, and give one application of it. (2 pts)

(b) the log transformation s = c log(1 + r) with c = 255 / log(1 + 255). (3 pts)

(c) gamma correction s = 255 (r/255)^γ with γ = 0.5; also compute r = 127 with γ = 2.0. Which values of γ brighten the image? (3 pts)

(d) contrast stretching with low = 50 and high = 150. (2 pts)

**Answer**

**Source:** L6 p.44-45 negative y = -x + 255 and its applications · L6 p.47 gamma code 255*(img/255)**gamma · L6 p.37 contrast stretching formula · the log transform is textbook context (Gonzalez 3.2), not on the slides  
**Notes:** [Lecture 6 › Intensity transformations and gamma](../notes/06_Week3_Image_Basics_Perception_Resampling.md#14-intensity-transformations-and-gamma-slides-44-57) · [Lecture 6 › Contrast stretching and thresholding](../notes/06_Week3_Image_Basics_Perception_Resampling.md#13-contrast-stretching-and-thresholding-slides-37-43) · [Lecture 9 › Contrast stretching and intensity transformations](../notes/09_Week5_Intensity_Transforms_Histogram.md#4-contrast-stretching-and-intensity-transformations-slides-2-13-26-55)

**Write:** "Intensity transformation is a point process that converts an old pixel into a new pixel based on some predefined function", implemented with a LUT.

**(a) Negative** s = 255 - r: 31 → **224**, 63 → **192**, 127 → **128**, 200 → **55**. Applications: display of medical images; producing negative prints.

**(b) Log.** c = 255 / log10(256) = 105.89 (with ln, c = 45.99; s is the same in any base). Since 1 + r = 32, 64, 128 are powers of 2, s = 255 x log2(1 + r) / 8.

| r | 1 + r | s = c log(1 + r) | rounded |
|---|---|---|---|
| 31 | 32 | 255 x 5/8 = 159.375 | **159** |
| 63 | 64 | 255 x 6/8 = 191.25 | **191** |
| 127 | 128 | 255 x 7/8 = 223.125 | **223** |
| 200 | 201 | 105.89 x log10(201) = 105.89 x 2.3032 = 243.88 | **244** |

The log expands dark values (31 → 159) and compresses bright ones (127 to 200 → 223 to 244).

**(c) Gamma, s = 255 (r/255)^γ (slide 47 convention).**

| r | γ = 0.5: 255 √(r/255) | rounded | slide code (uint8 truncates) |
|---|---|---|---|
| 31 | 88.91 | **89** | 88 |
| 63 | 126.75 | **127** | 126 |
| 127 | 179.96 | **180** | 179 |
| 200 | 225.83 | **226** | 225 |

r = 127 with γ = 2.0: 255 (127/255)² = **63.25 → 63** (darker). **With this convention γ < 1 brightens and γ > 1 darkens.** (Slide 49 writes output = input^(1/γ), which reverses this; say which form you use.)

**(d) Contrast stretching** (slide 37): output = 0 for x ≤ low; 255 (x - low)/(high - low) for low < x ≤ high; 255 for x ≥ high.
31 ≤ 50 → **0**; 63 → 255 x 13/100 = 33.15 → **33**; 127 → 255 x 77/100 = 196.35 → **196**; 200 ≥ 150 → **255**.

---

## Score check

| Q | Max pts | What earns the points |
|---|---|---|
| Q1 | 10 | (a) erode-then-dilate definition with formula (2), removes small bright spots / thin protrusions, breaks isthmuses (2); (b) correct A ⊖ B (3), correct opening with protrusion and noise gone (3) |
| Q2 | 10 | (a) how each filter works and min = salt, max = pepper, median = both, min/max fail on mixed (4); (b) sorted windows and median/max/min at both pixels (1 each, 6) |
| Q3 | 10 | (a) histogram and T(r) with x 7/16 and rounding (3); (b) G(z) (2); (c) inverse LUT and r→z table (3); (d) output image (2) |
| Q4 | 10 | (a) all 5 boxes in order with input/decision (3), side inputs and one line per stage (2); (b) both means (2), x1 salmon with distances (2), x2 reject (1) |
| Q5 | 10 | (a) definitions and JPEG/PNG/MP3 classified (3); (b) low/high/range table (3), final interval (1), codeword by Procedure 7.2 (3) |
| Q6 | 10 | (a) frequency masking rules and temporal masking times (3); (b) encoder blocks in order with their roles (3); (c) MNR values, first bit to sub-band 2, 3-bit allocation and final MNR (4) |
| Q7 | 10 | (a) when to resample and NN/bilinear/bicubic properties (3); (b) bilinear 67.5 with steps (4), NN 60 (1); (c) 320 x 240 and both storage sizes (2) |
| Q8 | 10 | (a) 4 negatives and an application (2); (b) c and 4 log values (3); (c) 4 gamma values, γ = 2 value, γ < 1 brightens (3); (d) 4 stretched values (2) |
