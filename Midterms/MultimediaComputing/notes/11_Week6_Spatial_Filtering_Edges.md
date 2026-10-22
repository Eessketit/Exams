# Lecture 11 (Week 6): Spatial Filtering, Sharpening and Edge Detection

What this lecture is about: filtering an image with small masks (convolution), blurring (average, Gaussian), sharpening (sharpening masks, high pass, unsharp masking, high boost), point, line and edge detection with first order operators (Roberts, Prewitt, Sobel, Frei-Chen, compass masks) and second order operators (Laplacian, zero crossing, LoG, DoG), color edge detection, and the nonlinear median, color median and min/max filters. Slide 2 cites "Chapter - 3 (Gonzalez books)".

**Conventions used throughout**
- "slide N" = PDF page N (slide 1 = title). Reference (slide 61): Gonzalez and Woods, *Digital Image Processing*, 4th ed. The scanned figures (Fig. 3.14, 3.17, ...) keep their source book's numbers.
- "Apply a mask at a pixel" follows slide 14: multiply each window pixel by the mask weight in the same position and add, $\text{new pixel}=\sum_{k=0}^{8} I_k M_k$ (no flip). Every number below was checked with numpy/scipy (`agents/L11/verify.py`).
- Masks are written row by row in Matlab style: `[1 0 -1; 2 0 -2; 1 0 -1]` (see Lecture 8). Coordinates are (row, col), 0-based, top-left = (0,0).

## 1. Masks, Filters and Edges Overview (slides 2-8)

- Slide 3: "A mask is a filter. Concept of masking is also known as **spatial filtering**". The filtering "is performed directly on the image".
- Slide 4: "The process of filtering is also known as **convolving a mask with an image**", so "filter masks are also known as **convolution masks**". Types of filters (slide wording): "linear filters or smoothing filters"; "others are called as frequency domain filters". Uses (slide 5): blurring and noise reduction; edge detection and sharpness.
- **Edges** (slide 6): "significant local changes of intensity in a digital image"; "a set of connected pixels that forms a boundary between two disjoint regions". Three types: **horizontal, vertical, diagonal**.
- Edge detection (slides 7-8): "a method of segmenting an image into regions of discontinuity", used in pattern recognition, image morphology and feature extraction. "It reduces the amount of data in an image and preserves the structural properties of an image."
- Two families of operators (slide 8): **gradient based** = first order derivatives (Sobel, Prewitt, Robert operator); **Gaussian based** = second order derivatives (Canny edge detector, Laplacian of Gaussian). (textbook context) Canny really uses the first derivative of a Gaussian; the grouping is the slide's.

## 2. Histogram Statistics for Enhancement (slides 9-10)

- $r$ = a discrete random variable (the intensity). $p(r_i)$ = the normalized histogram component for the i-th value (histograms: see Lecture 9).
- Mean $m=\sum_{i=0}^{L-1} r_i\,p(r_i)$. n-th moment $\mu_n(r)=\sum_{i=0}^{L-1}(r_i-m)^n p(r_i)$. Second moment $\mu_2(r)=\sum_{i=0}^{L-1}(r_i-m)^2 p(r_i)$, which is the variance.
- **Global enhancement**: "The global mean and variance are measured over an entire image". **Local enhancement**: "The local mean and variance are used as the basis for making changes".
- Example (verified): window `[13 4 8; 2 9 6; 7 25 16]` with each value at $p=1/9$ gives $m=90/9=10$ and $\mu_2=400/9=44.44$.

## 3. Convolution and Image Borders (slides 11-15)

- Mathematical formulation (slide 11):
$$g(x,y)=h(x,y)*f(x,y)=\int_{-\infty}^{\infty}\int_{-\infty}^{\infty} h(x-x',y-y')\,f(x',y')\,dx'\,dy'$$
$$y(m,n)=h(m,n)*x(m,n)=\sum_{m'=-\infty}^{\infty}\sum_{n'=-\infty}^{\infty} h(m-m',n-n')\,x(m',n')$$
- Discrete convolution (slide 11): "merely a **weighted sum of pixels in the neighborhood** of the source pixel". The weights come from "a small matrix called the **convolution mask** or **convolution kernel**". "The location of the **center** corresponds to the location of the output pixel." It is used for smoothing, edge detection and other effects.
- Slide 14 diagram: a window $I_0..I_8$ times a mask $M_0..M_8$ gives new pixel $=I_0M_0+I_1M_1+\dots+I_8M_8$, written at the centre position.
- 1D (slide 12): $f(x)*g(x)=\int_{-\infty}^{\infty} f(\alpha)\,g(x-\alpha)\,d\alpha$. "Intuitively, one function is swept past (1D) or rubbed over (2D) the other."
- (textbook context) Convolution vs correlation. The formula flips $h$ ($h(x-x')$) but the slide-14 recipe does not, so the recipe is really correlation. Both give the same result for symmetric masks (average, Gaussian, Laplacian, sharpening). For Sobel and Prewitt the flip only changes the sign, so the gradient magnitude does not change. Matlab: imfilter correlates, conv2 convolves (see Lecture 8).

**Worked example: slide 13** ($f(\alpha)=1$ on $[0,1]$, $g(\alpha)=\tfrac12$ on $[0,1]$): flip $g$ to $g(-\alpha)$, shift it to $g(x-\alpha)$, then integrate the overlap.

| x range | overlap of f and g(x - alpha) | $f*g(x)$ | numeric check |
|---|---|---|---|
| $0\le x\le 1$ | $[0,x]$ at height 1/2 | $x/2$ | $x=0.5$: 0.25 |
| $1\le x\le 2$ | $[x-1,1]$ at height 1/2 | $1-x/2$ | $x=1$: 0.5 (peak); $x=1.5$: 0.25 |
| elsewhere | none | 0 | |

- Border handling (slide 15, "How to treat image borders for convolution?"; all four on one image in Exam focus E3):
  1. **Zero-padding**: "treat the empty cells in the convolution window as zeros."
  2. **Start convolving at the first position where window doesn't overlap the image**: "Start convolving at (1,1) instead of (0,0) with 3 x 3 convolution mask". The output loses a 1-pixel frame.
  3. **Duplication of the edges**: "Copy the top row, the left side, the right side, and the bottom of the image."
  4. **Wrap-around**: the opposite edge supplies the missing neighbours.

## 4. Blurring: Average and Gaussian Masks (slides 16-19)

- Blurring = **low-pass spatial filtering** (slide 16). It "Removes the finer details of an image" and "Can be accomplished through convolution."
- "One common blurring mask": "all convolution coefficients are equal". A 3x3 mask has all elements $1/9$; a 5x5 mask has all elements $1/25$. "**The bigger the mask, the greater the blurring effect.**" Slides 17-18 show 3x3, 5x5 and 7x7.
- Gaussian smoothing (slide 19). The formula as printed (the slide types $\sigma$ as $\delta$ and $\pi$ as $\Pi$):
$$G[x,y]=\frac{e^{-\frac{x^2+y^2}{2\sigma^2}}}{\sqrt{2\pi\sigma^2}}$$
  - "$\sigma$ controls the effective spread & size of the mask." The curves are drawn for $\sigma = 0.75, 0.8, 0.85$.
  - 3x3 mask approximation: `[1/16 1/8 1/16; 1/8 1/4 1/8; 1/16 1/8 1/16]` $=\frac{1}{16}$ `[1 2 1; 2 4 2; 1 2 1]` (sum 1).
  - Verified: sampling $e^{-(x^2+y^2)/2\sigma^2}$ on a 3x3 grid gives exactly 1:2:4 when $e^{-1/(2\sigma^2)}=\tfrac12$. That means $\sigma=1/\sqrt{2\ln 2}=0.849$, the $\sigma\approx0.85$ curve on the slide. For $\sigma=1$ the normalized 3x3 kernel is `[0.0751 0.1238 0.0751; 0.1238 0.2042 0.1238; 0.0751 0.1238 0.0751]`.
  - (textbook context) The 2-D constant is $\frac{1}{2\pi\sigma^2}$. The slide's $\frac{1}{\sqrt{2\pi\sigma^2}}$ is the 1-D constant: with it, the 2-D integral is 2.50 instead of 1 for $\sigma=1$. In practice the sampled kernel is divided by its sum, so the constant drops out.
  - The slides give no rule for the kernel size. The LoG demos use "7X7, $\sigma$=1.0" (slide 48). (textbook context) A common choice is an odd size of about $6\sigma$.

## 5. Sharpening, High Pass, Unsharp Masking, High Boost (slides 20-26)

- Slide 20: "Sharpening has the **opposite affect of blurring**." It is "also referred to as **crispening**, emphasizes the details in an image." "Sharpening an image will **increase its contrast**."
- Sharpening masks (slide 20): `[0 -1 0; -1 5 -1; 0 -1 0]`, `[-1 -1 -1; -1 9 -1; -1 -1 -1]`, `[1 -2 1; -1 5 -2; 1 -2 1]`.
  - The first two sum to 1, so flat areas are unchanged. (textbook context) Each one equals identity + a Laplacian mask from slide 45 (verified).
  - The third sums to 2 as printed (slide shows -1 at middle-left). The symmetric textbook mask `[1 -2 1; -2 5 -2; 1 -2 1]` sums to 1.
- **High pass filter** (slide 21): "A high pass filter will remove the low frequency components and show only high detail." Common mask: $\frac19$ `[-1 -1 -1; -1 8 -1; -1 -1 -1]`. It sums to 0, so flat regions go to 0 (the black "Highpass" image on slide 25).
- **Unsharp masking**: "another method of highpass filtering". "Subtract a lowpass filtered image from its original."
- **High-boost filtering** ("high-frequency emphasis filter", slides 21, 24):
$$\text{High Boost}=\alpha\cdot\text{Original}-\text{Lowpass}$$
  - Mask: centre $\omega/9$, all 8 neighbours $-1/9$, with $\omega=9\alpha-1$.
  - "When $\alpha$ = 1, the result is high pass filter" ($\omega=8$). "When $\alpha$ > 1, the effect is to restore low frequency component."
  - Effects (slide 24): "Retains more of original image's background"; "As $\alpha$ increases, the overall image gets lighter"; "Looks more like the original image, with a relative degree of edge enhancement."
  - Why (verified): the mask sums to $(\omega-8)/9=\alpha-1$, so a flat region of value $v$ becomes $(\alpha-1)v$. The demos use $\alpha=1.2$ ($\omega=9.8$, sum 0.2) and $\alpha=1.7$ ($\omega=14.3$, sum 0.7) on slides 25-26.

## 6. Point and Line Detection (slides 27-28)

- "Three types of discontinuities: **points, lines, edges**" (slide 27).
- Mask response: $R=\sum_{i=1}^{9} Z_i M_i$, where $Z_1..Z_9$ is the window row by row and $M_1..M_9$ is the mask.
- **Point detection**: "A point has been detected at the location at which the mask is centered if $|R|>T$", "where T is a nonnegative threshold".
- Point mask (slide 28, "for detecting isolated points different from a constant background"): `[-1 -1 -1; -1 8 -1; -1 -1 -1]`.
- Line masks (slide 28):

| Horizontal | +45 deg | Vertical | -45 deg |
|---|---|---|---|
| `[-1 -1 -1; 2 2 2; -1 -1 -1]` | `[-1 -1 2; -1 2 -1; 2 -1 -1]` | `[-1 2 -1; -1 2 -1; -1 2 -1]` | `[2 -1 -1; -1 2 -1; -1 -1 2]` |

- Every one of these masks sums to 0, so a constant background gives $R=0$. (textbook context) The line direction is the mask with the largest $|R|$. Numbers: Exam focus E4.

## 7. Edges, Homogeneity and Difference Operators (slides 29-36)

- Slide 29: an edge is "the boundary between two regions with relatively distinct gray-level properties". "The idea underlying most edge-detection techniques: The **computation of a local derivative**." Isolated points and thin lines are rare in practice.
- Slide 30 (profiles of a light bar and a dark bar). The **first derivative** is one spike per edge, positive for dark to light and negative for light to dark. The **second derivative** gives a +/- pair per edge, and its sign change (the **zero crossing**) marks the edge centre.
- Slide 31: "An edge is where the intensity of an image move from a low value to a high value or vice versa." Edge shapes: **roof, line, step, ramp**. "Infinite number of edge orientations, widths and shapes." Applications: **image segmentation** (groups pixels into regions) and **image registration** ("aligns two images that may have been acquired at separate times or from different sensors"). Edges tell "where objects are, their shape and size, and something about their texture" (slides 31-32).
- **Homogeneity operator** (slide 33): "Subtracts each 8 surrounding pixels from the center pixel of a 3 X 3 window. The output is the maximum of the absolute value of each difference." Slides call it among "the simplest and quickest edge detectors".
- **Difference operator**: "It operates more quickly because it requires **four subtractions per pixel** as opposed to the **eight** needed by the homogeneity operator." It subtracts the 4 pairs of opposite pixels through the centre.

**Worked example: slide 34** (window `[11 13 15; 16 11 11; 16 12 11]`, centre 11):
- Homogeneity: max{|11-11|, |11-13|, |11-15|, |11-16|, |11-11|, |11-16|, |11-12|, |11-11|} = max{0, 2, 4, 5, 0, 5, 1, 0} = **5**.
- Difference: max{|11-11| (top-left minus bottom-right), |13-12| (top minus bottom), |15-16| (top-right minus bottom-left), |11-16| (right minus left)} = max{0, 1, 1, 5} = **5**.
- Edge maps: Fig. 3.14 (slide 35) and slide 36.

## 8. First Order Derivative Operators: Roberts, Prewitt, Sobel, Frei Chen (slides 37-40, 43-44)

- Gradient magnitude and direction (slide 37). $H_r$ is the row mask and $H_c$ is the column mask:
$$H(x,y)=\sqrt{H_r^2(x,y)+H_c^2(x,y)}\quad\text{or}\quad H(x,y)=|H_r(x,y)|+|H_c(x,y)|,\qquad \theta=\tan^{-1}\frac{H_c(x,y)}{H_r(x,y)}$$
- Masks exactly as printed (slide 37):

| Operator | $H_r$ | $H_c$ |
|---|---|---|
| Roberts | `[0 0 -1; 0 1 0; 0 0 0]` | `[-1 0 0; 0 1 0; 0 0 0]` |
| Sobel | `[1 0 -1; 2 0 -2; 1 0 -1]` | `[-1 -2 -1; 0 0 0; 1 2 1]` |
| Prewitt | `[1 0 -1; 1 0 -1; 1 0 -1]` | `[-1 -1 -1; 0 0 0; 1 1 1]` |
| Frei-Chen | `[1 0 -1; √2 0 -√2; 1 0 -1]` | `[-1 -√2 -1; 0 0 0; 1 √2 1]` |

- Sobel, second version (slide 43). It "uses two 3 x 3 kernels or masks which are convolved with the input image to calculate the vertical and horizontal derivative approximations respectively":

| $M_x$ | | | | $M_y$ | | |
|---|---|---|---|---|---|---|
| -1 | 0 | 1 | | -1 | -2 | -1 |
| -2 | 0 | 2 | | 0 | 0 | 0 |
| -1 | 0 | 1 | | 1 | 2 | 1 |

- Sign conventions (verified): $M_x=-H_r$ and $M_y=H_c$.
  - With the slide-14 (no flip) rule, $M_x$ is positive where intensity rises left to right, and $H_r$ is positive where it falls. $M_y$ and $H_c$ are positive where intensity rises downward.
  - $|G|$ is the same with either version, and also with true (flipped) convolution, because rotating a Sobel mask by 180 deg only negates it.
  - (textbook context) $M_x$ and $H_r$ respond to horizontal change, so they find **vertical edges**. $M_y$ and $H_c$ find **horizontal edges**.
- Slide 43 gives no magnitude formula; use slide 37's. **No slide says anything about scaling or normalizing the result for display.** (textbook context) The usual practice is to clip to 0-255 or to scale by $255/\max|G|$ (Exam focus E2).
- Properties (slide 38): **Roberts**: "Smaller effective area than the other masks", "More susceptible to noise". **Sobel**: "More sensitive to diagonal edges than vertical and horizontal edges." **Prewitt**: "More sensitive to vertical and horizontal edges than diagonal edges".
- Roberts as printed takes diagonal differences: $H_r$ = centre minus top-right, $H_c$ = centre minus top-left.
- Sobel definition (slide 43): "a **discrete differentiation operator**. It computes the **gradient approximation of image intensity function** for image edge detection."
- Sobel (slide 44). Advantages: "Simple and time efficient computation"; "Very easy at searching for smooth edges". Limitations: "Diagonal direction points are not preserved always"; "Highly sensitive to noise"; "Not very accurate in edge detection"; "Detect with thick and rough edges does not give appropriate results".
- Demos: Fig. 3.17 (slide 39) shows the image convolved with $H_r$, with $H_c$, and the composite. Fig. 3.18 (slide 40) compares Roberts and Prewitt.

## 9. Compass Gradient Operators (slides 41-42)

- Slide 41: "Find edges in **eight different orientations**. Convolve an image with **eight different masks**." Families: **Prewitt, Kirsch, Robinson 3-level, Robinson 5-level**.
- "The effects of convolution": "Smaller masks are sensitive to noise"; "Larger masks cannot resolve fine detail, and also requires more computations."
- First mask of each family (slide 42). The other seven are 45 deg rotations of the outer ring:

| Prewitt | Kirsch | Robinson 3-level | Robinson 5-level |
|---|---|---|---|
| `[1 1 -1; 1 -2 -1; 1 1 -1]` | `[5 -3 -3; 5 0 -3; 5 -3 -3]` | `[1 0 -1; 1 0 -1; 1 0 -1]` | `[1 0 -1; 2 0 -2; 1 0 -1]` |

- Robinson 3-level = the Prewitt row mask and Robinson 5-level = the Sobel row mask (slide 37). Kirsch puts 5 on three neighbours and -3 on the other five (sum 0). The slide-42 scan is partly garbled (only 7 rows visible, one Kirsch row cut off), so learn the first masks and the rotation rule.
- (textbook context) Edge magnitude = the largest of the 8 responses. Edge direction = the orientation of that mask. Example: Exam focus E6.

## 10. Second Order Operators: Laplacian and Zero Crossing (slides 45-47)

- Laplacian masks (slide 45): `[0 -1 0; -1 4 -1; 0 -1 0]` or `[-1 -1 -1; -1 8 -1; -1 -1 -1]` (both sum to 0).
- "Better edge localization." "The resulting image exhibits a **sign change at image edges** => **Zero crossing**."
- Disadvantages of the Laplacian (slide 45): "Typically unacceptably **sensitive to noise**"; "Produce **double edges**"; "Unable to detect **edge direction**".
- Zero crossing (slide 46) "offers an alternative in case when edges are blurry or a high noise content is present". "At ZC, generate the output pixels for the edge map." The code from the slide, run on the Laplacian image stored row by row:

```c
for(i=0; i<(cols*(rows-1)); i++)
  if((image[i] < 0) && ((image[i+1] >= 0) || (image[i+cols] >= 0)))
     out_buffer[i] = 255;   /* Must check both Horizontal and vertical */
  else if((image[i] > 0) && ((image[i+1] <= 0) || (image[i+cols] <= 0)))
     out_buffer[i] = 255;
  else
     out_buffer[i] = 0;
```

- In words: write 255 when the pixel's sign differs from its right or lower neighbour. Slide 47: "Simple zero-crossing may indicate **more edges than desired**." A threshold fixes this: "Pass a 3x3 window; determine the difference between the maximum and minimum; An edge is present if the difference exceeds the threshold." Fig. 3.20 uses thresholds 20, 48, 72; a higher T gives fewer edges. Numbers: Exam focus E5.

## 11. Laplacian of Gaussian and Difference of Gaussians (slides 48-50)

- LoG (slide 48): "A second order derivative edge detector **less susceptible to noise**", done by "**Gaussian smoothing before applying Laplacian**". The demos use "7X7, $\sigma$=1.0".
- As printed: $LoG(x,y)=\frac{1}{\pi\sigma^4}\left[1-\frac{x^2+y^2}{2\sigma^2}\right]-e^{-\frac{x^2+y^2}{2\sigma^2}}$. Read it as a product with the minus sign in front. This form matches $\nabla^2$ of the 2-D Gaussian (verified numerically):
$$LoG(x,y)=-\frac{1}{\pi\sigma^4}\left[1-\frac{x^2+y^2}{2\sigma^2}\right]e^{-\frac{x^2+y^2}{2\sigma^2}}$$
  - It crosses zero at $x^2+y^2=2\sigma^2$. The slide's curves ($\sigma=0.75, 0.8, 0.85$) and the DoG masks are the sign-flipped "Mexican hat": positive centre, negative ring.
- DoG (slide 49): "Approximation of LoG (Cf. Heavy computation requirements of the LoG)".
$$DoG(x,y)=\frac{e^{-\frac{x^2+y^2}{2\sigma_1^2}}}{2\pi\sigma_1^2}-\frac{e^{-\frac{x^2+y^2}{2\sigma_2^2}}}{2\pi\sigma_2^2}$$
  - "The ratio $\sigma_1/\sigma_2=1.6$ results in a good approximation of LoG", with the example LoG ($\sigma$=12.35) vs DoG ($\sigma_1$=10, $\sigma_2$=16). In that example the ratio is really $\sigma_2/\sigma_1=1.6$: the larger sigma is 1.6 times the smaller.
  - "Can specify the width of edges to detect by varying $\sigma_1$ and $\sigma_2$." "The 9x9 mask will detect wider edges than 7x7 mask."
  - 7x7 DoG mask (slide 49; two smudged entries filled in by symmetry): `[0 0 -1 -1 -1 0 0; 0 -2 -3 -3 -3 -2 0; -1 -3 5 5 5 -3 -1; -1 -3 5 16 5 -3 -1; -1 -3 5 5 5 -3 -1; 0 -2 -3 -3 -3 -2 0; 0 0 -1 -1 -1 0 0]`. It sums to 0 (verified). The 9x9 mask has centre 19 inside a 3x3 core of 9s.
  - Fig. 3.23 (slide 50) shows the 7x7 DoG and its zero crossings, then the 9x9 DoG and its zero crossings.

## 12. Color Edge Detection (slides 51-52)

- "Depends on your definition of an edge" (slide 51):
  - Def. 1: a discontinuity in **luminance**. Edge detection runs on "the intensity channel of color image in HSU space" (slide wording; textbook context: the I of HSI).
  - Def. 2: a discontinuity in the **RGB channels**. Edge detection runs on each color component.
  - Def. 3: run on each component, then the components are **summed** into a gray scale map:
$$G(x,y)=\sqrt{G_{red}^2+G_{green}^2+G_{blue}^2}$$
- "The best color edge detection => Depends on the application." Slide 52 shows the edge maps of the blue, green and red channels. Color sharpening and blurring demo: slide 23.

## 13. Median and Color Median Filtering (slides 53-59)

- Slide 53: median filtering is "An effective method for **removing impulse noise**" that preserves "sharp edges (high frequency information) and detail". A **lowpass filter** is "Suited for removing **Gaussian noise**, but not impulse noise".
- "Median filter is superior to lowpass filter when dealing with edges." Fig. 3.25 (slide 54) compares the noisy, low-pass filtered and median filtered images.
- Method (slide 55): sort the window pixels and replace the centre with the middle value. Window shapes: horizontal (1x5), vertical (5x1), cross, block (5x5), X, diamond.
- Demos: 3x3, 5x5, 9x9 (slide 56) and 3x3, 5x5, 7x7 (slide 57). Bigger windows remove more noise but flatten detail.

**Worked example: slide 55** (window `[13 4 8; 2 9 6; 7 25 16]`):

| Step | Value |
|---|---|
| Ordered pixels | 2, 4, 6, 7, **8**, 9, 13, 16, 25 |
| Median (5th of 9) | **8**. The outlier 25 has no effect; the mean would be 10 |

- **Color median with separate R, G, B** (slide 58) applies the median to each channel on its own. "(Problem) Lose any correlation between color components." "Ex. Horizontal median filter of width 5 => Can not remove unwanted yellow pixel." B = 0 everywhere; the edge lies between p4 and p5 (verified with replicated borders):

| | p0 | p1 | p2 | p3 | p4 | p5 | p6 | p7 |
|---|---|---|---|---|---|---|---|---|
| R in | 0 | 0 | 255 | 0 | 0 | 255 | 255 | 255 |
| G in | 255 | 255 | 255 | 255 | 255 | 0 | 0 | 0 |
| color in | green | green | **yellow** | green | green | red | red | red |
| R out | 0 | 0 | 0 | 0 | 255 | 255 | 255 | 255 |
| G out | 255 | 255 | 255 | 255 | 255 | 0 | 0 | 0 |
| color out | green | green | green | green | **yellow** | red | red | red |

- The yellow pixel at p2 is gone, but a new yellow one appears at p4 next to the edge, because R and G are filtered independently.
- **Color median using the unique property** (slide 59). The median minimizes the sum of absolute differences: $\sum_{i=1}^{N}|x_{med}-x_i|\le\sum_{i=1}^{N}|y-x_i|$, where N = number of elements (9 for 3x3) and y = any value in the window. On slide 55's window, $\sum|8-x_i|=44$ is the smallest over all candidates (verified).
- Idea: break x and y into red, green and blue components:
$$Dist_i=\sum_{j=1}^{N}|red_i-red_j|+\sum_{j=1}^{N}|green_i-green_j|+\sum_{j=1}^{N}|blue_i-blue_j|$$
  - The slide writes $i=1$ under the sums; the running index is $j$. "The pixel $x_i$ with smallest $Dist_i$ is the filter output, where $x_i=\{red_i, green_i, blue_i\}$."
  - Algorithm: start with N elements in the window, compute every $Dist_i$, find the minimum, return that $x_i$.
  - Example: window p0..p4 above = G, G, Y, G, G. $Dist_Y=4\cdot255=1020$ and each $Dist_G=255$, so the output is green. The output is always a color already in the window, never a new mix.

## 14. Minimum and Maximum Filtering (slide 60)

- "Very similar to median filtering. Max/min window value is used. Cf. Central pixel in median window value." "Effective at removing extreme impulse noise."
  - **Min filter**: "removes white spikes; overall intensity will be reduced". **Max filter**: "removes dark spikes; overall intensity is increased". "Both the min and max filters fail in removing mixed impulse noises."
- "Cascade of max min filters: can remove 'salt and pepper noise'". The slide says "**Closing filter: min -> max**" and "**Opening filter: max -> min**".
  - These two are swapped compared with Lecture 10, where opening = erosion then dilation = min then max, and closing = max then min. (textbook context) On gray images, min = erosion and max = dilation.

## Exam focus

**Likely theory questions**
- Why the median beats the average on impulse noise and edges. Why the Laplacian gives double edges and no direction. First vs second derivative at an edge (spike vs zero crossing).
- The four border methods. What $\alpha$ does in high boost. Roberts vs Sobel vs Prewitt sensitivity. How many compass masks there are (8). The DoG sigma ratio (1.6). What min and max filters remove.

**E1. Every mask at one pixel** (slide-34 window `[11 13 15; 16 11 11; 16 12 11]`; the 8 neighbours sum to 105):

| Mask | Computation | Result |
|---|---|---|
| Average 1/9 | 116 / 9 | 12.89 (13) |
| Gaussian 1/16 | (1(11+15+16+11) + 2(13+16+11+12) + 4(11)) / 16 = 201/16 | 12.5625 |
| Sobel $H_r$ (slide 37) | (11-15) + 2(16-11) + (16-11) | 11 |
| Sobel $H_c$ | (16+24+11) - (11+26+15) | -1 |
| Sobel $M_x$, $M_y$ (slide 43) | $-H_r$, $H_c$ | -11, -1 |
| Magnitude, square root form | sqrt(121 + 1) | 11.05 |
| Magnitude, absolute sum form | 11 + 1 | 12 |
| Direction $\tan^{-1}(H_c/H_r)$ | atan(-1/11) | -5.19 deg |
| Prewitt $H_r$, $H_c$ | (11+16+16) - (15+11+11); (16+12+11) - (11+13+15) | 6, 0 |
| Roberts $H_r$, $H_c$ | 11 - 15; 11 - 11 | -4, 0 |
| Laplacian, centre 4 | 4(11) - (13+16+11+12) | -8 |
| Laplacian, centre 8 | 8(11) - 105 | -17 |
| Sharpen, centre 5 | 5(11) - 52 | 3 |
| Sharpen, centre 9 | 9(11) - 105 | -6 |
| High boost, $\alpha$ = 1.2 | 1.2(11) - 116/9 | 0.31 |
| Median, min, max | sorted 11, 11, 11, 11, 12, 13, 15, 16, 16 | 12, 11, 16 |

- Negative outputs must be clipped (or offset) before they can be shown as 0-255 pixels.

**E2. Sobel on a 5x5 image** (slide 43 masks, slide-14 rule, output only where the window fits, i.e. "start at (1,1)"):

| Image | c0 | c1 | c2 | c3 | c4 |
|---|---|---|---|---|---|
| r0 | 10 | 10 | 10 | 50 | 50 |
| r1 | 10 | 10 | 10 | 50 | 50 |
| r2 | 10 | 10 | 10 | 50 | 50 |
| r3 | 10 | 10 | 50 | 50 | 50 |
| r4 | 10 | 10 | 50 | 50 | 50 |

- Pixel (2,2), window `[10 10 50; 10 10 50; 10 50 50]`: $G_x=(-10+50)+2(-10+50)+(-10+50)=160$, $G_y=(10+100+50)-(10+20+50)=80$, $|G|=\sqrt{160^2+80^2}=178.89$ (absolute sum form: 240), $\theta=\tan^{-1}(80/160)=26.57$ deg.
- Full interior results (pixels (1..3, 1..3)):

| row | $G_x$ | $G_y$ | $\sqrt{G_x^2+G_y^2}$ | absolute sum | scaled $255\,G/\max G$ |
|---|---|---|---|---|---|
| 1 | 0, 160, 160 | 0, 0, 0 | 0, 160, 160 | 0, 160, 160 | 0, 228, 228 |
| 2 | 40, 160, 120 | 40, 80, 40 | 56.57, 178.89, 126.49 | 80, 240, 160 | 81, 255, 180 |
| 3 | 120, 160, 40 | 40, 80, 40 | 126.49, 178.89, 56.57 | 160, 240, 80 | 180, 255, 81 |

- With slide 37's $H_r$ (or true convolution) $G_x$ flips sign but $|G|$ is unchanged (verified). The last column is a display choice (textbook context); the slides do not specify one.

**E3. 3x3 average, the four border rules** (image `[10 20 30 40; 20 30 40 50; 30 40 50 60; 40 50 60 70]`, pixel (0,0)):

| Rule (slide 15) | 3x3 window used | Output at (0,0) |
|---|---|---|
| Zero padding | `[0 0 0; 0 10 20; 0 20 30]` | 80/9 = 8.89 |
| Start at (1,1) | none | no output; the result is 2x2 `[30 40; 40 50]` |
| Duplication of edges | `[10 10 20; 10 10 20; 20 20 30]` | 150/9 = 16.67 |
| Wrap-around | `[70 40 50; 40 10 20; 50 20 30]` | 330/9 = 36.67 |

**E4. Point and line detection.** Window `[10 10 10; 10 100 10; 10 10 10]` with the point mask: $R=8(100)-8(10)=720$, so it is a point for any $T<720$. Window `[0 0 0; 10 10 10; 0 0 0]`: horizontal mask $R=2(30)=60$; the +45, vertical and -45 masks give 0. So it is a horizontal line.

**E5. Zero crossing.** Take an image whose rows are all `10 10 10 50 50 50`. The centre-4 Laplacian (replicated border) gives `0 0 -40 40 0 0` in every row. The slide-46 code marks columns 2 and 3 with 255, a 2-pixel-wide edge ("more edges than desired"). The 3x3 max minus min of the Laplacian is `0 40 80 80 40 0`; with T = 50 the edge is again columns 2-3.

**E6. Compass (Kirsch) on a vertical step** `[50 50 100; 50 50 100; 50 50 100]`:
- Mask with the 5s in the left column: $5(150)-3(400)=-450$.
- Mask with the 5s in the right column `[-3 -3 5; -3 0 5; -3 -3 5]`: $5(300)-3(250)=750$. This is the maximum of the 8, so the edge is vertical and brighter on the right.
- Sobel on the same window: $H_r=-200$, $M_x=+200$, $H_c=0$.

**E7. Median vs min vs max on salt and pepper** (window `[12 255 14; 13 15 0; 16 14 13]`):
- Sorted: 0, 12, 13, 13, 14, 14, 15, 16, 255. Median 14 (clean). Min 0 (the pepper survives). Max 255 (the salt survives). Mean 39.11 (the noise is smeared in). So min and max fail on mixed impulse noise, and the median handles it.

**E8. High-boost mask.** For $\alpha=1.2$: $\omega=9(1.2)-1=9.8$, so the centre is $9.8/9=1.089$, the neighbours are $-1/9$, and the sum is $0.2$. For $\alpha=1$: centre $8/9$, sum 0, which is the high pass mask.

**E9. Gaussian mask.** $\sigma\approx0.85$ gives $\frac{1}{16}$ `[1 2 1; 2 4 2; 1 2 1]`. Applied to E1's window it gives 12.5625. $\sigma=1$ (3x3, normalized) gives centre 0.2042, edge 0.1238, corner 0.0751.
