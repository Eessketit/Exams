# Lecture 7 (Week 4): Pixel Relationships, Connectivity, Distance Measures and CIE XYZ Color

What this lecture is about: how pixels are indexed and stored, the light/photometry vocabulary behind an image, neighbors, 4-/8-/m-adjacency, paths, region adjacency and boundaries, the three distance metrics (Euclidean, D4, D8) plus m-distance, image arithmetic/logic, and color: Munsell, HSL/HSV/Lab, CIE-RGB to CIE-XYZ, the xy chromaticity diagram, illuminants, gamut, dominant wavelength and purity. Contents slide (p.2): Picture element, Basic relationship among pixels, Neighbors of a pixel, Connectivity, Adjacent pixel, Arithmetic operation, Color representation, CIE XYZ to RGB. Reference (p.69): Gonzalez and Woods, *Digital Image Processing*, 4th ed.

## 1. Coordinate Convention and Matrix Flattening (slides 3-4)

- Origin $(0,0)$ at the **top-left**. **x runs down the rows** ($0..M-1$), **y runs right along the columns** ($0..N-1$). "One pixel" is one grid point $f(x,y)$ (p.3).
- **Matrix representation**: $f(x,y)=\begin{bmatrix}f(0,0)&\cdots&f(0,N-1)\\ \vdots&&\vdots\\ f(M-1,0)&\cdots&f(M-1,N-1)\end{bmatrix}$. **Element-wise representation**: $A=[a_{i,j}]$, $a_{0,0}\dots a_{M-1,N-1}$.
- Slide wording: "element-wise representation treats each pixel independently as an individual data point, whereas its matrix representation structures the entire grid of pixels as a unified mathematical object for spatial transformations."
- Flattening (p.4): "for performance reasons we usually do not store image in the matrix fashion ... in Embedded Systems." Two schemes:

| Order | Sequence in memory | Linear index of $f[i][j]$ (textbook context) |
|---|---|---|
| Row-major | f[0][0], f[0][1], ..., f[0][N-1], f[1][0], ... , f[M-1][N-1] | $iN+j$ |
| Column-major | f[0][0], f[1][0], ..., f[M-1][0], f[0][1], ... , f[M-1][N-1] | $jM+i$ |

- Check ($M=3,N=4$, $f[1][2]$): row-major 6, column-major 7 (0-based, verified). Matlab is column-major: see Lecture 8.

## 2. Light Basics: Radiometry, Photometry and Vision (slides 5-17)

- **Radiometry** (p.5-6): light = travelling energy, unit **joule (J)**; source described by position, propagation direction and wavelength $\lambda$ (in **nm**). Particle theory (photon = quantum of energy) and wave theory agree.
- Invariants: frequency $f=\dfrac{c_n}{\lambda}$ (does not change, unlike $c_n$ and $\lambda$; $c_n$ = speed in a medium of refractive index $n$) and photon energy $q=\dfrac{hc}{\lambda}$.
- *Spectral energy* = density of quantum energy in an interval $\Delta\lambda$ around $\lambda$. Radiometry measures radiation of **all** optical wavelengths; basic unit of power = **watt (W)**.
- Example (verified, $h=6.626\times10^{-34}$, $c=3\times10^8$): $\lambda=555$ nm gives $f=5.41\times10^{14}$ Hz, $q=3.58\times10^{-19}$ J.
- **Photometry** (p.7): measurement of light in terms of the **visual response** it produces; a **branch of radiometry**. Radiometry = entire optical spectrum (often spectrally resolved); photometry = **visible spectrum weighted by the eye's response**.
- Visual sensitivity (p.8): sensitivity to a wavelength at given viewing conditions; differs between individuals; read off the sensitivity/luminosity curve.
- **Photopic** (day) vision: peak at **555 nm (yellow-green)**, half sensitivity at **510 nm and 610 nm**. **Scotopic** (night) vision: peak at **507 nm (blue-green)**, needs lower intensities (p.9).
- Color is a photometric quantity with a perceptual aspect and a signalling function (ripe banana, red dawn sky) (p.10).
- Object color = nature of reflected light; balanced reflection over all visible wavelengths looks **white**; reflection favoring a limited range gives **chromatic light** (p.11).
- **Achromatic light** (p.12): "void of color", the slide calls it "monochromatic (achromatic) light"; only attribute is **intensity**; achromatic images = **gray scale images**. Trap: on p.67 "monochromatic" means a single wavelength (laser).

| Term (p.13-15) | Slide definition | Unit |
|---|---|---|
| Radiance | total energy that flows from the light source | watts (W) |
| Luminance | amount of energy an observer **perceives** from the source | lumens (lm) |
| Brightness | **subjective** descriptor of light perception, practically impossible to measure | none |

- Principal energy source for images = **electromagnetic (EM) spectrum**; synthetic images are computer generated (p.16). Two major tasks: improve pictorial information for **human interpretation**; process image data for storage, transmission and **autonomous machine perception** (p.17).

## 3. Image Formation Model and Resolution (slides 18-20)

- Image = 2D light-intensity function $f(x,y)$; amplitude = intensity (brightness) at $(x,y)$; light is energy so $0<f(x,y)<\infty$ (p.18).
- Two components (p.19): **illumination** $i(x,y)$ = source light incident on the scene; **reflectance** $r(x,y)$ = light reflected by the objects. (Textbook context: $f=i\,r$ with $0<i<\infty$, $0<r<1$; see Lecture 6.)
- Resolution = how much detail you can see; depends on **sampling (M x N)** and **gray levels** (p.20). Storage: $B=M\times N\times K$; levels $L=2^k$ (integer power of 2 for storage/quantizer hardware).
- Note: the slide calls K "the gray scale level", but in $B=M\times N\times K$ it must be the **bits per pixel** $k$ (with $L=2^k$ levels) (textbook context).
- Example (verified): $1024\times1024$, $k=8$: $B=8{,}388{,}608$ bits $=1{,}048{,}576$ bytes, $L=256$.

## 4. Neighbors of a Pixel (slide 21)

| Set | Coordinates for $p=(x,y)$ | Count |
|---|---|---|
| $N_4(p)$ | $(x+1,y),(x-1,y),(x,y+1),(x,y-1)$ | 4 |
| $N_D(p)$ | $(x+1,y+1),(x+1,y-1),(x-1,y+1),(x-1,y-1)$ | 4 |
| $N_8(p)$ | $N_4(p)\cup N_D(p)$ | 8 |

- Picture on the slide: $N_4$ = the cross (up, down, left, right), $N_D$ = the four corners. (Textbook context: for a border pixel some neighbors fall outside the image.)

## 5. Connectivity and Adjacency: 4, 8 and m (slides 22-24, 26)

- $V$ = set of gray-level values used to define connectivity (binary image: $V=\{1\}$) (p.22).
- **4-connectivity**: $p,q$ with values from $V$ and $q\in N_4(p)$.
- **8-connectivity**: $p,q$ with values from $V$ and $q\in N_8(p)$ (slide shows $N_4(p)$, a copy-paste typo).
- **m-connectivity (mixed)** (p.23): $p,q$ with values from $V$ are m-connected if
  1. $q\in N_4(p)$, **or**
  2. $q\in N_D(p)$ **and** $N_4(p)\cap N_4(q)$ has no pixels whose values are from $V$.
- Purpose (p.24): "m-connectivity **eliminates the multiple path connections** that arises in 8-connectivity."
- Professor's wording (p.26): "A pixel p is adjacent to a pixel q if they are connected."
- Worked example (p.22, 24, 26), $V=\{1\}$, (row, col) coordinates:

| | col 0 | col 1 | col 2 |
|---|---|---|---|
| row 0 | 0 | **1** | **1** |
| row 1 | 0 | **1** | 0 |
| row 2 | 0 | 0 | **1** |

| Pair | 8-adjacent | m-adjacent | Why (verified) |
|---|---|---|---|
| (0,1)-(0,2) | yes | yes | 4-neighbors |
| (0,1)-(1,1) | yes | yes | 4-neighbors |
| (0,2)-(1,1) | yes | **no** | diagonal, but common 4-neighbor (0,1)=1 is in V |
| (1,1)-(2,2) | yes | yes | diagonal, common 4-neighbors (1,2),(2,1) are both 0 |

- 8-adjacency: triangle (0,1),(0,2),(1,1) gives two routes from (0,2) to (1,1) (ambiguous). m-adjacency drops the diagonal link, leaving one path (p.26 "8-adjacent" vs "M-adjacent" figure).

## 6. Paths, Region Adjacency and Boundaries (slides 25, 27-29)

- **Digital path** from $p=(x,y)$ to $q=(s,t)$ (p.25): sequence of **distinct** pixels $(x_0,y_0),(x_1,y_1),\dots,(x_n,y_n)$ with $(x_0,y_0)=(x,y)$, $(x_n,y_n)=(s,t)$, and $(x_i,y_i)$ adjacent to $(x_{i-1},y_{i-1})$. **n is the length of the path** (number of steps, not pixels).
- (Textbook context: 4-, 8- or m-path according to the adjacency used; closed path if $(x_0,y_0)=(x_n,y_n)$.)
- **Region adjacency** (p.27): "Two image area subsets R1 and R2 are adjacent if some pixels in R1 is adjacent to some pixels R2." Slide figure ($R_i$ = rows 0-2, $R_j$ = rows 3-5):

| row | values | region |
|---|---|---|
| 0 | 1 1 1 | $R_i$ |
| 1 | 1 0 1 | $R_i$ |
| 2 | 0 **1** 0 | $R_i$ |
| 3 | 0 0 **1** | $R_j$ |
| 4 | 1 1 1 | $R_j$ |
| 5 | 1 1 1 | $R_j$ |

- Only link: diagonal pair (2,1)-(3,2) (circled). So $R_i$, $R_j$ are adjacent under **8-adjacency** (also m), **not** under 4-adjacency (verified).
- **Boundary** (p.28): "The circle point is part of the boundary of the 1 valued pixels only if 8-adjacency between the region and background is used." Grid rows: 00000 / 01100 / 01100 / 01(1)10 / 01110 / 00000; circled pixel (3,2): all four 4-neighbors are 1, but its diagonal (2,3) is 0. So it is a boundary pixel with 8-adjacency, not with 4-adjacency (verified).
- p.29: a vertical 1-pixel-wide line of four 1s in background 0: "The **inner boundary** of the 1-valued region does not form a closed path, but its **outer boundary** does."

## 7. Distance Measures (slides 30-34)

- For $p=(x,y)$, $q=(s,t)$, $z=(u,v)$, $D$ is a **distance function or metric** if (p.30):
  (a) $D(p,q)\ge0$, $D(p,q)=0$ iff $p=q$; (b) $D(p,q)=D(q,p)$; (c) $D(p,z)\le D(p,q)+D(q,z)$.

| Metric | Formula (slide form) | Pixels with $D\le r$ form | $D=1$ set |
|---|---|---|---|
| Euclidean (p.31) | $D_e(p,q)=\sqrt{(s-x)^2+(t-y)^2}$ ("standard equation"; also $d=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$) | disk (textbook context) | $N_4$ |
| City-block $D_4$ (p.32) | $D_4(p,q)=\lvert x-s\rvert+\lvert y-t\rvert$ | **diamond** centered at $(x,y)$ | **4-neighbors** |
| Chessboard $D_8$ (p.33) | $D_8(p,q)=\max(\lvert x-s\rvert,\lvert y-t\rvert)$ | **square** centered at $(x,y)$ | **8-neighbors** |

- Slide contour figures for $r\le2$ (verified; 13 pixels in the diamond, 25 in the square):

| $D_4$ |  |  |  |  | | $D_8$ |  |  |  |  |
|---|---|---|---|---|---|---|---|---|---|---|
| . | . | 2 | . | . | | 2 | 2 | 2 | 2 | 2 |
| . | 2 | 1 | 2 | . | | 2 | 1 | 1 | 1 | 2 |
| 2 | 1 | 0 | 1 | 2 | | 2 | 1 | 0 | 1 | 2 |
| . | 2 | 1 | 2 | . | | 2 | 1 | 1 | 1 | 2 |
| . | . | 2 | . | . | | 2 | 2 | 2 | 2 | 2 |

- (Textbook context: $D_4$ and $D_8$ depend only on coordinates, not on pixel values; the shortest 4-/8-path equals them when every pixel is in V.)
- p.32 also shows a 5x5 exercise grid with p = top-left (value 2) and q = bottom-right (value 6), no question text; solved in Exam focus Q3-Q4.
- **m-connectivity distance** (p.34): "depends on values of the pixels along the path." Example: only value 1 connects; find the m-distance from p to p4. Layout and the three slide cases (verified by BFS):

| Layout | Case A | Case B | Case C |
|---|---|---|---|
| row 0: . p3 p4 | . 0 1 | . 1 1 | . 1 1 |
| row 1: p1 p2 . | 0 1 . | 0 1 . | 1 1 . |
| row 2: p . . | 1 . . | 1 . . | 1 . . |
| (p1, p3) | (0, 0) | (0, 1) | (1, 1) |
| shortest m-path | p, p2, p4 | p, p2, p3, p4 | p, p1, p2, p3, p4 |
| $D_m$ | **2** | **3** | **4** |

- Why: when p3=1, p2 to p4 diagonal is blocked (common 4-neighbor p3 in V), so the path must go via p3. When p1=1, p to p2 is blocked too. The 8-distance stays 2 in all three cases.

## 8. Arithmetic and Logical Operations (slides 35-36)

- "Image arithmetic involves images are **same size**" (p.35), applied pixel by pixel:
  $s(x,y)=f+g$, $d(x,y)=f-g$, $p(x,y)=f\times g$, $v(x,y)=f\div g$ (all at $(x,y)$).
- Logical ops (p.36), **black = binary 0, white = binary 1**, foreground = white: NOT(A), (A) AND (B), (A) OR (B), (A) AND [NOT (B)], (A) XOR (B).
- (Textbook context) 8-bit results must be clipped to $[0,255]$: $f=\begin{bmatrix}100&200\\50&250\end{bmatrix}$, $g=\begin{bmatrix}60&100\\50&10\end{bmatrix}$ gives $f+g=\begin{bmatrix}160&300\\100&260\end{bmatrix}$, clipped $\begin{bmatrix}160&255\\100&255\end{bmatrix}$ (raw uint8 wrap-around would give 44 and 4). More in Lecture 9.

## 9. Color Image, Munsell and Color Dimensions (slides 37-41, 66-68)

- Color image = **separate channel per color (RGB)**; some models **separate color information from brightness intensity (HSI)** (p.37).
- **Munsell (1915)** (p.38): "equal perceptual steps in Hue Saturation Value". Hue: R, YR, Y, GY, G, BG, B, PB, P, RP (each subdivided into 10). **Chroma 0..20** (neutral..saturated). **Value 0..10** (dark..pure white). Example **5YR 8/4** (hue 5YR, value 8, chroma 4; textbook context for the reading order).
- Three qualities of color perception (p.39): **Hue** (what color?), **Value** (lightness/darkness), **Intensity/Saturation** (level).
- Color solid (p.40): a 2D color wheel shows **hue and brightness**; the 3D color solid **adds saturation**.
- Representations (p.41): CIE XYZ, CIE chromaticity space, HSL (hue, saturation, lightness), HSV (hue, saturation, value), LUV, CIE Lab ($L^*$ perceptual lightness; $a^*,b^*$ for the four unique colors red, green, blue, yellow).
- **Chromaticity** (p.41, 65): "an objective specification of the quality of a color **regardless of its luminance**", two independent parameters, **hue (h)** and **colorfulness (s)** (also called saturation, chroma, intensity, or excitation purity).
- Color description (p.66): Hue (red, green, yellow, blue), Saturation (pink to bright red), Lightness/Value (black, grey, white). Double cone: white at top, black at bottom, brightness on the axis, hue = angle, saturation = radius.
- **Color stimuli** (p.67-68): stimulus = **illumination x reflectance** spectrum. **Monochromatic** = one wavelength (laser); **achromatic** = equal light at all wavelengths (daytime sunlight is close); **polychromatic** = different amounts at different wavelengths (most real stimuli).

## 10. CIE XYZ Color Coordinate System (slides 42-53)

- 1931: the CIE (Commission Internationale de l'Eclairage) defined the **CIE-XYZ color coordinate system**; XYZ **tristimulus values** can describe **any visible color**; based on **color matching experiments** (p.42).
- **Trichromatic theory** (p.43): every color can be represented by 3 values; the space of visible colors is **3-dimensional**.
- **CIE-RGB** (p.44, 52): Wright (1928-1930) and Guild (1931), **17 observers**, monochromatic lights **400-700 nm**, **2 deg field**. Primaries are monochromatic: **435.8 nm (B), 546.1 nm (G), 700 nm (R)**. The $\bar r(\lambda)$ CMF goes **negative** (about 440-540 nm). "XYZ are a linear transformation away from the observed data."
- **CIE criteria for choosing X, Y, Z and the CMFs $\bar x,\bar y,\bar z$** (p.45):
  1. CMFs **non-negative** over visible wavelengths (any color = 3 positive values).
  2. **Equal amounts of the primaries produce white** ($X=Y=Z$ for an equal-luminance stimulus).
  3. $\bar y$ is defined to **match the luminous-efficiency function** of the eye.
  4. Primaries as **tight** as possible around the set of colors (Maxwell triangle projects to equilateral in XYZ space).
- Luminous efficiency (p.46): peak near 555 nm. **Protanopia**: peak shifts to about **540 nm**, essentially no sensitivity above **670 nm**. **Deuteranopia**: slight shift to about **560 nm**.
- Meaning of the axes (p.47): **Y = luminance** (perceived brightness), **X = "red mix"** (chosen mathematically to keep values positive), **Z = "blue response"** (short wavelengths).
- Construction in rg space (p.48): $C_r, C_g, C_b$ must enclose the gamut; line $C_b C_r$ = **alychne** (line of zero luminance, from Y = luminance); line $C_r C_g$ tangent at 650+ nm (z is zero beyond 650); **equal energy $x=y=z=1/3$** constrains $C_b C_g$; tight around the gamut so $C_b C_g$ lies close to green.
- **CIE-RGB to XYZ** (p.49): "Map Cb Cg Cr to x=(0,0) y=(0,1) z=(1,0)"
$$\begin{bmatrix}X\\Y\\Z\end{bmatrix}=\frac{1}{b_{21}}\begin{bmatrix}b_{11}&b_{12}&b_{13}\\b_{21}&b_{22}&b_{23}\\b_{31}&b_{32}&b_{33}\end{bmatrix}\begin{bmatrix}R\\G\\B\end{bmatrix}=\frac{1}{0.17697}\begin{bmatrix}0.49&0.31&0.20\\0.17697&0.81240&0.01063\\0.00&0.01&0.99\end{bmatrix}\begin{bmatrix}R\\G\\B\end{bmatrix}$$
- Every row sums to **1.00000** (verified), so $R=G=B$ gives $X=Y=Z$: this is criterion 2. Dividing by $b_{21}=0.17697$ makes the R primary contribute $Y=1$.
- p.52 shows the same matrix rounded **without** the $1/0.17697$ factor: rows 0.49 0.31 0.20 / 0.17 0.81 0.01 / 0.00 0.01 0.99 (the rounded Y row sums to 0.99).
- CMF vs cone (LMS) responses (p.51): cone responses form a 3D linear system and are equal for **metamers**, so XYZ and LMS are related by a 3x3 matrix:
$$\begin{bmatrix}X\\Y\\Z\end{bmatrix}=\begin{bmatrix}1.9023&-1.4000&0.3544\\0.6371&0.3933&-0.0093\\0.0007&0.0033&1.7462\end{bmatrix}\begin{bmatrix}L\\M\\S\end{bmatrix}$$
- $\bar x\bar y\bar z$ CMFs (p.53, read off the plot): $\bar z$ peaks about 1.78 near 445 nm; $\bar y$ peaks at 1.0 near 555 nm; $\bar x$ peaks about 1.06 near 600 nm with a small lobe (about 0.35) near 445 nm. All non-negative.
- Colorimeter (p.50): light-sensing device measuring **absorbance and transmittance** of light through a liquid sample; its illuminant is a fixed light source. Uses: blood, water, soil nutrients, foodstuffs, solution concentration, reaction levels, bacterial growth.

## 11. CIE Chromaticity Diagram, Illuminants and Gamut (slides 54-60)

- **Chromaticity coordinates** (p.54), "a common representation of color signal":
$$x=\frac{X}{X+Y+Z},\qquad y=\frac{Y}{X+Y+Z},\qquad z=\frac{Z}{X+Y+Z},\qquad x+y+z=1$$
- Only $(x,y)$ are plotted; $z=1-x-y$. p.55 shows the diagram as the plane through the X, Y, Z axis points (intensity removed). (Textbook context: back to XYZ with $X=\frac{x}{y}Y$, $Z=\frac{1-x-y}{y}Y$.)
- Horseshoe = spectral locus labelled 380/450 ... 520 ... 650/700 nm; straight bottom edge = line of purples (textbook context). Color naming regions (p.56): green, yellow-green, yellow, orange, red, pink, magenta, purple, blue, cyan around a central **white** region.
- CIE-RGB primaries on the xy diagram (p.57) at 700, 546.1, 435.8 nm with **E** at the center. From the p.49 matrix (verified): R at $(0.7347,0.2653)$, G at $(0.2738,0.7174)$, B at $(0.1666,0.0089)$; $R=G=B$ gives $(1/3,1/3)$ = E.
- **CIE standard illuminants** (p.58): **A** tungsten light, **B** sunset, **C** blue sky, **D65** average daylight, **E** equal-energy white ($x=y=z=1/3$). They lie near the **blackbody locus** (2000 K to 20000 K curve on the slide).
- **Television primaries** (p.59): $R_1G_1B_1$ = **PAL**, reference white **D65**; $R_2G_2B_2$ = **NTSC**, reference white **C**. NTSC = National Television System Committee, **525 lines**; PAL = Phase Alternating Line, **625 lines**. **Gamut** = "a certain complete subset of colors", usually the colors that can be accurately represented in a given color space or by a given output device (the triangle of the primaries).
- p.60: on the diagram hue changes around the locus, saturation decreases towards white.

## 12. Chromaticity in Polar Coordinates: Dominant Wavelength and Purity (slides 61-65)

All three are defined "given a reference white":

| Quantity | Slide definition | Slide example |
|---|---|---|
| **Dominant wavelength** (p.61) | wavelength of the spectral color which, **added to the reference white**, produces the given color | points towards 550, 490 and 630 nm |
| **Complementary wavelength** (p.62) | wavelength of the spectral color which, **added to the given color**, produces the reference white | 570 nm and 485 nm on opposite sides of white |
| **Purity** (p.63) | ratio of lengths (given color to white) / (dominant wavelength point to white); **ranges 0..1** | light green purity 0.2, pink purity 0.4 |

- Example (p.64), reference white = illuminant **C**: dominant wavelength of $S_1$ is $D_1$, of $S_2$ is $D_2$. Complementary wavelength of $S_1$ is $D_1'$ on the opposite side of C (slide text prints "D1"). **$S_2$ has no complementary wavelength** (the line from $S_2$ through C hits the line of purples). Excitation purity: $CS_1/CD_1$, $CS_2/CD_2$, $CS_3/CD_3$ ($D_3$ lies on the line of purples).
- Purity formula: $\text{purity}=\dfrac{\lvert W S\rvert}{\lvert W D\rvert}$ with W = white, S = color, D = spectral-locus point on the ray from W through S.
- p.65: dominant/complementary wavelength = **hue** (angle around white), purity = **saturation** (distance from white).

## 13. Practice Notebook: sRGB to XYZ and Chromaticity (Lecture7.ipynb)

Method of `srgb_to_xyz(r, g, b)`:
1. Normalize 8-bit values: $c'=c/255$.
2. **Inverse gamma** (linearize sRGB): $c_{lin}=c'/12.92$ if $c'\le0.04045$, else $c_{lin}=\left(\frac{c'+0.055}{1.055}\right)^{2.4}$.
3. sRGB to XYZ, **D65** matrix:
$$\begin{bmatrix}X\\Y\\Z\end{bmatrix}=\begin{bmatrix}0.4124564&0.3575761&0.1804375\\0.2126729&0.7151522&0.0721750\\0.0193339&0.1191920&0.9503041\end{bmatrix}\begin{bmatrix}R_{lin}\\G_{lin}\\B_{lin}\end{bmatrix}$$
4. $x=X/(X+Y+Z)$, $y=Y/(X+Y+Z)$. If $X+Y+Z=0$ (black) it returns the **D65 white point $(0.3127, 0.3290)$**. All values rounded to 4 decimals.

Notebook outputs (reproduced and verified; Blue and Yellow added by me):

| Color | RGB | X | Y | Z | x | y |
|---|---|---|---|---|---|---|
| Pure Red | (255,0,0) | 0.4125 | 0.2127 | 0.0193 | 0.64 | 0.33 |
| Pure Green | (0,255,0) | 0.3576 | 0.7152 | 0.1192 | 0.30 | 0.60 |
| Pure White | (255,255,255) | 0.9505 | 1.0 | 1.0888 | 0.3127 | 0.329 |
| Mid Gray | (128,128,128) | 0.2052 | 0.2159 | 0.2350 | 0.3127 | 0.329 |
| Pure Blue | (0,0,255) | 0.1804 | 0.0722 | 0.9503 | 0.15 | 0.06 |
| Yellow | (255,255,0) | 0.7700 | 0.9278 | 0.1385 | 0.4193 | 0.5052 |

- Takeaways: the sRGB primaries sit at R (0.64, 0.33), G (0.30, 0.60), B (0.15, 0.06); white = D65. **Mid gray has the same (x, y) as white** and only a smaller Y: chromaticity ignores luminance. Matrix row sums $(0.9505, 1.0, 1.0888)$ are the white XYZ. The **Y row (0.2126729, 0.7151522, 0.0721750) gives luminance**, so green dominates brightness.

## 14. Exam focus

1. **Neighbors.** $p=(5,5)$: $N_4=\{(6,5),(4,5),(5,6),(5,4)\}$, $N_D=\{(6,6),(6,4),(4,6),(4,4)\}$, $N_8$ = all 8.
2. **Is a pair m-adjacent?** Slide 24 matrix: (0,2)-(1,1) is 8-adjacent but **not** m-adjacent (common 4-neighbor (0,1)=1 in V). (1,1)-(2,2) **is** m-adjacent (common 4-neighbors are 0). Why m: it removes the multiple-path ambiguity of 8-adjacency.
3. **D4, D8, De.** $p=(3,1)$, $q=(7,4)$: $D_4=4+3=7$, $D_8=\max(4,3)=4$, $D_e=\sqrt{16+9}=5.0$. Slide 32 grid, $p=(0,0)$, $q=(4,4)$: $D_4=8$, $D_8=4$, $D_e=\sqrt{32}=5.657$. Always $D_8\le D_e\le D_4$.
4. **Shortest 4-, 8-, m-path** on the slide 32 grid. The slide gives no V, so I chose $V=\{2,3,6\}$ (verified by BFS; coordinates are (row, col)):

| | c0 | c1 | c2 | c3 | c4 |
|---|---|---|---|---|---|
| r0 | 2 (p) | 3 | 2 | 6 | 1 |
| r1 | 6 | 2 | 3 | 6 | 2 |
| r2 | 5 | 3 | 2 | 3 | 5 |
| r3 | 2 | 4 | 3 | 5 | 2 |
| r4 | 4 | 5 | 2 | 3 | 6 (q) |

| Path | One shortest path | Length |
|---|---|---|
| 4-path | (0,0)(1,0)(1,1)(2,1)(2,2)(3,2)(4,2)(4,3)(4,4) | **8** |
| 8-path | (0,0)(1,0)(2,1)(3,2)(4,3)(4,4) | **5** (pure diagonal blocked: (3,3)=5 not in V) |
| m-path | (0,0)(1,0)(1,1)(2,1)(2,2)(2,3)(3,4)(4,4) | **7** |

   - m-check: (0,0) to (1,1) is not allowed (common 4-neighbors (1,0)=6 and (0,1)=3 are in V). (2,3) to (3,4) is allowed (common 4-neighbors (2,4)=5 and (3,3)=5 are not in V). With $V=\{2,6\}$ no path exists. With all values in V: 4-path 8 = $D_4$, 8-path 4 = $D_8$.
5. **m-distance (slide 34)**: $D_m=2$ when p1=p3=0, 3 when p3=1, 4 when p1=p3=1. The 8-distance is 2 in every case.
6. **How many pixels within distance r?** For $r=2$: $D_4$ diamond has 13 pixels and $D_8$ square has 25 (both counting the center). $D_4=1$ gives the 4 4-neighbors, $D_8=1$ the 8 8-neighbors.
7. **Chromaticity from XYZ.** $(X,Y,Z)=(20,30,50)$, sum 100: $x=0.2$, $y=0.3$, $z=0.5$. Reverse (textbook context): $x=0.25$, $y=0.40$, $Y=50$ gives $X=31.25$, $Z=43.75$.
8. **sRGB to XYZ (notebook method)** for (200, 100, 50):

| Step | R | G | B |
|---|---|---|---|
| $c/255$ | 0.78431 | 0.39216 | 0.19608 |
| linearized (all above 0.04045, power branch) | 0.57758 | 0.12744 | 0.03190 |

   Result: $X=0.2896$, $Y=0.2163$, $Z=0.0567$, so $x=0.5148$, $y=0.3845$ (orange region on the p.56 naming diagram). Low-value case: (10, 10, 10) gives $c'=0.03922\le0.04045$, so the linear branch applies: $0.03922/12.92=0.00304$.
9. **CIE-RGB to XYZ (p.49 matrix).** $R=G=B=1$ gives $X=Y=Z=1/0.17697=5.6507$, so $(x,y)=(1/3,1/3)$ = illuminant E (rows sum to 1). $R=1$ only: $XYZ=(2.7688,1,0)$, so $(x,y)=(0.7347,0.2653)$ = the 700 nm primary.
10. **Purity.** $W=(0.31,0.32)$, $S=(0.45,0.32)$, $D=(0.69,0.32)$: purity $=0.14/0.38=0.368$ (verified). Purity = 0 at white, 1 on the spectral locus.
11. **Storage.** $B=M\times N\times k$: $512\times512\times8=2{,}097{,}152$ bits $=262{,}144$ bytes ($L=256$). $256\times256\times4=262{,}144$ bits ($L=16$).
12. **Definitions to memorize.**
    - Radiometry (all wavelengths, W) vs photometry (visible, eye-weighted, branch of radiometry).
    - Radiance (W) vs luminance (lm) vs brightness (subjective).
    - Photopic peak 555 nm (halves at 510/610) vs scotopic peak 507 nm.
    - CIE-RGB primaries 435.8/546.1/700 nm, 17 observers, 2 deg.
    - The 4 CIE criteria.
    - Illuminants A/B/C/D65/E. PAL uses D65 and 625 lines; NTSC uses C and 525 lines.
    - Munsell: Value 0..10, Chroma 0..20.
    - Path length n counts steps.
    - Arithmetic requires same-size images; in logic ops white = 1.
