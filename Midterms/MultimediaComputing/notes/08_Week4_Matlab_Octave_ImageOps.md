# Lecture 8 (Week 4): Matlab, Octave and Google Colab for Image Operations

What this lecture is about: a hands-on tour of Matlab syntax (variables, indexing, matrix maths, control flow, functions, plotting), then images as matrices (I/O, type conversion, resize/rotate/affine, filtering, erosion/dilation/opening), and running the same work in Octave Online and Google Colab. Contents slide (p.2): Matlab Introduction, Use of Octave, Google Colab/Jupyter notebook.

## 1. Matlab Basics and Main Screen (slides 3-4)

- **Matlab = MATrix LABoratory** (p.3). It is a **dynamically typed** language: variables need no declaration and are created by initialization (`x=10;`).
- **All variables are treated as matrices**: scalar = $1\times1$ matrix, vector = $N\times1$ or $1\times N$ matrix. "Calculations are much faster."
- Advantages (p.3): fast implementation and debugging, natural matrix operations, a powerful image processing toolbox.
- Main screen (p.4):

| Panel | Purpose (slide wording) |
|---|---|
| Command Window | type commands |
| Current Directory | view folders and m-files |
| Workspace | view variables; double-click a variable to see it in the **Array Editor** |
| Command History | view past commands; save a whole session using **diary** |

## 2. Variables and Matrix Creation (slides 5-11)

- C/C++ needs `int a; a=1;`, Matlab just `a=1;` (p.5). "Variables are created when they are used." "All variables are created as matrices with 'some' type (unless specified)."
- A trailing `;` suppresses printing; without it Matlab echoes `a = 1` (p.5).
- `a = 1;` gives `<1x1 double>`; `whos a` shows Size 1x1, **Bytes 8**, Class double (p.6). `b = false;` gives `<1x1 logical>`, value 0.
- Building matrices (p.7-8): **space or comma separates columns, semicolon separates rows**.

| Command | Size | Result |
|---|---|---|
| `A = [1, 2, 3]` | 1x3 | 1 2 3 |
| `B = [1,2,3;4,5,6]` | 2x3 | rows 1 2 3 / 4 5 6 |
| `C = [1 2 3;4 5 6;7 8 9]` | 3x3 | rows 1 2 3 / 4 5 6 / 7 8 9 |
| `D = [1 ; 2 ; 3]` | 3x1 | column 1, 2, 3 |
| `E = [1 2 3]'` | 3x1 | column 1, 2, 3 (transpose) |

- Colon operator `start:step:end` (p.9). Element count $=\lfloor (\text{end}-\text{start})/\text{step}\rfloor+1$ (verified).

| Command | Output | Count |
|---|---|---|
| `A=1:10` | 1 2 ... 10 (default step 1) | 10 |
| `B=0:2:10` | 0 2 4 6 8 10 | 6 |
| `1:0.5:5` | 1.0000 1.5000 ... 5.0000 | 9 |

- Strings are char row vectors: `C='Hello World!'` is `<1x12 char>` (p.10).
- Built-in constructors (p.11): `zeros(3)` 3x3 zeros, `ones(5)` 5x5 ones, `rand(100,2)` 100x2 random, `eye(20)` 20x20 identity, `sprintf('%d\n',9)` formatted string.

## 3. Matrix Indexing (slides 12-14)

- "Matrix indices begin from **1** (not 0!!!)"; "Matrix indices must be **positive integers**" (p.12).
- Errors shown: `A(0)` gives "Subscript indices must either be real positive integers or logicals."; `A(1,4)` on a 3x3 gives "Index exceeds matrix dimensions."
- **Column-Major Order**: a single (linear) index runs down the columns. Worked example with `A = [1 2 3;4 5 6;7 8 9]` (p.12-13):

| Expression | Meaning | Result |
|---|---|---|
| `A(1,3)` | row 1, col 3 | 3 |
| `A(1)` | 1st element, column-major | 1 |
| `A(2)` | 2nd element, column-major | **4** (not 2) |
| `A(2,2:3)` | row 2, cols 2 to 3 | 5 6 |
| `A(2,1:end)` | row 2, all cols (`end` = last index) | 4 5 6 |
| `A(2,:)` | row 2, `:` = all | 4 5 6 |
| `A(2,1:2:3)` | row 2, cols 1 and 3 | 4 6 |
| `A(2,[1 3])` | row 2, cols listed in a vector | 4 6 |
| `A(:)` | all elements as one column, column-major | 1 4 7 2 5 8 3 6 9 |

- Accessing elements (p.14), `A = rand(4)`: `A(2,3)` one element; `A(:,2)` 2nd column; `A(end,:)` last row; `A([1,2],[1,3])` rows 1-2 x cols 1,3 (2x2); `A(1:2,3:end)` rows 1-2 x cols 3-4 (2x2).

## 4. Matrix Operations (slides 15-19)

- Matrix operators (p.15): `+` addition, `-` subtraction, `*` (matrix) multiplication, `^` power, `'` **complex conjugate transpose**.
- Worked example (p.16), `A = [1 2 3;4 5 6;7 8 9]`, `B = [3 5 2;5 2 8;3 6 9]` (all verified):

| Operation | Row 1 | Row 2 | Row 3 |
|---|---|---|---|
| `X = A + B` | 4 7 5 | 9 7 14 | 10 14 18 |
| `Y = A - B` | -2 -3 1 | -1 3 -2 | 4 2 0 |
| `Z = A * B` | 22 27 45 | 55 66 102 | 88 105 159 |
| `T = A'` | 1 4 7 | 2 5 8 | 3 6 9 |

  - e.g. $Z_{11} = 1\cdot3 + 2\cdot5 + 3\cdot3 = 22$ (row of A times column of B).
- **Element-wise** operators put a dot first (p.17): `.*` element-wise multiplication, `./` element-wise division, `.^` element-wise power.
- Worked example (p.18): `x = A(1,:)` = [1 2 3], and the slide uses y = [3 4 -1]:

| Element | x | y (slide) | `b = x .* y` | `c = x ./ y` | `d = x .^ y` |
|---|---|---|---|---|---|
| 1 | 1 | 3 | 3 | 0.33 | $1^3=1$ |
| 2 | 2 | 4 | 8 | 0.5 | $2^4=16$ |
| 3 | 3 | -1 | -3 | -3 | $3^{-1}=0.33$ |

  - The slide is inconsistent: it types `A = [1 2 3; 5 1 4; 3 2 1]`, displays row 3 as `3 2 -1`, and prints `y = A(3,:)` as `3 4 -1` (slide shows 3 4 -1). The b, c, d values are correct for y = [3 4 -1]. With the displayed A, y = [3 2 -1], so b = [3 4 -3], c = [0.33 1 -3], d = [1 4 0.33] (verified). Learn the method, not the numbers.
- Linear systems (p.19): slide states "A/B solve xA=B for x" and "A\B solve Ax=B for x". Correct Matlab: `x = A\B` solves $Ax=B$ (backslash, as the slide says), but $xA=B$ is solved by `x = B/A` (slide shows A/B). Check: $A=\begin{pmatrix}2&1\\1&3\end{pmatrix}$, $B=(5\ \ 10)$ gives `B/A` = (1 3), since $(1\ 3)A=(5\ 10)$ (verified).

## 5. Concatenation, Strings, Cells and Structures (slides 20-22)

- Concatenation (p.20), `X=[1 2]`, `Y=[3 4]`: `[X Y]` gives 1x4 `1 2 3 4` (side by side); `[X ; Y]` gives 2x2 `1 2 / 3 4` (stacked).
- Strings (p.21), with `A = 'vision and geometry'`:

| Command | Result (verified where computable) |
|---|---|
| `strfind(A,'geometry')` | 12 (start index, 1-based) |
| `strcmp(A,'computer vision')` | 0 (logical false; compares whole strings) |
| `B = strcat(A,' 12345')` | `'vision and geometry 12345'` |
| `c = [A,' 12345']` | same: strings concatenate like vectors |
| `D = sprintf('I am %02d years old.\n',9)` | `'I am 09 years old.'` plus newline (`%02d` pads to 2 digits) |
| `int2str, str2num, str2double` | number and string conversions |

  - (textbook context) `strcat` strips trailing whitespace of char inputs, `[ ]` does not: `strcat('a ','b')` is `'ab'`, `['a ','b']` is `'a b'`.
- **Cells** (p.22), braces `{}` hold mixed types: `a = {}; a = cell(1)`, `b = {1,2,3}`, `c = {{1,2},2,{3}}` (nested), `D = {'cat','dog','sheep','cow'}` gives `D{2}` = dog, `E = {'cat',4}` gives `E{1}` = cat, `E{2}` = 4.
- **Structures** (p.22), named fields: `A = struct('name','1.jpg','height',640,'width',480);` or field by field `b.name = '1.jpg'`.

## 6. Operators and Flow Control (slides 23-24)

- Relational and logical operators (p.23): `==` equal to, `~=` **not equal to** (not `!=`), `<` strictly smaller, `>` strictly greater, `<=` smaller than or equal to, `>=` greater than or equal to, `&` and, `|` or. (textbook context) `~` alone is logical NOT, used in the practice code (section 15).
- Flow control (p.24), every block closes with `end`:
  - `if (a<3) ... elseif (b~=5) ... end`
  - `while ((a>3) & (b==5)) ... end`
  - `for ii=1:100` (100 iterations); `for j=1:3:200` (j = 1, 4, ..., 199: **67** iterations, verified); `for k=[0.1 0.3 -13 12 7 -9.3]` (loops over the elements of any vector).

## 7. M files, Functions, Debugging, Plotting (slides 25-28)

- **M-file** (p.25): "a text file containing script or function", extension **".m"**; created with HOME, New Script.
- **Function** (p.26), file `Add3.m`: `function out=Add3(in)` / `out=in+3;` / `end`. With `a = magic(3)` = [8 1 6; 3 5 7; 4 9 2], `b = Add3(a)` = [11 4 9; 6 8 10; 7 12 5] (verified; scalar + matrix adds to every element).
- **Debugging** (p.27): breakpoints (red dot); toolbar Step, Step in, Step out, Continue, Exit debug mode; green arrow = current line indicator. Example script: `xx = 0:0.1:10; ff = xx./(1+xx.^2/4)-1/2; plot(xx,ff);` (note element-wise `./` and `.^`).
- **Plotting** (p.28): functions plot, plot3d, bar, area, hist, contour, mesh ((textbook context) the 3D line function is actually `plot3`). Example: `x = -pi:.1:pi; y = sin(x); plot(x,y)` gives 63 points; the last x is 3.0584, not $\pi$, so the curve stops at $\sin(3.0584)=0.083$ (verified; visible on the slide's plot).

## 8. Image Data Structure (slide 29)

- **Image as matrices**: gray image $m\times n$; RGB image $m\times n\times 3$.
- Indexing `I(row, col, channel)`: `I(1,1,1)` = top-left pixel of the **R** plane, `I(1,n,3)` = top-right of **B**, `I(m,n,1)` and `I(m,n,3)` = bottom-right of R and B. Channel 1 = R, 2 = G, 3 = B.
- **Format** (slide wording): `[0, 255] uint8` and `[0, 1] double`. The peppers zoom shows double values such as 0.2235, 0.1294 per R/G/B plane.
- (textbook context) Memory: uint8 = 1 byte per element, double = 8 bytes (p.6 `whos`). A 512x512 RGB image: $512\cdot512\cdot3=786{,}432$ bytes as uint8, $\times8 = 6{,}291{,}456$ bytes as double (verified).

## 9. Image Input, Output, Display and Conversions (slides 30-31)

- `I = imread('lena.jpg');` "Read image (support bmp, jpg, png, ppm, etc)"; `imwrite(I, 'lena_out.jpg');` save; `imshow(I);` display. Alternatives to imshow: `imagesc(I)`, `imtool(I)`, `image(I)` (p.30).
- Type conversion (p.31): `I1 = im2double(I);` `I2 = im2uint8(I);`. RGB to grayscale: `I3 = rgb2gray(I);` (the slide gives no weights).
- (textbook context) im2double on uint8 rescales: $I_{double} = I_{uint8}/255$ (e.g. 200 gives 0.7843); im2uint8 does $\mathrm{round}(255\,I_{double})$. Plain `double(I)` keeps 0-255. rgb2gray uses $Y = 0.2989R + 0.5870G + 0.1140B$ (e.g. (200,100,50) gives 124.18, verified).

## 10. Image Operations: Resize, Crop, Rotate, Affine (slide 32)

| Code (p.32) | Slide comment |
|---|---|
| `Ires = imresize(I, 0.6);` | "Resize image as 60% smaller" |
| `imshow(I); Rect = getrect; Icrp = imcrop(I, Rect);` | "Crop image from user's input" (drag a rectangle) |
| `Irot = imrotate(I, 45);` | "Rotate image by 45 degrees" |
| `A = [1 0 0; .5 1 0; 0 0 1]; tform = maketform('affine', A); Itran = imtransform(I, tform);` | "Affine transformation" |

- Wording trap: scale 0.6 makes the output **60% of the original size** (i.e. 40% smaller). (textbook context) Output size = ceil(0.6 x size): 1024x1024 gives 615x615 (verified); default interpolation is bicubic, `imresize(I,0.6,'bilinear')` selects bilinear; `imrotate` angle is counterclockwise.
- Affine formula on the slide: $$\mathbf{p}^i_{warped} = \begin{pmatrix} a & b \\ c & d \end{pmatrix}\mathbf{p}^i_{source} + \mathbf{t}$$
- (textbook context) maketform uses row vectors, $[x\ y\ 1] = [u\ v\ 1]\,A$, so this A gives $x = u + 0.5v$, $y = v$: a horizontal **shear** (a=1, b=0.5, c=0, d=1, t=0; the slide's output picture is sheared). Point (10,20) maps to (20,20) (verified).

## 11. Image Filtering and Convolution (slides 33-35)

- "A **filter** (or called mask, kernel, neighborhood) is $N\times N$ matrix" (p.33). It slides over the image: the neighbourhood centred at input pixel $I(x,y)$ produces output pixel $O(x,y)$ (diagram: 3x3 grey block around I(2,2) gives O(2,2)).
- "Filters help us perform different kinds of operations": **Blurring, Sharpening, Edge, Denoise** (p.33, example pictures only, no kernels given).
- (textbook context) imfilter computes correlation, $O(x,y)=\sum_{i}\sum_{j} h(i,j)\,I(x+i,y+j)$; convolution flips h first. For symmetric kernels (average, Gaussian) both give the same result.
- Motion blur demo (p.34-35): `originalRGB = imread('peppers.png'); imshow(originalRGB)`; "Create a motion-blur filter using the fspecial function": `h = fspecial('motion', 50, 45);` then `filteredRGB = imfilter(originalRGB, h); figure, imshow(filteredRGB)`.
  - (textbook context) arguments = length 50 pixels, angle 45 degrees; imfilter on an RGB image filters each channel; default zero padding causes the dark frame visible on p.35.
- Worked example (textbook context, 3x3 average $h=\frac19\mathbf{1}_{3\times3}$, zero padding as imfilter's default; verified):

| Step | Value |
|---|---|
| Input (5x5 uint8) | border of 10s, inner ring of 50s, centre 200 |
| 3x3 patch around centre | rows 50 50 50 / 50 200 50 / 50 50 50 |
| Sum | $8\cdot50+200 = 600$ |
| Output | $600/9 = 66.67$, stored as uint8 67 |
| Corner pixel (10, zero-padded) | neighbours 10 10 / 10 50 + five zeros: $80/9 = 8.89$, stored as 9 |

## 12. Morphological Operations (slides 36-39)

- Setup (p.36-37): `A = [000000; 001100; 011110; 001100; 000000]` (typed with spaces in the console) and `B = strel([1;1;1])`, which Matlab reports as "an arbitrary shaped structuring element", Neighborhood [3x1 logical], Dimensionality 2. So B is a **vertical** 3x1 line.
- `A_eroded_By_B = imerode(A,B)` (p.37), `A_dilated_by_B = imdilate(A,B)` (p.38). With a vertical 3x1 SE: erosion keeps a 1 only if the pixel **and** the pixels directly above and below are 1; dilation sets a 1 if the pixel **or** the one above or below is 1. Verified in Python:

| Row | A | imerode(A,B) | imdilate(A,B) |
|---|---|---|---|
| 1 | 0 0 0 0 0 0 | 0 0 0 0 0 0 | 0 0 1 1 0 0 |
| 2 | 0 0 1 1 0 0 | 0 0 0 0 0 0 | 0 1 1 1 1 0 |
| 3 | 0 1 1 1 1 0 | 0 0 1 1 0 0 | 0 1 1 1 1 0 |
| 4 | 0 0 1 1 0 0 | 0 0 0 0 0 0 | 0 1 1 1 1 0 |
| 5 | 0 0 0 0 0 0 | 0 0 0 0 0 0 | 0 0 1 1 0 0 |

  - Why row 3, col 2 erodes to 0: above it (row 2, col 2) is 0. Why row 1, col 3 dilates to 1: below it (row 2, col 3) is 1.
- Opening demo (p.39): `BW1 = imread('circbw.tif'); figure; imshow(BW1)`; `SE = strel('rectangle',[40 30]);` `BW2 = imopen(BW1, SE); imshow(BW2);` Only the white regions large enough to hold a 40x30 rectangle survive (the slide's result shows a few solid rectangles).
- (textbook context) $A\ominus B=\{z \mid B_z\subseteq A\}$, $A\oplus B=\{z \mid \hat B_z\cap A\neq\emptyset\}$, opening $A\circ B=(A\ominus B)\oplus B$. `[40 30]` = 40 rows x 30 columns. Full theory: see Lecture 10.

## 13. Octave (slides 40-41)

- **Octave Online** (p.40): Files panel on the left ("File or data": clowndata.mat, mz_script.m; "Drop Files Here to Upload"), Vars panel, and the **Octave Command Prompt** at the bottom right ("Write command"). Tips: files are kept for the next visit and deleted after 6 months of inactivity; Ctrl+Space auto-completion, Cmd/Ctrl+S save the file, Cmd/Ctrl/Win+R run the file, Cmd/Ctrl/Win+E focus the prompt.
- Commands (p.41): `Load data`, `Image(X)`, `Colormap(map)`, `B=X(1:2:200,:);`, `Image(B)`.
  - `X(1:2:200,:)` keeps rows 1, 3, 5, ..., 199 (**100 rows**, verified) and all columns: **vertical subsampling by 2** (every 2nd row dropped).
  - (textbook context) the clown data is an indexed image: X (200x320) holds indices into colour table `map`, so B is 100x320. Functions are lower-case in practice (`load`, `image`, `colormap`): Matlab and Octave are case-sensitive.

## 14. Google Colab and Jupyter (slides 42-44)

- Colab ("Colaboratory", p.42): zero configuration required, access to GPUs free of charge, easy sharing; notebooks from Examples, Recent, Google Drive, GitHub, Upload.
- OpenCV in Colab (p.43). Commands to **skip with no replacement**: `cv2.waitKey()` ("you inherently wait after each cell executes anyways"), `cv2.moveWindow()` and `cv2.destroyAllWindows()` (no windows in Colab). Command to **translate**: `cv2.imshow("Original", img)` becomes `cv2_imshow(img)` (no label input), after `from google.colab.patches import cv2_imshow`.
- matplotlib alternative (p.44): `from matplotlib import pyplot as plt`; `%matplotlib inline` ("magic function" to render inline); `plt.imshow(img)`; `plt.figure(figsize=[18, 4])`; `plt.axis('off')`; use subplots to show several images side by side.
- (textbook context) OpenCV loads channels as **BGR**; for plt.imshow convert with `cv2.cvtColor(img, cv2.COLOR_BGR2RGB)`.
- Reference (p.45): Cambridge Octave tutorial (www-mdp.eng.cam.ac.uk ... octavetut.pdf).

## 15. Practice Code: experiment L8.txt (posted file)

Images: `300cat (2).jpeg`, `300dog (2).jpeg`, both 1024x1024 RGB (the code says `'300cat.jpeg'`, so rename or fix the path).

- **Image addition**: check sizes match, `im2double` both (to [0,1]), add (range [0,2]), `imshow`, then normalize `result_image / max(result_image(:))`.
  - Verified on these images: max of the sum = 2.0, so normalization divides by 2 (same as the average); 24.3% of pixels exceed 1 and show as pure white in the `imshow` called before normalizing.
  - Why im2double first (textbook context): uint8 arithmetic saturates in Matlab (200+100 gives 255); numpy uint8 wraps around (gives 44).
  - (textbook context) bug: `if size(image1) ~= size(image2)` is true only if **every** dimension differs; use `~isequal(size(image1), size(image2))`.

| Pixel | cat | dog | im2double sum | normalized (/2.0) |
|---|---|---|---|---|
| example | 200 | 100 | $0.7843+0.3922=1.1765$ | 0.5882 |

- **Logical OR**: `imbinarize(rgb2gray(img))` turns each image into a logical (0/1) image, then `img_or = img1_bw | img2_bw` (white where either is white); show the three images with `subplot(1,3,k)` and `title`.
- **Logical NOT**: `img1_not = ~img1_bw` inverts black and white; shown in a 2x2 subplot grid. (textbook context) imbinarize's default threshold is Otsu's global method.
- **Blurring**: `rgb2gray`, `h = fspecial('average', [5 5])` (every weight $1/25=0.04$), `imfilter(img_gray, h)`, show original and blurred with `subplot(1,2,k)`.

```python
import cv2, numpy as np
c = cv2.imread('300cat (2).jpeg').astype(np.float64) / 255     # im2double
d = cv2.imread('300dog (2).jpeg').astype(np.float64) / 255
assert c.shape == d.shape
s = c + d;  s = s / s.max()                                    # add + normalize
g1 = cv2.cvtColor(cv2.imread('300cat (2).jpeg'), cv2.COLOR_BGR2GRAY)
g2 = cv2.cvtColor(cv2.imread('300dog (2).jpeg'), cv2.COLOR_BGR2GRAY)
b1 = cv2.threshold(g1, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1] > 0   # imbinarize
b2 = cv2.threshold(g2, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1] > 0
img_or, img_not = b1 | b2, ~b1                                  # | and ~
blur = cv2.filter2D(g1, -1, np.ones((5, 5)) / 25,
                    borderType=cv2.BORDER_CONSTANT)              # imfilter: correlation, zero pad
```

## 16. Exam focus (slides 9-41)

1. **Linear (column-major) index.** `A=[1 2 3;4 5 6;7 8 9]`: `A(2)` = 4, `A(6)` = 8 (order 1 4 7 2 5 8 ...), `A(:)` = 1 4 7 2 5 8 3 6 9. Indices start at 1; `A(0)` is an error.
2. **Colon count.** Count $=\lfloor(\text{end}-\text{start})/\text{step}\rfloor+1$: `0:2:10` gives 6, `1:0.5:5` gives 9, `1:3:200` gives 67 (last 199), `1:2:200` gives 100.
3. **`*` vs `.*`.** `[1 2 3].*[3 4 -1]` = [3 8 -3]; `./` gives [0.33 0.5 -3]; `.^` gives [1 16 0.33]. For p.16, `Z = A*B` gives `Z(1,1)` = 1*3+2*5+3*3 = 22 (row of A times column of B).
4. **Transpose and concatenation.** `[1 2 3]'` is 3x1. `[X Y]` with X=[1 2], Y=[3 4] gives 1x4; `[X;Y]` gives 2x2.
5. **Backslash vs slash.** `A\B` solves $Ax=B$; `B/A` solves $xA=B$ (slide wrote A/B). Example: A=[2 1;1 3], B=[5 10], `B/A` = [1 3].
6. **Image sizes and types.** Gray $m\times n$, RGB $m\times n\times3$; uint8 in [0,255], double in [0,1]. `im2double(uint8 200)` = 0.7843. 512x512x3 uint8 = 786,432 bytes; as double = 6,291,456 bytes.
7. **Erosion and dilation by hand.** Use the p.36 matrix with `strel([1;1;1])`: erosion leaves only (3,3) and (3,4); dilation gives rows `001100 / 011110 / 011110 / 011110 / 001100`. Opening = erode then dilate, here giving `001100` in rows 2-4.
8. **Average filter.** 3x3 weights are 1/9, 5x5 weights are 1/25 = 0.04. A centre 200 with eight neighbours of 50: (8*50+200)/9 = 66.67, stored as 67.
9. **Image addition.** In uint8, 200+100 saturates to 255. With im2double: 0.7843+0.3922 = 1.1765 (> 1, so imshow clips it); divide by max (2.0) to get 0.5882.
10. **Subsampling and resize.** `X(1:2:200,:)` on 200x320 gives 100x320. `imresize(I,0.6)` on 1024x1024 gives 615x615 (60% of the size, not "60% smaller").
11. **Strings.** `strfind('vision and geometry','geometry')` = 12; `strcmp(...)` = 0; `sprintf('%02d',9)` = '09'; `'Hello World!'` is 1x12 char.
12. **Function file.** `Add3(magic(3))` = [11 4 9; 6 8 10; 7 12 5]; the file must be named `Add3.m` and the body ends with `end`.
