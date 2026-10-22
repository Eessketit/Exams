# Lecture 6 (Week 3): Digital Image Basics, Human Visual Perception, Image Acquisition and Resampling

What this lecture is about: the human visual system (eye, brightness adaptation, Weber ratio, perception illusions), how images are formed and acquired (lens, EM spectrum, sensors, $f=i\cdot r$), sampling and quantization, storage $b=M\times N\times k$, resolution, coordinate sets and adjacency, resampling and interpolation. The last third (slides 37-64) previews intensity transformations and histograms (covered in full in Lecture 9). Reference (slide 65): Gonzalez and Woods, *Digital Image Processing*, 4th ed. Figure numbers below are Gonzalez's.

## 1. Human Eye Structure (slides 3-4)

- "Human visual perception plays a key role in selecting a technique" (slide 4).
- **Lens and cornea** focus on the objects.
- **Two receptors in the retina: cones and rods.**
  - **Cones** are located in the **fovea** and are highly sensitive to **color**.
  - **Rods** give a general overall picture of the view. They are **insensitive to color** and sensitive to **low levels of illumination**.

## 2. Brightness Adaptation and Weber Ratio (slides 5-7)

- **Scotopic** vision: low illumination, **rods** dominant. Objects are visible but appear in black and white.
- **Photopic** vision: good illumination, **cones** dominant. Gives color.
- Fig. 2.4 (slide 5) plots subjective brightness against **log of intensity (mL, millilambert)**. The range runs from the scotopic threshold up to the glare limit.
- "The total range of distinct intensity levels the eye can discriminate **simultaneously** is rather small." The eye works around a **brightness adaptation level** ($B_a$ on the figure).
  - (textbook context) Below $B_b$, everything is perceived as black.
- **Weber ratio (fraction)**, slide 6:
$$\text{Weber ratio}=\frac{\Delta I_c}{I}$$
  - Experiment: a background of intensity $I$ plus a short-duration flash $I+\Delta I$. $\Delta I$ starts at zero and is increased slowly until the observer sees the circle. That point is the **just noticeable difference**, $\Delta I_c$.
  - **Small ratio = good** brightness discrimination. **Large ratio = poor** discrimination.
- Fig. 2.6 (slide 7) plots $\log \Delta I_c/I$ against $\log I$:
  - At low intensity (the **rod** branch) the Weber ratio is large, so discrimination is poor.
  - At high intensity (the **cone** branch) the ratio falls to about $-1.6$ on the log scale, so discrimination is good.

## 3. Perceived vs Actual Intensity (slides 8-9)

- "Perceived intensity is not a simple function of the actual intensity."
- **Mach band effect** (Fig. 2.7): the actual intensity is a staircase. The perceived intensity **undershoots and overshoots** at each boundary.
- **Simultaneous contrast** (Fig. 2.8): all the inner squares have the same intensity. They appear progressively **darker as the background becomes lighter**.

## 4. Object Perception (slides 10-11)

- Perception of a scene involves multiple levels of analysis: **Features, then Groups of features, then Objects, then Scenes**.
- **Bottom-up processing** is data-driven: the sensation reaches the brain, and then the brain makes sense of it.
- **Top-down processing**: cognitive functions inform our sensation. Slide example: walking to the refrigerator in the middle of the night.

## 5. Image Formation in the Eye and Lens Parameters (slides 12-16)

- Image acquisition captures **geometry** (size, location) and **appearance** (color, intensity), slide 12.
- The **image is upside down** on the retina or imaging plane (Fig. 2.3, slide 13). Point C is the optical center of the lens.
  - Figure numbers: a 15 m tree, 100 m away, with 17 mm from C to the retina.
  - By similar triangles, $\frac{15}{100}=\frac{h}{17}$, so the retinal image is $h=2.55$ mm (textbook context; the numbers are the slide's).
  - Focus is adjusted by changing the focus length, in both cameras and the human eye.
- **Thin lens theory** (slide 14), with object distance $S_1$, image distance $S_2$ and focal length $f$:
$$\frac{1}{S_1}+\frac{1}{S_2}=\frac{1}{f}$$
- **Field of view**, exactly as written on the slide:
$$\omega = 2\arctan\frac{d}{f}$$
  - In the diagram, $d$ is the half-height measured from the optical axis.
  - (textbook context) Many texts write $2\arctan\frac{d}{2f}$ with $d$ the full sensor size. It is the same formula with $d$ meaning the full size instead of the half.
- Slide 14 rules:
  - Increasing the distance from the object to the lens **reduces the size of the image**.
  - A **large focus length gives a small FOV**.
- **Depth of field (DOF)**, slide 15:
  - DOF is **inversely proportional to the focus length** and **proportional to $S_1$**.
  - "The longer the focal length, the **narrower the angle of view** and the **higher the magnification**."
- Slide 16: the same scene shot with 28, 50, 70 and 210 mm lenses on a 35 mm camera at a constant distance from the subject. The 210 mm lens gives the narrowest view.

## 6. Light and EM Spectrum (slides 17-19)

- The sun, like any hot object, releases energy in discrete "rays" with particle and wave properties. This is called **electromagnetic radiation**.
- Spectrum on slide 17, by wavelength in m: radio $10^{3}$, microwave $10^{-2}$, infrared $10^{-5}$, **visible $10^{-6}$**, ultraviolet $10^{-8}$, X-ray $10^{-10}$, gamma $10^{-12}$. Frequencies run from $10^4$ to $10^{20}$ Hz.
- Wavelength $\lambda$, frequency $\nu$ and energy $E$ (slide 18):
$$\lambda=\frac{c}{\nu},\quad c=2.998\times10^{8}\ \text{m/s};\qquad E=h\nu,\quad h=6.626068\times10^{-34}\ \text{m}^2\,\text{kg/s}$$
- **Diffraction limit** (slide 19): the smallest object you can "see" is set by the **Airy disk**. Its size is proportional to wavelength times f-number (focal length divided by lens dimension):
$$\text{Airy disk size} \sim \lambda\frac{f}{d}$$
  - The Airy pattern is "the best-focused spot of light that a perfect lens with a circular aperture can make, limited by the diffraction of light."

## 7. Image Sensing and the 2D Image Model (slides 20-23)

- Sensing (slide 20) turns illumination energy into a digital image:
  - Incoming energy is transformed into a **voltage**, and the response is then digitized.
  - Sensor types (Fig. 2.12): **single** imaging sensor, **line** sensor, **array** sensor.
- **An image is a 2D function $f(x,y)$** (slide 21):
  - $x,y$ are spatial coordinates, and $f(x,y)$ is the intensity or gray level.
- **Digital image**: $x$, $y$ and $f(x,y)$ are **all finite**. Example: $x\in\lbrace1,\dots,M\rbrace$, $y\in\lbrace1,\dots,N\rbrace$, $f\in\lbrace0,\dots,255\rbrace$.
  - Each element $(x,y)$ is a **pixel** (picture element).
- **Spatial domain model** (slide 22): $g(x,y)=T[f(x,y)]$.
  - $T$ is an operator on $f$ defined over a neighborhood of $(x,y)$, for example 3x3.
  - $g$ is the processed image and $f$ the input image.
- **Simple image formation model** (slide 23):
$$f(x,y)=i(x,y)\cdot r(x,y),\qquad 0<f<\infty$$
  - $0<i(x,y)<\infty$: **illumination** component (the source).
  - $0<r(x,y)<1$: **reflectance/transmission** component (the object).
  - In practice $L_{min}<f<L_{max}$, with $L_{min}=i_{min}r_{min}$ and $L_{max}=i_{max}r_{max}$.
- Slide values:
  - $i$: sunlight 10,000 lm/m$^2$ on a cloudy day, 90,000 lm/m$^2$ on a clear day; office 1000 lm/m$^2$.
  - $r$: black velvet 0.01, white pall 0.8, snow 0.93.

## 8. Sampling, Quantization and Dynamic Range (slides 24-26)

- **Sampling = digitizing the coordinate values** (usually determined by the sensors).
- **Quantization = digitizing the amplitude values.** The 1D version is in Lecture 2.
- Fig. 2.16: a continuous scan line A-B is sampled and quantized into the digital scan line. Fig. 2.17: the image is projected onto a **CCD array**.
- Gray-level range (slide 26):
$$0\le f(x,y)\le L-1,\qquad L=2^k$$
- **Dynamic range (contrast ratio)**: "the ratio of the maximum detectable intensity level (**saturation**) to the minimum detectable intensity level (**noise**)":
$$\text{DR}=\frac{I_{max}}{I_{min}}$$

## 9. Representing and Storing a Digital Image (slides 27-28)

- Slide 27 uses $f(x,y)$ with $x=0,\dots,M-1$ and $y=0,\dots,N-1$, so coordinates are **0-based**.
  - **$x$ extends downward (rows)** and **$y$ extends to the right (columns)**.
  - Slide 21 is different: it draws $x$ to the right and $y$ down, with 1-based indices.
- Three representations (Fig. 2.18):
  - (a) a surface plot;
  - (b) a visual intensity array, "suitable for visualization";
  - (c) a 2D numerical array, used for "processing and algorithm development". In (c), 0, .5 and 1 stand for black, gray and white.
- **Number of bits to store an image** (slide 27):
$$b=M\times N\times k$$
- Table 2.1 (slide 28) uses square images ($M=N$), so $b=N^2k$. Excerpt:

| N | k=1 (L=2) | k=5 (L=32) | k=7 (L=128) | k=8 (L=256) |
|---|---|---|---|---|
| 32 | 1,024 | 5,120 | 7,168 | 8,192 |
| 512 | 262,144 | 1,310,720 | 1,835,008 | 2,097,152 |
| 1024 | 1,048,576 | 5,242,880 | 7,340,032 | 8,388,608 |
| 2048 | 4,194,304 | 20,971,520 | **29,360,128** (slide shows 29,369,128) | 33,554,432 |
| 8192 | 67,108,864 | 335,544,320 | 469,762,048 | **536,870,912** (circled) |

- The circled value is $8192^2\times8 = 536{,}870{,}912$ bits $=67{,}108{,}864$ bytes $=64$ MiB. All 72 entries were checked in Python; only the 2048/k=7 cell is wrong.

## 10. Spatial and Intensity Resolution, Isopreference Curves (slides 29-31)

- **Spatial resolution = smallest discernible detail.** It is measured as the number of **line pairs per unit distance** or **dots (pixels) per unit distance**.
  - Printing and publishing use dots per inch (**dpi**) in the US. The quality scale runs newspaper, then magazines, then book.
  - "**Large image size itself does not mean high spatial resolution!**" What matters is the scene or object size in the image. Example: a 1280x960 photo where the lighthouse covers only a few pixels.
  - Fig. 2.20: the same image at 1250, 300, 150 and 72 dpi.
- **Intensity resolution = smallest discernible change in intensity level.** It is given as the number of intensity levels.
  - **False contouring (banding)** appears when $k$ is small. The slide calls it "undersampling"; strictly it is coarse quantization (textbook context).
  - The skull image is shown at 256, 128, 64, 32, 16, 8, 4 and 2 levels.
- **Isopreference curves** (Fig. 2.22-2.23): vary the spatial ($N$) and intensity ($k$) sampling simultaneously. Each curve joins $(N,k)$ pairs of equal subjective quality.
  - The three test images are Face (low detail), Cameraman (medium) and Crowd (high detail).
  - The Crowd curve is nearly vertical: a detailed image needs few intensity levels (textbook context).

## 11. Set Operations, Neighbors and Adjacency (slides 32-35)

- Set notation (slide 32):
  - set $A=\lbrace w \mid w=1,\dots,255\rbrace$; empty set $\emptyset$;
  - element $a\in A$ and $a\notin A$; **subset** $A\subseteq B$ (the slide prints ⊑);
  - **union** $A\cup B$; **intersection** $A\cap B$; **disjoint** (mutually exclusive) when $A\cap B=\emptyset$;
  - **set universe**: the set of all elements in an application;
  - **set difference** $A-B=\lbrace w \mid w\in A,\ w\notin B\rbrace$.
- **Set operations based on coordinates** (slide 33): a region in an image is represented by the set of coordinates within it. Fig. 2.31 shows $A\cup B$, $A\cap B$, the complement $A^c$ and $A-B$. Lecture 10 uses these for morphology.
- **Neighbors of $p=(x,y)$** (slide 34; $x$ is the row). Full treatment in Lecture 7.
  - $N_4(p)$: $(x-1,y)$, $(x+1,y)$, $(x,y-1)$, $(x,y+1)$.
  - $N_D(p)$: $(x-1,y-1)$, $(x-1,y+1)$, $(x+1,y-1)$, $(x+1,y+1)$. The slide prints the bottom-left as $(x-1,y+1)$, but it should be **$(x+1,y-1)$**. The same typo appears in $N_8$.
  - $N_8(p)=N_4(p)\cup N_D(p)$.
- **Adjacency** (slide 35): a relationship between pixels $p$ and $q$, given a set $V$ of intensity values.
  - Binary image: $V=\lbrace1\rbrace$ or $\lbrace0\rbrace$. Gray image: $V\subseteq\lbrace0,\dots,255\rbrace$.
  - Intensity constraint: both $f(p)\in V$ and $f(q)\in V$.
  - **4-adjacency**: $q\in N_4(p)$. **8-adjacency**: $q\in N_8(p)$.
  - **m-adjacency**: $q\in N_4(p)$, OR ($q\in N_D(p)$ and $N_4(q)\cap N_4(p)=\emptyset$).
  - (textbook context) In the m-adjacency rule, "$=\emptyset$" means the intersection holds no pixel whose value is in $V$.
- The slide 35 example: image rows `011 / 010 / 001`, $V=\lbrace1\rbrace$, $p$ = centre (1,1). Verified in Python:

| q | value | 4-adjacent | 8-adjacent | m-adjacent | why |
|---|---|---|---|---|---|
| (0,1) | 1 | yes | yes | yes | $q\in N_4(p)$ |
| (0,2) | 1 | no | yes | **no** (the X on the slide) | $N_4(p)\cap N_4(q)=\lbrace(0,1),(1,2)\rbrace$ contains (0,1), whose value 1 is in V |
| (2,2) | 1 | no | yes | yes | the shared 4-neighbors (1,2) and (2,1) are both 0 |

- m-adjacency removes the **double (ambiguous) path** that 8-adjacency creates.

## 12. Image Resampling and Interpolation (slide 36)

- **We need to resample the image when:**
  - rescaling;
  - applying a geometrical transformation;
  - the output image coordinates are not discrete.
- **Interpolation methods** (the professor's wording):

| Method | Slide properties |
|---|---|
| **Nearest neighbor** | Fast and simple; loss of sharpness; artifacts (checkerboard) |
| **Bilinear** | (no bullets on the slide) |
| **Bicubic** | Images are sharpest; fine details are preserved; slow |

- The slide gives **no formula**. The method below is textbook context, needed for the homework.
- **Bilinear (textbook context).** Take the 4 nearest pixels and fractional offsets $a$ (horizontal) and $b$ (vertical):
$$f(x+a,y+b)=(1-a)(1-b)f_{00}+a(1-b)f_{10}+(1-a)b\,f_{01}+ab\,f_{11}$$
  - Equivalently, do two linear interpolations along $x$, then one along $y$. Uses 4 pixels; bicubic uses 16 (textbook context).
- Worked example: $f_{00}=10$, $f_{10}=20$, $f_{01}=30$, $f_{11}=60$, point $a=0.3$, $b=0.6$. Verified in Python:

| Step | Computation | Result |
|---|---|---|
| Top row ($y=0$) | $10+0.3(20-10)$ | 13 |
| Bottom row ($y=1$) | $30+0.3(60-30)$ | 39 |
| Vertical | $13+0.6(39-13)$ | **28.6** |
| Check by weights | $0.28\cdot10+0.12\cdot20+0.42\cdot30+0.18\cdot60$ | 28.6 |
| Nearest neighbor | closest corner is $(0,1)$ | 30 |

- **Homework link (cv2.INTER_LINEAR, OpenCV context):**
  - OpenCV maps a destination pixel to the source with $x_{src}=(x_{dst}+0.5)\cdot\text{scale}-0.5$.
  - So a **2x downscale gives the mean of each 2x2 block**: `[[10,20,30,40],[50,60,70,80],[90,100,110,120],[130,140,150,160]]` becomes `[[35,55],[115,135]]` (verified with cv2).
  - A 1x4 row `10 20 30 40` upscaled to 8 becomes `10 13 18 23 28 33 38 40`.

## 13. Contrast Stretching and Thresholding (slides 37-43)

These are point operations, previewed here; see Lecture 9.

- **Contrast stretching formula**, slide 37:
$$\text{output}(x)=\begin{cases}0 & x\le low\\ 255\,\dfrac{x-low}{high-low} & low<x\le high\\ 255 & high\le x\end{cases}$$
- General form, slide 38, with $B$ bits per pixel:
$$y(\mathbf n)=\frac{2^B-1}{x_{max}-x_{min}}\big(x(\mathbf n)-x_{min}\big),\qquad x_{max}=\max_{\mathbf n}x(\mathbf n),\ x_{min}=\min_{\mathbf n}x(\mathbf n)$$
- Slide 39: basic contrast stretching vs **end-in search**.
  - (textbook context) End-in search picks low and high so that a small percentage of pixels is clipped at each end.
- Slide 40: after stretching, the histogram is spread but has **gaps (comb)**. No new levels are created.
- Slide 41: a color image has a separate histogram for each of R, G and B.
- **Threshold** (slides 42-43): a step at $m$. Output 0 below $m$, 255 above.
  - Shown with thresholds 128 and 100. A lower threshold makes more pixels white.

## 14. Intensity Transformations and Gamma (slides 44-57)

- **Intensity transformation**: "a point process that converts an old pixel into a new pixel based on some predefined function". It is **implemented with a look-up table (LUT)** (slides 45, 49).
- **Null transform**: new pixel = old pixel.
- **Image negative**: $y=-x+255$ (slide 45), also written $v=L-u$ (slide 44, where $L$ is the max level).
  - Applications: display of medical images; producing negative prints.
- **Intensity level slicing** (slide 44): highlight a range $[a,b]$ (set it to $L$, with the rest set to 0 or kept as is, or the inverse).
  - Application: segmentation of certain gray-level regions.
- **Posterizing** reduces the number of gray levels (8-level staircase).
  - **Thresholding** is posterizing to 2 levels.
  - **Bounded threshold** ("bounced" on slide 46) thresholds only a limited range and treats the other pixels with the null transformation.
- **Gamma correction** (slide 47) adjusts brightness. It "prevent[s] bleaching or darkening of images when viewed from different types of monitors". Reason: our eyes perceive in a gamma-shaped curve, while cameras capture linearly.
  - Slide 47 code (cv2 and numpy): `np.array(255*(img/255)**gamma, dtype='uint8')` for gamma in `[0.1, 0.5, 1.2, 2.2]`. It normalizes by 255, applies the power, rescales by 255 and truncates to uint8.
  - **Two conventions appear on the slides:**
    - Slides 47-48 use $s=255(r/255)^{\gamma}$: **$\gamma<1$ brightens**, $\gamma>1$ darkens (curve figure; gamma=0.45 gives a brighter image, 2.20 a darker one).
    - Slide 49 writes $\text{output}=\text{input}^{1/\gamma}$, and slide 53 matches it: the gamma=0.45 curve darkens and 2.2 brightens.
    - In an exam, state which form you use.
- Catalogue of curves (slides 50-57):
  - contrast stretch (steep line) and contrast compression (shallow line);
  - posterize, threshold, bounded threshold;
  - **iso-intensity contouring** (sawtooth ramps);
  - **2-bit bit-clipping** (Fig. 2.19, a repeating ramp);
  - **range-highlighting**;
  - **solarize with threshold 150**: the graph is the identity below 150 and inverted ($255-x$) above;
  - first and second **parabola** transformations ($\cap$-shaped and $\cup$-shaped).

## 15. Histogram and Histogram Equalization (slides 58-64)

- **Histogram**: "a simple bar graph that stands for pixel intensities". Intensities go on the x-axis and the number of occurrences on the y-axis. It gives information about the **contrast and overall intensity distribution**.
- Slide 58 example, 4x4 image with rows `4433 / 4433 / 4123 / 0123` (16 pixels):

| Intensity | 0 | 1 | 2 | 3 | 4 | 5-7 |
|---|---|---|---|---|---|---|
| Frequency | 1 | 2 | 2 | 6 | 5 | 0 |

- Slide 59: a washed-out image has a narrow histogram on the bright side, a high-contrast image a spread histogram, a dark image a narrow histogram on the left.
- Slide 60: **+40 shifts the histogram right** (spike at 255 from clipping); **-40 shifts it left** (spike at 0).
- Slide 61: **x1.2 stretches** it (gaps, spike at 255); **/1.2 compresses** it (taller peaks).
- Slides 62-63: dark vs bright images; an RGB image has 3 histograms, a gray image 1.
- **Histogram equalization** (slide 64):
  - Goal: a **uniform histogram** for the output image, by mapping gray level $r$ to $s$ so that $s$ is uniformly distributed.
  - "Spreading": peaks and valleys are shifted, because of approximation in digitized space.
  - Steps: **1. compute the histogram; 2. calculate the normalized sum of the histogram; 3. transform the input image to the output image.**
  - Formula and worked example: see Lecture 9.

## Exam focus

All numbers below were verified in Python (`/home/claude/work/agents/L6/verify.py`, `adj.py`).

1. **Storage $b=M\times N\times k$.**
   - $1024\times1024$, $k=8$: 8,388,608 bits = 1,048,576 bytes = 1 MiB.
   - $512\times512$, $k=5$: 1,310,720 bits = 163,840 bytes.
   - RGB $640\times480$ at 24 bits: 7,372,800 bits = 921,600 bytes.
   - A 1920x1080 RGB frame takes 6,220,800 bytes; halving each side (960x540) gives 1,555,200 bytes, 1/4 of the size.
2. **Levels and bits**: $L=2^k$, range $0$ to $L-1$. $k=8$ gives 256 levels (0-255). 100 levels need $k=\lceil\log_2 100\rceil=7$.
3. **Spot the table error**: $2048^2\times7=29{,}360{,}128$ (slide shows 29,369,128).
4. **Retinal image size** (Fig. 2.3): $h=17\cdot15/100=2.55$ mm.
5. **Thin lens and FOV**:
   - $f=50$ mm, $S_1=2000$ mm: $S_2=1/(1/50-1/2000)=51.28$ mm.
   - FOV $=2\arctan(d/f)$ with $d=18$ mm (half of a 36 mm frame, textbook context): 28 mm gives 65.5°, 50 mm gives 39.6°, 70 mm gives 28.8°, 210 mm gives 9.8°. Longer $f$ means a smaller FOV.
6. **EM relations**: $\nu=5\times10^{14}$ Hz gives $\lambda=c/\nu=599.6$ nm (visible) and $E=h\nu=3.313\times10^{-19}$ J.
7. **$f=i\cdot r$**:
   - Office ($i=1000$) with black velvet (0.01): $f=10$; with snow (0.93): $f=930$.
   - Clear day (90,000) with snow: $f=83{,}700$.
   - Since $0<r<1$, always $f<i$.
8. **Weber ratio**: $I=100$, $\Delta I_c=2$ gives 0.02 (good discrimination). $\Delta I_c=20$ gives 0.2 (poor). Rods (dim light) have a large ratio; cones have a small one.
9. **Definitions to state word for word**: sampling (coordinates) vs quantization (amplitude); spatial vs intensity resolution; dynamic range $I_{max}/I_{min}$ (saturation over noise); scotopic (rods) vs photopic (cones); bottom-up vs top-down; Mach band vs simultaneous contrast.
10. **Interpolation comparison**: NN is fast with checkerboard artifacts and loss of sharpness; bicubic is sharpest and slow. Bilinear example (textbook context): corners 10, 20, 30, 60 at $(a,b)=(0.3,0.6)$ give 28.6, while NN gives 30.
11. **Neighbors and m-adjacency**:
    - For $p=(2,3)$: $N_4=\lbrace(1,3),(3,3),(2,2),(2,4)\rbrace$ and $N_D=\lbrace(1,2),(1,4),(3,2),(3,4)\rbrace$.
    - Slide 35 example: the diagonal to (0,2) is 8-adjacent but **not** m-adjacent.
12. **Point operations** (preview of Lecture 9):
    - Stretch with low=50, high=150: $x=80$ gives 76.5, $x=100$ gives 127.5, $x\le50$ gives 0, $x\ge150$ gives 255.
    - Negative: $255-100=155$.
    - Gamma with the slide 47 code, $r=64$: $\gamma=0.5$ gives 127.75, stored as uint8 127; $\gamma=2.2$ gives 12.18, stored as 12.
    - Histogram of the slide 58 image: counts 1, 2, 2, 6, 5 for levels 0-4.
