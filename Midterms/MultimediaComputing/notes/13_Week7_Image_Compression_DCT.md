# Lecture 13 (Week 7): Image Compression (DCT, Data Redundancy, Fidelity)

What this lecture is about: how to reduce the data needed to represent an image (Gonzalez ch. 8): DCT/JPEG, lossy vs lossless, compression ratio and relative redundancy, the three redundancies (coding, interpixel, psychovisual), run length coding, fidelity criteria and the compression system model.

> **Exam scope:** the professor said Lecture 13 is **NOT on the midterm** (it will be on the **final**). One point from it was mentioned in class: **JPEG = lossy, PNG = lossless**.

Source: `Multimedia Computing L13 (2).pdf`, 44 pages. "slide N" = PDF page N (page 1 = title).

---

## 1. Objective, Uses and Types of Compression (slides 2-5)

- Content list (slide 2): Chapter 8 (Gonzalez), image compression, DCT, coding redundancy, interpixel redundancy, psychovisual redundancy, lossy and lossless example.
- **Objective** (slide 3): reduce the number of **bytes** required to represent a digital image:
  - redundant data reduction; remove patterns; "uncorrelated data confirms redundant data elimination".
- **Enabling technology** (slide 4): compression is used in FAX, teleconference, remote demo, etc.
- **Review** (slide 5): what and how to exploit data redundancy; model based approach; information theory principles (entropy: see Lecture 4).
- **Types of compression** (slide 5): **lossless** and **lossy**.

## 2. Compression Models and Standards (slides 6, 7, 13, 41)

- Definition (slide 6): *"Image compression is the process of reducing the amount of data required to represent an image."*
- Slide 6 diagrams: $f(x,y) \to$ Compress $\to$ transmit (channel) or store (storage device) $\to$ retrieve $\to$ Decompress $\to \hat f(x,y)$; also Original image $\to$ Encoder $\to$ bitstream `0101100111...` $\to$ Decoder $\to$ Decoded image.
- **General model** (slide 7): $F(x,y) \to$ Source Encoder $\to$ Channel Encoder $\to$ Channel/Store $\to$ Channel Decoder $\to$ Source Decoder $\to F'(x,y)$.
- **Standards** (slide 7), exact list:
  - **JPEG** based on **DCT** (discrete cosine transform)
  - **JPEG 2000** based on **DWT** (discrete wavelet transform)
  - **GIF** (Graphics Interchange Format), etc.
  - PNG = lossless (slides 17-18; mentioned in class).
- Slide 13 ("Information recovery"): Data $\to$ Processing $\to$ Information. Goal: recover the information with reduced data volume, i.e. reduce data redundancy and **measure** it. Slide also says *"Image compression is an irreversible process"* and lists transforms used: DCT, DWT. (Strictly only lossy compression is irreversible; PNG and RLE are reversible.)
- **Image compression model** (slide 41, Gonzalez Fig. 8.5 and 8.6):
  - Encoder = **source encoder + channel encoder**; Decoder = **channel decoder + source decoder**.
  - Source encoder: $f(x,y) \to$ **Mapper** $\to$ **Quantizer** $\to$ **Symbol encoder** $\to$ channel.
  - Source decoder: channel $\to$ **Symbol decoder** $\to$ **Inverse mapper** $\to \hat f(x,y)$. There is **no inverse quantizer** (quantization cannot be undone).
  - (textbook context) Mapper reduces interpixel redundancy (reversible), quantizer reduces psychovisual redundancy (irreversible, omitted for lossless), symbol encoder reduces coding redundancy (e.g. variable-length code). Channel encoder adds controlled redundancy for noise immunity.

## 3. Discrete Cosine Transform (slides 8-12)

- DCT (slide 8): transforms a signal or image from the **spatial domain** (pixel intensities) to the **frequency domain**. Used in **JPEG** because it **concentrates most of the image's information in a small number of frequency components**.
- It writes the data as a **sum of cosine functions oscillating at different frequencies**.
- Less important (**higher frequency**) components can be **discarded**, reducing size while keeping a similar visual appearance.
- **2D DCT** (slide 9) is applied to blocks, typically **8x8**. The professor's formula (block $f(x,y)$, $N$ = block size, usually 8 for JPEG):

$$F(u,v)=\frac{1}{4}\sum_{x=0}^{N-1}\sum_{y=0}^{N-1} f(x,y)\,\alpha(u)\,\alpha(v)\cos\!\left(\frac{(2x+1)u\pi}{2N}\right)\cos\!\left(\frac{(2y+1)v\pi}{2N}\right),\qquad \alpha(u)=\begin{cases}\frac{1}{\sqrt2}, & u=0\\ 1, & u\neq 0\end{cases}$$

  - $f(x,y)$ = pixel value in the block; $F(u,v)$ = DCT coefficient for frequency $(u,v)$; $\alpha(u),\alpha(v)$ = normalizing factors.
  - The $\frac14$ equals $\frac{2}{N}$ for $N=8$ (textbook context: for other $N$ use $\frac{2}{N}$). Verified in Python: for $N=8$ this equals the orthonormal DCT-II (MATLAB `dct2`), max difference $3\times10^{-13}$.
  - $F(0,0)$ is the **DC** coefficient: $F(0,0)=\frac14\cdot\frac12\sum f = \frac{1}{8}\sum f = 8\cdot\text{mean}$ for an 8x8 block.
- **Steps in image compression with DCT** (slide 10), exact order:
  1. **Block the image**: split into non-overlapping 8x8 blocks.
  2. **Apply 2D DCT** to each block (spatial values to frequency coefficients).
  3. **Quantization**: coefficients are quantized; discarding less important high-frequency components gives the compression (the lossy step).
  4. **Zigzag scan**: quantized coefficients ordered in a zigzag to prioritize low frequencies. (textbook context: order starts (0,0), (0,1), (1,0), (2,0), (1,1), (0,2), (0,3), ...)
  5. **Entropy encoding**: e.g. Huffman coding (see Lecture 4).
- **DCT example in Matlab** (slides 11-12):

```matlab
I = imread('12.jpg');
I_gray = rgb2gray(I);                     % convert to grayscale if color
block_size = 8;
dct_transform = @(block_struct) dct2(block_struct.data);
DCT_image = blockproc(I_gray, [block_size block_size], dct_transform);  % 2D DCT per 8x8 block
subplot(1,2,1); imshow(I_gray); title('Original Image');
subplot(1,2,2); imshow(log(abs(DCT_image)), []); title('DCT Transformed Image');
```

  - Coefficients are displayed as `log(abs(.))` with `[]` (auto min-max scaling), since magnitudes span a huge range.

## 4. Lossy JPEG and Lossless PNG in Matlab (slides 15-19)

- **Lossy** (slide 16): `imwrite(img, 'compressed_image_90.jpg', 'jpg', 'Quality', 90)`, also Quality 50 and 10, on `peppers.png`; shown in a 2x2 subplot (slide 15).
  - Slide wording: *"Lower quality values result in more compression but also greater loss of image fidelity."*
- **Lossless** (slides 17-18): `imwrite(img, 'compressed_image_lossless.png', 'png')`.
  - Slide wording: *"PNG uses lossless compression, meaning the compressed image will be exactly the same as the original in terms of pixel values, but with a smaller file size."*
- File sizes via `dir(...).bytes` (slide 19). The printed "Original Image Size" value is **missing** in the slide output. Reported sizes, with CR computed **relative to the PNG** (both from the slide):

| File | Size (bytes) | CR vs PNG | RD vs PNG |
|---|---|---|---|
| JPEG Quality 90 | 41327 | 6.96 | 0.856 |
| JPEG Quality 50 | 15671 | 18.35 | 0.946 |
| JPEG Quality 10 | 6619 | 43.45 | 0.977 |
| PNG lossless | 287589 | 1.00 | 0 |

- (textbook context) MATLAB `peppers.png` is 384x512x3 = 589824 raw bytes, so PNG gives CR about 2.05 and JPEG Q50 about 37.6 relative to raw.

## 5. Compression Ratio and Relative Data Redundancy (slides 13-14, 20)

- Two data sets $D_1$, $D_2$ that **yield the same information**; $n_1$, $n_2$ = **"info-carrying units"** of each (slide 14). $D_1$ = **original**, $D_2$ = **compressed** (slide 20).

$$C_R=\frac{n_1}{n_2}\qquad\qquad R_D = 1-\frac{1}{C_R}$$

- Slide 24 also writes them as $CR=\dfrac{\text{Original Size}}{\text{Compressed Size}}$ and $RD = 1-\dfrac{\text{Compressed Size}}{\text{Original Size}}$ (same thing).
- $C_R$ has no unit (ratio); $R_D$ is a fraction of $D_1$ that is redundant.
- Worked cases (slide 20):

| Case | $C_R$ | $R_D=1-1/C_R$ | Meaning (slide wording) |
|---|---|---|---|
| $n_1=n_2$ | 1 | 0 | no data redundancy relative to $D_1$ |
| $n_1=10\,n_2$ | 10 | 0.9 | 90% of the data in $D_1$ is redundant |
| $n_1 \ll n_2$ | $\to 0$ | $\to -\infty$ | (slide asks) $D_2$ is much bigger: data **expansion**, negative redundancy, e.g. $C_R=0.1 \Rightarrow R_D=-9$ |

## 6. Three Types of Data Redundancy (slide 21)

Exact definitions:
- **Coding redundancy**: occurs when the data used to represent the image is **not utilized in an optimal manner**.
- **Interpixel redundancy**: occurs because **adjacent pixels tend to be highly correlated**; in most images brightness levels do not change rapidly but **change gradually**.
- **Psychovisual redundancy**: some information is **more important to the human visual system** than other information.

## 7. Coding Redundancy and Lavg (slides 22-25)

- Slide 22: how to assign codes to an alphabet. In image processing, code = gray level or color value; alphabet is conceptual.
- General approach: **find the more frequently used alphabet; use fewer bits for the more frequent symbols and more bits for the less frequent ones.**
- Slide 23 (gray images): normalize the histogram into a pdf. With $r_k$ the random variable, $n_k$ = count of level $r_k$, $n$ = total pixels, $L$ = number of gray levels:

$$p_r(r_k)=\frac{n_k}{n},\quad k=0,1,\dots,L-1 \qquad L_{avg}=\sum_{k=0}^{L-1} l(r_k)\,p_r(r_k)$$

  - $l(r_k)$ = number of bits to represent $r_k$; $L_{avg}$ = **average number of bits to encode one pixel**.
  - An $M \times N$ image needs $MN\,L_{avg}$ bits.
  - 8-bit code: $l(r_k)=8$, so $L_{avg}=8$. These are **fixed length codes**.
- **Worked example: fixed vs variable length codes** (slide 24, Gonzalez Table 8.1), 8 gray levels:

| $r_k$ | $p_r(r_k)$ | Code 1 | $l_1(r_k)$ | Code 2 | $l_2(r_k)$ | $l_2(r_k)\,p_r(r_k)$ |
|---|---|---|---|---|---|---|
| $r_0=0$ | 0.19 | 000 | 3 | 11 | 2 | 0.38 |
| $r_1=1/7$ | 0.25 | 001 | 3 | 01 | 2 | 0.50 |
| $r_2=2/7$ | 0.21 | 010 | 3 | 10 | 2 | 0.42 |
| $r_3=3/7$ | 0.16 | 011 | 3 | 001 | 3 | 0.48 |
| $r_4=4/7$ | 0.08 | 100 | 3 | 0001 | 4 | 0.32 |
| $r_5=5/7$ | 0.06 | 101 | 3 | 00001 | 5 | 0.30 |
| $r_6=6/7$ | 0.03 | 110 | 3 | 000001 | 6 | 0.18 |
| $r_7=1$ | 0.02 | 111 | 3 | 000000 | 6 | 0.12 |
| **Sum** | 1.00 | | $L_{avg}=3$ | | | $L_{avg}=$ **2.70** |

  - Step 1: $L_{avg}(\text{Code 2}) = 2(0.19)+2(0.25)+2(0.21)+3(0.16)+4(0.08)+5(0.06)+6(0.03)+6(0.02)=2.7$ bits/pixel.
  - Step 2: $C_R = 3/2.7 = 1.11$ (Code 1 is the 3-bit fixed code).
  - Step 3: $R_D = 1-1/1.11 = 0.099$. Exact value: $1-2.7/3 = 0.10$; the slide's 0.099 comes from rounding $C_R$ to 1.11 first. So about 10% of the 3-bit code is redundant.
  - Code 2 is prefix-free (no codeword is the start of another), so it decodes uniquely (verified).
- **Code assignment view** (slide 25, Fig. 8.1): plot of $p_r(r_k)$ (falling) and $l_2(r_k)$ (rising, 2,2,2,3,4,5,6,6). Shortest codes go to the most probable levels: the fundamental basis of compression through variable-length coding.

## 8. Interpixel Redundancy (slides 26-27)

- Slide 26 (Fig. 8.2): two match images (random vs aligned) with **almost identical histograms** but different **normalized autocorrelation along one line** $\gamma(\Delta n)$; the aligned matches give periodic peaks. Takeaway: same histogram means the same coding redundancy, yet the pixel-to-pixel structure differs; variable-length coding alone cannot exploit it.
- **Inter-pixel spatial redundancy** (slide 27):
  - due to the **correlation between neighboring pixels**;
  - the value of any pixel **can be predicted from its neighbors** (highly correlated);
  - the information carried by an individual pixel is relatively small;
  - to reduce it, **the difference between adjacent pixels** can be used to represent the image (the DPCM idea, see Lecture 4).
- **Inter-pixel temporal redundancy** (slide 27): statistical correlation between pixels of **successive frames** in a video; also called **inter-frame redundancy**; removing it gives efficient video compression.
- Algorithm named on slide 27: **Run Length Coding**.

## 9. Run Length Coding (slides 28-33)

- RLE (slide 29): *"a simple form of lossless compression that is particularly useful for images with many consecutive identical pixel values, such as binary or grayscale images."* Each run is stored as a pair (value, run length).
- **Worked example** (slide 28, Gonzalez Fig. 8.3): (a) 1024x343 scanned drawing, (b) binarized by a threshold, line 100 marked, (c) line profile, (d) RLC.
  - Line 100: (1,63) (0,87) (1,37) (0,5) (1,4) (0,556) (1,62) (0,210). Value 1 = above threshold (bright).

| Run | Value | Length | Pixels $x$ |
|---|---|---|---|
| 1 | 1 | 63 | 0 to 62 |
| 2 | 0 | 87 | 63 to 149 |
| 3 | 1 | 37 | 150 to 186 |
| 4 | 0 | 5 | 187 to 191 |
| 5 | 1 | 4 | 192 to 195 |
| 6 | 0 | 556 | 196 to 751 |
| 7 | 1 | 62 | 752 to 813 |
| 8 | 0 | 210 | 814 to 1023 |
| | | **1024** | full line |

  - Whole image: $n_1 = 1024 \times 343 \times 1$ bit $= 351232$ bits; $n_2 = 12166$ runs $\times$ 11 bits $= 133826$ bits.
  - $C_R = \dfrac{1024\cdot 343}{12166\cdot 11} = 2.62$ (slide shows 2.63; exact 2.6245). Note the slide writes `1024*343/12166*11`, meaning the denominator is the product.
  - $R_D = 1 - 1/2.62 = 0.62$ (matches slide).
- **Matlab RLE** (slides 30-33): `image = imread('cameraman.tif'); image_vector = image(:);` (flatten 2D to 1D), loop: if pixel equals current `value` then `count = count + 1`, else store `value` and `count`, reset; append the last run at the end.
  - Size measure used: `original_size = length(image_vector)`, `compressed_size = length(encoded_values) + length(run_lengths)`.
  - **Careful:** the code computes `compression_ratio = compressed_size / original_size`, the **inverse** of $C_R=n_1/n_2$.
- **Result** (slide 29): original 65536 bytes (256x256), compressed 112224 bytes (= 2 x 56112 runs), "Compression Ratio: 1.71".

| Quantity | Value |
|---|---|
| Slide's ratio (compressed / original) | 112224 / 65536 = 1.71 |
| Proper $C_R = n_1/n_2$ | 65536 / 112224 = **0.584** |
| $R_D = 1 - 1/C_R$ | **-0.712** |

  - So RLE **expanded** the natural grayscale image (this is the $n_1 \ll n_2$ case of slide 20): neighboring gray values are similar but rarely identical, so runs are short.

## 10. Psychovisual Redundancy and IGS (slides 34-38)

- Slide 34: some visual characteristics are less important than others; observers seek out **edges, textures**, etc. and mentally combine them to recognize the scene.
- Slide 34 (Fig. 8.4): (a) original, (b) **uniform quantization to 16 levels** (false contours), (c) **IGS quantization to 16 levels** (looks much better at the same 4 bits/pixel). (textbook context: 8 to 4 bits gives $C_R=2$.)
- Slide 35, key wording:
  - If the image is only for visual observation, much information is psychovisually redundant; it can be removed without changing visual quality. **This kind of compression is usually irreversible.**
  - It exists because human perception does **not involve quantitative analysis of every pixel or luminance value**.
  - Its elimination is possible only because the information is not essential for normal visual processing.
- **IGS (Improved Gray Scale) quantization, Table 8.2** (slide 36). Rule (textbook context): Sum = current 8-bit gray level + the 4 low bits of the previous Sum (add 0000 if the 4 high bits of the current pixel are 1111, to avoid overflow); IGS code = 4 high bits of Sum.

| Pixel | Gray level | Added (low 4 bits of previous Sum) | Sum | IGS code |
|---|---|---|---|---|
| $i-1$ | N/A | | 0000 0000 | N/A |
| $i$ | 0110 1100 (108) | 0000 | 0110 1100 (108) | 0110 |
| $i+1$ | 1000 1011 (139) | 1100 | 1001 0111 (151) | 1001 |
| $i+2$ | 1000 0111 (135) | 0111 | 1000 1110 (142) | 1000 |
| $i+3$ | 1111 0100 (244) | 0000 (high bits are 1111) | 1111 0100 (244) | 1111 |

  - Plain truncation would give 0110, 1000, 1000, 1111; IGS adds a pseudo-random dither that breaks up false contours.
- **DCT demo of psychovisual redundancy** (slides 37-38), steps: (1) read grayscale image; (2) 2D DCT of the image; (3) visualize DCT coefficients (log scale); (4) zero out high-frequency components, *"retain only the top-left 10% of DCT coefficients"*; (5) apply the mask; (6) reconstruct with inverse DCT (IDCT); (7) display. Result (slide 37): cameraman becomes blurry with ringing but is still recognizable.

## 11. Fidelity Criteria (slides 39-40)

- Slide 39: **Subjective** and **Objective**. Objective measures named: **sum of the absolute error**, **RMS value of the error**, **signal to noise ratio**.
- Formulas (textbook context, Gonzalez; slides only name them). $f$ = original, $\hat f$ = decompressed, $M \times N$ image, $e(x,y)=\hat f(x,y)-f(x,y)$:

$$\text{SAE}=\sum_{x=0}^{M-1}\sum_{y=0}^{N-1}\lvert \hat f(x,y)-f(x,y)\rvert \qquad e_{rms}=\left[\frac{1}{MN}\sum_{x}\sum_{y}\big(\hat f(x,y)-f(x,y)\big)^2\right]^{1/2}$$

$$\text{SNR}_{ms}=\frac{\sum_x\sum_y \hat f(x,y)^2}{\sum_x\sum_y\big(\hat f(x,y)-f(x,y)\big)^2}\qquad \text{SNR}_{rms}=\sqrt{\text{SNR}_{ms}}$$

  - In dB: $10\log_{10}\text{SNR}_{ms}$ (see Lecture 3 for SNR in dB).
- **Subjective scale** (slide 40, Table 8.3, Television Allocations Study Organization): note **1 = best**.

| Value | Rating | Description |
|---|---|---|
| 1 | Excellent | extremely high quality, as good as you could desire |
| 2 | Fine | high quality, enjoyable viewing; interference not objectionable |
| 3 | Passable | acceptable quality; interference not objectionable |
| 4 | Marginal | poor quality, you wish you could improve it; interference somewhat objectionable |
| 5 | Inferior | very poor but watchable; objectionable interference definitely present |
| 6 | Unusable | so bad you could not watch it |

---

## Exam focus

All numbers below were verified in Python (`/home/claude/work/agents/L13/verify.py`, `verify2.py`).

1. **Lossy or lossless?** JPEG = lossy (DCT + quantization, Quality 0 to 100); PNG = lossless (pixel values identical, smaller file); JPEG 2000 = DWT; RLE = lossless. Lower JPEG quality gives more compression and less fidelity: Q90 41327 B, Q50 15671 B, Q10 6619 B vs PNG 287589 B (slide 19).
2. **Compute CR and RD.** $n_1=65536$ bytes, $n_2=16384$ bytes: $C_R=4$, $R_D=1-1/4=0.75$ (75% of $D_1$ redundant). Remember: $C_R=1 \Rightarrow R_D=0$; $C_R=10 \Rightarrow R_D=0.9$; $n_1 \ll n_2 \Rightarrow C_R<1$, $R_D<0$ (expansion).
3. **Lavg from a code table (slide 24 style).** 4 levels, $p=0.5, 0.25, 0.125, 0.125$, codes 0, 10, 110, 111:

| $p_r(r_k)$ | code | $l(r_k)$ | $l\,p$ |
|---|---|---|---|
| 0.5 | 0 | 1 | 0.5 |
| 0.25 | 10 | 2 | 0.5 |
| 0.125 | 110 | 3 | 0.375 |
| 0.125 | 111 | 3 | 0.375 |
| | | $L_{avg}$ | **1.75** |

   vs 2-bit fixed code: $C_R=2/1.75=1.143$, $R_D=1-1/1.143=0.125$. A 100x100 image needs $MN\,L_{avg}=17500$ bits. Slide's own answer: $L_{avg}=2.7$, $C_R=1.11$, $R_D=0.099$ (exact 0.10).
4. **Run length coding.** Binary line `1111 0000000000 11` (16 px, 1 bit each) gives runs (1,4)(0,10)(1,2). With 5 bits per pair (1 bit value + 4 bits length): $n_2=15$, $C_R=16/15=1.07$, $R_D=0.0625$. Slide's answer: $C_R=(1024\cdot343)/(12166\cdot11)=2.62$ (slide 2.63), $R_D=0.62$. Cameraman RLE: proper $C_R=65536/112224=0.584$ (the code's "1.71" is compressed/original).
5. **Name and define the three redundancies** (slide 21) and the remedy: coding: variable-length code (Huffman); interpixel: differences or run lengths (mapper); psychovisual: quantization (irreversible).
6. **JPEG DCT pipeline in order:** 8x8 blocks, 2D DCT, quantization, zigzag scan, entropy (Huffman) coding. Mini: an 8x8 block with all pixels 128 has $F(0,0)=\frac14\cdot\frac{1}{\sqrt2}\cdot\frac{1}{\sqrt2}\cdot 64\cdot128 = 1024$ and every other coefficient 0 (energy compaction into DC).
7. **Fidelity mini example.** $f=\begin{bmatrix}10&20\\30&40\end{bmatrix}$, $\hat f=\begin{bmatrix}12&18\\30&43\end{bmatrix}$, so $e=\begin{bmatrix}2&-2\\0&3\end{bmatrix}$.
   - SAE $=2+2+0+3=7$.
   - $e_{rms}=\sqrt{(4+4+0+9)/4}=\sqrt{4.25}=2.06$.
   - $\text{SNR}_{ms}=(144+324+900+1849)/17=3217/17=189.2$; $\text{SNR}_{rms}=13.76$; $10\log_{10}189.2=22.77$ dB.
8. **IGS mini example.** Pixels 58, 58, 243 (0011 1010, 0011 1010, 1111 0011): Sums 58, 58+10=68, 243 (high bits 1111, add 0), so IGS codes are **0011, 0100, 1111**. Identical pixels can get different codes (dithering).
9. **Compression system model:** draw source encoder (mapper, quantizer, symbol encoder) and source decoder (symbol decoder, inverse mapper; no inverse quantizer), plus channel encoder and decoder (slide 41).
10. **Subjective scale:** 1 Excellent, 2 Fine, 3 Passable, 4 Marginal, 5 Inferior, 6 Unusable (1 = best).
