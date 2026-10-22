# Lecture 10 (Week 5): Morphological Image Processing

What this lecture is about: binary (and briefly gray scale) morphology from Gonzalez and Woods Ch. 9. It covers structuring elements, fit and hit, dilation, erosion, opening, closing and hit-or-miss, then the algorithms built from them: boundary extraction, region filling, connected components, thinning, skeletons and pruning.

**Conventions used throughout**
- 1 = foreground (object), 0 = background. In the grid figures a shaded cell = 1 (slide 41 labels a white cell "0" and a gray cell "1"; slide 3: "white and grey pixels have zero and non-zero values").
- Pixels outside the image count as 0. That is why the image border shows up in the boundary on slide 38.
- Matrix coordinates below are (row, col), 0-based, top-left = (0,0). Every result was checked with numpy/scipy.ndimage (`agents/L10/verify.py`).
- Reference (slide 59): Gonzalez and Woods, *Digital Image Processing*, 4th ed. (the cover shown). Figure and table numbers (Fig 9.x, Table 9.2) are the book's.

## 1. Basic Concepts and Structuring Element (slides 2-6)

- Contents (slide 2): "Chapter 9 (Gonzalez books)", morphological operation, dilation, erosion, opening, closing.
- Definition (slide 3): "Morphological image processing is a collection of **non-linear** operations related to the shape or morphology of features in an image."
- **Structuring element (SE)** (slide 4): "a small binary image, i.e. a small matrix of pixels, each with a value of zero or one."
  - matrix dimensions = **size**; pattern of ones and zeros = **shape**.
  - **origin**: "usually one of its pixels, although generally the origin can be outside the structuring element."
- Slide 5: "common practice is to have **odd dimensions** ... and the origin defined as the **centre** of the matrix. Structuring elements play in morphological image processing the same role as **convolution kernels** in linear image filtering."
- SE examples (slide 4):

| Square 5x5 | Diamond 5x5 | Cross 5x5 | Square 3x3 |
|---|---|---|---|
| all 1s, origin centre | `00100 01110 11111 01110 00100` | `00100 00100 11111 00100 00100` | all 1s, origin at the **bottom-right** pixel |

- **Fit / hit** (slide 6, exact wording): the SE "is said to **fit** the image if, for each of its pixels set to 1, the corresponding image pixel is also 1. Similarly, a structuring element is said to **hit**, or intersect, an image if, at least for one of its pixels set to 1 the corresponding image pixel is also 1."
- "Zero-valued pixels of the structuring element are ignored, i.e. indicate points where the corresponding image value is irrelevant."
- Slide 3 example (2x2 SE of ones, 7x8 image). A at rows 3-4, cols 2-3: all 1, so it **fits**. B at rows 5-6, cols 5-6: only (6,5)=1, so it **hits**. C at rows 0-1, cols 5-6: all 0, so it **neither** fits nor hits.

**Worked example: slide 6** (image 10x12; $s_1$ = 3x3 ones, $s_2$ = 3x3 cross `010 111 010`; the boxes are 3x3 windows):

| row | image |
|---|---|
| 0 | `0 0 0 0 0 0 0 0 0 0 0 0` |
| 1 | `0 0 0 1 1 0 0 0 0 0 0 0` |
| 2 | `0 0 1 1 1 1 1 0 0 0 0 0` |
| 3 | `0 1 1 1 1 1 1 1 0 0 0 0` |
| 4 | `0 1 1 1 1 1 1 1 0 0 0 0` |
| 5 | `0 0 1 1 1 1 1 1 0 0 0 0` |
| 6 | `0 0 1 1 1 1 1 1 1 0 0 0` |
| 7 | `0 0 1 1 1 1 1 1 1 1 1 0` |
| 8 | `0 0 0 0 0 1 1 1 1 1 1 0` |
| 9 | `0 0 0 0 0 0 0 0 0 0 0 0` |

- Windows (3x3): **A** rows 5-7, cols 2-4 = `111 111 111`; **B** rows 1-3, cols 2-4 = `011 111 111`; **C** rows 1-3, cols 8-10 = `000 000 100`.

| | | A | B | C | why |
|---|---|---|---|---|---|
| fit | $s_1$ | yes | no | no | B has a 0 in its corner, C is almost all 0 |
| fit | $s_2$ | yes | yes | no | B's cross positions (corners ignored) are all 1 |
| hit | $s_1$ | yes | yes | yes | C has one 1 (bottom-left corner) |
| hit | $s_2$ | yes | yes | no | C's cross positions are all 0 |

- (textbook context) For a symmetric SE: **erosion** = 1 at every position where the SE *fits*; **dilation** = 1 wherever it *hits*.

## 2. Set Theory and Logic Operations (slides 7-11)

- Fig 9.1 (slide 7): union $A\cup B$, intersection $A\cap B$, complement $A^c$, difference $A-B$. Fig 9.2 (slide 8): translation $(A)_z$ and reflection $\hat B$.
- Table 9.2 definitions (slide 48):
  - Translation $(A)_z=\lbrace w \mid w=a+z,\ a\in A\rbrace$ ("translates the origin of A to point z")
  - Reflection $\hat B=\lbrace w \mid w=-b,\ b\in B\rbrace$ ("reflects all elements of B about the origin")
  - Complement $A^c=\lbrace w \mid w\notin A\rbrace$; Difference $A-B=\lbrace w \mid w\in A,\ w\notin B\rbrace = A\cap B^c$
- Logic ops on binary images (slide 9): $(A)$ OR $(B)$, $(A)$ XOR $(B)$, $[\text{NOT}(A)]$ AND $(B)$. The last keeps the part of B that is outside A.
- Slide 10: morphological operations "rely only on the **relative ordering** of pixel values, not on their numerical values, and therefore are especially suited to the processing of **binary images**". They also work on gray scale images whose light transfer function is unknown.
- Slide 11: "The most basic morphological operations are two: **Erosion and Dilation**." Uses: removing noise; isolating individual elements and joining disparate elements; finding intensity bumps or holes.

## 3. Dilation (slides 12-14, 20-22)

- Professor's intuitive wording (slide 12): "convoluting an image A with some kernel (B) ... usually a square or circle". B has an **anchor point**, usually its centre. "we compute the **maximal** pixel value overlapped by [B] and replace the image pixel in the anchor point position with that maximal value", so bright regions "grow", hence the name. (He says "convoluting", but the operation is a max, not a weighted sum.)
- Slide 13: "sets a pixel at (i, j) to the **maximum over all pixels in the neighborhood centered at (i, j)**. Dilation **enlarges bright regions and shrinks dark regions**."
- **Formal definition** (slide 20), with $A, B$ sets in $Z^2$:

$$A\oplus B=\lbrace z \mid (\hat B)_z\cap A\neq\varnothing\rbrace$$

  - $\hat B$ = reflection of B about its origin, then shifted by z. Dilation = "the set of all displacements, z, such that $\hat B$ and A **overlap by at least one element**." Equivalent form on the slide: $A\oplus B=\lbrace z \mid [(\hat B)_z\cap A]\subseteq A\rbrace$.
  - "Set B is referred to as the **structuring element** in dilation." Table 9.2 comment: dilation "**expands**" the boundary of A.
- Fig 9.4 (slide 21), sizes: square A of side $d$.
  - Square SE of side $d/4$: $A\oplus B$ is a square of side $d+d/4=5d/4$ ($d/8$ added on each side).
  - Elongated SE ($d/4$ wide, $d$ tall): result is $5d/4$ wide and $2d$ tall ($d/2$ added top and bottom).
- Fig 9.5 (slide 22): low-resolution text with broken characters, dilated by the 3x3 cross `010 111 010`. "Broken segments were joined."

## 4. Erosion (slides 15-19, 23-25)

- Slide 15: erodes away the boundaries of foreground (white) regions. "Areas of foreground pixels shrink in size, and holes within those areas become larger." Common names: **Erode, Shrink, Reduce**.
- Slide 16: two inputs, the image and "a set of coordinate points known as a structuring element (also known as a kernel)". The SE determines the precise effect.
- Slide 18: "the sister of dilation": a **local minimum** over the kernel area, written to the anchor pixel. Bright areas get thinner, dark zones get bigger.
- **Formal definition** (slide 23, as printed):

$$A\ominus B=\lbrace z \mid (\hat B)_z\subseteq A\rbrace$$

  - Slide wording: "the set of all points z, such that **B, translated by z, is contained in A**." The slide's own derivation and Table 9.2 (slide 48) write $A\ominus B=\lbrace z \mid (B)_z\subseteq A\rbrace$, with no hat. That is the standard form; the two are identical for symmetric SEs. Table comment: erosion "**contracts**" the boundary.
- **Duality** (slide 23): $(A\ominus B)^c=A^c\oplus\hat B$. Derivation:

$$(A\ominus B)^c=\lbrace z \mid (B)_z\subseteq A\rbrace^c=\lbrace z \mid (B)_z\cap A^c=\varnothing\rbrace^c=\lbrace z \mid (B)_z\cap A^c\neq\varnothing\rbrace=A^c\oplus\hat B$$

  (Slide shows the middle steps as "$(B)_z\subseteq A^c=\phi$"; the operator there should be $\cap$.)
- Fig 9.6 (slide 24): square of side $d$ eroded by a $d/4$ square gives a square of side $3d/4$ ($d/8$ removed on each side). Eroded by the elongated $d/4\times d$ SE, it gives a **horizontal line** of length $3d/4$ through the centre.
- **Fig 9.7 (slide 25)**: squares of side 1, 3, 5, 7, 9, 15 px.
  - Eroded by a **13x13** square of 1s, only the 15 px squares survive, each shrunk to $15-13+1=3$ px (3x3).
  - Dilating with the same SE restores them to 15x15.
  - So erosion followed by dilation removes everything smaller than the SE (verified: 9 px, then 225 px).

## 5. Opening and Closing (slides 26-35)

- **Opening** (slide 26): "obtained by the **erosion** of an image followed by a **dilation**." Somewhat like erosion: it removes foreground pixels from region edges. "**Opening can remove small bright spots and connect small dark cracks.**"
- **Closing** (slide 28): "a **dilation followed by an erosion**. **Closing can remove small dark spots and connect small bright cracks.**"
- Slide 29 (Gonzalez wording):
  - Opening: "smooth the contour of an object, **break narrow isthmuses**, and **eliminate thin protrusions**."
  - Closing: "smooth sections of contours but it generally **fuses narrow breaks and long thin gulfs**, **eliminates small holes**, and **fills gaps** in the contour."

$$A\circ B=(A\ominus B)\oplus B=\bigcup\lbrace (B)_z \mid (B)_z\subseteq A\rbrace \qquad A\bullet B=(A\oplus B)\ominus B$$

- Rolling-ball picture. Fig 9.8 (slide 30): B "rolling" along the **inner** boundary of A; the opening is the union of every translate of B that fits inside A, so sharp corners get rounded. Fig 9.9 (slide 31): B rolling on the **outer** boundary gives the closing, which fills narrow gulfs.
- Fig 9.10 (slides 32-33), disk SE. Opening: $A\ominus B$ breaks the narrow bridge into 2 pieces, and $\oplus B$ restores their size with rounded corners. Closing: $A\oplus B$ fuses the gaps, and $\ominus B$ restores the size while the narrow gulf stays filled.
- **Properties** (slide 34):
  - Opening: $A\circ B\subseteq A$; if $C\subseteq D$ then $C\circ B\subseteq D\circ B$; $(A\circ B)\circ B=A\circ B$ (idempotent).
  - Closing: $A\subseteq A\bullet B$; if $C\subseteq D$ then $C\bullet B\subseteq D\bullet B$; $(A\bullet B)\bullet B=A\bullet B$.
- **Fig 9.11 fingerprint (slide 35)**: noise filter with $B$ = 3x3 of 1s.
  - $A\ominus B$ removes the isolated background noise.
  - $(A\ominus B)\oplus B=A\circ B$ restores the ridges.
  - $(A\circ B)\oplus B$, then $[(A\circ B)\oplus B]\ominus B=(A\circ B)\bullet B$, closes the breaks in the ridges.
  - So the filter is **opening followed by closing**.
- Phantom demos: slide 27, opening removes the thin bright ring (only its thick top part survives). Slide 28, closing fills the small dark gap in the ring.

## 6. Hit or Miss Transform (slides 36-37)

$$A\circledast B=(A\ominus X)\cap\left[A^c\ominus(W-X)\right],\qquad B=(X,\ W-X)$$

- X = the shape to find; W = a small window enclosing X; $W-X$ = the **local background** of X. Fig 9.12: $A=X\cup Y\cup Z$, and the result is the single point at the location of the origin of X.
- Table 9.2 form (slide 49): $A\circledast B=(A\ominus B_1)\cap(A^c\ominus B_2)=(A\ominus B_1)-(A\oplus\hat B_2)$. It is "the set of points at which, simultaneously, $B_1$ found a match ('hit') in A and $B_2$ found a match in $A^c$."
- In template form: 1 = must be foreground, 0 = must be background, x = don't care (as in the thinning SEs, slide 46).

## 7. Boundary Extraction (slides 38-39)

$$\beta(A)=A-(A\ominus B),\quad B=\text{3x3 of 1s}$$

**Worked example, Fig 9.13 (slide 38)** (outside the image = 0):

| row | A | $A\ominus B$ | $\beta(A)$ |
|---|---|---|---|
| 0 | `1 1 1 0 1 1 1 1 1 0` | `0 0 0 0 0 0 0 0 0 0` | `1 1 1 0 1 1 1 1 1 0` |
| 1 | `1 1 1 0 1 1 1 1 1 0` | `0 1 0 0 0 1 1 1 0 0` | `1 0 1 0 1 0 0 0 1 0` |
| 2 | `1 1 1 1 1 1 1 1 1 1` | `0 1 0 0 0 1 1 1 0 0` | `1 0 1 1 1 0 0 0 1 1` |
| 3 | `1 1 1 1 1 1 1 1 1 1` | `0 1 1 1 1 1 1 1 1 0` | `1 0 0 0 0 0 0 0 0 1` |
| 4 | `1 1 1 1 1 1 1 1 1 1` | `0 0 0 0 0 0 0 0 0 0` | `1 1 1 1 1 1 1 1 1 1` |

- Each eroded pixel needs a full 3x3 of 1s around it. Example: (2,2) fails because (1,3)=0.
- With the 3x3 SE the boundary is 1 px thick. Fig 9.14 (slide 39) applies it to a silhouette image.

## 8. Region Filling (slides 40-42)

$$X_k=(X_{k-1}\oplus B)\cap A^c,\quad X_0=p,\ k=1,2,3,\dots$$

- $B$ = the **symmetric** 3x3 cross `010 111 010` (Fig 9.15). "p is the initial point we should assign", inside the boundary.
- Stop when $X_k=X_{k-1}$. Final answer = $X_k\cup A$ (slide 41 underlines $X_7\cup A$).
- The intersection with $A^c$ keeps the growth inside the boundary.

**Worked example, Fig 9.15 (slide 41)**: A = boundary (10x7), $p=(2,2)$:

| row | A | $X_1$ | $X_2$ | $X_6$ | $X_7$ | $X_7\cup A$ |
|---|---|---|---|---|---|---|
| 0 | `0000000` | `0000000` | `0000000` | `0000000` | `0000000` | `0000000` |
| 1 | `0011000` | `0000000` | `0000000` | `0000000` | `0000000` | `0011000` |
| 2 | `0100100` | `0011000` | `0011000` | `0011000` | `0011000` | `0111100` |
| 3 | `0100100` | `0010000` | `0011000` | `0011000` | `0011000` | `0111100` |
| 4 | `0010100` | `0000000` | `0000000` | `0001000` | `0001000` | `0011100` |
| 5 | `0010100` | `0000000` | `0000000` | `0001000` | `0001000` | `0011100` |
| 6 | `0100010` | `0000000` | `0000000` | `0011100` | `0011100` | `0111110` |
| 7 | `0100010` | `0000000` | `0000000` | `0001000` | `0011100` | `0111110` |
| 8 | `0111100` | `0000000` | `0000000` | `0000000` | `0000000` | `0111100` |
| 9 | `0000000` | `0000000` | `0000000` | `0000000` | `0000000` | `0000000` |

- Step 1: $X_0\oplus B$ = {(1,2),(2,1),(2,2),(2,3),(3,2)}. (1,2) and (2,1) are boundary pixels, so they are removed by $\cap A^c$, giving $X_1$.
- Pixel counts: $X_1..X_7$ = 3, 4, 5, 6, 7, 10, 12. $X_8=X_7$, so the process stops (verified).
- Fig 9.16 (slide 42): filling the holes inside white rings, first from one seed and then from all seeds.

## 9. Extraction of Connected Components (slides 43-44)

$$X_k=(X_{k-1}\oplus B)\cap A,\quad X_0=p,\quad B=\text{3x3 of 1s}$$

- It finds the connected component Y that contains p. The same as region filling, but with $\cap A$ instead of $\cap A^c$ and with the full 3x3 SE (8-connectivity).
- **Worked example, Fig 9.17 (slide 43)**: A (10x10) has 1s at row 1: cols 6-8; row 2: 6-8; row 3: 5, 6, 8; row 4: 5-8; row 5: 3-5; row 6: 2-4; row 7: 1, 4; row 8: 2-4. Seed $p=(6,3)$.
  - $X_1$ = {(5,3),(5,4),(6,2),(6,3),(6,4),(7,4)}, i.e. the 3x3 around p intersected with A.
  - $X_2$ adds (4,5),(5,5),(7,1),(8,3),(8,4) (11 px). (8,2) is not reached yet; it is the plain gray cell in the slide.
  - Counts: 6, 11, 15, 18, 24, then $X_6=X_5$. Y = all 24 pixels (A is a single component; (3,7) is a hole).
- Fig 9.18 (slide 44): X-ray of a chicken fillet, thresholded, eroded with a **5x5** SE of 1s, then the connected components are counted. Result: **15 components** with pixel counts 11, 9, 9, 39, 133, 1, 1, **743**, 7, 11, 11, 9, 9, **674**, 85. The large components are the bone fragments.

## 10. Thinning, Thickening, Skeletons, Pruning (slides 45-47, 50-51, 57-58)

- **Thinning** (slide 45): $A\otimes B=A-(A\circledast B)=A\cap(A\circledast B)^c$.
  - Symmetric version with a sequence $\lbrace B\rbrace=\lbrace B^1,\dots,B^n\rbrace$: $A\otimes\lbrace B\rbrace=((\dots((A\otimes B^1)\otimes B^2)\dots)\otimes B^n)$. Repeat the whole pass until there is no change.
- Fig 9.21 SEs (slide 46): $B^1$ = `000 / x1x / 111`. $B^1..B^8$ are successive 45 degree rotations; their background side is top, top-right, right, bottom-right, bottom, bottom-left, left, top-left. 1 = foreground, 0 = background, x = don't care.
- **Thinning worked example (slide 46)**:

| row | A | $A\otimes B^1$ | converged |
|---|---|---|---|
| 0 | `11111111111` | `10000000111` | `10000000111` |
| 1 | `11111111100` | `11111111100` | `11000001100` |
| 2 | `11111111100` | `11111111100` | `01111111000` |
| 3 | `11111111100` | `11111111100` | `11000001000` |
| 4 | `11100111100` | `11100111100` | `10000001100` |

  - With $B^1$, a top-row pixel is removed when the row above (outside, so 0) is background and the 3 pixels below are 1, which holds for cols 1-7.
  - $B^2$ changes nothing, and $B^3$ matches the slide.
  - The converged result matches slide panel (k) (verified). The slide's intermediate panels from $B^4$ onward do not follow exactly from the drawn SEs; my recomputation differs there but ends at the same result.
  - Panel (l) converts the result to m-connectivity.
- **Thickening** (slide 50): $A\odot B=A\cup(A\circledast B)$, also applied with a sequence. Table: "Uses IV with 0's and 1's reversed."
- **Skeletons** (slide 47, Fig 9.23): the skeleton is the set of centres of **maximum disks** that fit in A. Formulas (slide 51):

$$S(A)=\bigcup_{k=0}^{K}S_k(A),\quad S_k(A)=(A\ominus kB)-(A\ominus kB)\circ B,\quad A=\bigcup_{k=0}^{K}\big(S_k(A)\oplus kB\big)$$

  - $(A\ominus kB)$ = k successive erosions; K = the last step before A erodes to the empty set. (Slide 51 prints a stray $\bigcup_{k=0}^K$ in front of the $S_k(A)$ term.)
  - Slide 57: "reduces objects ... to their skeletal form ... while preserving their connectivity. It iteratively erodes the image until the objects are reduced to a minimal, skeletal form."
- **Pruning** (slides 51, 58): "removes small spurs or extraneous branches from the skeleton". Steps:
  - $X_1=A\otimes\lbrace B\rbrace$
  - $X_2=\bigcup_{k=1}^{8}(X_1\circledast B^k)$
  - $X_3=(X_2\oplus H)\cap A$
  - $X_4=X_1\cup X_3$, the pruned result.
- **Convex hull** (slide 49, table only): $X_k^i=(X_{k-1}^i\circledast B^i)\cup A$, $i=1..4$, $X_0^i=A$, $D^i=X^i_{\text{conv}}$ (iterate until $X_k^i=X_{k-1}^i$). (textbook context: $C(A)=\bigcup_{i=1}^4 D^i$.)

## 11. Gray Scale Morphology, Gradient, Top Hat (slides 52-56)

- On gray images, dilation = local **max** and erosion = local **min** over the SE (slides 12, 13, 18). (textbook context, flat SE b: $[f\oplus b](x,y)=\max_{(s,t)\in b}f(x-s,y-t)$, $[f\ominus b](x,y)=\min_{(s,t)\in b}f(x+s,y+t)$.)
- Figs 9.29 and 9.31-9.33 (slides 52-54):
  - dilation makes the image brighter and shrinks dark details; erosion makes it darker.
  - opening and closing.
  - **morphological smoothing**, (textbook context) opening followed by closing.
  - **morphological gradient**.
- **Morphological gradient** (slide 55): "the difference between the dilation and erosion": $g=(f\oplus b)-(f\ominus b)$. It highlights boundaries and edges.
- **Top hat** (slide 56): "extract small elements and details", enhancing bright objects on a dark background or vice versa.
  - **White top hat** = original minus opening: $f-(f\circ b)$
  - **Black top hat** = closing minus original: $(f\bullet b)-f$

## Exam focus

1. **Definitions in set notation.**
   - Dilation $A\oplus B=\lbrace z \mid (\hat B)_z\cap A\neq\varnothing\rbrace$.
   - Erosion $A\ominus B=\lbrace z \mid (B)_z\subseteq A\rbrace$ (slide 23 prints $(\hat B)_z$).
   - Duality $(A\ominus B)^c=A^c\oplus\hat B$.
   - Opening $=(A\ominus B)\oplus B$ (erode first), closing $=(A\oplus B)\ominus B$ (dilate first).
2. **Fit / hit.** Window `011 / 111 / 111` (slide 6, B):
   - 3x3 square SE: fit = no (one 0), hit = yes.
   - Cross: fit = yes, since the cross ignores the corners and the corner is the only 0.
3. **Erode / dilate a small matrix** (3x3 square or cross, outside = 0). Example E (rows 1-4 = `0111100`, `0111100`, `0111110`, `0111100`; rows 0 and 5 = 0):

| row | E | $E\ominus$ square | $E\circ$ square | $\beta(E)$ | $E\oplus$ cross |
|---|---|---|---|---|---|
| 0 | `0000000` | `0000000` | `0000000` | `0000000` | `0111100` |
| 1 | `0111100` | `0000000` | `0111100` | `0111100` | `1111110` |
| 2 | `0111100` | `0011000` | `0111100` | `0100100` | `1111110` |
| 3 | `0111110` | `0011000` | `0111100` | `0100110` | `1111111` |
| 4 | `0111100` | `0000000` | `0111100` | `0111100` | `1111110` |
| 5 | `0000000` | `0000000` | `0000000` | `0000000` | `0111100` |

   - The opening deletes the 1 px protrusion at (3,5) ("eliminates thin protrusions").
4. **Closing fills holes.** F = 3x5 block of 1s with a hole at the centre (2,3). $F\bullet$ 3x3 square = solid 3x5 block. Ring G (3x3 ring in a 5x5 image): $G\ominus$ square = all 0, $G\oplus$ square = all 1, $G\bullet$ square = solid 3x3.
5. **Region filling iteration** on ring G with $p=(2,2)$:
   - $X_0\oplus$ cross = {(1,2),(2,1),(2,2),(2,3),(3,2)}.
   - $\cap\,G^c$ leaves {(2,2)}, so $X_1=X_0$ and we stop.
   - Fill = $X_1\cup G$ = solid 3x3. Slide 41 gives 7 steps (see section 8).
6. **Sizes with d.** Square of side d with a d/4 square SE: dilation gives 5d/4, erosion gives 3d/4. Elongated d/4 x d SE: dilation gives 5d/4 x 2d, erosion gives a line of length 3d/4.
7. **Which squares survive** an erosion by a 13x13 SE (slide 25)? Only those of side at least 13: the 15 px squares become 3x3, and dilation restores 15x15.
8. **Hit-or-miss.** To find isolated pixels, use the template `000 / 010 / 000`. On an image with a single 1 at (1,1) and a 2x2 block elsewhere, the result is 1 only at (1,1).
9. **Boundary / thinning / connected components formulas**: $\beta(A)=A-(A\ominus B)$; $A\otimes B=A-(A\circledast B)$; $X_k=(X_{k-1}\oplus B)\cap A$ for components versus $\cap A^c$ for filling.
10. **Gray scale, 1D, window of 3, border replicated.** f = `10 50 20 80 30 30 90 40`:
    - dilation `50 50 80 80 80 90 90 90`
    - erosion `10 10 20 20 30 30 30 40`
    - gradient `40 40 60 60 50 60 60 50`
    - opening `10 20 20 30 30 30 40 40`, so the white top hat = `0 30 0 50 0 0 50 0`, which isolates the bright peaks 50, 80, 90.
11. **Effects wording.**
    - Opening "removes small bright spots, connects small dark cracks"; it breaks isthmuses and removes protrusions.
    - Closing "removes small dark spots, connects small bright cracks"; it fills small holes and gaps.
    - Dilation enlarges bright regions; erosion shrinks them (names: erode, shrink, reduce).
