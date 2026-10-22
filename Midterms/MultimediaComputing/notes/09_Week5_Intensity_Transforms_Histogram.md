# Lecture 9 (Week 5): Image Types, Lookup Tables, Histogram Processing, Arithmetic and Logic Operations

What this lecture is about: point processing of images. It covers image and data types, look-up tables (LUT), the point-processing model $s=T(r)$, histograms, histogram equalization (theory plus a 3-bit worked example), histogram specification, and pixel-wise arithmetic and logic operations.

**Conventions used throughout**
- Page numbers are PDF pages (page 1 = title slide). All numbers below were checked in Python (`agents/L9/verify.py`, `agents/L9/verify2.py`).
- $r$ = input gray level of $f(x,y)$ and $s$ = output gray level of $g(x,y)$ (slide 13). $L$ = number of gray levels, so levels run $0 \dots L-1$ (slide 21).
- Reference (slide 60): Gonzalez and Woods, *Digital Image Processing*, 4th ed. Most of the figures are tagged [Gonzalez] or [D.H. Ballard].
- **Not in this deck:** the Contents slide (2) lists "Contrast Stretching" and "Intensity Transformation", but **no slide gives the negative, log, power-law (gamma) or piecewise-linear formulas**. Section 4 says exactly what is there.

## 1. Image Types and Data Types (slides 2-6)

- Three types (slide 3): **binary**, **gray scale** and **color** image.
- Slide 4 (image-only slide, example size 462x512):

| Type | Slide wording | Matlab class shown |
|---|---|---|
| Binary | "Each Pixel is just Black and white, i.e. 0 or 1" | `<462x512 logical>` |
| Gray scale | "Each Pixel is shade of Gray, its 0(black) to white(255), i.e. each pixel-8 bits" | `<462x512 unit8>` (sic, read uint8) |
| Color (RGB) | "Each pixel corresponds to 3 values. Combination of Red, Green and Blue" | `<462x512x3 unit8>` |

- RGB (slide 5): "three images layered on top of one another", each channel 8 bits (0-255), so **24 bits per pixel**. The example pixel is Red 240, Blue 170, Green 80, giving one 24-bit RGB pixel.
- Data types (slide 6; the slide spells it "unit8"):

| Type | Meaning | Range |
|---|---|---|
| int8 | 8 bit integer | -128 to 127 |
| uint8 | 8 bit unsigned integer | 0 to 255 |
| int16 | 16 bit integer | -32768 to 32767 |
| uint16 | 16 bit unsigned integer | 0 to 65535 |
| double | double precision real number | machine specific |

## 2. Point Processes and the Spatial Domain Model (slides 7-8, 13)

- Point processes (slide 7) are "the simplest of the basic image processing operations". They are "based solely in the pixel's value" and are therefore "easily implemented as look-up tables".
- Spatial domain model (slide 8): $g(x,y) = T[f(x,y)]$, where $T$ is an operator on $f$ "defined over some neighborhood of (x,y)". $f$ = input image and $g$ = processed image. The figure shows a 3x3 neighborhood with $x$ pointing down and $y$ pointing right [Gonzalez].
- **Point processing** (slide 13) is "the simplest form of T": a **1 x 1 neighbor**, so $g$ depends only on $f$ at $(x,y)$.
  - Gray-level transformation (mapping): $s = T(r)$.
- Figure on slide 13 [Gonzalez]:
  - (a) **contrast stretching**: an S-shaped $T(r)$ darkens levels below $m$ and brightens levels above $m$.
  - (b) **binarization**: a step at $m$, so $r<m$ becomes dark and $r \ge m$ becomes light.

## 3. Lookup Tables (slides 9-12)

- Definition (slide 9): "An LUT is simply a table of cross-references linking *index numbers* to *output values*." When it is used for display it is "often called simply a **colormap**".
- Each pixel value is "treated as an index number into the colormap". The output values are typically RGB colors.
- Advantage stated (slide 9, only the first of the "two" is given): "the index number can be made to use fewer bits than the output value in order to save storage space". An 8-bit index looks up a 24-bit RGB value, so 8-bit color images are smaller than 24-bit ones.
- Slide 10 (Figure 5.9): the LUT is a table in memory (Address 0-255 to Brightness: 0, 3, 7, 11, 16, ...). Pixel value 4 is looked up and 16 goes to the monitor. Parts (ii) and (iii) show the **identity (default) LUT**, a straight line from black to white.
- Mechanism (slide 11): "use the current pixel value as the array index", and the "new value is the array element pointed by this index".

**Worked example: 3-bit LUT (slide 11).** LUT for indexes 0-7 = `0 0 1 1 2 3 4 5`. The slide fills only the first output row; the rest was computed here.

| Input row | Output row |
|---|---|
| 7 7 5 4 2 | 5 5 3 2 1 (on slide) |
| 7 6 4 3 0 | 5 4 2 1 0 |
| 7 6 4 3 1 | 5 4 2 1 0 |
| 6 6 4 2 0 | 4 4 2 1 0 |
| 5 5 3 1 0 | 3 3 1 0 0 |

- Slide 12: a LUT applied to a photo (girl with pigeons) gives a brighter output.

## 4. Contrast Stretching and Intensity Transformations (slides 2, 13, 26, 55)

What the slides actually contain:
- "Contrast Stretching" and "Intensity Transformation" appear **only as Contents items** (slide 2).
- Contrast stretching appears only as the curve figure on slide 13(a), plus one line on slide 26: "Similar effect of enhancement could be achieved by manual contrast stretching approach".
- The **negative** appears only as the NOT operation: new pixel $= 255 -$ old pixel (slide 55). This equals $s = L-1-r$ for $L=256$.
- **No** log transform, **no** gamma, **no** constant $c$, **no** normalization rule, **no** log base and **no** code anywhere in the deck. The PPTX was checked too: it has no hidden slides and no speaker notes with this content.

(textbook context: Gonzalez 4th ed. Sec. 3.2, given here because the slides only name these topics)
- Negative: $s = L-1-r$.
- Log: $s = c\log(1+r)$, with $c$ a constant and $r \ge 0$. It expands dark values and compresses bright ones. The book uses $c=1$ on a Fourier spectrum: the range $0$ to $1.5\times10^6$ becomes about $0$ to $6.2$ (that is $\log_{10}$). The common display choice is $c = (L-1)/\log(1+r_{max})$, so that $r_{max} \mapsto 255$. With that $c$ the log base cancels: for $r = 0, 1, 10, 50, 100, 255$ both ln and log10 give $0, 31.88, 110.27, 180.81, 212.23, 255$.
- Power-law (gamma): $s = c\,r^{\gamma}$, with intensities scaled to $[0,1]$ and $c=1$ (8-bit values below are computed as $255\,(r/255)^{\gamma}$). $\gamma<1$ brightens: $\gamma=0.4$ maps $64 \mapsto 146.7$ and $128 \mapsto 193.6$. $\gamma>1$ darkens: $\gamma=2.5$ maps $128 \mapsto 45.5$.
- Min-max contrast stretch: $s = \frac{r-r_{min}}{r_{max}-r_{min}}(L-1)$. For $[50,150]$: $50 \mapsto 0$, $100 \mapsto 127.5$, $150 \mapsto 255$. Piecewise-linear stretching uses points $(r_1,s_1),(r_2,s_2)$. When $r_1=r_2$, $s_1=0$, $s_2=L-1$ it becomes thresholding, which is slide 13(b).

## 5. Histogram (slides 14-19)

- Definition (slide 14): "A simple bar graph that stands for pixel intensities". The intensities go on the **x-axis** and the "number of occurrences for each intensity" on the **y-axis**. It gives "information about contrast and overall intensity distribution".
- Slide 14 example (4x4, 3-bit): `4 4 3 3 / 4 4 3 3 / 4 1 2 3 / 0 1 2 3`. Counts $n_0..n_7 = 1,2,2,6,5,0,0,0$ (total 16). The same image is used on slides 29-31.
- Slide 15 (peppers): a narrow histogram in the upper range means a washed-out, low-contrast image. A histogram spread over the whole range means good contrast. A histogram bunched at the left means a dark image.
- Slide 16: **+40** shifts the histogram right, with a spike at 255 (clipped pixels). **-40** shifts it left, with a spike at 0. The shape is unchanged.
- Slide 17: **x1.2** stretches the histogram (comb-like gaps, spike at 255). **/1.2** compresses it (taller, merged bars).
- Slide 18: a dark image has its histogram at the low end; a bright image has it at the high end.
- Slide 19: a color image has three histograms (R, G, B); a gray image has one.

## 6. Histogram Equalization, Theory (slides 20-28)

- Goal (slide 20): "to obtain a **uniform histogram** for the output image", by mapping $r$ to $s$ so that $s$ is uniformly distributed. "Spreading: the peaks and valleys will be shifted (due to approximation in digitized space)."
- **Steps** (slide 20): 1. Compute histogram. 2. Calculate **normalized sum** of histogram. 3. Transform input image to output image (with a LUT).
- Definition (slide 21): $0 \le r \le 1$ is continuous; the discrete version uses $[0, L-1]$.
$$s = T(r) = \int_0^r p_r(w)\,dw,\quad 0 \le r \le 1$$
  - Condition (a): $T(r)$ is single-valued and monotonically increasing on $[0,1]$.
  - Condition (b): $0 \le T(r) \le 1$ for $r\in[0,1]$. (The slide shows "0 <= T(r) <= for r", with the 1 missing.)
  - Inverse: $r = T^{-1}(s)$, $s\in[0,1]$.
- Slide 23: gray levels are random variables with pdfs $p_r(r)$ and $p_s(s)$:
$$p_s(s) = \left[p_r(r)\frac{dr}{ds}\right]_{r=T^{-1}(s)}$$
- Slide 24: with $T$ = the CDF, $\frac{ds}{dr} = p_r(r)$, so $p_s(s) = \left[p_r(r)\frac{1}{p_r(r)}\right] = 1$, a **uniform density**.
- Slide 25 figure: $p_r(r)=2-2r$ (a triangle from 2 down to 0 on $[0,1]$). This gives $T(r)=2r-r^2$ (derived from the figure; $T(0.5)=0.75$, $T(1)=1$) and $p_s(s)=1$ on $[0,1]$. Simulated $s$ falls about 20% in each fifth of $[0,1]$.
- Effects (slide 26): HE "stretches contrast ... for gray levels near histogram **maxima**" and "compresses contrast in areas with gray levels near histogram **minima**". Contrast grows for most pixels, so detectability improves. "**The resulting histogram is not flat**": nothing in the discrete approximation says it should be.
- Mapping (slides 27-28, Ballard): $g(s)\,ds = h(r)\,dr$, where $h$ is the input histogram and $g$ the new one. A uniform output means $g(s) = N^2/M$. (Slide 27 writes "G(s)"; slide 28 writes $g(s)$.)
$$T(r) = \frac{M}{N^2}\int_0^r h(w)\,dw$$
  - $N^2$ = number of pixels; $M$ = "the number of gray levels".
  - **Convention used in the worked example:** the factor is $7/16$ for a 3-bit, 16-pixel image, so $M$ is used as $L-1 = 7$ (the maximum level), not 8. Discrete rule:
$$s_k = \mathrm{round}\left(\frac{L-1}{N^2}\sum_{j=0}^{k} n_j\right) = \mathrm{round}\left((L-1)\,\mathrm{cdf}(r_k)\right)$$

## 7. Histogram Equalization, Worked Example (slides 29-31)

Image (slide 29): `4 4 3 3 / 4 4 3 3 / 4 1 2 3 / 0 1 2 3`, with $L=8$ and $N^2=16$. Normalized sum = sum x (7/16) (slide 30: "1 * (7/16) = 0.43", "3 * (7/16) = 1.31").

| $r_k$ | $n_k$ | $p_r=n_k/16$ | sum | cdf | sum x 7/16 (exact) | slide shows | $s_k$ |
|---|---|---|---|---|---|---|---|
| 0 | 1 | 0.0625 | 1 | 0.0625 | 0.4375 | 0.43 | 0 |
| 1 | 2 | 0.125 | 3 | 0.1875 | 1.3125 | 1.31 | 1 |
| 2 | 2 | 0.125 | 5 | 0.3125 | 2.1875 | 2.18 | 2 |
| 3 | 6 | 0.375 | 11 | 0.6875 | 4.8125 | 4.81 | **5** |
| 4 | 5 | 0.3125 | 16 | 1.0 | 7.0 | 7.00 | 7 |
| 5, 6, 7 | 0 | 0 | 16 | 1.0 | 7.0 | 7.00 | 7 |

- **Rounding convention:** the two-decimal column is truncated (0.4375 shows as 0.43 and 2.1875 as 2.18; correct rounding gives 0.44 and 2.19). The final $s_k$ is **rounded to the nearest integer**: 4.81 becomes 5, while floor would give 4. Slide 31's output proves it.
- Output image (slide 31, verified): `7 7 5 5 / 7 7 5 5 / 7 1 2 5 / 0 1 2 5`. Output histogram: $n_0=1, n_1=2, n_2=2, n_5=6, n_7=5$. It is spread to the full range 0-7 but **not flat**.

## 8. Histogram Equalization, Image Examples (slides 32-39)

- Slide 32 (nuts, [Gonzalez]): a narrow mid-range histogram becomes one spread over 0-255. The image gains contrast.
- Slide 33: Lena equalized with 256 levels. The output histogram is spread out with comb gaps.
- Slide 34: "Original Image / 4" leaves only 64 levels (dark, narrow histogram). After equalization (64 levels) the image is harsh and posterized, with 64 sparse bars: **HE cannot create new levels**, it only moves them apart.
- Slides 35-36: color images with the histograms equalized (Luminosity and R, G, B shown on 35; R, G, B on 36).
- Slide 37: equalizing the **saturation** channel (saturation adjustment function, saturation image and histogram) gives more vivid colors.
- Slides 38-39: "histogram equalized **intensity**" compared with "**each R, G, B image** is histogram equalized". The per-channel version shifts the colors (a bluish cast on slide 39). (textbook context: Gonzalez equalizes only intensity so that hue is preserved.)

## 9. Histogram Specification (slides 40-45)

- Purpose (slide 40): "Specify particular histogram shapes capable of highlighting certain gray-level ranges"; "lighten or darken an image or you need more contrast". It "requires both a desired histogram and the image as input".
- "The principle difficulty ... lies in being able to construct a meaningful histogram". Two ways: 1. specify a particular pdf; 2. specify a histogram shape "by means of graphic device".
- Steps (slide 41): 1. compute the histograms of the input and target. 2. compute the CDFs of both. 3. find the mapping that relates the input CDF to the target CDF. 4. apply the mapping.
- Math (slide 42; the slide writes "$p_r(z)$", which should be $p_z(z)$):
  - (1) equalize the original: $s = T(r) = \int_0^r p_r(w)\,dw$.
  - (2) equalize the desired pdf: $v = G(z) = \int_0^z p_z(w)\,dw$.
  - (3) apply the inverse: $z = G^{-1}(s)$, so $z = G^{-1}[T(r)]$.
- Slide 43 block diagram: original, then histogram equalization, then **inverse histogram equalization** (fed by the desired histogram), then the specified image.

**Worked example (slide 44).** Desired histogram: $n_5=6, n_6=5, n_7=5$ (16 pixels, 3-bit).

| $z$ | desired $n_z$ | sum | $G(z)$ = sum x 7/16 | slide shows |
|---|---|---|---|---|
| 0-4 | 0 | 0 | 0 | 0.0 |
| 5 | 6 | 6 | 2.625 | 2.6 |
| 6 | 5 | 11 | 4.8125 | 4.8 |
| 7 | 5 | 16 | 7.0 | 7.0 |

- Inverse LUT on the slide ($s$ to $z$): `0->0, 1->0, 2->5, 3->5, 4->6, 5->6, 6->7, 7->7`.
- **Rule the slide uses:** pick the $z$ whose $G(z)$ is **closest** to $s$ (ties go to the smallest $z$). Example: $s=1$ is 1 away from 0 and 1.625 away from 2.625, so $z=0$. The rule "smallest $z$ with $G(z)\ge s$" would give `0 5 5 6 6 7 7 7`, which does not match.
- Applied to the slide-29 image (computed, not on the slide): $r \to s \to z$ is $0\to0\to0$, $1\to1\to0$, $2\to2\to5$, $3\to5\to6$, $4\to7\to7$. Result: `7 7 6 6 / 7 7 6 6 / 7 0 5 6 / 0 0 5 6`, with histogram $n_0=3, n_5=2, n_6=6, n_7=5$. This only approximates the desired shape (discrete levels).
- Slide 45: Lena with a desired histogram concentrated at bright levels gives a brighter result.

## 10. Arithmetic Operations (slides 46-53)

- Addition, subtraction, division and multiplication (slide 46).
  - **Addition and subtraction adjust brightness**: $I(x,y) + a = I'(x,y)$, where "a : random pixel value" (i.e. any constant).
  - **Subtraction: motion detection.**
  - **Division and multiplication adjust contrast.**
- Slide 47: image +40 and -40; image x1.2 and /1.2.
- Slide 48: adding brightens and subtracting darkens. "Adding and subtracting **cannot adjust the contrast**." Examples: Original+50 and Original-60.
- Slide 50: "The contrast of the image will be **increased by multiplication and decreased by division**." Examples: x1.5 and /1.5.
- Slide 49: adding two images blends them (child + man). Subtracting two video frames leaves only the moving car.
- Problems (slide 52): results can be negative or above the maximum. The fix is **clamping**: negative values become 0 and overflow becomes 255.
- Change detection with subtraction (slide 53): medical imaging (displaying blood-flow paths), automated inspection of printed circuits, security monitoring. The ping-pong frames example shows that only the ball and the moving arm survive.

## 11. Logic Operations (slides 54-59)

- NOT, plus bitwise XOR, AND and OR (slide 54).
- **NOT** (slide 55): new Pixel $= 255 -$ old Pixel. For 8 bits this is the same as bitwise NOT: $147 = 10010011 \to 108 = 01101100$.
- **XOR** (slide 56): sets bits that are the same to 0 and bits that differ to 1. "In image processing, XOR operation sets the pixels that are specified to black, others to nonblack": $p \oplus v = 0$ exactly when $p = v$.
  - Usage: find all pixels of a certain value, draw the mouse cursor, special effects. (textbook context: $(p\oplus v)\oplus v = p$, so drawing the cursor twice restores the background.)
- Slide 57: ORIGINAL XOR 128 flips the MSB ($100 \to 228$, $200 \to 72$), which gives harsh false contours. ORIGINAL XOR 250 turns pixels equal to 250 black ($250 \to 0$, $255 \to 5$).
- **AND** (slide 58): $10010011 \text{ AND } 01100110 = 00000010$ (147 AND 102 = 2). Figure: mask (black frame, white disk) AND face. The slide shows the face with a **white** disk, but that picture is actually the OR result. With this mask, AND keeps only the face inside the disk and makes the rest black.
- **OR** (slide 59): $10010011 \text{ OR } 01100110 = 11110111$ (147 OR 102 = 247). Figure: cameraman OR rice gives an overlaid, brightened image.

## Exam focus

**Q1. Equalize a small histogram.** Image `0 1 1 2 / 1 2 2 3 / 1 2 3 3 / 2 3 3 7` (3-bit, 16 px).

| $r_k$ | $n_k$ | sum | sum x 7/16 | $s_k$ |
|---|---|---|---|---|
| 0 | 1 | 1 | 0.4375 | 0 |
| 1 | 4 | 5 | 2.1875 | 2 |
| 2 | 5 | 10 | 4.375 | 4 |
| 3 | 5 | 15 | 6.5625 | 7 |
| 4-6 | 0 | 15 | 6.5625 | (7, unused) |
| 7 | 1 | 16 | 7.0 | 7 |

Output `0 2 2 4 / 2 4 4 7 / 2 4 7 7 / 4 7 7 7`. Levels 3 and 7 merge into 7, so HE can merge levels and the histogram is not flat. Use the slide's conventions: factor $(L-1)/N^2$, then round to the nearest integer.

**Other likely questions**

2. **Slide 29-31 example** (very likely): reproduce the table in section 7. The answer is the LUT `0 1 2 5 7 7 7 7`.
3. **Histogram specification inverse LUT:** given $G(z)$ = `0 0 0 0 0 2.625 4.8125 7`, map each $s$ to the nearest $G(z)$, giving `0 0 5 5 6 6 7 7` (slide 44).
4. **Apply a LUT:** with LUT `0 0 1 1 2 3 4 5`, the input row `7 6 4 3 0` becomes `5 4 2 1 0` (slide 11).
5. **Bitwise ops:** $I_1=10110100$ (180) and $I_2=11001010$ (202) give AND $=10000000$ (128), OR $=11111110$ (254), XOR $=01111110$ (126), and NOT $I_1 = 255-180 = 75 = 01001011$.
6. **Brightness versus contrast with clamping:**
   - Pixels 100 and 200 plus 40 become 140 and 240: the difference stays 100, so brightness changes but contrast does not.
   - Times 1.2 gives 120 and 240: the difference becomes 120, so contrast increases.
   - Clamping: $230+40 = 270 \to 255$ and $30-40 = -10 \to 0$. (Without clamping, uint8 wraps around: $200+100 \to 44$.)
7. **Storage:**
   - 462x512 gray uint8 = 236,544 bytes; RGB = 3 x 236,544 = 709,632 bytes (24 bit/pixel); binary = 236,544 bits.
   - LUT: an 8-bit index image is 3x smaller than 24-bit RGB, plus a 256 x 3 = 768-byte colormap.
8. **Theory questions:**
   - Why the output histogram is not flat: discrete approximation (slide 26).
   - Conditions (a) and (b) on $T(r)$ (slide 21).
   - Why the CDF gives $p_s(s)=1$ (slide 24).
   - HE stretches contrast near histogram maxima and compresses it near minima.
   - Specification is $z = G^{-1}[T(r)]$.
   - Addition and subtraction change brightness; multiplication and division change contrast; subtraction is for motion detection.
   - Data-type ranges (slide 6).
9. **Related lectures:** pixel relationships, arithmetic operations and color representation, see Lecture 7. Matlab image operations, see Lecture 8. Filtering and edges, see Lecture 11.
