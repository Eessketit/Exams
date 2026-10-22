# Multimedia Computing: Midterm Sample 4

Lectures 2-12 (not 1, 8, 13) · 100 pts · Part 1: 10 x 2 = 20 · Part 2: 8 x 10 = 80 · Answer and explanation under each question

## Part 1: Multiple choice (10 x 2 = 20 pts)

**1.** An audio signal is sampled at 11.025 kHz with 16 bits per sample, in stereo. What is its uncompressed bit rate?

a) 176.4 kbps  
b) 44.1 kbps  
c) 352.8 kbps  
d) 705.6 kbps

> **Answer: c)** Bit rate = f_s x bits x channels = 11,025 x 16 x 2 = 352,800 bps. a) forgets the 2 channels; b) is 44.1 kB/s (bytes, not bits).  
> Source: L2 p.34-35

**2.** Which is the correct order of the blocks in a PCM speech encoder?

a) μ-law compressor → bandlimiting filter → linear PCM → transmission  
b) bandlimiting filter → linear PCM → μ-law expander → transmission  
c) low-pass filter → digital-to-analog converter → μ-law expander → transmission  
d) bandlimiting filter → μ-law compressor → linear PCM → transmission

> **Answer: d)** Encoder: bandlimiting filter → μ-law/A-law compressor → linear PCM → transmission. The expander, DAC and low-pass filter belong to the decoder.  
> Source: L3 p.44

**3.** Run-length coding compresses well because it:

a) exploits memory in the source: symbols tend to form continuous groups (runs)  
b) assumes a memoryless source, where each symbol is independent of the previous ones  
c) gives shorter codewords to more probable symbols, using a tree built bottom-up  
d) builds a dictionary of repeated strings while it scans the input

> **Answer: a)** RLC exploits memory in the source: it codes the symbol and the length of its group. b) is the opposite case; c) is Huffman; d) is LZW.  
> Source: L4 p.14-15

**4.** What is MP4 (MPEG-4 Part 14)?

a) The audio codec that succeeded MP3, based on pure MDCT  
b) A multimedia container (wrapper) format that stores video and audio streams and metadata  
c) MPEG-1 Audio Layer III  
d) A lossless audio format, like FLAC

> **Answer: b)** MPEG-4 Part 14 (.mp4) is a container (wrapper) format for video and audio streams. a) describes AAC.  
> Source: L5 p.52

**5.** How many bits are needed to store a 512 x 512 gray-scale image with 64 gray levels?

a) 1,572,864 bits  
b) 2,097,152 bits  
c) 16,777,216 bits  
d) 196,608 bits

> **Answer: a)** b = M x N x k with k = log2 64 = 6: 512 x 512 x 6 = 1,572,864 bits. c) uses L = 64 in place of k; b) assumes 8 bits; d) is the answer in bytes.  
> Source: L6 p.26-28

**6.** In the CIE XYZ color system, which tristimulus value represents luminance (perceived brightness)?

a) X  
b) Z  
c) Y  
d) x = X / (X + Y + Z)

> **Answer: c)** Y = luminance; X = "red mix"; Z = "blue response". x is a chromaticity coordinate, which ignores luminance.  
> Source: L7 p.47

**7.** Adding the constant 40 to every pixel of an 8-bit image (with clamping at 255) mainly:

a) increases the contrast; the histogram is stretched  
b) increases the brightness; the histogram shifts right and the contrast does not change  
c) flattens the histogram, as histogram equalization does  
d) inverts the image, as the NOT operation does

> **Answer: b)** Addition and subtraction adjust brightness; they cannot adjust contrast (multiplication and division do).  
> Source: L9 p.46-48

**8.** Which morphological operation makes foreground (bright) regions shrink and the holes inside them grow?

a) Dilation  
b) Closing  
c) Region filling  
d) Erosion

> **Answer: d)** Erosion (erode, shrink, reduce): foreground areas shrink and holes inside them grow. Dilation and closing do the opposite.  
> Source: L10 p.15, 18

**9.** The 3x3 Gaussian smoothing mask is written as (1/16) x [1 2 1; 2 4 2; 1 2 1]. Why the factor 1/16?

a) The mask window contains 16 pixels  
b) It makes the weights sum to 0, so flat regions become 0  
c) 16 is the sum of the weights, so the mask sums to 1 and a flat region keeps its value  
d) It equals 1/σ² for σ = 4

> **Answer: c)** 1+2+1+2+4+2+1+2+1 = 16, so the mask sums to 1. The window has 9 pixels, not 16; a sum of 0 is a high-pass/Laplacian mask.  
> Source: L11 p.19

**10.** In a pattern recognition system, which stage should produce features that are invariant to translation, rotation and scale?

a) Feature extraction  
b) Sensing  
c) Segmentation and grouping  
d) Post-processing

> **Answer: a)** Feature extraction: "discriminative features", "invariant features with respect to translation, rotation and scale".  
> Source: L12 p.19

## Part 2: Short questions (8 x 10 = 80 pts)

### Q1. Morphology: closing (10 pts)

(a) What is morphological closing? How does it differ from opening (order of the operations and effect on the image)? (4 pts)

(b) Apply closing to the binary image A with the 3x3 structuring element B (all 1s, origin at the centre, marked in brackets). Show A ⊕ B first, then (A ⊕ B) ⊖ B. Pixels outside the image count as 0. Which pixels of A changed, and why? (6 pts)

Image A (rows 0-6 top to bottom, columns 0-6 left to right):

```
0 0 0 0 0 0 0
0 1 0 0 0 1 0
0 1 0 0 0 0 0
0 1 1 1 0 1 0
0 1 0 1 1 1 0
0 1 1 1 1 1 0
0 0 0 0 0 0 0
```

Structuring element B:

```
1  1  1
1 [1] 1
1  1  1
```

**Answer**

**Source:** L10 p.28-29 closing definition and effects · L10 p.26 opening · L10 p.12-13, 18 dilation = local max, erosion = local min · L10 p.34 properties  
**Notes:** [Lecture 10 › Opening and closing](../notes/10_Week5_Morphology.md#5-opening-and-closing-slides-26-35) · [Lecture 10 › Dilation](../notes/10_Week5_Morphology.md#3-dilation-slides-12-14-20-22) · [Lecture 10 › Erosion](../notes/10_Week5_Morphology.md#4-erosion-slides-15-19-23-25)

**(a) Write:**
- **Closing** = a dilation followed by an erosion: A • B = (A ⊕ B) ⊖ B. "Closing can remove small dark spots and connect small bright cracks." It smooths contours, "fuses narrow breaks and long thin gulfs, eliminates small holes, and fills gaps in the contour". The result contains A: A ⊆ A • B.
- **Opening** = an erosion followed by a dilation: A ∘ B = (A ⊖ B) ⊕ B. "Opening can remove small bright spots and connect small dark cracks." It breaks narrow isthmuses and eliminates thin protrusions. The result lies inside A: A ∘ B ⊆ A.
- Rolling ball picture: opening rolls B inside the boundary of A, closing rolls B outside it. Both are idempotent: closing twice = closing once.

**(b) Step 1: dilation A ⊕ B** (3x3 local max, outside = 0). A pixel becomes 1 if its 3x3 window holds at least one 1 of A. Only (0,3) and (1,3) stay 0: the window of (1,3) (rows 0-2, cols 2-4) is all 0, and so is the in-image part of the window of (0,3).

```
1 1 1 0 1 1 1
1 1 1 0 1 1 1
1 1 1 1 1 1 1
1 1 1 1 1 1 1
1 1 1 1 1 1 1
1 1 1 1 1 1 1
1 1 1 1 1 1 1
```

**Step 2: erosion (A ⊕ B) ⊖ B** (3x3 local min, outside = 0). A pixel stays 1 only if all 9 pixels of its window are 1.
- Rows 0 and 6 and columns 0 and 6 become 0, because their windows reach outside the image.
- (1,2), (1,3), (1,4), (2,2), (2,3), (2,4) become 0, because their windows contain (0,3) or (1,3).
- Every other interior pixel stays 1.

**A • B =**

```
0 0 0 0 0 0 0
0 1 0 0 0 1 0
0 1 0 0 0 1 0
0 1 1 1 1 1 0
0 1 1 1 1 1 0
0 1 1 1 1 1 0
0 0 0 0 0 0 0
```

**Changed pixels (16 → 19 ones), all 0 → 1:**
- **(4,2): the one-pixel hole is filled** ("eliminates small holes").
- **(2,5): the break in the right arm is fused** ("fuses narrow breaks").
- **(3,4): the one-pixel crack is filled** ("fills gaps in the contour").
- **No 1 became 0 (A ⊆ A • B).** The notch at rows 1-2, cols 2-4 is 3 pixels wide, so B fits inside it and it stays open: closing only fills gaps smaller than the SE.
- For contrast, opening A with the same B gives an empty image, because no 3x3 block of 1s fits inside A.

---

### Q2. Filtering: blurring (10 pts)

(a) Name and briefly explain the four ways to treat the image borders when convolving with a 3x3 mask. (4 pts)

(b) 8-bit image I (rows and columns numbered from 0, pixel (row, col)):

```
80 80  70 50 40
80 60  60 40 30
70 60 100 50 30
50 40  50 40 20
40 30  30 20 20
```

Average mask = (1/9) x [1 1 1; 1 1 1; 1 1 1]. Gaussian mask = (1/16) x [1 2 1; 2 4 2; 1 2 1].

(i) Apply both masks at the interior pixel (2,2). Which result stays closer to the original value, and why? (3 pts)

(ii) Apply both masks at the corner pixel (0,0), once with zero padding and once with duplication of the edges. Which border method gives the more realistic result? (3 pts)

**Answer**

**Source:** L11 p.15 image borders · L11 p.14 applying a mask · L11 p.16-18 average mask · L11 p.19 Gaussian mask  
**Notes:** [Lecture 11 › Convolution and image borders](../notes/11_Week6_Spatial_Filtering_Edges.md#3-convolution-and-image-borders-slides-11-15) · [Lecture 11 › Blurring](../notes/11_Week6_Spatial_Filtering_Edges.md#4-blurring-average-and-gaussian-masks-slides-16-19)

**(a) Write (slide 15):**
1. **Zero padding:** treat the empty cells of the window as zeros. Simple, but it darkens the border.
2. **Start convolving at the first position where the window does not overlap the image:** start at (1,1) instead of (0,0) with a 3x3 mask. The output loses a 1-pixel frame (here 5x5 → 3x3).
3. **Duplication of the edges:** copy the top row, the left side, the right side and the bottom of the image outward.
4. **Wrap-around:** the opposite edge supplies the missing neighbours (the image is treated as periodic).

**(b)(i) Interior pixel (2,2) = 100.** Window:

```
60  60 40
60 100 50
40  50 40
```

| Mask | Computation | Result |
|---|---|---|
| Average | (60+60+40+60+100+50+40+50+40) / 9 = 500 / 9 | **55.56 (56)** |
| Gaussian | [1(60+40+40+40) + 2(60+60+50+50) + 4(100)] / 16 = (180 + 440 + 400) / 16 = 1020 / 16 | **63.75 (64)** |

**The Gaussian result stays closer to 100.** It gives the centre the weight 4/16 = 0.25 (the average gives 1/9 = 0.11) and the corners only 1/16, so it blurs less.

**(ii) Corner pixel (0,0) = 80.**

| Border rule | Window | Average | Gaussian |
|---|---|---|---|
| Zero padding | `[0 0 0; 0 80 80; 0 80 60]` | 300 / 9 = **33.33 (33)** | [4(80) + 2(80+80) + 1(60)] / 16 = 700 / 16 = **43.75 (44)** |
| Duplication of edges | `[80 80 80; 80 80 80; 80 80 60]` | 700 / 9 = **77.78 (78)** | [1(80+80+80+60) + 2(4 x 80) + 4(80)] / 16 = 1260 / 16 = **78.75 (79)** |

**Duplication of the edges is more realistic:** the corner area is bright (80), and the result stays near 80. Zero padding mixes in five fake black pixels and darkens the corner (dark frame artefact). (Wrap-around for comparison: average 51.11, Gaussian 58.75, because the far corner pixel 20 is pulled in.)

---

### Q3. Histogram equalization (10 pts)

3-bit image (L = 8 gray levels, 0-7), 5 x 5 = 25 pixels:

```
3 3 4 2 3
2 4 5 3 1
3 4 6 4 2
5 3 3 4 2
1 2 4 5 3
```

(a) Compute the histogram n_k and the normalized histogram p(r_k) = n_k / 25 for k = 0..7. (3 pts)

(b) Compute the normalized cumulative sum and the equalization mapping s_k (the look-up table). (4 pts)

(c) Give the histogram of the equalized image. Why is it not perfectly flat? (3 pts)

**Answer**

**Source:** L9 p.14 histogram · L9 p.20 steps (histogram, normalized sum, transform) · L9 p.28 T(r) = (M/N²) ∫ h(w) dw · L9 p.29-31 worked example (factor 7/16, round to nearest) · L9 p.26 result not flat  
**Notes:** [Lecture 9 › Histogram equalization, worked example](../notes/09_Week5_Intensity_Transforms_Histogram.md#7-histogram-equalization-worked-example-slides-29-31) · [Lecture 9 › Histogram equalization, theory](../notes/09_Week5_Intensity_Transforms_Histogram.md#6-histogram-equalization-theory-slides-20-28)

**Write:** steps: 1. compute the histogram; 2. calculate the normalized sum of the histogram; 3. transform the input image to the output image with a LUT. Rule (slide convention, factor (L-1)/(M x N) = 7/25, round to the nearest integer):

s_k = round( (L-1)/(M x N) x Σ_{j≤k} n_j ) = round( 7 x cdf(r_k) )

**(a) + (b)**

| r_k | n_k | p(r_k) = n_k/25 | cumulative Σ n_j | normalized sum (cdf) | 7 x cdf | s_k |
|---|---|---|---|---|---|---|
| 0 | 0 | 0.00 | 0 | 0.00 | 0.00 | 0 |
| 1 | 2 | 0.08 | 2 | 0.08 | 0.56 | 1 |
| 2 | 5 | 0.20 | 7 | 0.28 | 1.96 | 2 |
| 3 | 8 | 0.32 | 15 | 0.60 | 4.20 | 4 |
| 4 | 6 | 0.24 | 21 | 0.84 | 5.88 | 6 |
| 5 | 3 | 0.12 | 24 | 0.96 | 6.72 | 7 |
| 6 | 1 | 0.04 | 25 | 1.00 | 7.00 | 7 |
| 7 | 0 | 0.00 | 25 | 1.00 | 7.00 | 7 |
| sum | 25 | 1.00 | | | | |

**LUT r → s: 0→0, 1→1, 2→2, 3→4, 4→6, 5→7, 6→7, 7→7.**

**(c)** Equalized image (for checking):

```
4 4 6 2 4
2 6 7 4 1
4 6 7 6 2
7 4 4 6 2
1 2 6 7 4
```

| s | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| new n_s | 0 | 2 | 5 | 0 | 8 | 0 | 6 | 4 |

**Not flat because:**
- The theory (p_s(s) = 1) holds only for continuous levels. With discrete levels, all pixels of one level go to the same new level: the 8 pixels at r = 3 cannot be split.
- Levels 5 and 6 merge into 7, and levels 3 and 5 stay empty.
- HE cannot create new levels; it only moves them apart. Slide 26: "The resulting histogram is not flat".
- It still stretches the contrast near the histogram maxima (3 → 4, 4 → 6) and spreads the range from 1-6 to 1-7.

---

### Q4. Pattern recognition (10 pts)

(a) Draw the flow chart of a pattern recognition system from the input to the decision. Name the three side inputs and the stage(s) each one enters. Write one line on what each stage does. (6 pts)

(b) A fish sorter uses the feature vector x = [lightness, width]. Training samples:

| Sample | Lightness | Width | Class |
|---|---|---|---|
| S1 | 2 | 3 | salmon |
| S2 | 3 | 5 | salmon |
| S3 | 4 | 2 | salmon |
| B1 | 6 | 5 | sea bass |
| B2 | 8 | 8 | sea bass |

Classify the new fish x = [5, 5] with the nearest neighbour (1-NN) rule and Euclidean distance. Would 3-NN give the same class? (4 pts)

**Answer**

**Source:** L12 p.17-19 PR system stages · L12 p.18 flow chart · L12 p.41 nearest neighbour, extendable to k-NN · L12 p.4-13 fish example (lightness, width)  
**Notes:** [Lecture 12 › Pattern recognition system flowchart](../notes/12_Week7_Pattern_Recognition.md#4-pattern-recognition-system-flowchart-slides-17-19) · [Lecture 12 › Nearest neighbor and k nearest neighbors](../notes/12_Week7_Pattern_Recognition.md#11-nearest-neighbor-and-k-nearest-neighbors-slide-41)

**(a) Draw (bottom to top, as on slide 18).** Solid `^` = data flowing up; dotted `: v` = arrows going down to the stage below.

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

**Side inputs:** costs → post-processing; adjustments for context → post-processing and classification; adjustments for missing features → classification.

**Stages (slide wording):**
- **Sensing:** use of a transducer (camera or microphone).
- **Segmentation and grouping:** patterns should be well separated and should not overlap.
- **Feature extraction:** discriminative features, invariant with respect to translation, rotation and scale.
- **Classification:** use the feature vector provided by the feature extractor to assign the object to a category.
- **Post-processing:** exploit context (input-dependent information other than from the target pattern itself) to improve performance.

**(b)** Nearest neighbour rule: keep all training samples, find the sample nearest to x and assign its class. Euclidean distance d = √(Δ1² + Δ2²) from x = [5, 5]:

| Sample | Class | Δ = sample - x | d² | d |
|---|---|---|---|---|
| S1 (2,3) | salmon | (-3, -2) | 9 + 4 = 13 | 3.61 |
| S2 (3,5) | salmon | (-2, 0) | 4 + 0 = 4 | 2.00 |
| S3 (4,2) | salmon | (-1, -3) | 1 + 9 = 10 | 3.16 |
| B1 (6,5) | sea bass | (1, 0) | 1 + 0 = 1 | 1.00 |
| B2 (8,8) | sea bass | (3, 3) | 9 + 9 = 18 | 4.24 |

Order: B1 (1.00) < S2 (2.00) < S3 (3.16) < S1 (3.61) < B2 (4.24).

- **1-NN: the nearest sample is B1 (d = 1), so x = sea bass.**
- **3-NN: B1 (sea bass), S2 (salmon), S3 (salmon) vote 2 to 1 for salmon. So no: 3-NN changes the class to salmon.** 1-NN follows one single (possibly noisy) sample; k-NN takes a majority vote.

---

### Q5. Compression: Shannon-Fano and run-length coding (10 pts)

(a) A source emitted 32 symbols with these counts:

| Symbol | A | B | C | D | E |
|---|---|---|---|---|---|
| Count | 10 | 9 | 6 | 4 | 3 |

Build the Shannon-Fano code (top-down splits, left branch = 0, right branch = 1). Give each codeword and the total number of bits, and compare with a fixed-length code. (6 pts)

(b) Run-length encode string X = `KKKKKKKMMMNNNNNNNNNPKKKKSSSSSS` (count, then symbol) and give the compression ratio in symbols. Then encode string Y = `PQRST` and comment on the result. (4 pts)

**Answer**

**Source:** L4 p.19-23 Shannon-Fano (top-down, sort then split) · L4 p.12-13 entropy · L4 p.11 compression ratio B0/B1 · L4 p.24 fixed-length coding · L4 p.14-15 run-length coding  
**Notes:** [Lecture 4 › Shannon Fano algorithm](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#7-shannon-fano-algorithm-slides-19-23) · [Lecture 4 › Run length coding](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#6-run-length-coding-repetition-suppression-pattern-substitution-slides-14-18)

**(a) Write:** Shannon-Fano is a top-down approach: 1. sort the symbols by count; 2. recursively divide them into two parts with approximately the same counts until each part has one symbol. Left = 0, right = 1.

Sorted: A 10, B 9, C 6, D 4, E 3 (total 32).

| Split | Options (left / right: counts) | Chosen |
|---|---|---|
| 1: {A,B,C,D,E} | {A} / {B,C,D,E}: 10 vs 22 (diff 12); **{A,B} / {C,D,E}: 19 vs 13 (diff 6)**; {A,B,C} / {D,E}: 25 vs 7 (diff 18) | {A,B} = 0, {C,D,E} = 1 |
| 2: {A,B} | {A} / {B}: 10 vs 9 | A = 00, B = 01 |
| 3: {C,D,E} | **{C} / {D,E}: 6 vs 7 (diff 1)**; {C,D} / {E}: 10 vs 3 (diff 7) | C = 10, {D,E} = 11 |
| 4: {D,E} | {D} / {E}: 4 vs 3 | D = 110, E = 111 |

```
              (32)
            0/    \1
         (19)      (13)
        0/  \1    0/  \1
      A:10  B:9  C:6  (7)
                    0/  \1
                   D:4   E:3
```

| Symbol | Count | Code | Length | Bits used |
|---|---|---|---|---|
| A | 10 | 00 | 2 | 20 |
| B | 9 | 01 | 2 | 18 |
| C | 6 | 10 | 2 | 12 |
| D | 4 | 110 | 3 | 12 |
| E | 3 | 111 | 3 | 9 |
| | | | TOTAL | **71** |

- **Total = 71 bits, average 71/32 = 2.22 bits/symbol.**
- **Fixed-length:** 5 symbols need ⌈log2 5⌉ = 3 bits, so 32 x 3 = **96 bits**. Shannon-Fano saves 25 bits; **compression ratio B0/B1 = 96/71 = 1.35**.
- Entropy η = Σ p_i log2(1/p_i) = 0.5244 + 0.5147 + 0.4528 + 0.3750 + 0.3202 = **2.187 bits/symbol** (lower bound 32 x 2.187 = 69.99 bits). Efficiency = 2.187 / 2.219 = **98.6%**. (Huffman gives the same code lengths here, also 71 bits.)

**(b)** RLE codes each run as count, then symbol.
- X = KKKKKKK MMM NNNNNNNNN P KKKK SSSSSS has the runs 7K, 3M, 9N, 1P, 4K, 6S, so **X → `7K3M9N1P4K6S`**: 30 symbols → 12 symbols, **compression ratio = 30/12 = 2.5**.
- **Y → `1P1Q1R1S1T`**: 5 symbols → 10 symbols, **ratio 0.5, so the "compressed" output is twice as long**. There are no runs: each single symbol still costs two entries (count + symbol, like the `1D` on the slide). RLE only pays off when the source has memory, i.e. symbols form continuous groups.

---

### Q6. MIDI (10 pts)

(a) What is MIDI? Why is a MIDI file much smaller than a WAV file of the same song? Support your answer by computing the size of 3 minutes of CD-quality WAV audio (44.1 kHz, 16 bits, stereo) and comparing it with about 3 kB of MIDI. (4 pts)

(b) A keyboard sends a Note On message on channel n = 5 (channels numbered 0-15), key number 67, velocity 90.

(i) Write the three bytes in hex and in binary, and explain the bits of the status byte. (3 pts)

(ii) MIDI runs at 31.25 kbps with 10-bit bytes. How long does this one message take to send? How long does a 5-note chord take (Note On messages only), and how long with the 5 Note Off messages added? (3 pts)

**Answer**

**Source:** L3 p.15-16 MIDI definition, scripting language, small files · L3 p.21 3 min MIDI ≈ 3 kB, WAV 1 min ≈ 10 MB · L3 p.25 status bytes 128-255, data bytes 0-127, 10-bit bytes · L3 p.35 channel message structure · L3 p.37 Table 6.3 · L3 p.31, 34 31.25 kbps and timing example  
**Notes:** [Lecture 3 › MIDI basics](../notes/03_Week2_Audio_SNR_MIDI_PCM.md#7-midi-basics-concepts-and-terminology-slides-15-24) · [Lecture 3 › Structure of MIDI messages](../notes/03_Week2_Audio_SNR_MIDI_PCM.md#10-structure-of-midi-messages-slides-35-39) · [Lecture 3 › Hardware aspects of MIDI](../notes/03_Week2_Audio_SNR_MIDI_PCM.md#9-hardware-aspects-of-midi-slides-31-34)

**(a) Write:**
- MIDI (Musical Instrument Digital Interface, early 1980s) is a protocol adopted by the electronic music industry. It lets computers, synthesizers, keyboards and other musical devices communicate.
- MIDI is a scripting language: it codes **events** (which note, its volume, which instrument), not the sound itself. A WAV file stores every audio sample, so MIDI files are generally very small.
- Size of 3 min of CD-quality WAV: 44,100 x 16 x 2 = 1,411,200 bit/s = 176,400 bytes/s. Over 180 s: 176,400 x 180 = **31,752,000 bytes ≈ 31.75 MB**.
- MIDI: about 3 kB, so **about 10,000 times smaller** (31,752,000 / 3,000 ≈ 10,584).

**(b)(i)** Table 6.3: Note On = status &H9n, then key number, then velocity. Status byte layout: `1 t t t n n n n`.

| Byte | Value | Hex | Binary |
|---|---|---|---|
| Status (Note On, n = 5) | 144 + 5 = 149 | **&H95** | **1001 0101** |
| Data 1 (key number) | 67 | **&H43** | **0100 0011** |
| Data 2 (velocity) | 90 | **&H5A** | **0101 1010** |

Status byte 1001 0101:
- MSB = 1 marks a status byte (status bytes are 128-255).
- The next three bits, 001, give the message type, Note On.
- The four low-order bits, 0101, give channel 5.
- The data bytes have MSB = 0 (values 0-127).

**Message = 95 43 5A (hex) = 10010101 01000011 01011010.**

**(ii)** Each MIDI byte is 10 bits (8 bits plus a start and a stop bit).

| Case | Bits | Time at 31,250 bit/s |
|---|---|---|
| One Note On message | 3 x 10 = 30 | 30 / 31,250 = **0.00096 s = 0.96 ms** |
| 5-note chord, Note On only | 5 x 30 = 150 | **0.0048 s = 4.8 ms** |
| plus 5 Note Off messages (status &H85) | 150 + 150 = 300 | **0.0096 s = 9.6 ms** |

---

### Q7. Human visual perception and image formation (10 pts)

(a) Compare rods and cones: where they are, what they respond to, and which one dominates in scotopic and in photopic vision. (3 pts)

(b) In a brightness discrimination experiment the just noticeable difference is ΔI_c = 4 on a background of I = 80, and ΔI_c = 0.5 on a dim background of I = 2. Compute both Weber ratios. In which case is brightness discrimination better, and which receptor dominates in the other case? (2 pts)

(c) With the image formation model f(x,y) = i(x,y) · r(x,y), compute f for a white page (r = 0.75) and for black ink (r = 0.05) under office light (i = 1,000 lm/m²) and on a cloudy day (i = 10,000 lm/m²). What is the page-to-ink ratio in each case, and what does it show? (3 pts)

(d) Define dynamic range. A camera sensor saturates at 12,000 and its noise level is 8 (same units as f). Compute its dynamic range. Can it record all four values from (c) without clipping and without losing the darkest one in noise? (2 pts)

**Answer**

**Source:** L6 p.4-5 rods and cones, scotopic and photopic vision · L6 p.6-7 Weber ratio · L6 p.23 image formation model f = i · r · L6 p.26 dynamic range  
**Notes:** [Lecture 6 › Human eye structure](../notes/06_Week3_Image_Basics_Perception_Resampling.md#1-human-eye-structure-slides-3-4) · [Lecture 6 › Brightness adaptation and Weber ratio](../notes/06_Week3_Image_Basics_Perception_Resampling.md#2-brightness-adaptation-and-weber-ratio-slides-5-7) · [Lecture 6 › Image sensing and the 2D image model](../notes/06_Week3_Image_Basics_Perception_Resampling.md#7-image-sensing-and-the-2d-image-model-slides-20-23) · [Lecture 6 › Dynamic range](../notes/06_Week3_Image_Basics_Perception_Resampling.md#8-sampling-quantization-and-dynamic-range-slides-24-26)

**(a)**

| | Cones | Rods |
|---|---|---|
| Where | in the fovea | spread over the retina; give a general overall picture of the view |
| Respond to | highly sensitive to color | insensitive to color; sensitive to low levels of illumination |
| Vision | photopic (good light): gives color | scotopic (low light): objects visible but black and white |

**(b)** Weber ratio = ΔI_c / I.
- Bright background: 4 / 80 = **0.05**.
- Dim background: 0.5 / 2 = **0.25**.
- **A small ratio means good discrimination, so the bright background (0.05) is better.** On the dim background the large ratio (0.25) means poor discrimination; **rods** dominate there, while cones dominate at high intensity.

**(c)** f = i · r:

| Illumination | Page (r = 0.75) | Ink (r = 0.05) | Page / ink |
|---|---|---|---|
| Office, i = 1,000 | **750** | **50** | 15 |
| Cloudy day, i = 10,000 | **7,500** | **500** | 15 |

**The ratio is 15 in both cases (= 0.75 / 0.05).** Illumination (the source) only scales every value; the contrast between the objects comes from the reflectance (the object). Since 0 < r < 1, f is always below i.

**(d)** Dynamic range = the ratio of the maximum detectable intensity (saturation) to the minimum detectable intensity (noise): DR = I_max / I_min = 12,000 / 8 = **1,500 (1,500 : 1)**.

**Yes, the sensor records all four values.** The brightest, 7,500, is below 12,000, so nothing clips. The darkest, 50, is above the noise level of 8. The scene ratio, 7,500 / 50 = 150, is far below 1,500.

---

### Q8. Edge detection (10 pts)

(a) Compare first-order and second-order derivative edge operators. Then compare the Roberts, Prewitt and Sobel operators. (4 pts)

(b) Two 3x3 neighbourhoods; the pixel of interest is the centre one.

W1:

```
50 30 10
70 40 20
90 60 30
```

W2:

```
30  32 30
28 110 30
30  30 34
```

Prewitt row mask H_r:

```
1 0 -1
1 0 -1
1 0 -1
```

Prewitt column mask H_c:

```
-1 -1 -1
 0  0  0
 1  1  1
```

Laplacian mask (centre 8):

```
-1 -1 -1
-1  8 -1
-1 -1 -1
```

Apply a mask by multiplying each pixel by the mask weight in the same position and adding (no flipping).

(i) At the centre of W1 compute H_r, H_c, the gradient magnitude (both the square-root form and the |H_r| + |H_c| form) and the direction θ = tan⁻¹(H_c / H_r). (3 pts)

(ii) Apply the Laplacian at the centre of W1 and of W2. Use the same mask as the point detection mask with threshold T = 400: is a point detected in W1? In W2? (3 pts)

**Answer**

**Source:** L11 p.29-30 derivatives at an edge · L11 p.37 Prewitt masks, magnitude and direction · L11 p.38 Roberts / Prewitt / Sobel properties · L11 p.45 Laplacian and its disadvantages · L11 p.27-28 point detection |R| > T  
**Notes:** [Lecture 11 › First order derivative operators](../notes/11_Week6_Spatial_Filtering_Edges.md#8-first-order-derivative-operators-roberts-prewitt-sobel-frei-chen-slides-37-40-43-44) · [Lecture 11 › Second order operators](../notes/11_Week6_Spatial_Filtering_Edges.md#10-second-order-operators-laplacian-and-zero-crossing-slides-45-47) · [Lecture 11 › Point and line detection](../notes/11_Week6_Spatial_Filtering_Edges.md#6-point-and-line-detection-slides-27-28)

**(a) Write:**
- **First order (gradient based: Roberts, Prewitt, Sobel):**
  - one spike per edge;
  - gives the magnitude H = √(H_r² + H_c²) (or |H_r| + |H_c|) and the direction θ = tan⁻¹(H_c / H_r).
- **Second order (Laplacian; LoG):**
  - a +/- pair per edge; the sign change (zero crossing) marks the edge centre, so "better edge localization";
  - but "unacceptably sensitive to noise", "produce double edges", "unable to detect edge direction".
- **Roberts:** "smaller effective area than the other masks" (diagonal differences); "more susceptible to noise".
- **Prewitt:** weights 1 1 1; "more sensitive to vertical and horizontal edges than diagonal edges".
- **Sobel:** weights 1 2 1 (the centre row or column is weighted, which smooths); "more sensitive to diagonal edges than vertical and horizontal edges".

**(b)(i) W1:**
- H_r = left column - right column = (50+70+90) - (10+20+30) = 210 - 60 = **150**.
- H_c = bottom row - top row = (90+60+30) - (50+30+10) = 180 - 90 = **90**.
- Magnitude, square-root form: √(150² + 90²) = √(22,500 + 8,100) = √30,600 = **174.93**.
- Magnitude, absolute form: |150| + |90| = **240**.
- Direction: θ = tan⁻¹(90 / 150) = tan⁻¹(0.6) = **30.96°**.
- So intensity falls from left to right and rises downward: a diagonal edge with the bright side at the bottom-left.

**(ii)** Laplacian / point mask: R = 8 · z_centre - (sum of the 8 neighbours). A point is detected where |R| > T.

| Window | Sum of 8 neighbours | R | \|R\| > 400? |
|---|---|---|---|
| W1 | 50+30+10+70+20+90+60+30 = 360 | 8(40) - 360 = **-40** | **No**: a smooth ramp/edge, not a point |
| W2 | 30+32+30+28+30+30+30+34 = 244 | 8(110) - 244 = **636** | **Yes: isolated point detected** |

The Laplacian is small on W1, where the intensity changes almost linearly, so a large first derivative comes with a near-zero second derivative. W2 has one bright pixel on a nearly constant background, so the response is large.

---

## Score check

| Q | Max | What earns the points |
|---|---|---|
| Q1 | 10 | (a) 2: closing = dilate then erode, formula, "removes dark spots / fills holes and gaps"; 2: opening = erode then dilate, its effects, A∘B ⊆ A ⊆ A•B. (b) 3: correct A ⊕ B; 3: correct closing, with (4,2), (2,5), (3,4) named and the 3-wide notch explained. |
| Q2 | 10 | (a) 1 per border method. (b)(i) 1 average 55.56, 1 Gaussian 63.75, 1 reason (centre weight). (ii) 2 for the four corner values (33.33, 43.75, 77.78, 78.75), 1 for "duplication is realistic, zero padding darkens". |
| Q3 | 10 | (a) 3: n_k = 0 2 5 8 6 3 1 0 and p(r_k). (b) 4: cumulative sums, 7 x cdf, rounding, LUT 0 1 2 4 6 7 7 7. (c) 2: new histogram 0 2 5 0 8 0 6 4; 1: discrete levels cannot be split or created, levels merge. |
| Q4 | 10 | (a) 3: six labelled stages in order with arrows; 2: three side inputs to the right stages; 1: one line per stage. (b) 2: five distances; 1: 1-NN = sea bass; 1: 3-NN = salmon, so the class changes. |
| Q5 | 10 | (a) 3: correct splits and codes 00 01 10 110 111; 2: 71 bits vs 96 bits fixed; 1: ratio 1.35 (or entropy/efficiency). (b) 2: `7K3M9N1P4K6S`, ratio 2.5; 2: `1P1Q1R1S1T`, ratio 0.5, RLE needs runs. |
| Q6 | 10 | (a) 2: protocol, event coding (scripting language); 2: 31.75 MB vs about 3 kB. (b)(i) 2: &H95 &H43 &H5A in hex and binary; 1: status bits (MSB 1, type 001, channel 0101). (ii) 1 each: 0.96 ms, 4.8 ms, 9.6 ms. |
| Q7 | 10 | (a) 3: location, color vs low light, photopic vs scotopic. (b) 2: 0.05 vs 0.25, small = better, rods at low light. (c) 2: four f values; 1: ratio 15 comes from reflectance. (d) 1: DR definition and 1,500; 1: yes, 50 > 8 and 7,500 < 12,000. |
| Q8 | 10 | (a) 2: first vs second order (spike vs zero crossing, noise, double edges, direction); 2: Roberts, Prewitt, Sobel properties. (b)(i) 1: H_r = 150, H_c = 90; 1: 174.93 and 240; 1: 30.96°. (ii) 1: R(W1) = -40; 1: R(W2) = 636; 1: decisions with T = 400. |
