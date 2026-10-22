# Week 1.2: Intro to Machine Learning and Linear Regression with One Variable

What this lecture is about: two definitions of ML, the four ML branches, supervised (classification vs regression) vs unsupervised (clustering, dimensionality reduction), then univariate linear regression on a Celsius to Fahrenheit dataset: hypothesis, squared-error cost $J$ with $\frac{1}{2m}$, and gradient descent (update rule, learning rate, local minima, derivatives, iterations).

Slides 2, 6, 10, 13 are agenda slides. The agenda also lists "Linear Regression with Multiple Variables", but this deck stops at slide 32 (33 = questions, 34 = thank you). Multivariable GD is in `03_Week2_MultivariateRegression_NormalEquation_Polynomial.md`. Broader AI/ML/DL context is in `01_Week1_IntroToAI.md`.

## 1. What is machine learning (slides 3-5)

- Definition 1 (slide 3): ML is "the use and development of computer systems that are able to learn and adapt without following explicit instructions, by using algorithms and statistical models to analyse and draw inferences from patterns in data."
- Definition 2 (slide 3): "Field of study that gives computers the ability to learn without being explicitly programmed." Arthur Samuel (1959).
- Nesting (slide 4): AI ⊃ Machine Learning ⊃ Deep Learning. "Machine Learning is a part of Artificial Intelligence."
- The professor's **four** branches of ML (slide 5): supervised learning, unsupervised learning, reinforcement learning, recommender system. (Lecture 1.1 lists three paradigms; this deck adds recommender systems as a fourth.)

## 2. Supervised learning: classification vs regression (slides 7-9)

| | A. Classification problem | B. Regression problem |
|---|---|---|
| Output | discrete class label | continuous number |
| Algorithms (slide 7) | Logistic Regression, Decision Tree, Naive Bayes, K-Nearest Neighbor, Support Vector Machine | Linear Regression, Ridge Regression, Stepwise Regression |
| Examples (slide 7) | Email spam detection, Speech recognition | Stock market prediction, Rainfall prediction |
| Picture (slides 8-9) | train on labeled apples and bananas, new fruit (a peach) in, output "Apple" | train on (°C, F) pairs, input 45 °C, output 113 F |

- Supervised = training data has the correct answer (label/target) for each input.
- Note the trap: **Logistic Regression is listed under classification** despite its name (see `04_Week2_LogisticRegression.md`).
- Slide 9 table, all consistent with $F = 32 + 1.8t$:

| °C | 10 | 13 | 22 | 35 | 45 (query) |
|---|---|---|---|---|---|
| F | 50 | 55.4 | 71.6 | 95 | 113 |

## 3. Unsupervised learning: clustering and dimensionality reduction (slides 11-12)

- No labels; the algorithm finds structure itself.
- Clustering problem: K-Means, MeanShift. Slide 12: a mixed pile of apples and bananas in, two groups out (apples, bananas). No one told it the names.
- Dimensionality reduction: PCA (slide misspells it "Principle"; correct is **Principal** Component Analysis), LDA (Linear Discriminant Analysis), Autoencoders (AEs).
- (textbook context) LDA actually uses class labels, so it is normally called a *supervised* dimensionality-reduction method. On the exam, follow the slide's grouping if asked "what does the slide list", but know the caveat.

## 4. Linear regression setup and notation (slides 14-17)

**Temperature dataset** (slides 14, 16, 29). Slide 14 asks for 35 °C: the fitted line gives 95 F.

| i | x = Temp (°C) | y = Temp (F) |
|---|---|---|
| 1 | 10 | 50 |
| 2 | 15 | 59 |
| 3 | 20 | 68 |
| 4 | 25 | 77 |
| 5 | 30 | 86 |
| query | 35 | 95 (= 32 + 1.8·35) |

**House-price dataset** (slide 15), only to show a noisy regression cloud: size in feet² (x) vs price in $1000s (y): 2104→460, 1416→232, 1534→315, 852→178, ...

**Notation (slide 16), exactly as written:**
- $x$ = "input" variable / feature; $y$ = "output" variable / target.
- $m$ = number of training examples (here $m = 5$).
- $(x, y)$ = one training example; $(x^{(i)}, y^{(i)})$ = the $i$-th training example. The superscript $(i)$ is an **index, not a power**; indexing starts at 1.
- Slide fill-ins: $(x^{(1)}, y^{(1)}) = (10, 50)$, $(x^{(2)}, y^{(2)}) = (15, 59)$, $(x^{(3)}, y^{(3)}) = (20, 68)$.

**Pipeline (slide 17):** Training Set → Learning Algorithm → $h$ (the *hypothesis*), which maps Temp (°C) to Temp (F).
- $h_\theta(x) = \theta_0 + \theta_1 x$, equivalently $y = b + wx$, so $\theta_0 = b$ (bias, intercept) and $\theta_1 = w$ (weight, slope).
- Fill-ins for $F = 32 + 1.8\,t$: $y = h_\theta(x) = F$, $\theta_0 = b = 32$, $\theta_1 = w = 1.8$, $x = t$ (°C).
- Name used: "Linear Regression with one variable" (univariate).

## 5. Hypothesis examples (slide 18)

Each pair $(\theta_0, \theta_1)$ is a different line. Values at x = 0..3 (verified):

| $\theta_0$ | $\theta_1$ | $h(x)$ | h(0) | h(1) | h(2) | h(3) | Shape |
|---|---|---|---|---|---|---|---|
| 1.5 | 0 | $1.5 + 0\cdot x$ | 1.5 | 1.5 | 1.5 | 1.5 | horizontal line |
| 0 | 0.5 | $0 + 0.5x$ | 0 | 0.5 | 1.0 | 1.5 | through origin |
| 1 | 0.5 | $1 + 0.5x$ | 1 | 1.5 | 2.0 | 2.5 | same slope, shifted up 1 |

$\theta_0$ moves the line up/down; $\theta_1$ tilts it.

## 6. Cost function J with 1 over 2m (slides 19-20)

- Idea (slide 19): choose $\theta_0, \theta_1$ so that $h_\theta(x)$ is close to $y$ for the training examples $(x, y)$.
- **Cost function, professor's exact form (has $\frac{1}{2m}$):**

$$J(\theta_0, \theta_1) = \frac{1}{2m}\sum_{i=1}^{m}\left(h_\theta(x^{(i)}) - y^{(i)}\right)^2, \qquad h_\theta(x^{(i)}) = \theta_0 + \theta_1 x^{(i)}$$

- Order inside the square is **prediction minus target**, $h_\theta(x^{(i)}) - y^{(i)}$ (matters for the sign of the gradient).
- Called the "Squared error function". Goal: $\min_{\theta_0, \theta_1} J(\theta_0, \theta_1)$.
- Slide 22 writes $h_\Theta$ (capital Theta) in the same formula; same thing.
- Why $\frac{1}{2m}$: $\frac{1}{m}$ averages over examples; the $\frac{1}{2}$ cancels the 2 from differentiating the square (see section 10). It does not change where the minimum is.
- **Simplified version (slide 20, right panel is blank on the slide; filled in here):** set $\theta_0 = 0$, so $h_\theta(x) = \theta_1 x$ and

$$J(\theta_1) = \frac{1}{2m}\sum_{i=1}^{m}\left(\theta_1 x^{(i)} - y^{(i)}\right)^2, \qquad \min_{\theta_1} J(\theta_1)$$

## 7. Worked example: J(theta1) on toy data (slide 21)

Data: (1,1), (2,2), (3,3), so $m = 3$, $2m = 6$. Hypothesis $h_\theta(x) = \theta_1 x$.

| $\theta_1$ | Predictions $h(1), h(2), h(3)$ | Squared errors | Sum | $J = \text{Sum}/6$ |
|---|---|---|---|---|
| 1 | 1, 2, 3 | 0, 0, 0 | 0 | **0** |
| 0.5 | 0.5, 1, 1.5 | 0.25, 1, 2.25 | 3.5 | **0.58** (0.5833) |
| 0 | 0, 0, 0 | 1, 4, 9 | 14 | **2.33** (2.3333) |
| 1.5 | 1.5, 3, 4.5 | 0.25, 1, 2.25 | 3.5 | **0.58** |
| 2 | 2, 4, 6 | 1, 4, 9 | 14 | **2.33** |

- All slide values verified (0.58 and 2.33 are rounded). $J(\theta_1)$ is a parabola, symmetric about the minimum $\theta_1 = 1$ (boxed on the slide), where $J = 0$ (perfect fit).
- Slide glitch: the $\theta_1$ axis on slide 21 labels the tick left of 0 as "0.5"; it should be **−0.5** (there $J = 31.5/6 = 5.25$, off the plotted range).

## 8. Gradient descent: idea and update rule (slides 22-24)

- Outline (slide 22): start with some $(\theta_0, \theta_1)$, the professor uses **$\theta_0 = 0, \theta_1 = 0$**; keep changing them to reduce $J(\theta_0, \theta_1)$ until we hopefully end at a minimum.
- Slide 23 (surface from Andrew Ng's course): on a non-convex $J$, two nearby starting points can roll down to **two different local minima**.
- **Update rule (slide 24), professor's exact form:**

$$\text{Repeat until convergence } \{\quad \theta_j = \theta_j - \alpha \cdot \frac{\partial}{\partial \theta_j} J(\theta_0, \theta_1) \quad (\text{for } j = 0 \text{ and } j = 1) \quad \}$$

- $\alpha$ = **learning rate**; $\frac{\partial}{\partial\theta_j}J$ = "derivative part". The professor writes the assignment with plain "=" (Ng's course uses ":="), and uses "•" or "·" for multiplication.
- For intuition he reduces to one parameter: $\min_{\theta_1} J(\theta_1)$, $\theta_1 \in \mathbb{R}$.

## 9. Derivative sign, learning rate, local minima (slides 25-28)

| Situation (slide) | Derivative | Update | Effect |
|---|---|---|---|
| Right of minimum, positive slope (25) | $\frac{\partial J}{\partial\theta_1} \ge 0$ | $\theta_1 = \theta_1 - \alpha\cdot(\text{positive})$ | $\theta_1$ decreases, moves left toward the min |
| Left of minimum, negative slope (25) | $\frac{\partial J}{\partial\theta_1} \le 0$ | $\theta_1 = \theta_1 - \alpha\cdot(\text{negative})$ | $\theta_1$ increases, moves right toward the min |
| At a local optimum (27) | $= 0$ (slope = 0) | $\theta_1 = \theta_1 - \alpha\cdot 0 = \theta_1$ | stays put |

- $\alpha$ too small (26): gradient descent **can be slow** (many tiny steps).
- $\alpha$ too large (26): can **overshoot** the minimum; may **fail to converge, or even diverge** (zig-zags across the valley, growing).
- Slide 28: GD can converge to a **local minimum even with $\alpha$ fixed**. Near a minimum the derivative shrinks, so GD **automatically takes smaller steps**; there is **no need to decrease $\alpha$ over time**. (The figure shows step heights a > b > ...)
- (textbook context) For linear regression with squared error, $J(\theta_0,\theta_1)$ is convex (a bowl), so the only local minimum is the global one; the bumpy surface of slide 23 is for general $J$.

## 10. Gradient descent for linear regression: derivatives (slides 29-31)

Target (slide 29): the data lie exactly on $h_\theta(x) = 32 + 1.8x$, so the optimum is $\theta_0 = 32$, $\theta_1 = 1.8$ with $J(32, 1.8) = 0$ (verified; least squares also gives exactly 32, 1.8).

Derivation (slide 30):

$$\frac{\partial}{\partial\theta_j}J = \frac{\partial}{\partial\theta_j}\frac{1}{2m}\sum_{i=1}^{m}\left(\theta_0 + \theta_1 x^{(i)} - y^{(i)}\right)^2$$

$$j=0:\ \frac{\partial J}{\partial\theta_0} = \frac{1}{m}\sum_{i=1}^{m}\left(h_\theta(x^{(i)}) - y^{(i)}\right) \qquad j=1:\ \frac{\partial J}{\partial\theta_1} = \frac{1}{m}\sum_{i=1}^{m}\left(h_\theta(x^{(i)}) - y^{(i)}\right)\cdot x^{(i)}$$

(Chain rule: the 2 from the square cancels the $\frac12$; the inner derivative is 1 for $\theta_0$ and $x^{(i)}$ for $\theta_1$.)

**Final algorithm (slide 31), "Update $\theta_0$ and $\theta_1$" together:**

$$\theta_0 = \theta_0 - \alpha\cdot\frac{1}{m}\sum_{i=1}^{m}\left(h_\theta(x^{(i)}) - y^{(i)}\right), \qquad \theta_1 = \theta_1 - \alpha\cdot\frac{1}{m}\sum_{i=1}^{m}\left(h_\theta(x^{(i)}) - y^{(i)}\right)\cdot x^{(i)}$$

The update uses $\frac{1}{m}$ (not $\frac{1}{2m}$). This is batch GD: every step sums over all $m$ examples.

## 11. Simultaneous update (slide 31, term is textbook context)

- The slide brackets both equations as one "Update $\theta_0$ and $\theta_1$" step. The word "simultaneous" is not on the slides (textbook context), but that is what it means: compute **both** gradients with the **old** $\theta$, then assign.
- Correct: `temp0 = θ0 − α·∂J/∂θ0(θ0,θ1); temp1 = θ1 − α·∂J/∂θ1(θ0,θ1); θ0 = temp0; θ1 = temp1`.
- Wrong (sequential): updating $\theta_0$ first and using the new $\theta_0$ inside $\partial J/\partial\theta_1$.
- Numeric check on the temperature data, from (0, 0), $\alpha = 0.001$:

| Version | $\theta_0$ | $\theta_1$ |
|---|---|---|
| Simultaneous (correct) | 0.068 | 1.45 |
| Sequential (wrong) | 0.068 | 1.44864 |

## 12. Worked GD iterations on the temperature dataset (slide 32)

Slide 32 shows the idea only: 1. $\theta_0 = 0, \theta_1 = 0$ (horizontal line $y = 0$, high on the $J$ curve); 2-4. "..." (lines tilting up, points sliding down $J$); 5. $\theta_0 = 32, \theta_1 = 1.8$ (pink line through all points, bottom of $J$). The intermediate values are not given.

The PDF's text layer also contains **"α = 0.01"** on slide 32, hidden behind the yellow footer (not visible on screen). **With $\alpha = 0.01$, GD on this raw data diverges** (verified). Below are the real numbers.

Step 0, from $(\theta_0, \theta_1) = (0, 0)$: all predictions are 0, errors $h - y = -50, -59, -68, -77, -86$.
- $J(0,0) = \frac{1}{2\cdot5}(50^2+59^2+68^2+77^2+86^2) = \frac{23930}{10} = 2393$ (the same 2393 opens the Lecture 2.1 example).
- $\sum(h-y) = -340 \Rightarrow \partial J/\partial\theta_0 = -68$; $\sum(h-y)x = -7250 \Rightarrow \partial J/\partial\theta_1 = -1450$.

**$\alpha = 0.001$ (converges, slowly):**

| k | $\theta_0$ | $\theta_1$ | $J$ | $\partial J/\partial\theta_0$ | $\partial J/\partial\theta_1$ |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 2393.00 | −68.00 | −1450.00 |
| 1 | 0.0680 | 1.4500 | 760.91 | −38.93 | −796.14 |
| 2 | 0.1069 | 2.2461 | 268.79 | −22.97 | −437.10 |
| 3 | 0.1299 | 2.6832 | 120.40 | −14.21 | −239.94 |
| 4 | 0.1441 | 2.9232 | 75.65 | −9.39 | −131.69 |
| 10 | 0.1779 | 3.2066 | 56.27 | | |
| 100 | 0.4943 | 3.2006 | 55.14 | | |
| 1000 | 3.4870 | 3.0676 | 45.17 | | |

Iteration 1 by hand: $\theta_0 = 0 - 0.001\cdot(-68) = 0.068$, $\theta_1 = 0 - 0.001\cdot(-1450) = 1.45$; predictions 14.568, 21.818, 29.068, 36.318, 43.568; $J = 760.91$.

Pattern: $\theta_1$ shoots to about 3.2 (the best slope through the origin, $7250/2250 = 3.22$), then $\theta_0$ creeps up very slowly. Reaching within 0.01 of (32, 1.8) takes **72,738 iterations**. The slide's "5 iterations" is schematic.

**$\alpha = 0.01$ (diverges, the "too large" case of slide 26):**

| k | $\theta_0$ | $\theta_1$ | $J$ |
|---|---|---|---|
| 0 | 0 | 0 | 2393 |
| 1 | 0.68 | 14.50 | 28,825 |
| 2 | −1.5468 | −36.386 | 354,271 |
| 3 | 6.4259 | 142.160 | 4,361,267 |
| 4 | −21.39 | −484.35 | 53,696,667 |

(textbook context) The stability limit for this data is $\alpha < 2/\lambda_{max} \approx 0.00444$, where $\lambda_{max} = 450.9$ is the largest eigenvalue of $\begin{pmatrix}1 & \bar x\\ \bar x & \overline{x^2}\end{pmatrix} = \begin{pmatrix}1 & 20\\ 20 & 450\end{pmatrix}$. Verified: 0.0044 converges, 0.0045 diverges.

## 13. Contour plots and why raw x GD is slow (textbook context)

- Not on the slides. Slide 23 shows the 3D surface; a contour plot is the same $J(\theta_0, \theta_1)$ seen from above. Each closed curve is a set of $(\theta_0, \theta_1)$ with equal $J$. For linear regression the contours are **ellipses centered at the minimum** (here (32, 1.8)). Each point on the contour plot corresponds to one line $h_\theta$ on the data plot.
- GD moves perpendicular to the contours (steepest descent).
- For raw x = 10..30, the ellipses are extremely stretched (axis ratio $\sqrt{450.9/0.111} \approx 64$). So GD zig-zags across the narrow direction ($\theta_1$) and crawls along the long one ($\theta_0$), which is exactly the slow $\theta_0$ creep in section 12.
- Fix: scale features, e.g. $x' = (x-20)/10$. Then $\alpha = 0.5$ reaches $(\theta_0', \theta_1') = (68, 18)$ in 27 iterations (verified); un-scaled, that is $\theta_1 = 18/10 = 1.8$ and $\theta_0 = 68 - 1.8\cdot 20 = 32$. Scaling is covered in `09_Week5_DataPreparation.md`.

## 14. Notation summary (slides 16-32)

| Item | Professor's convention |
|---|---|
| Hypothesis | $h_\theta(x) = \theta_0 + \theta_1 x$ (also $y = b + wx$, $\theta_0 = b$, $\theta_1 = w$) |
| Example index | superscript $(i)$, $i = 1..m$; $m$ = number of training examples |
| Cost | $J(\theta_0,\theta_1) = \frac{1}{2m}\sum (h_\theta(x^{(i)}) - y^{(i)})^2$, "squared error function" |
| Simplified cost | $\theta_0 = 0$: $J(\theta_1)$ |
| Learning rate | $\alpha$ |
| Update | $\theta_j = \theta_j - \alpha\cdot\frac{\partial}{\partial\theta_j}J(\theta_0,\theta_1)$, for $j = 0$ and $j = 1$, "Repeat until convergence" |
| Gradients | $\frac{1}{m}\sum(h-y)$ and $\frac{1}{m}\sum(h-y)\cdot x^{(i)}$ |
| Start point | $\theta_0 = 0, \theta_1 = 0$ |

## Exam focus

All numbers verified in `/home/claude/work/agents/w1l2/verify.py`.

1. **Classify the problem.** Spam filter → supervised, classification. Rainfall or stock price → supervised, regression. Grouping unlabeled fruit or customers → unsupervised, clustering. Reducing 100 features to 10 with PCA → unsupervised, dimensionality reduction.
2. **Definitions.** Samuel (1959): "ability to learn without being explicitly programmed". Four branches: supervised, unsupervised, reinforcement, recommender system.
3. **Read off parameters.** For $F = 32 + 1.8t$: $\theta_0 = 32$, $\theta_1 = 1.8$; $h(35) = 95$, $h(45) = 113$.
4. **Compute $J$** on the temperature data for $\theta = (30, 2)$: predictions 50, 60, 70, 80, 90; errors 0, 1, 2, 3, 4; squares sum to 30; $J = 30/(2\cdot5) = \mathbf{3.0}$.
5. **Simplified $J(\theta_1)$** for data (1,2), (2,4), (3,6), $m = 3$:

| $\theta_1$ | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Sum of squares | 56 | 14 | 0 | 14 |
| $J = \text{sum}/6$ | 9.33 | 2.33 | **0** | 2.33 |

6. **One GD step** on the same data, $\theta = (0, 1)$, $\alpha = 0.1$: predictions 1, 2, 3; errors −1, −2, −3.
   - $\partial J/\partial\theta_0 = (-6)/3 = -2$; $\partial J/\partial\theta_1 = (-1 - 4 - 9)/3 = -4.667$.
   - New $\theta_0 = 0 - 0.1(-2) = \mathbf{0.2}$; new $\theta_1 = 1 - 0.1(-4.667) = \mathbf{1.4667}$.
   - $J$: 2.333 → 0.470 (decreased, so $\alpha$ is OK).
7. **First step on slide 32's setup**, $(0,0)$, $\alpha = 0.001$: gradients (−68, −1450) → $\theta = (0.068, 1.45)$, $J$: 2393 → 760.91. With $\alpha = 0.01$, $J$ jumps to 28,825: diverging, so lower $\alpha$.
8. **Direction questions.** Positive slope → $\theta_1$ decreases; negative slope → increases; zero slope (local optimum) → unchanged ($\theta_1 = \theta_1 - \alpha\cdot0$).
9. **$\alpha$ questions.** Too small → slow. Too large → overshoot, fail to converge or diverge. A fixed $\alpha$ is fine because steps shrink as the derivative shrinks near a minimum. GD can get stuck in a local minimum (slide 23); linear-regression $J$ is convex, so it cannot (textbook context).
10. **Why $\frac{1}{2m}$?** The $\frac{1}{m}$ averages over examples; the $\frac12$ cancels the 2 from the square, leaving the gradient with $\frac{1}{m}$. Scaling $J$ by a constant does not move the minimizer.
11. **Simultaneous update.** Both new values come from the old $(\theta_0, \theta_1)$. Updating sequentially gives a different (wrong) result: 1.44864 vs 1.45 in section 11.
