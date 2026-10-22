# Week 2 (2.1): Multivariate Linear Regression, Normal Equation, Polynomial Regression

What this lecture is about: linear regression with several features, solved two ways: gradient descent (with one full update worked by hand on a 5-row dataset) and the normal equation (same dataset, exact answer). Then polynomial regression, which is linear regression on constructed features. Single-variable LR, the cost function and the GD derivation are in `02_Week1_IntroML_LinearRegression.md`.

Deck: "Intro to Machine Learning: Linear and Polynomial Regression", 50 pages. Agenda (slides 2, 44, 48): LR with multi-variables, polynomial regression, setting up environments, implementation of LR. All numbers below were re-checked in Python (`/home/claude/work/agents/w2l1/verify*.py`).

## 1. Two approaches and the running example (slides 3-5)
- Slide 3: two ways to solve LR. **Gradient Descent** is iterative. The **Normal Equation** $\theta=(X^T\cdot X)^{-1}\cdot(X^T\cdot y)$ is closed form.
- Slides 4-5 recap the one-variable case: Temp °C ($x$) → Temp F ($y$), with rows (10,50), (15,59), (20,68), (25,77), (30,86). $h_\theta(x)=\theta_0+\theta_1x$ fits them exactly with $\theta_0=32,\ \theta_1=1.8$.
- The multivariable dataset keeps the same $x_1$ and $y$ and adds two extra features $x_2, x_3$. So $y=32+1.8x_1$ holds exactly, and the true solution is $\theta=[32,\ 1.8,\ 0,\ 0]^T$ with $J=0$. This makes a handy sanity check.

## 2. Notation for multiple variables (slides 6-11)
Dataset (slide 6; the $x_0$ column is added on slide 10). $m=5$ examples, $n=3$ features (the brace over $x_1..x_3$ is labelled $n$).

| i | $x_0$ | $x_1$ | $x_2$ | $x_3$ | $y$ |
|---|---|---|---|---|---|
| 1 | 1 | 10 | 12 | 5 | 50 |
| 2 | 1 | 15 | 11 | 7 | 59 |
| 3 | 1 | 20 | 23 | 3 | 68 |
| 4 | 1 | 25 | 28 | 6 | 77 |
| 5 | 1 | 30 | 31 | 6 | 86 |

- Hypothesis (slide 6): $h(x)=\theta_0+\theta_1x_1+\theta_2x_2+\theta_3x_3=\theta_0+\sum_{i=1}^{n}\theta_i x_i$. Careful: on this slide $i$ indexes **features**, but in the loss $i$ indexes **examples** $x^{(i)}$. The feature or parameter index is $j$ in the GD rule.
- Slide 9: a dummy feature $x_0$ is boxed in, giving $h(x)=\theta_0x_0+\theta_1x_1+\theta_2x_2+\theta_3x_3$ with $x_0=1$.
- Slides 10-11: vector form $h(x)=X\theta$. Shapes: $X$ is $m\times(n+1)=5\times4$ with the column of 1s first, $\theta$ is $4\times1$, $y$ is $5\times1$, and $h=X\theta$ is $5\times1$.
- Initialisation (slide 11): $\theta=[0,0,0,0]^T$. Learning rate (slide 20): $\alpha=0.001$.
- Professor's style: products are written with a bullet, e.g. $X^T\bullet X$. The loss is called the "Loss function" $J(\theta)$, and the goal is written "$\underset{\theta}{minimize}\ J(\theta)$".

## 3. Loss and the vectorised gradient descent update (slides 7, 20-22)
- Loss (slide 7): $J(\theta)=\frac{1}{2m}\sum_{i=1}^{m}\big(h_\theta(x^{(i)})-y^{(i)}\big)^2$. It includes the $\frac12$. Slide 19 writes it as $\frac{1}{2\times5}\sum_{i=1}^{5}(h(x)-y)^2$.
- GD algorithm (slide 7): $\theta_j=\theta_j-\alpha\cdot\frac{\partial}{\partial\theta_j}J(\theta)$.
- Slide 20, boxed in red. Here $\theta^0$ means the **current (old) θ**, not a power:
$$\theta=\theta^0-\alpha\cdot\frac1m\sum_{i=1}^m\big(h_\theta(x^{(i)})-y^{(i)}\big)\cdot x^{(i)}=\theta^0-\alpha\cdot\frac1m\cdot X^T\cdot\big(h(x)-y\big)$$
- Component form: $\frac{\partial J}{\partial\theta_j}=\frac1m\sum_i\big(h_\theta(x^{(i)})-y^{(i)}\big)x_j^{(i)}$. All $j=0..n$ are updated simultaneously, which the matrix form does automatically.
- Slides 21-22 write out $X^T$ ($4\times5$: a row of 1s, then the $x_1$, $x_2$ and $x_3$ rows).

## 4. Worked example: first update from zero theta (slides 12-23)
**Prediction (slides 12-18).** Every row is $1\times0+x_1\times0+x_2\times0+x_3\times0=0$, so the "initial prediction" is $h=[0,0,0,0,0]^T$.

**Loss (slide 19).**

| i | $h^{(i)}$ | $y^{(i)}$ | $h-y$ | $(h-y)^2$ |
|---|---|---|---|---|
| 1 | 0 | 50 | -50 | 2500 |
| 2 | 0 | 59 | -59 | 3481 |
| 3 | 0 | 68 | -68 | 4624 |
| 4 | 0 | 77 | -77 | 5929 |
| 5 | 0 | 86 | -86 | 7396 |
| sum | | | | 23930 |

$J=\frac{1}{2\times5}(23930)=\mathbf{2393}$ ✓

**Gradient and update (slides 20-23).** $X^T(h-y)$ with $h-y=[-50,-59,-68,-77,-86]^T$:

| row of $X^T$ | dot product | $X^T(h-y)$ | $\times\ \alpha/m=0.001/5$ | new $\theta_j=0-$ that |
|---|---|---|---|---|
| $x_0$: 1 1 1 1 1 | $-(50+59+68+77+86)$ | -340 | -0.068 | **0.068** |
| $x_1$: 10 15 20 25 30 | $-(500+885+1360+1925+2580)$ | -7250 | -1.45 | **1.45** |
| $x_2$: 12 11 23 28 31 | $-(600+649+1564+2156+2666)$ | -7635 | -1.527 | **1.527** |
| $x_3$: 5 7 3 6 6 | $-(250+413+204+462+516)$ | -1845 | -0.369 | **0.369** |

- **Slide error (slide 23, carried onto 24-30): $\theta_0$ is shown as 0.06. The correct value is $0.001\cdot340/5=$ 0.068.** The slides' own next predictions (34.737, …) only come out with 0.068. With 0.06, every prediction would be 0.008 lower (34.729, 41.190, …).
- Because $h=0$, the first gradient is just $-X^Ty$. The same vector $[340,7250,7635,1845]$ shows up again as $X^Ty$ in the normal equation (slide 40).

## 5. Worked example: loss after the update and iteration 3 (slides 24-30)
With $\theta=[0.068,1.45,1.527,0.369]^T$ (slides 26-29). Row 1 check: $0.068+14.5+18.324+1.845=34.737$.

| i | $h=X\theta$ | $y$ | $h-y$ | $(h-y)^2$ |
|---|---|---|---|---|
| 1 | 34.737 | 50 | -15.263 | 232.959 |
| 2 | 41.198 | 59 | -17.802 | 316.911 |
| 3 | 65.296 | 68 | -2.704 | 7.312 |
| 4 | 81.288 | 77 | 4.288 | 18.387 |
| 5 | 93.119 | 86 | 7.119 | 50.680 |
| sum | | | | 626.2491 |

$J=\frac{1}{2\times5}(626.2491)=\mathbf{62.625}$ ✓ (slide 29). Slide 24 labels 2393 as the loss "in the first iteration".

Slide 30 summary. **"Iteration k" means the state before the k-th update**, so Iteration 1 is the initial θ = 0:

| slide label | updates done | $\theta^T$ | $h^T$ | $J(\theta)$ |
|---|---|---|---|---|
| Iteration 1 | 0 | [0, 0, 0, 0] | [0, 0, 0, 0, 0] | 2393 |
| Iteration 2 | 1 | [0.068 (slide: 0.06), 1.45, 1.527, 0.369] | [34.737, 41.198, 65.296, 81.288, 93.119] | 62.625 |
| Iteration 3 | 2 | [0.073, 1.481, 1.547, 0.397] | [35.429, 42.080, 66.459, 82.789, 94.833] | 61.25 |

- The second update (not shown on the slides): $X^T(h-y)=[-24.362,-152.970,-100.417,-140.599]$ and $\frac1mX^T(h-y)=[-4.8724,-30.594,-20.0834,-28.1198]$. So $\theta=[0.07287,1.48059,1.54708,0.39712]$, and $J=612.5104/10=61.251$ ✓
- Pattern: a huge drop in the first step (2393 → 62.6), then very slow progress (62.6 → 61.25). The features are unscaled, so $\theta_0$ creeps up (0.068 → 0.073) even though the answer is 32.

## 6. Python implementation of gradient descent (slides 31-32)
- Slide 31: `dataset` is a 5×4 array. `X = dataset[:, 0:3]` and `y = dataset[:, -1]` reshaped to `(5,1)`. Then `x0 = np.ones((5,1)); X_fin = np.hstack((x0, X))` gives shape `(5,4)`.
- Slide 32 loop, with `learning_rate = 0.001`, `iteration = 1000`, `theta = np.zeros((4,1))`, `m = len(X_fin)`:
```python
h_x = np.dot(X_fin, theta)
error = h_x - y
loss = np.sum(error**2)/(2*m)
delta = np.dot(np.transpose(X_fin), error)
theta = theta - learning_rate*delta/m
```
- Printed loss at iterations 0, 100, …, 900: 2393.0, 30.52, 21.53, 18.40, 16.91, 15.97, 15.29, 14.77, 14.36, 14.03. All reproduced. The plot of Loss against the number of iterations drops sharply, then flattens.
- Test `x_new_data = [[1, 10, 12, 5]]` gives **46.419** (true value 50). After 1000 iterations θ = [1.636, 0.671, 1.341, 4.396], which is far from [32, 1.8, 0, 0], so GD needs many more iterations here (the course notebook runs 100 000 iterations and gets 49.90).

## 7. Normal equation (slides 33-41, 43)
$$\theta=(X^T\cdot X)^{-1}\cdot(X^T\cdot y)$$
- Where it comes from (textbook context): setting $\nabla J=\frac1mX^T(X\theta-y)=0$ gives $X^TX\theta=X^Ty$. One step, no α, no iterations.
- Slides 34-39 use the same $X$ (with $x_0$) and $y$, write out $X^T$ ($4\times5$), and substitute everything.
- Slide 40, verified. $X^TX$ is $4\times4$ and symmetric, with $X^Ty$ as the last column:

| | $x_0$ | $x_1$ | $x_2$ | $x_3$ | $X^Ty$ |
|---|---|---|---|---|---|
| $x_0$ | 5 ($m$) | 100 ($\sum x_1$) | 105 ($\sum x_2$) | 27 ($\sum x_3$) | 340 ($\sum y$) |
| $x_1$ | 100 | 2250 ($\sum x_1^2$) | 2375 ($\sum x_1x_2$) | 545 ($\sum x_1x_3$) | 7250 ($\sum x_1y$) |
| $x_2$ | 105 | 2375 | 2539 ($\sum x_2^2$) | 560 ($\sum x_2x_3$) | 7635 ($\sum x_2y$) |
| $x_3$ | 27 | 545 | 560 | 155 ($\sum x_3^2$) | 1845 ($\sum x_3y$) |

- Slide 41 shows $(X^TX)^{-1}$ to 2 dp. Exact values to 4 dp ($\det X^TX=163000$):

| | col 1 | col 2 | col 3 | col 4 |
|---|---|---|---|---|
| row 1 | 6.9503 | 0.3927 | -0.4095 | -1.1120 |
| row 2 | 0.3927 | 0.0928 | -0.0787 | -0.1103 |
| row 3 | -0.4095 | -0.0787 | 0.0698 | 0.0959 |
| row 4 | -1.1120 | -0.1103 | 0.0959 | 0.2416 |

- **Slide error (slide 41): entry (row 4, col 2) is shown as -0.01. It should be -0.11, since the matrix is symmetric and entry (2,4) is -0.11 (exact -0.1103).**
- Result: $\theta=[32,\ 1.8,\ \approx0,\ \approx0]^T$. Slide 41 prints 2.8e(-14) and -1.7e(-13), slide 43's code prints -3.33e-14 and -2.59e-14, and my run gave 5.7e-14 and -1.1e-13. All of these are floating-point round-off, so the true values are **exactly 0**. The model is $h=32+1.8x_1$ with $J=0$.
- By hand: multiplying the **rounded** 2-dp inverse by $X^Ty$ does **not** give 32 and 1.8. It gives roughly [12.2, -28.65, -0.45, 31.4] even with the typo fixed. $X^TX$ is ill-conditioned (condition number about $3.5\cdot10^4$), so keep full precision or solve $X^TX\theta=X^Ty$ directly.
- Slide 43 code: `theta_norm = np.linalg.inv(X_fin.T.dot(X_fin)).dot(X_fin.T).dot(y)`. The prediction for `[[1,10,12,5]]` is **50.** exactly (GD after 1000 iterations gave 46.42).

## 8. Gradient descent vs normal equation (slide 42)
| Gradient descent | Normal equation |
|---|---|
| need to choose learning rate α | no need to choose α |
| a lot of iterations are required to find the optimal solution | no need for iterations |
| very good if the number of features is very large | very slow if the number of features is very large |
| | $(X^T\cdot X)^{-1}$ needs to be calculated |

- Why (textbook context): inverting an $(n+1)\times(n+1)$ matrix costs about $O(n^3)$, while one GD step costs $O(mn)$. Andrew Ng's rule of thumb: the normal equation is fine up to $n\approx10^4$.
- More textbook context: $X^TX$ is singular when features are linearly dependent or $m\le n$; then use `np.linalg.pinv` or drop features. The normal equation needs no feature scaling, while GD benefits a lot from it (see notebook part B below). The closed form exists only for least-squares linear regression, not for logistic regression (`04_Week2_LogisticRegression.md`).

## 9. Polynomial regression (slides 45-47)
- Slide 45: on curved data, a straight line $y=ax+b$ underfits, while a polynomial curve follows the S-shape.
- Slide 46, the **core trick**: construct new features from the input $x$, such as $x^2, x^3, \dots$, and train a standard linear regression on the expanded features.

| Original feature | Extension | Linear model |
|---|---|---|
| $x$ | $x, x^2, x^3$ | $w_1x+w_2x^2+w_3x^3+b$ |

- **Key point (slide 46):** the model is still **linear with respect to the parameters $w$**. "Polynomial" refers only to the shape of the features. This is why the GD update and the normal equation apply unchanged, with $X$ columns $[1, x, x^2, x^3]$.
- Notation switch: these slides use $w$ (weights) and $b$ (bias) instead of θ, with $b=\theta_0$ and $w_j=\theta_j$.
- Slide 47 code (scikit-learn):
```python
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
poly_model = make_pipeline(PolynomialFeatures(degree=2), LinearRegression())
poly_model.fit(X_train, y_train)
y_pred = poly_model.predict(X_test)
# PolynomialFeatures: x -> [1, x, x^2]
```
- Slide 47 side notes: `PolynomialFeatures` generates polynomial features ($x^2, x^3, \dots$) from $x$. `make_pipeline` combines the steps into a single model, which is "convenient and error-free". **`degree` is the main hyperparameter and must be chosen correctly.**
- Textbook context: too low a degree underfits and too high a degree overfits, so pick it on validation data (`05_Week3_EvaluatingLearningAlgorithms.md`). With several inputs, `PolynomialFeatures` also adds interaction terms, e.g. $(a,b)\to[1,a,b,a^2,ab,b^2]$. The output has $\binom{n+d}{d}$ columns. Scale the features, because $x^3$ grows fast.

## 10. Setting up environments (slides 2, 44, 48)
- This item appears only in the agenda. The PDF has no content slides for it (slide 49 is "questions", slide 50 is "thank you").
- What the course code assumes: Python with `numpy`, `matplotlib`, `pandas` and `scikit-learn`, run as notebooks. The slide 31-32 screenshots show Jupyter cells in VS Code, and notebook cell 2 has `#!pip install lib_name`.
- Typical setup (textbook context): `python -m venv .venv`, activate it, `pip install numpy pandas matplotlib scikit-learn jupyter`, then open the `.ipynb` in VS Code or Jupyter.

## Code from the course notebook (linear regression)
Cells without saved outputs are marked "rerun". Those numbers come from my own execution.

**A. LR with one variable (cells 0-24).**
- Data: `x = np.array(range(0,100))`, `y = 32 + 1.8*x` (100 noise-free points), shown in a pandas DataFrame. Shape notes: `x.shape` is `(100,)`, and `x.reshape(50,-5)` is `(50,2)`.
- Start at θ0 = θ1 = 0. The cost `(1/(2*m))*np.sum((h_x-y)**2)` is **8682.47**.
- One manual step with `lr = 0.0001`: `theta_0 -= lr*(1/m)*np.sum(h_x-y)` and `theta_1 -= lr*(1/m)*np.sum((h_x-y)*x)` give θ0 = 0.01211 and θ1 = 0.74943. The cost becomes 3987.08. A second step gives 0.0205091 and 1.2527247. All verified.
- "Put all together": 1 000 000 iterations at lr 1e-4 give θ0 = 31.9999999997 and θ1 = 1.8000000000. The final cost is 1.2e-20. Test x = 234: label 453.2, prediction 453.2000000008.

**B. "Applied Normalization" (cells 25-30, rerun).**
- 80/20 split without shuffling: `x[:80]` / `x[80:]`, so the test set is extrapolation over x = 80..99.
- Standardisation uses the **train** mean (39.5) and std (23.09) for both sets.
- Settings: lr = 0.01, 1000 iterations. Result: θ0 = 103.096 and θ1 = 41.564 in scaled units (ideal: mean(y_train) = 103.1 and 1.8σ = 41.566). Test MSE is about 7e-5.
- Lesson: with scaling, a 100× larger lr and 1000 iterations do what 10⁶ unscaled iterations did. See `09_Week5_DataPreparation.md`.

**C. LR with multi-variable, gradient descent (cells 31-47).** This is the slide 31-32 code, but with `iteration = 100000`.
- Saved losses: 1000: 13.767, 1400: 13.064, …, 99900: **0.0531**.
- Final θ = [30.084, 1.688, 0.116, 0.310]. The prediction for `[1,10,12,5]` is **49.903**. It is still not [32, 1.8, 0, 0], which shows how slow unscaled GD is.

**D. Normal Equation Approach (cells 49-54, rerun).** Same code as slide 43: θ ≈ [32, 1.8, 0, 0], prediction 50.

**E. "Regularization technique" (cell 57, not on the slides, rerun).** L2 (ridge) penalty with `regularization_param = 0.1`. The bias $\theta_0$ is not penalised:
```python
loss  = (np.sum(error**2) + lam*np.sum(theta[1:]**2)) / (2*m)
delta = (X_fin.T @ error + lam*np.vstack(([0], theta[1:]))) / m
```
With lr 0.001 and 1000 iterations, the loss goes from 2393 to 14.00, and θ = [1.643, 0.682, 1.335, 4.377]. That is almost the unregularised result because λ is small.

**F. Task checking (cells 59-61, rerun).** `task_checking(k)` runs the same GD (lr 1e-4, 1000 iterations) on a different 5×3 dataset whose targets are shifted by `k`. With k = 109: loss 12337.9 → 473.31, θ = [1.269, 3.843, 3.119, 7.442].

**G. scikit-learn (cell 62, rerun).** `LinearRegression().fit(X_fin, y)` predicts **50** for `[1,10,12,5]`. sklearn fits its own intercept (32), so the weight on the column of 1s is 0.

## Exam focus
1. **One GD step on the slide data** ($\alpha=0.001$, θ = 0). $J=23930/10=2393$. $X^T(h-y)=[-340,-7250,-7635,-1845]$. $\theta=[0.068,1.45,1.527,0.369]$, after which $J=62.625$. Write 0.068, not the slide's 0.06.
2. **Small GD step by hand.** $X=\begin{bmatrix}1&1\\1&2\\1&3\end{bmatrix}$, $y=[2,4,6]^T$, $\alpha=0.1$, θ = 0.
   - $J_0=(4+16+36)/6=9.333$.
   - $X^T(h-y)=[-12,-28]$, so $\theta=-0.1\cdot\frac13[-12,-28]=[0.4,\ 0.9333]$.
   - $h=[1.333,2.267,3.2]$ and $J_1=11.289/6=1.8815$.
3. **Normal equation, 2×2 by hand.** Same $X$, $y=[2,3,5]^T$.
   - $X^TX=\begin{bmatrix}3&6\\6&14\end{bmatrix}$, $\det=6$, $(X^TX)^{-1}=\frac16\begin{bmatrix}14&-6\\-6&3\end{bmatrix}$, $X^Ty=[10,23]^T$.
   - $\theta=\frac16[140-138,\ -60+69]=[0.333,\ 1.5]$.
4. **Predict with the normal-equation θ** for $x=(40,35,8)$: $h=32+1.8\cdot40+0+0=104$.
5. **Shapes** for $m=5$, $n=3$: $X$ is 5×4, θ is 4×1, $X^TX$ is 4×4, and $X^Ty$ and $X^T(h-y)$ are 4×1. Remember to add the $x_0=1$ column.
6. **Trap on slide 30:** "Iteration 3" is the state after **two** updates: θ = [0.073, 1.481, 1.547, 0.397], J = 61.25.
7. **GD or normal equation?** Use slide 42's four bullets. With $n=10^6$ features, use GD (the inverse is too slow). With $n=3$, use the normal equation (exact, no α, no loop).
8. **Polynomial features:**
   - `PolynomialFeatures(degree=2)` on x = 3 gives [1, 3, 9].
   - Degree 3 on x = 2 gives [1, 2, 4, 8].
   - Inputs (a,b) = (2,3) at degree 2 give [1, 2, 3, 4, 6, 9] (textbook context: includes $ab$).
9. **"Why is polynomial regression linear?"** Because the model is linear in $w$. Example: fitting $y=1+x^2$ on $x\in\{-2,\dots,2\}$ with columns $[1,x,x^2]$ through the normal equation gives exactly θ = [1, 0, 1].
