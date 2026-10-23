# Multimedia Computing: Midterm Sample 5

Lectures 2-12 (not 1, 8, 13) · 100 pts · Part 1: 10 x 2 = 20 · Part 2: 8 x 10 = 80 · Answer and explanation under each question

## Part 1: Multiple choice (10 x 2 = 20 pts)

**1.** A 170 Hz tone travels through air at 340 m/s. What is its wavelength?  
a) 0.5 m  
b) 2 m  
c) 57,800 m  
d) 5.88 ms

> **Answer: b)** λ = v/f = vT = 340/170 = 2 m. a) is f/v, c) is v x f, d) is the period 1/f (a time, not a length).  
> **Source:** L2 p.25 wavelength and period · L2 p.26 λ = vT  
> **Notes:** [Lecture 2 › Sine wave parameters](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#4-sine-wave-parameters-amplitude-frequency-period-phase-wavelength-slides-16-18-21-26)

**2.** In MIDI, the value of a status byte lies in the range:  
a) 0 to 127  
b) 0 to 15  
c) 128 to 255  
d) 0 to 255

> **Answer: c)** "The data in a MIDI status byte is between 128 and 255; each of the data bytes is between 0 and 127." The status byte has its MSB = 1. b) 0-15 is the channel nibble.  
> **Source:** L3 p.25 status bytes 128-255, data bytes 0-127 · L3 p.35 status byte MSB = 1, channel in the four low bits  
> **Notes:** [Lecture 3 › MIDI bytes](../notes/03_Week2_Audio_SNR_MIDI_PCM.md#8-midi-bytes-envelope-and-sequencers-slides-22-25-30) · [Lecture 3 › Structure of MIDI messages](../notes/03_Week2_Audio_SNR_MIDI_PCM.md#10-structure-of-midi-messages-slides-35-39)

**3.** Which statement about Shannon-Fano and Huffman coding is correct?  
a) Shannon-Fano is top-down (sort, then recursively split into two parts with about equal counts); Huffman is bottom-up (repeatedly merge the two least probable nodes)  
b) Shannon-Fano is bottom-up (merge the two least probable nodes); Huffman is top-down (recursively split the sorted list)  
c) Both are top-down; they differ only in which branch gets 0 and which gets 1  
d) Both build a dictionary of variable-length strings and send fixed-length codes

> **Answer: a)** Slide titles: "Shannon-Fano Algorithm, a top-down approach" and "Huffman Coding Algorithm, a bottom-up approach". b) swaps them. d) describes LZW.  
> **Source:** L4 p.19 Shannon-Fano, top-down · L4 p.27 Algorithm 7.1 Huffman, bottom-up  
> **Notes:** [Lecture 4 › Shannon Fano algorithm](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#7-shannon-fano-algorithm-slides-19-23) · [Lecture 4 › Huffman coding](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#8-huffman-coding-slides-24-29)

**4.** On the MPEG-1 Audio encoding characteristics slide, which bit-rate range and target belong to Layer 3 (MP3)?  
a) 32-448 kbps, target 192 kbps  
b) 32-384 kbps, target 128 kbps  
c) 32-320 kbps, target 64 kbps  
d) 32-320 kbps, target 320 kbps

> **Answer: c)** "Layer 3: 32-320 kbps, target 64 kbps". a) is Layer 1 and b) is Layer 2. (The "128 kbps" on slide 25 is the stereo goal, 64 kbps per channel.)  
> **Source:** L5 p.23 MPEG-1 layers, bit rates and targets  
> **Notes:** [Lecture 5 › MPEG audio history and MPEG1 layers](../notes/05_Week3_ArithmeticCoding_LossyCompression_MPEG.md#9-mpeg-audio-history-and-mpeg1-layers-i-ii-iii-slides-21-28-42)

**5.** Which image interpolation method gives the sharpest images and preserves fine details, but is slow?  
a) Nearest neighbor  
b) Bilinear  
c) All three methods give the same sharpness; they differ only in speed  
d) Bicubic

> **Answer: d)** Bicubic: "Images are sharpest; fine details are preserved; slow". Nearest neighbor is fast and simple, with loss of sharpness and checkerboard artifacts.  
> **Source:** L6 p.36 nearest neighbor, bilinear and bicubic trade-offs  
> **Notes:** [Lecture 6 › Image resampling and interpolation](../notes/06_Week3_Image_Basics_Perception_Resampling.md#12-image-resampling-and-interpolation-slide-36)

**6.** How many pixels are in N4(p) for p = (3, 5), and which are they?  
a) 4: (2,5), (4,5), (3,4), (3,6)  
b) 4: (2,4), (2,6), (4,4), (4,6)  
c) 8: every pixel with D8 = 1 from p  
d) 4: (1,5), (5,5), (3,3), (3,7)

> **Answer: a)** N4(p) = (x+1,y), (x−1,y), (x,y+1), (x,y−1), which is 4 pixels. b) is N_D (the diagonals), c) is N8, d) are pixels at distance 2.  
> **Source:** L7 p.21 N4, ND and N8  
> **Notes:** [Lecture 7 › Neighbors of a pixel](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#4-neighbors-of-a-pixel-slide-21)

**7.** Which statement about the XOR operation on images is correct?  
a) XOR sets bits that are the same in both operands to 1 and bits that differ to 0  
b) p XOR v = 0 exactly when p = v, so XOR with v turns every pixel of value v black; it is used to find all pixels of a certain value  
c) XOR with 255 gives the same result as adding 255 with clamping  
d) XOR is used to adjust the contrast of an image, like multiplication

> **Answer: b)** XOR sets equal bits to 0 and different bits to 1, so p XOR v = 0 only when p = v ("sets the pixels that are specified to black"). a) is reversed. c) XOR 255 = NOT = 255 − p. d) is multiplication.  
> **Source:** L9 p.56 XOR operation and its use  
> **Notes:** [Lecture 9 › Logic operations](../notes/09_Week5_Intensity_Transforms_Histogram.md#11-logic-operations-slides-54-59)

**8.** The hit-or-miss transform A ⊛ B = (A ⊖ X) ∩ [A^c ⊖ (W − X)] gives:  
a) the boundary of A, that is A − (A ⊖ B)  
b) A with all its holes filled  
c) the erosion of A followed by a dilation  
d) the points where the shape X fits in A and, at the same time, its local background W − X fits in A^c

> **Answer: d)** Hit-or-miss finds the location of shape X: B1 = X must hit A and B2 = W − X must hit A^c at the same time. a) is boundary extraction, b) region filling, c) opening.  
> **Source:** L10 p.36-37 hit-or-miss transform  
> **Notes:** [Lecture 10 › Hit or miss transform](../notes/10_Week5_Morphology.md#6-hit-or-miss-transform-slides-36-37)

**9.** Which is a disadvantage of the Laplacian edge detector?  
a) It is sensitive to noise, produces double edges and cannot detect edge direction  
b) It needs eight masks, one for each orientation  
c) It has no zero crossing, so edges cannot be localized  
d) It is a first order operator, so it gives one thick spike per edge

> **Answer: a)** Laplacian disadvantages: "sensitive to noise", "produce double edges", "unable to detect edge direction". It has better localization through zero crossings (c is wrong). b) describes the compass operators.  
> **Source:** L11 p.45 Laplacian: zero crossing and disadvantages  
> **Notes:** [Lecture 11 › Second order operators](../notes/11_Week6_Spatial_Filtering_Edges.md#10-second-order-operators-laplacian-and-zero-crossing-slides-45-47)

**10.** How does a nearest neighbor classifier assign a class to a feature vector?  
a) It computes the mean of each class and chooses the closest mean, rejecting the vector if it is too far  
b) It groups the unlabeled samples into natural clusters  
c) It keeps all training samples, finds the training sample closest to the feature vector and assigns that sample's class; it can be extended to k nearest neighbors  
d) It converts the pattern into a grammar and parses it

> **Answer: c)** "Keep all the training samples ... find the nearest neighbor ... assign the class of the neighbor. Can be extended to K nearest neighbors." a) is nearest class mean, b) unsupervised learning, d) structural PR.  
> **Source:** L12 p.41 nearest neighbor classification  
> **Notes:** [Lecture 12 › Nearest neighbor and k nearest neighbors](../notes/12_Week7_Pattern_Recognition.md#11-nearest-neighbor-and-k-nearest-neighbors-slide-41)

## Part 2: Short questions (8 x 10 = 80 pts)

### Q1. Morphology: dilation, erosion and boundary extraction (10 pts)

Binary image A (6 x 6, 1 = foreground, pixels outside the image count as 0):

```
0 0 0 0 0 0
0 1 1 1 0 0
0 1 1 1 0 1
1 1 1 1 0 0
0 1 1 1 1 0
0 0 0 0 0 0
```

Structuring elements (origin in brackets):

```
B1 (1 x 3):   1 [1] 1

B2 (3 x 3):   1  1  1
              1 [1] 1
              1  1  1
```

(a) What are dilation and erosion? Give the set definition of each and what it does to the foreground. (4 pts)  
(b) Compute A ⊕ B1 and A ⊖ B1. Then extract the boundary β(A) = A − (A ⊖ B2). (6 pts)

**Answer**

**Source:** L10 p.20 dilation definition · L10 p.12-13 dilation = local maximum, bright regions grow · L10 p.23 erosion definition · L10 p.15, p.18 erosion = local minimum, foreground shrinks · L10 p.22 broken segments joined · L10 p.38 boundary extraction  
**Notes:** [Lecture 10 › Dilation](../notes/10_Week5_Morphology.md#3-dilation-slides-12-14-20-22) · [Lecture 10 › Erosion](../notes/10_Week5_Morphology.md#4-erosion-slides-15-19-23-25) · [Lecture 10 › Boundary extraction](../notes/10_Week5_Morphology.md#7-boundary-extraction-slides-38-39)

**(a) Write (4 pts)**
- Morphology is a collection of non-linear operations related to the shape of features in an image. The structuring element B is a small binary matrix with an origin.
- **Dilation:** A ⊕ B = { z | (B̂)_z ∩ A ≠ ∅ }, the set of all displacements z such that the reflected B and A overlap by at least one element. Each pixel takes the maximum over the neighborhood: it enlarges bright regions, shrinks dark regions, expands the boundary and joins broken segments.
- **Erosion:** A ⊖ B = { z | (B)_z ⊆ A }, the set of all points z such that B translated by z is contained in A. Each pixel takes the minimum: foreground areas shrink, holes become larger, and objects smaller than B disappear.
- Duality: (A ⊖ B)^c = A^c ⊕ B̂.

**(b) Work (6 pts)**

Rules. B1 is symmetric, so B̂1 = B1, and pixels outside the image count as 0. Coordinates are (row, col), 0-based, with (0,0) at the top left.
- A ⊕ B1: the output is 1 if the pixel or its left or right neighbor is 1. Each horizontal run grows by 1 pixel at each end.
- A ⊖ B1: the output is 1 only if the pixel and both horizontal neighbors are 1. Each run loses its two end pixels.
- A ⊖ B2: the output is 1 only if the whole 3x3 neighborhood is 1.

| row | A | A ⊕ B1 | A ⊖ B1 | A ⊖ B2 | β(A) = A − (A ⊖ B2) |
|---|---|---|---|---|---|
| 0 | `0 0 0 0 0 0` | `0 0 0 0 0 0` | `0 0 0 0 0 0` | `0 0 0 0 0 0` | `0 0 0 0 0 0` |
| 1 | `0 1 1 1 0 0` | `1 1 1 1 1 0` | `0 0 1 0 0 0` | `0 0 0 0 0 0` | `0 1 1 1 0 0` |
| 2 | `0 1 1 1 0 1` | `1 1 1 1 1 1` | `0 0 1 0 0 0` | `0 0 1 0 0 0` | `0 1 0 1 0 1` |
| 3 | `1 1 1 1 0 0` | `1 1 1 1 1 0` | `0 1 1 0 0 0` | `0 0 1 0 0 0` | `1 1 0 1 0 0` |
| 4 | `0 1 1 1 1 0` | `1 1 1 1 1 1` | `0 0 1 1 0 0` | `0 0 0 0 0 0` | `0 1 1 1 1 0` |
| 5 | `0 0 0 0 0 0` | `0 0 0 0 0 0` | `0 0 0 0 0 0` | `0 0 0 0 0 0` | `0 0 0 0 0 0` |
| # of 1s | 15 | 22 | 6 | 2 | 13 |

Checks to write next to the table:
- Dilation fills the gap at (2,4), so the isolated pixel (2,5) joins the block. Rows 0 and 5 stay 0 because B1 is horizontal only.
- Erosion deletes the isolated pixel (2,5). It also deletes (3,0), because its left neighbor is outside the image (= 0).
- A ⊖ B2: (2,1) fails because (1,0) = 0, (2,3) fails because (1,4) = 0, (3,1) fails because (2,0) = 0, and (3,3) fails because (2,4) = 0. Only (2,2) and (3,2) survive.

**Result: A ⊕ B1 = 22 pixels, A ⊖ B1 = {(1,2), (2,2), (3,1), (3,2), (4,2), (4,3)}, and β(A) = A without (2,2) and (3,2), which is 13 pixels (table, last column).**

---

### Q2. Filtering: high boost and median vs average (10 pts)

(a) Write the high-boost (unsharp masking) formula and the 3x3 high-boost mask for α = 1.5. What is the result when α = 1, and what happens when α > 1? (4 pts)  
(b) One image row with a step edge and one impulse (salt) pixel, positions p0 to p9:

| p0 | p1 | p2 | p3 | p4 | p5 | p6 | p7 | p8 | p9 |
|---|---|---|---|---|---|---|---|---|---|
| 30 | 30 | 30 | 240 | 30 | 30 | 90 | 90 | 90 | 90 |

Apply a 3-point average filter and a 3-point median filter to p1 to p8 (p0 and p9 are kept unchanged). (4 pts)  
(c) Which filter removes the impulse and keeps the edge sharp? Explain in one line. Would a min filter or a max filter remove this impulse? (2 pts)

**Answer**

**Source:** L11 p.21 unsharp masking and high-boost formula · L11 p.24-26 effect of α · L11 p.16 average (blurring) mask · L11 p.15 border handling · L11 p.53-55 median filtering · L11 p.60 min/max filtering  
**Notes:** [Lecture 11 › Sharpening and high boost](../notes/11_Week6_Spatial_Filtering_Edges.md#5-sharpening-high-pass-unsharp-masking-high-boost-slides-20-26) · [Lecture 11 › Blurring](../notes/11_Week6_Spatial_Filtering_Edges.md#4-blurring-average-and-gaussian-masks-slides-16-19) · [Lecture 11 › Median filtering](../notes/11_Week6_Spatial_Filtering_Edges.md#13-median-and-color-median-filtering-slides-53-59) · [Lecture 11 › Min and max filtering](../notes/11_Week6_Spatial_Filtering_Edges.md#14-minimum-and-maximum-filtering-slide-60)

**(a) Write (4 pts)**
- Unsharp masking: "subtract a lowpass filtered image from its original" (another method of highpass filtering).
- **High boost = α · Original − Lowpass.** The mask has centre ω/9 and all 8 neighbors −1/9, with ω = 9α − 1.
- For α = 1.5, ω = 9(1.5) − 1 = 12.5:

```
         -1    -1    -1
1/9  x   -1   12.5   -1
         -1    -1    -1
```

  The centre is 12.5/9 = 1.389, and the mask sums to (ω − 8)/9 = α − 1 = 0.5.
- α = 1: ω = 8, so the result is the **high pass filter** (1/9)[−1 −1 −1; −1 8 −1; −1 −1 −1]. It sums to 0, so flat areas become 0 and only the detail remains.
- α > 1: it restores the low frequency component and retains more of the original background. As α increases, the image gets lighter and looks more like the original, with edge enhancement.

**(b) Work (4 pts).** Border rule: p0 and p9 have no full window, so they are kept as they are (start at the first position where the window fits).

| Pixel | Window | Average (sum/3) | Median (sorted, middle) |
|---|---|---|---|
| p1 | 30 30 30 | 90/3 = 30 | 30 30 30 → 30 |
| p2 | 30 30 240 | 300/3 = 100 | 30 30 240 → 30 |
| p3 | 30 240 30 | 300/3 = 100 | 30 30 240 → 30 |
| p4 | 240 30 30 | 300/3 = 100 | 30 30 240 → 30 |
| p5 | 30 30 90 | 150/3 = 50 | 30 30 90 → 30 |
| p6 | 30 90 90 | 210/3 = 70 | 30 90 90 → 90 |
| p7 | 90 90 90 | 90 | 90 |
| p8 | 90 90 90 | 90 | 90 |

**Average: `30 30 100 100 100 50 70 90 90 90`**  
**Median: `30 30 30 30 30 30 90 90 90 90`**

**(c) Write (2 pts)**
- **The median filter wins.** The single 240 is never the middle value of 3, so it disappears, and the step 30 → 90 stays sharp between p5 and p6. The average smears the impulse into three pixels (100) and blurs the edge into a ramp 30, 50, 70, 90. The median is "superior to lowpass filter when dealing with edges"; the lowpass filter suits Gaussian noise, not impulse noise.
- **The min filter** "removes white spikes": its output is `30 30 30 30 30 30 30 90 90 90`, so the 240 is gone, but the edge moves one pixel right (p6 = 30) and intensity drops. **The max filter** removes dark spikes; here it spreads the salt to `30 30 240 240 240 90 90 90 90 90`. So the min filter removes this impulse and the max filter does not.

---

### Q3. Histogram equalization and lookup table (10 pts)

A 4 x 4 image with 8 gray levels (3 bits, levels 0 to 7):

```
5 5 6 6
4 5 6 7
5 6 6 7
5 5 6 6
```

(a) Calculate the histogram, the normalized sum and the equalized level s_k for all 8 gray levels. Show the full table. (5 pts)  
(b) Write the equalized image and its histogram. Is the output histogram flat? Why? (2 pts)  
(c) A 3-bit lookup table is given below. Apply it to the pixel row `2 7 4 0 5 3 6 1`, and say what kind of point transformation this LUT performs. (3 pts)

| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| Output | 0 | 1 | 1 | 2 | 4 | 6 | 7 | 7 |

**Answer**

**Source:** L9 p.14 histogram · L9 p.20 equalization steps · L9 p.21, p.27-28 mapping T(r) with factor (L−1)/N² · L9 p.29-31 worked example (round to nearest) · L9 p.26 output histogram not flat · L9 p.9-11 lookup tables · L9 p.13 contrast stretching curve  
**Notes:** [Lecture 9 › Histogram equalization, theory](../notes/09_Week5_Intensity_Transforms_Histogram.md#6-histogram-equalization-theory-slides-20-28) · [Lecture 9 › Histogram equalization, worked example](../notes/09_Week5_Intensity_Transforms_Histogram.md#7-histogram-equalization-worked-example-slides-29-31) · [Lecture 9 › Lookup tables](../notes/09_Week5_Intensity_Transforms_Histogram.md#3-lookup-tables-slides-9-12)

**(a) Write and work (5 pts).** The steps are: 1) compute the histogram, 2) calculate the normalized sum of the histogram, 3) transform the input image to the output image. The convention follows the slide: L = 8 and N² = 16, so the normalized sum is the running sum × (L−1)/N² = × 7/16, rounded to the nearest integer.

| r_k | n_k | p_r = n_k/16 | running sum | cdf = sum/16 | sum × 7/16 | s_k |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| 4 | 1 | 0.0625 | 1 | 0.0625 | 0.4375 | **0** |
| 5 | 6 | 0.375 | 7 | 0.4375 | 3.0625 | **3** |
| 6 | 7 | 0.4375 | 14 | 0.875 | 6.125 | **6** |
| 7 | 2 | 0.125 | 16 | 1.0 | 7.0 | **7** |

**Mapping (LUT): `0 0 0 0 0 3 6 7`, that is 4 → 0, 5 → 3, 6 → 6, 7 → 7.**

**(b) Equalized image (2 pts)**

```
3 3 6 6
0 3 6 7
3 6 6 7
3 3 6 6
```

- **Output histogram: n0 = 1, n3 = 6, n6 = 7, n7 = 2 (all other levels 0). It is not flat.**
- Why: the discrete approximation. All pixels with the same level map together, so equalization cannot split a level; it only moves levels apart. The narrow bright range 4-7 (a washed-out image) is spread over 0-7. Contrast is stretched near the histogram maxima: levels 5 and 6 were 1 apart and are now 3 apart.

**(c) Lookup table (3 pts).** Use each pixel value as the array index, and the new value is the element at that index.

| Input | 2 | 7 | 4 | 0 | 5 | 3 | 6 | 1 |
|---|---|---|---|---|---|---|---|---|
| Output | 1 | 7 | 4 | 0 | 6 | 2 | 7 | 1 |

**Output row: `1 7 4 0 6 2 7 1`.** The LUT is an **S-shaped contrast stretching** around m = 4. Levels below 4 get darker (2 → 1, 3 → 2) and levels above 4 get brighter (5 → 6, 6 → 7), so contrast is increased.

---

### Q4. Pattern recognition (10 pts)

(a) Draw the flow chart of a pattern recognition system from input to decision, including the side inputs. State the job of each stage in a few words. (5 pts)  
(b) Fish example (sorting salmon and sea bass on a conveyor). Why is length alone a poor feature? What do lightness and width add? What is a decision boundary, and why would we move it because of cost? (2 pts)  
(c) Training samples with feature vector x = [lightness, width]:

| Sample | S1 | S2 | S3 | B1 | B2 | B3 | B4 |
|---|---|---|---|---|---|---|---|
| Class | salmon | salmon | salmon | sea bass | sea bass | sea bass | sea bass |
| Lightness | 4 | 3 | 2 | 6 | 8 | 7 | 9 |
| Width | 20 | 18 | 15 | 18 | 19 | 21 | 17 |

Classify the new fish x = [5, 18] with the nearest neighbor rule (k = 1) and with k-NN, k = 3, using the Euclidean distance. (3 pts)

**Answer**

**Source:** L12 p.17-19 PR system stages · L12 p.18 flowchart · L12 p.4-6 fish problem and preprocessing · L12 p.8-11 length, lightness, decision boundary and cost · L12 p.12-15 lightness + width, best boundary, generalization · L12 p.41 nearest neighbor and k-NN  
**Notes:** [Lecture 12 › Pattern recognition system flowchart](../notes/12_Week7_Pattern_Recognition.md#4-pattern-recognition-system-flowchart-slides-17-19) · [Lecture 12 › Choosing features, decision boundary and cost](../notes/12_Week7_Pattern_Recognition.md#3-choosing-features-decision-boundary-and-cost-slides-8-16) · [Lecture 12 › Nearest neighbor and k-NN](../notes/12_Week7_Pattern_Recognition.md#11-nearest-neighbor-and-k-nearest-neighbors-slide-41)

**(a) Draw (5 pts).** Read the chart bottom to top. Solid `^` = data flow (black on the slide). Dotted `: v` = arrows back down to the stage below (gray on the slide).

```
                  decision
                      ^
                      |
           +--------------------+
           |  post-processing   |<----------- costs
           +--------------------+<----+
               ^          :           |
               |          v           +----- adjustments for context
           +--------------------+<----+
           |   classification   |<----------- adjustments for missing features
           +--------------------+
               ^          :
               |          v
           +--------------------+
           | feature extraction |
           +--------------------+
               ^          :
               |          v
           +--------------------+
           |    segmentation    |
           +--------------------+
               ^          :
               |          v
           +--------------------+
           |      sensing       |
           +--------------------+
                      ^
                      |
                    input
```

- **Sensing:** "use of a transducer (camera or microphone)". The system depends on the bandwidth, resolution, sensitivity and distortion of the transducer.
- **Segmentation and grouping:** "patterns should be well separated and should not overlap" (isolate each fish from the others and from the background).
- **Feature extraction:** "discriminative features"; "invariant features with respect to translation, rotation and scale". It reduces the data by measuring certain features.
- **Classification:** "use a feature vector provided by a feature extractor to assign the object to a category".
- **Post-processing:** "exploit context input dependent information other than from the target pattern itself to improve performance". Costs and context come in here.

**(b) Write (2 pts)**
- **Length:** the salmon and sea bass length histograms overlap heavily, so any threshold l* misclassifies many fish. "The length is a poor feature alone!"
- **Lightness** separates the classes much better (threshold x*). **Width** adds a second feature: x^T = [x1, x2] = [lightness, width]. In this 2D feature space a straight line separates the classes better than any single feature.
- **Decision boundary:** the border in feature space that splits it into class regions (a threshold for 1 feature, a line or curve for 2).
- **Cost:** the two errors do not cost the same, so we "move our decision boundary toward smaller values of lightness in order to minimize the cost (reduce the number of sea bass that are classified salmon!)". This is the task of decision theory. A boundary that is perfect on the training data can still fail on novel input (the issue of generalization).

**(c) Work (3 pts).** The query is x = [5, 18], and d = sqrt((Δlightness)² + (Δwidth)²).

| Sample | Class | Δl | Δw | d² | d | Rank |
|---|---|---|---|---|---|---|
| B1 (6,18) | sea bass | 1 | 0 | 1 | 1.000 | 1 |
| S2 (3,18) | salmon | −2 | 0 | 4 | 2.000 | 2 |
| S1 (4,20) | salmon | −1 | 2 | 5 | 2.236 | 3 |
| B2 (8,19) | sea bass | 3 | 1 | 10 | 3.162 | 4 |
| B3 (7,21) | sea bass | 2 | 3 | 13 | 3.606 | 5 |
| B4 (9,17) | sea bass | 4 | −1 | 17 | 4.123 | 6 |
| S3 (2,15) | salmon | −3 | −3 | 18 | 4.243 | 7 |

- **k = 1: the nearest sample is B1, so x is classified as sea bass.**
- **k = 3: the nearest samples are B1, S2 and S1, which gives 2 salmon votes to 1 sea bass, so x is classified as salmon.**
- The two rules disagree. 1-NN follows a single (possibly noisy) closest sample, while k-NN takes a majority vote.

---

### Q5. Compression: entropy, DPCM and compression ratio (10 pts)

(a) A source emits five symbols with these probabilities:

| Symbol | A | B | C | D | E |
|---|---|---|---|---|---|
| p | 1/2 | 1/4 | 1/8 | 1/16 | 1/16 |

Compute the entropy. Why can no lossless code have an average length below it? (3 pts)  
(b) Samples f1 to f6 = 60, 63, 67, 67, 64, 71. (4 pts)
- (i) Simple difference coding: the first sample is sent as is, then d_n = f_n − f_(n−1). What is sent? Show that the decoder rebuilds f exactly.
- (ii) DPCM: the prediction is the previous reconstructed sample, f̂_n = f̃_(n−1), with f̃_1 = f_1 = 60. The prediction error e_n = f_n − f̂_n is quantized to the nearest multiple of 4. For n = 2 to 6 give e_n, the quantized error, the reconstructed sample f̃_n and the reconstruction error f_n − f̃_n.

(c) A 512 x 512, 8-bit gray image is saved as PNG (131,072 bytes) and as JPEG (16,384 bytes). Compute both compression ratios. Which file is lossy and which is lossless, and why can JPEG go below the entropy limit while PNG cannot? (3 pts)

**Answer**

**Source:** L4 p.12-13 entropy and self-information · L4 p.30 η ≤ l̄ < η + 1 · L4 p.6 transformation stage: predict, send the prediction error (DPCM tables are textbook context, Li and Drew 6.3.5-6.3.6) · L4 p.10-11 lossless vs lossy, compression ratio B0/B1 · L5 p.11-13 lossy compression, rate distortion, quantization · class remark: JPG lossy, PNG lossless  
**Notes:** [Lecture 4 › Entropy](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#5-entropy-basics-of-information-theory-slides-12-13) · [Lecture 4 › Differential coding and DPCM](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#3-differential-coding-predictive-coding-and-dpcm-slides-2-6) · [Lecture 4 › Compression ratio](../notes/04_Week2_DPCM_Entropy_Huffman_LZW.md#4-compression-lossless-vs-lossy-compression-ratio-slides-10-11) · [Lecture 5 › Lossy compression and rate distortion](../notes/05_Week3_ArithmeticCoding_LossyCompression_MPEG.md#6-lossy-compression-rate-distortion-and-quantization-slides-11-13)

**(a) Entropy (3 pts):** η = Σ p_i log2(1/p_i)

| Symbol | p | log2(1/p) | p · log2(1/p) |
|---|---|---|---|
| A | 1/2 | 1 | 0.5 |
| B | 1/4 | 2 | 0.5 |
| C | 1/8 | 3 | 0.375 |
| D | 1/16 | 4 | 0.25 |
| E | 1/16 | 4 | 0.25 |

**η = 1.875 bits/symbol.** A fixed-length code needs 3 bits for 5 symbols.
- Why no lossless code can beat it: log2(1/p_i) is the self-information of s_i, the number of bits needed to encode s_i. The entropy is the average of it, so it is the lower bound on the average code length: η ≤ l̄ (Huffman: η ≤ l̄ < η + 1). A lossless code must keep all the information, so it cannot use fewer bits on average. Here Huffman lengths 1, 2, 3, 4, 4 reach exactly 1.875, because every p is a power of 1/2.

**(b)(i) Difference coding (2 pts).** **Sent: `60, 3, 4, 0, −3, 7`.** The decoder adds each difference to the previous value: 60, 60+3 = 63, 63+4 = 67, 67+0 = 67, 67−3 = 64, 64+7 = 71. **This is exactly f, so the coding is lossless.** The differences cluster around 0, so they need fewer bits.

**(b)(ii) DPCM (2 pts).** The formulas are f̂_n = f̃_(n−1), e_n = f_n − f̂_n, ẽ_n = 4 · round(e_n/4) and f̃_n = f̂_n + ẽ_n. No e_n is exactly halfway between two multiples of 4, so there are no rounding ties.

| n | f_n | f̂_n | e_n | ẽ_n | f̃_n | f_n − f̃_n |
|---|---|---|---|---|---|---|
| 1 | 60 | (sent as is) | | | 60 | 0 |
| 2 | 63 | 60 | 3 | 4 | 64 | −1 |
| 3 | 67 | 64 | 3 | 4 | 68 | −1 |
| 4 | 67 | 68 | −1 | 0 | 68 | −1 |
| 5 | 64 | 68 | −4 | −4 | 64 | 0 |
| 6 | 71 | 64 | 7 | 8 | 72 | −1 |

**Reconstructed: `60, 64, 68, 68, 64, 72`.** DPCM is lossy, but each error is at most half a step (2). The predictor uses reconstructed values, because the decoder only has those, so the errors do not accumulate. The reconstruction error equals the quantization error e_n − ẽ_n.

**(c) Ratios (3 pts).** B0 = 512 × 512 × 8 = 2,097,152 bits = 262,144 bytes, and the compression ratio is B0/B1.
- **PNG: 262,144 / 131,072 = 2.0** (4 bits/pixel). **PNG is lossless:** the decompressed image equals the original exactly.
- **JPEG: 262,144 / 16,384 = 16.0** (0.5 bits/pixel). **JPEG is lossy:** the result is a close approximation of the original.
- A lossless coder is bounded by the entropy (rate distortion: R(D) = H at D = 0). A lossy coder accepts distortion D > 0, and quantization (the main source of loss) throws information away, so R(D) < H. That gives a much higher compression ratio.

---

### Q6. Sound and sampling (10 pts)

A signal x(t) = 5 sin(2π·250t + π/2) volts.

(a) Give its peak amplitude, frequency, period and phase (in degrees and as a time shift). Find its wavelength in air if the speed of sound is 340 m/s. (4 pts)  
(b) A second tone 2 sin(2π·3000t) is added. What is the Nyquist sampling frequency for the mix? If the mix is sampled at fs = 4 kHz, at what frequency does each tone appear after reconstruction? (3 pts)  
(c) A 5 s stereo recording is made at 48 kHz with 16 bits per sample. Compute the bit rate and the file size in bytes. The sample rate is then halved: give the new highest frequency that can be captured and the new file size. (3 pts)

**Answer**

**Source:** L2 p.16 amplitude, frequency, period, phase · L2 p.21 f = 1/T · L2 p.24 phase 90° = π/2 = T/4 shift · L2 p.25-26 wavelength · L2 p.47-48 Nyquist f_s > 2 f_max · L2 p.51 aliasing (alias formula: textbook context) · L2 p.19, p.34-35 sampling rate and bit rate  
**Notes:** [Lecture 2 › Sine wave parameters](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#4-sine-wave-parameters-amplitude-frequency-period-phase-wavelength-slides-16-18-21-26) · [Lecture 2 › Sampling theorem and Nyquist](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#13-sampling-theorem-and-nyquist-slides-45-50) · [Lecture 2 › Aliasing](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#14-aliasing-undersampling-spatial-and-temporal-slides-51-55) · [Lecture 2 › Halving the sample rate](../notes/02_Week1_Sound_Sampling_Quantization_Fourier.md#15-halving-the-sample-rate-homework-link-slides-19-34-47-51)

**(a) Read off A sin(2πft + φ) (4 pts)**
- **Peak amplitude A = 5 V** (the maximum strength of the signal).
- **Frequency f = 250 Hz.**
- **Period T = 1/f = 1/250 = 4 ms.**
- **Phase φ = π/2 rad = 90°**, which is a time shift of T/4 = 4/4 = **1 ms**. The wave starts at its peak: x(0) = 5 sin(π/2) = 5 V.
- **Wavelength λ = v/f = vT = 340 × 0.004 = 1.36 m.**

**(b) Nyquist and aliasing (3 pts)**
- f_max = 3000 Hz, so the **Nyquist sampling frequency is 2 × 3000 = 6 kHz**: the signal must be sampled at more than 6 kHz.
- f_s = 4 kHz < 6 kHz, so the mix is undersampled.
  - **The 250 Hz tone** is below f_s/2 = 2 kHz, so it appears at **250 Hz** (correct).
  - **The 3000 Hz tone** is above 2 kHz, so it aliases to **f_s − f = 4000 − 3000 = 1000 Hz**. Check: sin(2π·3000·n/4000) = −sin(2π·1000·n/4000) for every n.

**(c) Bit rate and file size (3 pts).** Bit rate = f_s × bits × channels.
- **48,000 × 16 × 2 = 1,536,000 bit/s** (1.536 Mbps).
- **Size = 1,536,000 × 5 / 8 = 960,000 bytes.**
- **Halved, f_s = 24 kHz:** the highest frequency that can be captured is **below 12 kHz** (it was below 24 kHz). The bit rate becomes 768,000 bit/s and the **size 480,000 bytes** (half). The 16 bits per sample do not change. Content between 12 and 24 kHz now aliases, unless it is low-pass filtered first.

---

### Q7. Image arithmetic and logic (10 pts)

Two 8-bit images (gray levels 0 to 255):

F:
```
120 210
 40 230
```

G:
```
70 80
60 30
```

(a) Compute F + G, F − G and 1.2 × F, with clamping. (3 pts)  
(b) Which arithmetic operations change brightness and which change contrast? Show it with the pixels 120 and 210 of F after F + 40 and after 1.2 × F. (2 pts)  
(c) For the pixel values p = 172 and q = 105, write both in binary and compute p AND q, p OR q, p XOR q and NOT p (binary and decimal). (4 pts)  
(d) Compute the negative of F. (1 pt)

**Answer**

**Source:** L9 p.46-50 arithmetic operations: brightness vs contrast · L9 p.52 clamping · L9 p.55 NOT = 255 − pixel · L9 p.56 XOR · L9 p.58 AND · L9 p.59 OR · L7 p.35-36 same-size images, pixel by pixel · L6 p.44-45 image negative  
**Notes:** [Lecture 9 › Arithmetic operations](../notes/09_Week5_Intensity_Transforms_Histogram.md#10-arithmetic-operations-slides-46-53) · [Lecture 9 › Logic operations](../notes/09_Week5_Intensity_Transforms_Histogram.md#11-logic-operations-slides-54-59) · [Lecture 7 › Arithmetic and logical operations](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#8-arithmetic-and-logical-operations-slides-35-36) · [Lecture 6 › Intensity transformations (negative)](../notes/06_Week3_Image_Basics_Perception_Resampling.md#14-intensity-transformations-and-gamma-slides-44-57)

**(a) Clamping (3 pts).** Results below 0 become 0, and results above 255 become 255.

| Operation | Raw result | **Clamped** |
|---|---|---|
| F + G | `190 290 / 100 260` | **`190 255 / 100 255`** |
| F − G | `50 130 / −20 200` | **`50 130 / 0 200`** |
| 1.2 × F | `144 252 / 48 276` | **`144 252 / 48 255`** |

(Without clamping, uint8 wraps around: 290 → 34 and 260 → 4.)

**(b) Brightness vs contrast (2 pts)**
- **Addition and subtraction change brightness:** F + 40 turns 120 and 210 into 160 and 250. The difference stays 90, so the image is brighter but its contrast is the same.
- **Multiplication and division change contrast:** 1.2 × F turns 120 and 210 into 144 and 252. The difference grows from 90 to 108, so contrast increases. (Division decreases it. Subtraction is also used for motion detection.)

**(c) Bitwise operations (4 pts).** p = 172 = `1010 1100` and q = 105 = `0110 1001`.

| Operation | Binary | **Decimal** |
|---|---|---|
| p AND q | `0010 1000` | **40** |
| p OR q | `1110 1101` | **237** |
| p XOR q (equal bits → 0, different bits → 1) | `1100 0101` | **197** |
| NOT p | `0101 0011` | **83** (= 255 − 172) |

**(d) Negative (1 pt):** s = 255 − r.

```
135  45
215  25
```

---

### Q8. Color: dimensions, illuminants, chromaticity and purity (10 pts)

(a) Name and define the three dimensions of color. In the Munsell system, what are the ranges of value and chroma? (3 pts)  
(b) What do the CIE standard illuminants A, B, C, D65 and E represent? (2 pts)  
(c) A color has tristimulus values X = 95, Y = 94, Z = 61. Compute its chromaticity coordinates x, y and z. (2 pts)  
(d) The reference white is W = (0.31, 0.32). The line from W through the color meets the spectral locus at D = (0.51, 0.48), about 580 nm. What is the dominant wavelength of the color? Compute its purity, and say what purity 0 and purity 1 mean. (3 pts)

**Answer**

**Source:** L7 p.38 Munsell (value 0-10, chroma 0-20) · L7 p.39 hue, value, saturation · L7 p.66 color description · L7 p.58 CIE standard illuminants · L7 p.54 chromaticity coordinates · L7 p.61 dominant wavelength · L7 p.63-65 purity  
**Notes:** [Lecture 7 › Color dimensions and Munsell](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#9-color-image-munsell-and-color-dimensions-slides-37-41-66-68) · [Lecture 7 › Chromaticity diagram and illuminants](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#11-cie-chromaticity-diagram-illuminants-and-gamut-slides-54-60) · [Lecture 7 › Dominant wavelength and purity](../notes/07_Week4_Pixel_Relationships_Color_XYZ.md#12-chromaticity-in-polar-coordinates-dominant-wavelength-and-purity-slides-61-65)

**(a) Write (3 pts)**
- **Hue:** what color it is (red, green, yellow, blue). It is the angle around the gray (black-white) axis of the color solid.
- **Saturation (chroma, colorfulness):** how strong or pure the color is, from pink to bright red. It is the distance from the gray axis.
- **Value (lightness, brightness):** how light or dark the color is (black, gray, white). It is the height on the axis.
- **Munsell (1915), equal perceptual steps:** value runs 0 (dark) to 10 (pure white), and chroma runs 0 (neutral) to 20 (saturated). There are 10 principal hues, R, YR, Y, GY, G, BG, B, PB, P, RP, each split into 10.

**(b) CIE standard illuminants (2 pts)**
- **A:** tungsten light
- **B:** sunset
- **C:** blue sky
- **D65:** average daylight
- **E:** equal-energy white, x = y = z = 1/3

All of them lie near the blackbody locus.

**(c) Chromaticity (2 pts):** x = X/(X+Y+Z), y = Y/(X+Y+Z), z = Z/(X+Y+Z). Here X + Y + Z = 95 + 94 + 61 = 250.

**x = 95/250 = 0.380, y = 94/250 = 0.376, z = 61/250 = 0.244** (check: x + y + z = 1). Only (x, y) is plotted.

**(d) Dominant wavelength and purity (3 pts)**
- **Dominant wavelength:** the wavelength of the spectral color which, added to the reference white, produces the given color. Follow the ray from W through S to the locus at D: **about 580 nm (yellow)**.
- **Purity = |WS| / |WD|:**
  - WS = (0.380 − 0.31, 0.376 − 0.32) = (0.070, 0.056), so |WS| = sqrt(0.0049 + 0.003136) = sqrt(0.008036) = 0.0896.
  - WD = (0.51 − 0.31, 0.48 − 0.32) = (0.20, 0.16), so |WD| = sqrt(0.04 + 0.0256) = sqrt(0.0656) = 0.2561.
  - **Purity = 0.0896 / 0.2561 = 0.35.** Check with one coordinate: 0.07/0.20 = 0.35.
- Purity 0 = the color is the white point (no saturation). Purity 1 = a pure spectral color on the locus. So S is a pale (desaturated) yellow: dominant wavelength ≈ hue, purity ≈ saturation.

---

## Score check

| Q | Max pts | What earns the points |
|---|---|---|
| Q1 | 10 | Set definitions + effect of dilation and erosion (4); correct A ⊕ B1 and A ⊖ B1 with outside = 0 (3); A ⊖ B2 = {(2,2),(3,2)} and β(A) with 13 pixels (3) |
| Q2 | 10 | High boost = α·Original − Lowpass, mask with centre 12.5/9, α = 1 → high pass, α > 1 → more background and lighter (4); both filtered rows (4); median keeps the edge, min removes the white spike, max does not (2) |
| Q3 | 10 | Table with running sum × 7/16 rounded, LUT `0 0 0 0 0 3 6 7` (5); equalized image + not flat because of discrete levels (2); LUT row `1 7 4 0 6 2 7 1` + S-shaped contrast stretch (3) |
| Q4 | 10 | Flowchart with 5 stages in order and the 3 side inputs (3) + one line per stage (2); length overlap, lightness/width, boundary, cost (2); distance table, 1-NN = sea bass, 3-NN = salmon (3) |
| Q5 | 10 | η = 1.875 + lower-bound reason (3); differences `60 3 4 0 −3 7` with exact rebuild (2); DPCM table with f̃ = `60 64 68 68 64 72` (2); ratios 2 and 16, PNG lossless, JPEG lossy, R(D) < H (3) |
| Q6 | 10 | A = 5 V, f = 250 Hz, T = 4 ms, 90° = 1 ms, λ = 1.36 m (4); Nyquist 6 kHz, 250 Hz stays, 3000 Hz → 1000 Hz (3); 1,536,000 bit/s, 960,000 B, then < 12 kHz and 480,000 B (3) |
| Q7 | 10 | Three clamped results (3); brightness vs contrast shown with 90 vs 108 (2); AND 40, OR 237, XOR 197, NOT 83 in binary and decimal (4); negative `135 45 / 215 25` (1) |
| Q8 | 10 | Hue, saturation, value defined + Munsell ranges (3); five illuminants (2); x = 0.380, y = 0.376, z = 0.244 (2); about 580 nm, purity 0.35, meaning of 0 and 1 (3) |
