# Week 4 Lecture 2: Support Vector Machine (SVM)

What this lecture is about: SVM as a maximum-margin classifier, from the dot-product picture to the hard-margin problem ($d = 2/\|w\|$), the soft-margin cost with slack and $C$ (hinge loss), and kernels for non-linear data.

- Deck: `4.2. Machine Learning Support Vector Machine.pdf` (51 pages; 50-51 are "?" and "Thank you"). Notebooks `kernel_svm_from_scratch.ipynb` and `SVM.ipynb` were posted in week 5 but cover SVM; both are summarised at the end.
- Makeup video "Preparing Datasets for ML Model Training" (replaces the missed Week 4 Lecture 2 session) is on eClass. It is not covered here; see 09_Week5_DataPreparation.md.

**Professor's notation (use it on the exam)**
- Hyperplane / decision boundary $L$: $\vec w\cdot\vec x + b = 0$. $w$ is normal to the hyperplane, $b$ is the offset. A point is written $\vec X$ (capital) in the derivations.
- Labels $y_i\in\{-1,+1\}$: green "+" points are positive ($y=+1$), red "−" points are negative ($y=-1$).
- Margin lines: **L1: $w\cdot x+b=1$** (positive side), **L2: $w\cdot x+b=-1$** (negative side), on slides 26-30. Slides 31-34 swap the L1/L2 labels in the figure; go by the equations.
- $d$ = full margin width between L1 and L2 $= 2/\|w\|$. (Polynomial degree is also called $d$ on slide 47.)
- Slack is $\zeta_i$ ("zeta"). The penalty hyperparameter is written $c$ on slide 40 and $C$ on slides 40-41. Sums go to $n$ or $N$.
- Tie rule (slide 25): $y=+1$ if $\vec X\cdot\vec w+b\ \ge 0$ and $-1$ if $<0$, so a point exactly on the boundary counts as **+1**.

## 1. What SVM is, and SVM vs logistic regression (slides 3-5)
- SVM is a supervised algorithm. It can do regression and classification but is mostly used for classification. It works best on **small, complex** datasets, was popular in the 1990s, and performs well with little tuning.
- Both SVM and logistic regression look for a separating hyperplane:
  - LR is a **probabilistic** method (see 04_Week2_LogisticRegression.md).
  - SVM is a **geometric, margin-based** method grounded in statistical learning theory.
- Infinitely many hyperplanes can separate two classes. SVM chooses the one with the **maximum margin**, i.e. maximum distance to both classes.
- Practical advice (slide 5): try logistic regression first. If accuracy is poor, try SVM **without a kernel** (linear). LR and linear SVM perform similarly; which one is more efficient depends on the features.

## 2. Types: linear vs non-linear SVM (slides 6-7)
- **Linear SVM:** used when the data is (perfectly) linearly separable, i.e. one straight line in 2D splits the 2 classes.
- **Non-linear SVM:** used when no straight line separates the classes. It relies on the **kernel trick** (section 10).
- (textbook context) A soft-margin linear SVM also handles *nearly* separable data. "Perfectly separable" strictly applies only to the hard margin.

## 3. Important terms (slides 8-9, 12)
- **Hyperplane:** the decision boundary. It is a line in 2D and is called a hyperplane in higher dimensions (slide 12).
- **Support vectors:** the points **closest to the hyperplane**. They alone define the separating line.
- **Margin:** the distance between the hyperplane and the closest observations (the support vectors). A large margin is considered good. Slide 9 defines this half-distance; the derivation later uses $d$ = the full L1-to-L2 width.
- Slide 9 figure labels: maximum-margin hyperline in the middle, positive hyperline and negative hyperline through the support vectors.
- There are two kinds of margin:
  - **Hard margin:** no point may lie inside the margin.
  - **Soft margin:** some violations are allowed, controlled by slack $\zeta$ and $C$ (section 8).

## 4. How SVM works (slides 10-13)
- The SVM is defined **only by the support vectors**. Other points do not matter. Logistic regression, by contrast, is defined over **all** points (slide 11).
- Among the hyperplanes that classify the data correctly, SVM picks the one **farthest from the nearest points of both classes**, i.e. the maximised margin (slide 13).

## 5. Dot product and projection (slides 14-18)
- The dot product gives a scalar; the cross product gives a vector.
- Formula: $A\cdot B = |A|\cos\theta \cdot |B|$, where $|A|\cos\theta$ is the **projection of A on B** and the magnitudes come from Pythagoras.
- SVM needs only the projection, so it uses the unit vector of $B$: $A\cdot\hat B = |A|\cos\theta$ with $\hat B = B/|B|$.
  - Slide error (slide 18): the slide writes the left side as "$A\cdot B$". It should be $A\cdot\hat B$.
- Example (verified): $A=(3,4)$, $B=(4,0)$ gives $A\cdot B = 12$ and projection $A\cdot\hat B = 12/4 = 3$.

## 6. Using the dot product to classify a point (slides 19-22)
- Take the point as a vector $\vec X$ and a vector $\vec w$ **perpendicular to the hyperplane**. Let $c$ be the distance along $w$ from the origin to the boundary.
- Project $X$ on $w$ and compare with $c$:
  - $\vec X\cdot w = c$: the point is on the decision boundary.
  - $\vec X\cdot w > c$: positive sample.
  - $\vec X\cdot w < c$: negative sample.
- Why the perpendicular? Infinitely many boundary points could serve as a reference for "distance". Projecting onto the normal gives one standard reference.
- (textbook context) $X\cdot w$ is a geometric length only if $w$ is a unit vector. Otherwise the distance of the boundary from the origin is $c/\|w\|$.

## 7. Hyperplane, decision rule and margin lines (slides 23-26)
- Hyperplane: $w\cdot x + b = 0$ (slide 24).
- Decision rule (slide 25): $\vec X\cdot\vec w - c \ge 0$. Setting $b=-c$ gives $\vec X\cdot\vec w + b\ge 0$, so
$$y=\begin{cases}+1 & \text{if } \vec X\cdot\vec w+b\ge 0\\ -1 & \text{if } \vec X\cdot\vec w+b<0\end{cases}$$
- We want the $(w,b)$ that gives the largest margin $d$. To compute $d$, assume L1: $w\cdot x+b=1$ and L2: $w\cdot x+b=-1$ (slide 26).
- (textbook context) The distance from a point to the hyperplane is $|w\cdot x+b|/\|w\|$, so each support vector is $1/\|w\|$ from $L$.

## 8. Hard margin: constraints and margin 2 over norm w (slides 27-37)
**Constraints (slide 28).** No point may cross its margin line:
- Red (negative) points: $\vec w\cdot\vec X + b\le -1$
- Green (positive) points: $\vec w\cdot\vec X + b\ge 1$

**One combined constraint (slides 29-30).** Multiplying by $y$ ($+1$ for green, $-1$ for red) turns both into
$$y_i(\vec w\cdot\vec X_i + b)\ \ge\ 1$$

**Margin derivation (slides 31-35).**
1. Take one support vector from each class, $x_1$ and $x_2$, and project $(x_2-x_1)$ onto the **unit** normal $w/\|w\|$:
   $$(x_2-x_1)\cdot\frac{\vec w}{\|w\|} = \frac{x_2\cdot\vec w - x_1\cdot\vec w}{\|w\|}\quad (1)$$
2. Support vectors lie *on* the margin lines, so $y_i(\vec w\cdot x_i + b)=1$. The slide says "on the hyperplane" and garbles the formula as "$yi*(2.x+b)=1$".
   - Positive point, $y=1$: $\vec w\cdot x_1 = 1-b$ (2)
   - Negative point, $y=-1$: $\vec w\cdot x_2 = -b-1$ (3)
3. Substituting gives
   $$\frac{(1-b)-(-b-1)}{\|w\|} = \frac{1-b+b+1}{\|w\|} = \frac{2}{\|w\|} = d$$

Slide inconsistencies in this derivation:
- Slide 31 says $x_1$ is the negative point. Slide 34 uses $x_1$ as the positive one.
- Slide 35 plugs in $w\cdot x_1 - w\cdot x_2$, which is the reverse of eq. (1). Taken literally, eq. (1) gives $-2/\|w\|$. The magnitude $2/\|w\|$ is correct, since a distance is $|\cdot|$ (checked numerically in `verify_examples.py`).

**Optimisation problem (slide 36, primal).**
$$\underset{w^*,b^*}{\arg\max}\ \frac{2}{\|w\|}\quad\text{such that } y_i(\vec w\cdot\vec X+b)\ge 1 \qquad\Longleftrightarrow\qquad \text{minimize } J(w,b)=\tfrac12\|w\|^2$$
- Maximising $2/\|w\|$ is the same as minimising $\|w\|$. The square and the $\tfrac12$ make the problem a smooth quadratic program (textbook context).
- Slide 37: this is the **Hard Margin SVM**. It fails on real data, which is rarely perfectly separable, so we need the soft margin.

## 9. Soft margin: slack zeta, C and hinge loss (slides 38-42)
- Real data is usually nearly separable or non-separable. The soft margin allows a few misclassifications.
- Slide 39: $\max f(x)$ can be rewritten as $\min 1/f(x)$, so we minimise $\dfrac{\|w\|}{2}$ subject to $y_i(\vec w\cdot\vec X+b)\ge1$. Slide 39 writes $\|w\|/2$, while slides 36 and 40 write $\tfrac12\|w\|^2$; both have the same minimiser.
- Slide 40: add slack $\zeta_i$ weighted by the hyperparameter $c$:
$$\underset{w^*,b^*}{\arg\min}\ \frac{\|w\|}{2} + c\sum_{i=1}^{n}\zeta_i$$
$$J(w,b)=\frac12\|w\|^2 + C\sum_{i=1}^{N}\max\big(0,\ 1-y_i(w^Tx_i+b)\big)$$
- The $\max(0, 1-y_i f(x_i))$ term is the **hinge loss**. The slides do not use the word "hinge"; `SVM.ipynb` does. So $\zeta_i=\max(0,1-y_i(w^Tx_i+b))$.
- (textbook context) The constrained form is $\min \tfrac12\|w\|^2 + C\sum\zeta_i$ s.t. $y_i(w\cdot x_i+b)\ge 1-\zeta_i$ and $\zeta_i\ge 0$.

**C trade-off (slide 41):**

| $C$ | Effect on violations | Margin | Training errors | Risk |
|---|---|---|---|---|
| Large $C$ | penalised strongly | smaller | fewer misclassifications | overfit |
| Small $C$ | more allowed | wider | more | underfit |

- Slide 41's line "C control the same trade-off ... but in opposite ways" is a leftover fragment. The two bullets above are the content.

**What $\zeta$ means (slide 42):**
- $\zeta=0$ for correctly classified points.
- For misclassified points, $\zeta$ = distance from the point's **own** margin line: a wrong green point is measured from L1, a wrong red point from L2 (figure labels d1, d2, d3).
- (textbook context) Correct points inside the margin have $0<\zeta\le1$; misclassified points have $\zeta>1$. $\zeta$ is in functional units; the geometric distance is $\zeta/\|w\|$.

**Dual and Lagrangian (not on slides; textbook context plus `kernel_svm_from_scratch`)**
- Lagrangian: $L=\tfrac12\|w\|^2-\sum_i\alpha_i[y_i(w\cdot x_i+b)-1]$. Setting derivatives to zero gives $w=\sum_i\alpha_iy_ix_i$ and $\sum_i\alpha_iy_i=0$.
- Soft-margin dual: $\max_\alpha \sum_i\alpha_i-\tfrac12\sum_{i,j}\alpha_i\alpha_jy_iy_jK(x_i,x_j)$ s.t. $0\le\alpha_i\le C$, $\sum_i\alpha_iy_i=0$. The hard margin has only $\alpha_i\ge0$.
- Prediction: $f(x)=\sum_i\alpha_iy_iK(x_i,x)+b$. **Support vectors are the points with $\alpha_i>0$.** The data appears only through dot products, which is what makes the kernel trick possible.

## 10. Kernels and the kernel trick (slides 43-48)
- Slide 44 shows two data sets no line can split: 1D data (green-red-green on a line) and 2D data (green disk inside a red ring).
- Fix: map the data from the lower-dimensional space to a higher one (e.g. with quadratic functions) where a hyperplane separates the classes (slide 45).
- These mapping functions are **kernels**. **Which kernel to use is decided by hyperparameter tuning.**
- Slide 46: the kernel lifts 2D points onto a 3D surface; a flat "decision surface" plane then cuts the red points off.
- **Kernel trick** (wording from the notebook, as textbook context): the dual needs only $\phi(x_i)^\top\phi(x_j)$. A kernel $K(x_i,x_j)$ returns that value directly from the original vectors, so $\phi$ is never computed. RBF's $\phi$ is infinite-dimensional.

| Kernel | Formula | Hyperparameters | Source |
|---|---|---|---|
| Linear | $K(x,z)=x^\top z$ | $C$ | notebook |
| Polynomial | $f(X1,X2)=(X1^T\cdot X2+1)^d$ | degree $d$ (set manually) | slide 47 |
| Sigmoid | $f(x1,x2)=\tanh(\alpha x^Ty + c)$ | $\alpha$, $c$ | slide 48 |
| RBF / Gaussian | $K(x,z)=\exp(-\gamma\lVert x-z\rVert^2)$ | $\gamma$ (and $C$) | notebook; $\gamma$ is named on slide 49 |

**Polynomial kernel (slide 47):**
- The figure shows a degree-2 polynomial SVM separating data with a curved boundary.
- The notebook's general form is $(\gamma x^\top z + r)^d$; the slide's version is $\gamma=1$, $r=1$.

**Sigmoid kernel (slide 48):** "can be used as a proxy for neural networks". Two slide errors:
- The formula is printed as $\tanh(\alpha x^Ty + x)$; the last term should be a constant $c$.
- The slide says it maps inputs "to a value of 0 and 1", but $\tanh$ ranges over $(-1,1)$.

**RBF kernel and $\gamma$** (notebook; the slides name $\gamma$ only as a hyperparameter on slide 49):
- $K=1$ when $x=z$ and $K\to0$ far away. The width of the "bump" is about $1/\sqrt\gamma$.
- Large $\gamma$: very local similarity, a wiggly boundary that can **overfit**, and nearly every point becomes a support vector.
- Small $\gamma$: smooth, almost linear boundary that can **underfit**.
- (textbook context) The equivalent Gaussian form is $\exp(-\|x-z\|^2/2\sigma^2)$, with $\gamma = 1/(2\sigma^2)$.

## 11. Advantages and disadvantages (slide 49)

| Advantages (as on the slide) | Disadvantages |
|---|---|
| Works better when the data is linear | Choosing a good kernel is not easy |
| More effective in high dimensions | Doesn't give good results on big datasets |
| Kernel trick lets it solve complex problems | Hyperparameters **C and gamma** are hard to tune, and their impact is hard to visualise |
| Not sensitive to outliers | |
| Useful for image classification | |

- (textbook context) The "not sensitive to outliers" point holds because only the support vectors matter and the soft margin limits each point's influence to $C$. A hard margin is very sensitive to a single outlier.

## Code from the course notebook (kernel svm from scratch)
File: `kernel_svm_from_scratch.ipynb`. NumPy only; matplotlib is used just for plots.
- **Data:** four 2D sets generated by hand with labels $\pm1$: blobs (linear), circles (inner disk $+1$ vs outer ring), moons, and XOR ($y=\text{sign}(x_1x_2)$).
- **Split and scaling:** 70/30 split. Features are standardised with **train statistics only**.
- **Kernels** (vectorised Gram matrices):
  - `linear_kernel = A @ B.T`
  - `polynomial_kernel = (gamma*(A@B.T)+coef0)**degree`
  - `rbf_kernel = exp(-gamma*||a-b||^2)`, using $\|x\|^2+\|z\|^2-2x\cdot z$
- **Explicit feature-map check:** for $(x^\top z)^2$, $\phi(x)=(x_1^2,\sqrt2x_1x_2,x_2^2)$. With $x=(1,2)$, $z=(3,-1)$ both routes give **1.0**.
  - The quadratic lift makes the circles data separable by a plane in 3D, because $x_1^2+x_2^2$ acts as a radius feature.
- **Solver:** `KernelSVM`, a soft-margin **dual coordinate ascent** solver.
  - The bias is absorbed by using $K'=K+1$. This removes the constraint $\sum\alpha_iy_i=0$, so one $\alpha_i$ can be updated at a time:
  ```python
  grad  = 1.0 - y[i] * f[i]                      # >0 means margin violation
  new_a = np.clip(alpha[i] + grad / diag[i], 0.0, self.C)   # clip = the soft part
  f    += (new_a - alpha[i]) * y[i] * K[:, i]
  ```
  - Support vectors are the points with $\alpha>10^{-8}$. Prediction is $f(x)=\sum\alpha_iy_iK'(x_i,x)$, with `>= 0` mapped to $+1$.
- **Results** (all with $C=1$; reproduced by re-running, since the notebook shows them only as plot titles):

| Test acc (#SV) | Linear | Poly d=2 | Poly d=3 | RBF γ=1 |
|---|---|---|---|---|
| Blobs | 0.98 (8) | 1.00 (6) | 1.00 (5) | 1.00 (18) |
| Circles | 0.39 (210) | 1.00 (7) | 1.00 (10) | 1.00 (21) |
| Moons | 0.86 (57) | 0.79 (56) | 1.00 (19) | 1.00 (36) |
| XOR | 0.66 (191) | 0.94 (43) | 0.97 (32) | 0.96 (64) |

- **Hyperparameter sweeps on moons** (train/test, #SV out of 210 training points):
  - **γ:** 0.01 → 0.87/0.84 (105); 1 → 1.00/1.00 (36); 100 → 1.00/0.96 (**191**). Low γ underfits, high γ overfits.
  - **Degree:** 2 → 0.90/0.79; 3 → 1.00/1.00; 8 → 1.00/0.97.
  - **C:** 0.01 → 0.90/0.87 with **210 SV** (every point); 1 → 1.00/1.00 (36); 1000 → 1.00/1.00 (**9**). Larger C gives fewer SVs and a narrower margin.
- **Printed sklearn check** (`SVC`, same hyperparameters):
  - RBF: Circles 1.000/1.000, Moons 1.000/1.000, XOR 0.956/0.956 (ours/sklearn).
  - Poly d=3: XOR 0.967/0.967.
- **Rules of thumb:** standardise features first; start with RBF and tune $C,\gamma$ on a log grid by CV; many SVs or train ≫ test means overfitting, so lower $\gamma$ or $C$; use a linear kernel when features ≫ samples.

## Code from the course notebook (SVM)
File: `SVM.ipynb`. Data: `make_classification(n_samples=1000, n_features=2, n_informative=2, n_redundant=0, n_clusters_per_class=1, random_state=42)`.

**Part 1: sklearn.**
- Setup: `SVC(kernel='rbf')` with defaults $C=1$ and `gamma='scale'` (≈0.31 here), against `RandomForestClassifier(n_estimators=50)` (see 07_Week4_DecisionTree.md). Split is 80/20 with `random_state=50`.
- Metrics are as in 05_Week3_EvaluatingLearningAlgorithms.md. Confusion matrices are from a re-run, `[[TN,FP],[FN,TP]]`:

| Model | Accuracy | Precision | Recall | F1 | Confusion matrix |
|---|---|---|---|---|---|
| SVM (RBF) | 0.9350 | 1.0000 | 0.8713 | 0.9312 | [[99,0],[13,88]] |
| Random forest | 0.9450 | 0.9592 | 0.9307 | 0.9447 | [[95,4],[7,94]] |

- The SVM used 168 support vectors (85 + 83) out of 800 training points.

**Part 2: linear SVM from scratch, SGD on the hinge loss.**
- Labels are mapped $\{0,1\}\to\{-1,+1\}$. The split is the first 800 points for train and the last 200 for test.
- Hyperparameters: `w=0`, `b=0`, `lr=0.001`, `epochs=2000`, `C=5`.
  ```python
  margin = y[i] * (X[i] @ w + b)
  if margin >= 1:  dw = w / M;                    db = 0          # only regulariser
  else:            dw = w / M - C * y[i] * X[i];  db = -C * y[i]  # hinge active
  w -= lr * dw;  b -= lr * db
  ```
- Prediction is `np.sign(X@w+b)`. Printed results: **Accuracy 0.9400, Precision 0.9775, Recall 0.8969, F1 0.9355**. These imply TP=87, FN=10, FP=2, TN=101, which I checked.
- The shuffle is unseeded, so a re-run differs slightly (I got acc 0.925, $w≈(-0.71, 2.35)$, $b≈1.67$).

## Exam focus
**Q1. Classify points and find the margin.** Take $w=(3,4)$, $b=-10$. Then $\|w\|=5$ and the margin width is $d=2/\|w\|=0.4$.

| Point | $w\cdot x+b$ | Class | Distance to $L$ $=\lvert f\rvert/\lVert w\rVert$ |
|---|---|---|---|
| (2,2) | 6+8−10 = 4 | +1 | 0.8 |
| (1,1) | 3+4−10 = −3 | −1 | 0.6 |
| (2,1) | 6+4−10 = 0 | +1 (on boundary; tie goes to +1) | 0 |
| (4,0) | 12−10 = 2 | +1 | 0.4 |

**Q2. Hard margin by hand.** Data: $(1,1)$ with $y=-1$, $(3,3)$ with $y=+1$, $(0,0)$ with $y=-1$. sklearn with $C=10^{10}$ confirms $w=(0.5,0.5)$, $b=-2$.
- Constraint check $y_i(w\cdot x_i+b)$: $(1,1)\to -1\cdot(1-2)=1$; $(3,3)\to 1\cdot(3-2)=1$; $(0,0)\to 2$.
- So the support vectors are $(1,1)$ and $(3,3)$, the two points with equality.
- Margin: $2/\|w\| = 2/0.7071 = 2.828$, which equals $|(3,3)-(1,1)| = \sqrt8$.
- The boundary is $x_1+x_2=4$.

**Q3. Soft-margin cost.** Keep $w=(0.5,0.5)$, $b=-2$ and use 4 points. Then $\tfrac12\|w\|^2 = 0.25$.

| Point, y | $f=w\cdot x+b$ | $y f$ | hinge $\max(0,1-yf)=\zeta$ | Status |
|---|---|---|---|---|
| (1,1), −1 | −1 | 1 | 0 | on L2, support vector |
| (3,3), +1 | 1 | 1 | 0 | on L1, support vector |
| (2.5,2.5), +1 | 0.5 | 0.5 | 0.5 | correct but inside margin |
| (1,2), +1 | −0.5 | −0.5 | 1.5 | misclassified ($\zeta>1$) |

- Hinge sum = 2.0, so $J = 0.25 + C\cdot2$: $C=1\to2.25$, $C=10\to20.25$, $C=0.1\to0.45$. A large $C$ makes the violations dominate the cost.

**Q4. Kernel values.** For $x=(1,2)$, $z=(3,-1)$: $x\cdot z=1$ and $\|x-z\|^2=4+9=13$.
- Linear: 1.
- Polynomial (slide form): $(x\cdot z+1)^2=4$ and $(x\cdot z+1)^3=8$.
- Explicit check: $(x\cdot z)^2=1=\phi(x)\cdot\phi(z)$ with $\phi(x)=(1,2\sqrt2,4)$ and $\phi(z)=(9,-3\sqrt2,1)$, giving $9-12+4=1$.
- RBF: $\gamma=0.1\to e^{-1.3}=0.2725$; $\gamma=0.5\to e^{-6.5}=0.0015$.
- Sigmoid with $\alpha=1$, $c=0$: $\tanh(1)=0.7616$.

**Q5. Effect of γ** for two nearby points, $x=(1,2)$ and $z=(2,2)$, so $\|x-z\|^2=1$:
- $\gamma=0.1\to0.905$, $\gamma=1\to0.368$, $\gamma=10\to4.5\times10^{-5}$.
- A large γ makes even close points "dissimilar", which leads to a wiggly, overfit boundary.

**Q6. Why kernels: 1D lift** (slide 44 left). Take $x=-3..3$ with labels $+1$ for $|x|\ge2$ and $-1$ otherwise.
- No single threshold on $x$ works.
- With $\phi(x)=x^2$ the values are $9,4,1,0,1,4,9$, and the threshold $x^2=2.5$ separates the classes perfectly.

**Q7. RBF prediction.** Support vectors $(0,0)$ with $y=+1$ and $(2,0)$ with $y=-1$, $\alpha_i=1$, $b=0$, $\gamma=1$.
- At $(0.5,0)$: $K=(e^{-0.25}, e^{-2.25})=(0.7788,0.1054)$, so $f=0.673$ and the class is $+1$.
- At $(1.5,0)$: $f=-0.673$, class $-1$.
- At $(1,0)$: $f=0$, on the boundary.

**Short-answer checklist**
- Derive $d=2/\|w\|$ (section 8), and explain why maximising $2/\|w\|$ is the same as minimising $\tfrac12\|w\|^2$.
- Write the combined constraint $y_i(w\cdot x_i+b)\ge1$ and explain how it merges the two class constraints.
- Hard vs soft margin; role of $\zeta$; large vs small $C$ (table in section 9).
- Support vectors: only they define the boundary (logistic regression uses all points). They are the points with $\alpha_i>0$ (dual).
- Name the kernels and their formulas. Polynomial degree $d$ is set manually; the kernel is chosen by hyperparameter tuning; the hyperparameters are $C$ and $\gamma$.
- SVM vs logistic regression: geometric vs probabilistic; try LR first, then a linear SVM, then kernels.

Scripts: `/home/claude/work/agents/w4l2/verify_examples.py`, `verify_extra.py`, `nb/kernel_nb.py`, `nb/svm_nb.py`.
